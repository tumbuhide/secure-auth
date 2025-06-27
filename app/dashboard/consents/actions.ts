'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// --- Server Action untuk Mencabut Persetujuan ---
export async function revokeConsentAction(clientId: string) {
    const cookieStore = await cookies();
    const supabase = createSupabaseServerClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, message: 'Akses ditolak.' };
    }

    // Hapus persetujuan dari tabel authorizations
    const { error: deleteError } = await supabase
        .from('authorizations')
        .delete()
        .eq('user_id', user.id)
        .eq('client_id', clientId);

    if (deleteError) {
        return { success: false, message: `Gagal mencabut izin: ${deleteError.message}` };
    }

    // Cabut semua refresh token yang terkait dengan pasangan user & client ini
    const { error: revokeTokenError } = await supabase
        .from('refresh_tokens')
        .update({ revoked_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('client_id', clientId);
    
    if (revokeTokenError) {
        console.error("Gagal mencabut token terkait saat mencabut izin:", revokeTokenError);
        // Lanjutkan meskipun gagal mencabut token, karena izin utama sudah dicabut
    }
    
    revalidatePath('/dashboard/consents');
    return { success: true, message: 'Izin berhasil dicabut.' };
}
