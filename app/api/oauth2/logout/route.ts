import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import * as jose from 'jose'
import { getPublicKey } from '@/lib/keys'

// Helper untuk log audit
const logAudit = async (supabase: any, status: 'SUCCESS' | 'FAILURE', event_details: any, user_id?: string | null, client_id?: string | null) => {
  const { error } = await supabase.from('audit_logs').insert({
    event_type: 'LOGOUT_REQUEST',
    status,
    user_id,
    client_id,
    details: event_details,
  })
  if (error) {
    console.error('Audit Log Error:', error)
  }
}

export async function GET(request: Request) {
  const supabase = createSupabaseServerClient()
  const { searchParams } = new URL(request.url)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const id_token_hint = searchParams.get('id_token_hint')
  const post_logout_redirect_uri = searchParams.get('post_logout_redirect_uri')
  const state = searchParams.get('state')

  let userIdFromHint: string | undefined
  let clientIdFromHint: string | undefined

  if (id_token_hint) {
    try {
      const publicKey = await jose.importSPKI(getPublicKey(), 'RS256')
      const { payload } = await jose.jwtVerify(id_token_hint, publicKey, { issuer: siteUrl })
      userIdFromHint = payload.sub
      clientIdFromHint = typeof payload.aud === 'string' ? payload.aud : undefined
    } catch (err: any) {
      // It's just a hint, so we can ignore errors, but log them.
      await logAudit(supabase, 'FAILURE', { error: 'ID token hint tidak valid', token_error: err.message })
    }
  }

  // Get current user session from Supabase to sign them out
  const { data: { user } } = await supabase.auth.getUser()
  const currentUserId = user?.id

  if (currentUserId) {
    // Revoke all refresh tokens for this user
    await supabase.from('refresh_tokens').update({ revoked_at: new Date().toISOString() }).eq('user_id', currentUserId)
    // Sign out from Supabase auth session
    await supabase.auth.signOut()
    await logAudit(supabase, 'SUCCESS', { message: 'Sesi pengguna dicabut' }, currentUserId)
  } else if (userIdFromHint) {
    // If no active session, but hint is valid, revoke tokens based on hint
    await supabase.from('refresh_tokens').update({ revoked_at: new Date().toISOString() }).eq('user_id', userIdFromHint)
    await logAudit(supabase, 'SUCCESS', { message: 'Sesi pengguna dicabut berdasarkan ID Token Hint' }, userIdFromHint, clientIdFromHint)
  }

  // Validate post_logout_redirect_uri
  if (post_logout_redirect_uri && clientIdFromHint) {
    const { data: clientData } = await supabase
      .from('clients')
      .select('post_logout_redirect_uris')
      .eq('client_id', clientIdFromHint)
      .single()

    const allowedUris = clientData?.post_logout_redirect_uris || []
    if (allowedUris.includes(post_logout_redirect_uri)) {
      const redirectUrl = new URL(post_logout_redirect_uri)
      if (state) {
        redirectUrl.searchParams.set('state', state)
      }
      return NextResponse.redirect(redirectUrl)
    } else {
        await logAudit(supabase, 'FAILURE', { error: 'URI pengalihan logout tidak valid', redirect_uri: post_logout_redirect_uri }, userIdFromHint, clientIdFromHint)
    }
  }

  // Fallback to a default success page if no valid redirect URI is provided
  return NextResponse.redirect(`${siteUrl}/logout-success`)
}

export async function POST(request: Request) {
  return GET(request)
}
