'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid.'),
  password: z.string().min(1, 'Password harus diisi.'),
});

interface LoginActionResult {
    success: boolean;
    error?: string;
    data?: {
        mfa_required?: boolean;
        user_id?: string;
    } | null;
}

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_PERIOD_MINUTES = 15;

export async function loginAction(
  prevState: any,
  formData: FormData
): Promise<LoginActionResult> {
  const cookieStore = await cookies(); // Perbaikan: Menggunakan await
  const supabase = createSupabaseServerClient(cookieStore);
  const supabaseAdmin = createSupabaseServerClient(cookieStore, { isAdmin: true });

  try {
    const validatedFields = loginSchema.safeParse(Object.fromEntries(formData));

    if (!validatedFields.success) {
      return { success: false, error: "Email atau password tidak valid." };
    }
    
    const { email, password } = validatedFields.data;
    const ipAddress = '...'; // Placeholder

    const fifteenMinutesAgo = new Date(Date.now() - LOCKOUT_PERIOD_MINUTES * 60 * 1000).toISOString();
    const { data: recentAttempts, error: attemptError } = await supabaseAdmin
      .from('login_attempts')
      .select('id', { count: 'exact' })
      .eq('email', email)
      .gt('attempted_at', fifteenMinutesAgo)
      .eq('successful', false);
    
    if (attemptError) {
      console.error("DEBUG: DB Check Error:", attemptError);
      return { success: false, error: `Terjadi kesalahan internal (DB Check): ${attemptError.message}` };
    }

    if ((recentAttempts?.length || 0) >= MAX_LOGIN_ATTEMPTS) {
      return { success: false, error: 'Terlalu banyak percobaan login. Akun Anda terkunci sementara.' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        await supabaseAdmin.from('login_attempts').insert({ email, ip_address: ipAddress, successful: false });
        if (error.message.includes('Email not confirmed')) {
            return { success: false, error: 'Email Anda belum dikonfirmasi. Silakan periksa kotak masuk Anda.' };
        }
        return { success: false, error: 'Kombinasi email dan password salah.' };
    }
    
    await supabaseAdmin.from('login_attempts').insert({ email, ip_address: ipAddress, successful: true });

    const { data: mfaData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    const isMfaEnabled = mfaData?.currentLevel !== 'aal1';

    if (isMfaEnabled) {
        return { success: true, data: { mfa_required: true, user_id: data.user.id } };
    }

    return { success: true, data: null };

  } catch (e: any) {
    console.error("INTERNAL LOGIN ACTION ERROR:", e);
    return { success: false, error: 'Terjadi kesalahan internal yang tidak terduga.' };
  }
}
