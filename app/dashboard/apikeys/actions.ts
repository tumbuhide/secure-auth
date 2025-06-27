'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { generateRandomString, hashString } from '@/lib/utils';

// --- Skema Validasi ---
const createKeySchema = z.object({
  description: z.string().min(3, 'Deskripsi minimal 3 karakter.'),
  scopes: z.string().optional(), // Opsional, bisa kosong
});

// --- Tipe Data untuk Hasil Aksi ---
interface CreateActionResult {
    success: boolean;
    data?: {
        key: string;
    } | null;
    error?: {
        message: string;
        fieldErrors?: Record<string, string[] | undefined>;
    } | null;
}

// --- Server Action untuk Membuat API Key ---
export async function createApiKeyAction(
  prevState: any,
  formData: FormData
): Promise<CreateActionResult> {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: { message: 'Akses ditolak.' } };
  }

  const validatedFields = createKeySchema.safeParse(Object.fromEntries(formData));

  if (!validatedFields.success) {
    return {
        success: false,
        error: { 
            message: 'Input tidak valid.',
            fieldErrors: validatedFields.error.flatten().fieldErrors,
        }
    };
  }
  
  const { description, scopes } = validatedFields.data;
  const scopeArray = scopes?.split(/\s*,\s*|\s+/).filter(Boolean) || [];

  const prefix = `sk_${generateRandomString(12)}`;
  const secret = generateRandomString(40);
  const apiKey = `${prefix}.${secret}`;
  const apiKeyHash = hashString(apiKey);

  const { error: insertError } = await supabase.from('api_keys').insert({
    prefix,
    key_hash: apiKeyHash,
    description,
    scopes: scopeArray,
    user_id: user.id,
  });

  if (insertError) {
    return { success: false, error: { message: `Gagal menyimpan: ${insertError.message}` } };
  }

  revalidatePath('/dashboard/apikeys');

  return {
    success: true,
    data: {
      key: apiKey,
    },
  };
}

// --- Server Action untuk Mencabut API Key ---
export async function revokeApiKeyAction(keyId: number) {
    const cookieStore = cookies();
    const supabase = createSupabaseServerClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, message: 'Akses ditolak.' };
    }

    // Verifikasi kepemilikan sebelum mencabut
    const { error: updateError } = await supabase
        .from('api_keys')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', keyId)
        .eq('user_id', user.id);
    
    if (updateError) {
        return { success: false, message: `Gagal mencabut kunci: ${updateError.message}` };
    }
    
    revalidatePath('/dashboard/apikeys');
    return { success: true, message: 'API Key berhasil dicabut.' };
}
