'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// --- Helper untuk verifikasi admin ---
async function verifyAdmin(supabase: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.app_metadata?.roles?.includes('admin')) {
        throw new Error('Akses ditolak: Diperlukan hak admin.');
    }
}

// --- Server Action untuk Toggle Status Klien ---
export async function toggleClientStatusAction(clientId: string, currentStatus: boolean) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore, { isAdmin: true });

  try {
    await verifyAdmin(supabase);
  } catch(e: any) {
    return { success: false, message: e.message };
  }

  const { error } = await supabase
    .from('clients')
    .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
    .eq('client_id', clientId);

  if (error) {
    return { success: false, message: `Gagal memperbarui: ${error.message}` };
  }
  
  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath('/admin/clients'); // Juga revalidate halaman daftar
  return { success: true, message: `Status klien berhasil diubah.` };
}


// --- Server Action untuk Hapus Klien ---
export async function deleteClientAction(clientId: string) {
    const cookieStore = cookies();
    const supabase = createSupabaseServerClient(cookieStore, { isAdmin: true });

    try {
        await verifyAdmin(supabase);
    } catch(e: any) {
        // Handle error - mungkin redirect atau tampilkan pesan
        console.error(e.message);
        return;
    }

    const { error } = await supabase.from('clients').delete().eq('client_id', clientId);

    if (error) {
        console.error("Admin delete client error:", error);
        // Mungkin ingin mengembalikan pesan error di sini
        return;
    }
    
    redirect('/admin/clients');
}
