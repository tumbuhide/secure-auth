'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

// --- Skema Validasi ---
const profileSchema = z.object({
  fullName: z.string().min(3, 'Nama lengkap minimal 3 karakter.'),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Password saat ini diperlukan.'),
    newPassword: z.string().min(8, 'Password baru minimal 8 karakter.'),
});

// --- Action untuk Update Profil ---
export async function updateProfileAction(prevState: any, formData: FormData) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const validated = profileSchema.safeParse({ fullName: formData.get('fullName') });
  if (!validated.success) {
    return { success: false, message: validated.error.flatten().fieldErrors.fullName?.[0] };
  }

  const { error } = await supabase.auth.updateUser({
    data: { full_name: validated.data.fullName },
  });

  if (error) return { success: false, message: `Gagal memperbarui profil: ${error.message}` };
  
  revalidatePath('/dashboard/profile');
  return { success: true, message: 'Profil berhasil diperbarui.' };
}

// --- Action untuk Ganti Password ---
export async function changePasswordAction(prevState: any, formData: FormData) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const validated = passwordSchema.safeParse(Object.fromEntries(formData));
  if (!validated.success) {
     return { success: false, message: 'Input tidak valid.' };
  }
  
  const { currentPassword, newPassword } = validated.data;
  
  // 1. Verifikasi password saat ini
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'Pengguna tidak ditemukan.'};

  const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
  });

  if (signInError) {
      return { success: false, message: 'Password saat ini salah.' };
  }

  // 2. Jika berhasil, update ke password baru
  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

  if (updateError) {
    return { success: false, message: `Gagal mengubah password: ${updateError.message}` };
  }

  // 3. Logout dari semua sesi lain demi keamanan
  await supabase.auth.signOut({ scope: 'others' });
  
  revalidatePath('/dashboard/profile');
  return { success: true, message: 'Password berhasil diubah. Sesi di perangkat lain telah diakhiri.' };
}

// --- Action untuk Hapus Akun ---
export async function deleteAccountAction(prevState: any, formData: FormData) {
    const confirmation = formData.get('confirmation');
    if (confirmation !== 'hapus akun saya') {
        return { success: false, message: 'Teks konfirmasi tidak cocok.'};
    }

    const cookieStore = cookies();
    const supabase = createSupabaseServerClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Pengguna tidak ditemukan.'};

    // Ini memerlukan akses service_role untuk menghapus user
    const supabaseAdmin = createSupabaseServerClient(cookieStore, { isAdmin: true });
    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    
    if(error) {
        return { success: false, message: `Gagal menghapus akun: ${error.message}`};
    }

    // Logout dari sesi saat ini dan redirect
    await supabase.auth.signOut();
    redirect('/');
}
