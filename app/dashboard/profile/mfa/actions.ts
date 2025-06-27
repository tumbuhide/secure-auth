'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { decrypt, encrypt } from '@/lib/utils';

// --- Tipe Data untuk Hasil Aksi ---
interface EnrollActionResult {
    success: boolean;
    data?: {
        factorId: string;
        otpauthUri: string;
    } | null;
    error?: string | null;
}

interface VerifyActionResult {
    success: boolean;
    error?: string | null;
}

interface UnenrollActionResult {
    success: boolean;
    error?: string | null;
}

// --- Action untuk Memulai Pendaftaran MFA ---
export async function enrollMfaAction(): Promise<EnrollActionResult> {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Akses ditolak.' };
  }

  // Hapus faktor yang belum diverifikasi sebelumnya untuk kebersihan
  await supabase.from('mfa_factors').delete().eq('user_id', user.id).eq('status', 'unverified');

  // Mulai proses pendaftaran di Supabase
  const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      issuer: process.env.NEXT_PUBLIC_APP_NAME || 'Secure Auth',
      friendlyName: user.email || 'user@example.com'
  });

  if (error) {
    return { success: false, error: `Gagal memulai pendaftaran: ${error.message}` };
  }
  
  // Simpan secret yang dienkripsi ke database
  const { encryptedString, error: encryptError } = await encrypt(data.totp.secret);
  if (encryptError || !encryptedString) {
      return { success: false, error: 'Gagal mengenkripsi secret.' };
  }
  
  const { error: dbError } = await supabase.from('mfa_factors').insert({
      id: data.id,
      user_id: user.id,
      friendly_name: user.email,
      factor_type: 'totp',
      status: 'unverified',
      secret: encryptedString
  });

  if (dbError) {
      return { success: false, error: `Gagal menyimpan faktor: ${dbError.message}` };
  }

  return { 
    success: true, 
    data: {
        factorId: data.id,
        otpauthUri: data.totp.qr_code
    }
  };
}


// --- Action untuk Memverifikasi dan Mengaktifkan MFA ---
export async function verifyMfaAction(factorId: string, code: string): Promise<VerifyActionResult> {
    const cookieStore = cookies();
    const supabase = createSupabaseServerClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Akses ditolak.' };

    // Verifikasi tantangan
    const { error: challengeError } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code
    });

    if (challengeError) {
        return { success: false, error: `Kode verifikasi salah: ${challengeError.message}` };
    }

    // Jika berhasil, update status di DB
    const { error: dbError } = await supabase
        .from('mfa_factors')
        .update({ status: 'verified', updated_at: new Date().toISOString() })
        .eq('id', factorId);
    
    if (dbError) {
        return { success: false, error: `Gagal memperbarui status: ${dbError.message}`};
    }

    revalidatePath('/dashboard/profile/mfa');
    return { success: true };
}


// --- Action untuk Menonaktifkan MFA ---
export async function unenrollMfaAction(factorId: string): Promise<UnenrollActionResult> {
    const cookieStore = cookies();
    const supabase = createSupabaseServerClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Akses ditolak.' };

    // Hapus dari Supabase Auth
    const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId });

    if(unenrollError) {
        // Jika faktor tidak ada di Supabase Auth tapi ada di DB kita, tetap lanjutkan
        if (!unenrollError.message.includes("Factor not found")) {
            return { success: false, error: `Gagal menonaktifkan: ${unenrollError.message}` };
        }
    }

    // Hapus dari database kita
    const { error: dbError } = await supabase.from('mfa_factors').delete().eq('id', factorId);
    if(dbError) {
         return { success: false, error: `Gagal menghapus faktor dari DB: ${dbError.message}` };
    }
    
    revalidatePath('/dashboard/profile/mfa');
    return { success: true };
}
