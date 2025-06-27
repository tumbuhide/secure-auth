import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { authenticator } from 'otplib'
import { encrypt } from '@/lib/utils' // Asumsi ada fungsi enkripsi

export async function POST(request: Request) {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: { message: 'Tidak terotentikasi.' } }, { status: 401 });
    }

    // Periksa apakah pengguna sudah memiliki faktor terverifikasi
    const { data: existingFactor } = await supabase
        .from('mfa_factors')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'verified')
        .single();
    
    if (existingFactor) {
        return NextResponse.json({ error: { message: 'Anda sudah memiliki metode otentikasi 2-langkah yang aktif.' } }, { status: 400 });
    }

    const { friendly_name } = await request.json();
    if (!friendly_name) {
        return NextResponse.json({ error: { message: 'Nama perangkat diperlukan.' } }, { status: 400 });
    }
    
    const secret = authenticator.generateSecret();
    const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Secure Auth';
    const otpauth_uri = authenticator.keyuri(user.email!, appName, secret);
    
    const { encryptedString, error: encryptError } = await encrypt(secret);
    if(encryptError) {
        return NextResponse.json({ error: { message: 'Gagal memproses rahasia MFA.' } }, { status: 500 });
    }

    // Hapus faktor lama yang belum terverifikasi sebelum membuat yang baru
    await supabase.from('mfa_factors').delete().eq('user_id', user.id).eq('status', 'unverified');

    // Simpan faktor baru yang belum terverifikasi
    const { data: newFactor, error: dbError } = await supabase
        .from('mfa_factors')
        .insert({
            user_id: user.id,
            friendly_name: friendly_name,
            factor_type: 'totp',
            status: 'unverified',
            secret: encryptedString,
        })
        .select('id')
        .single();

    if (dbError) {
        return NextResponse.json({ error: { message: 'Gagal menyimpan faktor MFA: ' + dbError.message } }, { status: 500 });
    }

    // Kembalikan URI untuk generate QR code di frontend
    return NextResponse.json({
        factor_id: newFactor.id,
        otpauth_uri: otpauth_uri
    });
}
