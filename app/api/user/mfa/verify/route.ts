import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { authenticator } from 'otplib'
import { decrypt } from '@/lib/utils' // Menggunakan fungsi dekripsi yang baru dibuat

export async function POST(request: Request) {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: { message: 'Tidak terotentikasi.' } }, { status: 401 });
    }

    const { factor_id, verification_code } = await request.json();
    if (!factor_id || !verification_code) {
        return NextResponse.json({ error: { message: 'Factor ID dan kode verifikasi diperlukan.' } }, { status: 400 });
    }

    // Ambil faktor yang belum terverifikasi dari DB
    const { data: factor, error: factorError } = await supabase
        .from('mfa_factors')
        .select('id, secret')
        .eq('user_id', user.id)
        .eq('id', factor_id)
        .eq('status', 'unverified')
        .single();

    if (factorError || !factor) {
        return NextResponse.json({ error: { message: 'Faktor otentikasi tidak ditemukan atau sudah terverifikasi.' } }, { status: 404 });
    }
    
    // Dekripsi rahasia
    const { decryptedString: secret, error: decryptError } = await decrypt(factor.secret);
    if(decryptError || !secret) {
        return NextResponse.json({ error: { message: 'Gagal memproses rahasia MFA.' } }, { status: 500 });
    }
    
    // Verifikasi kode OTP yang diberikan pengguna
    const isValid = authenticator.check(verification_code, secret);
    
    if (!isValid) {
        return NextResponse.json({ error: { message: 'Kode verifikasi tidak valid. Silakan coba lagi.' } }, { status: 400 });
    }

    // Jika valid, update status faktor menjadi 'verified'
    const { error: updateError } = await supabase
        .from('mfa_factors')
        .update({ status: 'verified', updated_at: new Date().toISOString() })
        .eq('id', factor.id);

    if (updateError) {
        return NextResponse.json({ error: { message: 'Gagal mengaktifkan MFA: ' + updateError.message } }, { status: 500 });
    }

    // Berhasil, kembalikan pesan sukses
    return NextResponse.json({ message: 'Otentikasi 2-langkah berhasil diaktifkan.' });
}
