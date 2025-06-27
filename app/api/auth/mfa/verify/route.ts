import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { authenticator } from 'otplib'
import { decrypt } from '@/lib/utils'

export async function POST(request: Request) {
    const { user_id, verification_code } = await request.json();
    if (!user_id || !verification_code) {
        return NextResponse.json({ error: { message: 'User ID dan kode verifikasi diperlukan.' } }, { status: 400 });
    }
    
    const supabase = createSupabaseServerClient();

    // 1. Ambil faktor MFA pengguna
    const { data: factor, error: factorError } = await supabase
        .from('mfa_factors')
        .select('id, secret')
        .eq('user_id', user_id)
        .eq('status', 'verified')
        .single();
    
    if (factorError || !factor) {
        return NextResponse.json({ error: { message: 'Faktor MFA tidak ditemukan untuk pengguna ini.' } }, { status: 404 });
    }

    // 2. Dekripsi rahasia dan verifikasi kode
    const { decryptedString: secret, error: decryptError } = await decrypt(factor.secret);
    if(decryptError || !secret) {
        return NextResponse.json({ error: { message: 'Gagal memproses rahasia MFA.' } }, { status: 500 });
    }

    const isValid = authenticator.check(verification_code, secret);
    if (!isValid) {
        return NextResponse.json({ error: { message: 'Kode 2FA tidak valid.' } }, { status: 400 });
    }

    // 3. Jika kode valid, buat sesi untuk pengguna secara manual
    // Ini adalah bagian penting: kita membuat sesi SETELAH tantangan MFA berhasil
    const { data: { session }, error: sessionError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: (await supabase.auth.admin.getUserById(user_id)).data.user!.email!,
    });
    
    if(sessionError || !session?.access_token) {
        return NextResponse.json({ error: { message: 'Gagal membuat sesi setelah verifikasi MFA.' } }, { status: 500 });
    }
    
    // Set cookie sesi secara manual
    const response = NextResponse.json({ message: "Login MFA berhasil" });
    await supabase.auth.setSession(session)


    return response;
}
