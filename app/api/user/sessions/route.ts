import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { hashString } from '@/lib/utils'
import { cookies } from 'next/headers'

// GET: Mengambil semua sesi aktif milik pengguna
export async function GET(request: Request) {
    const supabase = createSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session || !session.user) {
        return NextResponse.json({ error: { message: 'Tidak terotentikasi.' } }, { status: 401 })
    }

    const { data: tokens, error } = await supabase
        .from('refresh_tokens')
        .select('id, ip_address, user_agent, last_used_at, created_at, token_hash')
        .eq('user_id', session.user.id)
        .is('revoked_at', null)
        .order('last_used_at', { ascending: false })

    if (error) {
        return NextResponse.json({ error: { message: 'Gagal mengambil sesi: ' + error.message } }, { status: 500 })
    }
    
    // Dapatkan cookie dari cookie store
    const cookieStore = cookies()
    // Nama cookie Supabase bisa bervariasi, kita coba beberapa kemungkinan
    // Format nama cookie: `sb-${project_ref_id}-auth-token`
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const projectRef = new URL(supabaseUrl).hostname.split('.')[0]
    const cookieName = `sb-${projectRef}-auth-token`

    const currentRefreshToken = cookieStore.get(cookieName)?.value
    // Hanya hash bagian pertama dari JWT (header.payload) karena signature-nya berubah-ubah
    const currentTokenHash = currentRefreshToken ? hashString(currentRefreshToken.split('.')[0] + '.' + currentRefreshToken.split('.')[1]) : null

    const sessionsWithCurrent = tokens.map(token => ({
        ...token,
        is_current: currentTokenHash ? token.token_hash === currentTokenHash : false,
    }))

    return NextResponse.json(sessionsWithCurrent)
}


// DELETE: Mencabut (revoke) sesi
export async function DELETE(request: Request) {
    const supabase = createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: { message: 'Tidak terotentikasi.' } }, { status: 401 })
    }

    if (!id) {
        return NextResponse.json({ error: { message: 'ID Sesi diperlukan.' } }, { status: 400 })
    }
    
    let query = supabase.from('refresh_tokens').update({ revoked_at: new Date().toISOString() })

    if (id === 'all_others') {
        const cookieStore = cookies()
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const projectRef = new URL(supabaseUrl).hostname.split('.')[0]
        const cookieName = `sb-${projectRef}-auth-token`
        const currentRefreshToken = cookieStore.get(cookieName)?.value
        const currentTokenHash = currentRefreshToken ? hashString(currentRefreshToken.split('.')[0] + '.' + currentRefreshToken.split('.')[1]) : null
        
        if (currentTokenHash) {
             query = query.eq('user_id', user.id).neq('token_hash', currentTokenHash)
        } else {
            return NextResponse.json({ error: { message: 'Sesi saat ini tidak dapat diidentifikasi.' } }, { status: 400 })
        }
    } else {
        query = query.match({ id: parseInt(id), user_id: user.id })
    }

    const { error } = await query
    
    if (error) {
        await supabase.from('audit_logs').insert({
            event_type: 'SESSION_REVOCATION', status: 'FAILURE', user_id: user.id,
            details: { error: 'Gagal mencabut sesi.', session_id: id },
        })
        return NextResponse.json({ error: { message: 'Gagal mencabut sesi.' } }, { status: 500 })
    }
    
    await supabase.from('audit_logs').insert({
        event_type: 'SESSION_REVOCATION', status: 'SUCCESS', user_id: user.id,
        details: { session_id: id },
    })

    return NextResponse.json({ message: 'Sesi berhasil dicabut.' })
}
