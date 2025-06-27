'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

// --- Skema Validasi Dinamis (Contoh) ---
// Di aplikasi nyata, ini bisa lebih kompleks
const settingsSchema = z.record(z.record(z.coerce.number().int().min(1)));

// --- Helper untuk verifikasi admin ---
async function verifyAdmin(supabase: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.app_metadata?.roles?.includes('admin')) {
        throw new Error('Akses ditolak: Diperlukan hak admin.');
    }
    return user.id;
}

// --- Action untuk Update Pengaturan ---
export async function updateSettingsAction(prevState: any, formData: FormData) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore, { isAdmin: true });
  let adminUserId;

  try {
    adminUserId = await verifyAdmin(supabase);
  } catch(e: any) {
    return { success: false, message: e.message };
  }

  // Mengubah FormData menjadi objek yang sesuai dengan skema
  const formObject: Record<string, any> = {};
  for (const [key, value] of formData.entries()) {
      const [mainKey, subKey] = key.split('.');
      if (!formObject[mainKey]) {
          formObject[mainKey] = {};
      }
      formObject[mainKey][subKey] = value;
  }
  
  const validated = settingsSchema.safeParse(formObject);

  if (!validated.success) {
    return { success: false, message: 'Data tidak valid. Pastikan semua nilai adalah angka.' };
  }

  const updates = Object.entries(validated.data).map(([key, value]) => {
      return supabase
        .from('system_settings')
        .update({ 
            value: value, 
            last_updated_by: adminUserId, 
            updated_at: new Date().toISOString()
        })
        .eq('key', key);
  });

  const results = await Promise.all(updates);
  const errors = results.filter(res => res.error);

  if (errors.length > 0) {
    console.error("Error updating settings:", errors.map(e => e.error?.message).join(', '));
    return { success: false, message: 'Terjadi kesalahan saat menyimpan beberapa pengaturan.' };
  }
  
  revalidatePath('/admin/settings');
  return { success: true, message: 'Pengaturan berhasil disimpan.' };
}
