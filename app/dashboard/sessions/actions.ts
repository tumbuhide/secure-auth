'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { hashString } from '@/lib/utils';

export async function revokeSessionAction(sessionId: number | 'all_others') {
    const cookieStore = await cookies();
    const supabase = createSupabaseServerClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, message: 'Akses ditolak.' };
    }

    if (sessionId === 'all_others') {
        const currentSessionToken = cookieStore.get('supabase-auth-token')?.value;
        if (!currentSessionToken) {
             return { success: false, message: 'Tidak dapat mengidentifikasi sesi saat ini.' };
        }
        const parsedToken = JSON.parse(currentSessionToken);
        const currentRefreshToken = parsedToken.refresh_token;

        const { data: tokens, error: fetchError } = await supabase
            .from('refresh_tokens')
            .select('id, token_hash')
            .eq('user_id', user.id)
            .is('revoked_at', null);

        if(fetchError) return { success: false, message: 'Gagal mengambil data sesi.' };

        const tokensToRevoke = tokens
            .filter(t => t.token_hash !== hashString(currentRefreshToken))
            .map(t => t.id);
        
        if (tokensToRevoke.length > 0) {
            const { error: updateError } = await supabase
                .from('refresh_tokens')
                .update({ revoked_at: new Date().toISOString() })
                .in('id', tokensToRevoke);

            if (updateError) return { success: false, message: `Gagal mencabut sesi lain: ${updateError.message}` };
        }

    } else {
        const { error: updateError } = await supabase
            .from('refresh_tokens')
            .update({ revoked_at: new Date().toISOString() })
            .eq('id', sessionId)
            .eq('user_id', user.id);
        
        if (updateError) {
            return { success: false, message: `Gagal mencabut sesi: ${updateError.message}` };
        }
    }
    
    revalidatePath('/dashboard/sessions');
    return { success: true, message: 'Sesi berhasil dicabut.' };
}
