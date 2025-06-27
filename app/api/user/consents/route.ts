import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// GET: Mengambil semua persetujuan milik pengguna
export async function GET(request: Request) {
    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: { message: 'Tidak terotentikasi.' } }, { status: 401 })
    }

    // Query untuk mengambil data dari tabel 'authorizations' dan menggabungkannya dengan tabel 'clients'
    const { data: consents, error } = await supabase
        .from('authorizations')
        .select(`
            client_id,
            scopes_granted,
            granted_at,
            clients (
                client_name,
                logo_uri
            )
        `)
        .eq('user_id', user.id);

    if (error) {
        return NextResponse.json({ error: { message: 'Gagal mengambil data persetujuan: ' + error.message } }, { status: 500 })
    }

    // Format data agar lebih mudah digunakan di front-end
    const formattedConsents = consents.map(consent => ({
        client_id: consent.client_id,
        scopes_granted: consent.scopes_granted,
        granted_at: consent.granted_at,
        client_name: (consent.clients as any)?.client_name || 'Aplikasi Tidak Dikenal',
        logo_uri: (consent.clients as any)?.logo_uri || null,
    }));

    return NextResponse.json(formattedConsents)
}


// DELETE: Mencabut (revoke) persetujuan untuk klien tertentu
export async function DELETE(request: Request) {
    const supabase = createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: { message: 'Tidak terotentikasi.' } }, { status: 401 })
    }

    if (!clientId) {
        return NextResponse.json({ error: { message: 'ID Klien diperlukan.' } }, { status: 400 })
    }

    // Hapus entri dari tabel authorizations
    const { error } = await supabase
        .from('authorizations')
        .delete()
        .match({ user_id: user.id, client_id: clientId });
    
    if (error) {
        await supabase.from('audit_logs').insert({
            event_type: 'CONSENT_REVOCATION', status: 'FAILURE', user_id: user.id,
            client_id: clientId,
            details: { error: error.message },
        })
        return NextResponse.json({ error: { message: 'Gagal mencabut izin: ' + error.message } }, { status: 500 })
    }
    
     await supabase.from('audit_logs').insert({
        event_type: 'CONSENT_REVOCATION', status: 'SUCCESS', user_id: user.id,
        client_id: clientId,
    })

    return NextResponse.json({ message: 'Persetujuan berhasil dicabut.' })
}
