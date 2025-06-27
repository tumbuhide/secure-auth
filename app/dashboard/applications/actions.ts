'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { generateRandomString, hashString } from '@/lib/utils';

// Skema validasi menggunakan Zod
const createClientSchema = z.object({
  client_name: z.string().min(3, 'Nama aplikasi minimal 3 karakter.'),
  redirect_uris: z.string().min(1, 'Minimal satu Redirect URI diperlukan.'),
});

interface ActionResult {
    success: boolean;
    data?: {
        client_id: string;
        client_secret: string;
        client_name: string;
    } | null;
    error?: {
        message: string;
        fieldErrors?: Record<string, string[] | undefined>;
    } | null;
}

export async function createClientAction(
  prevState: any,
  formData: FormData
): Promise<ActionResult> {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: { message: 'Akses ditolak: Pengguna tidak terotentikasi.' } };
  }

  const validatedFields = createClientSchema.safeParse({
    client_name: formData.get('client_name'),
    redirect_uris: formData.get('redirect_uris'),
  });

  if (!validatedFields.success) {
    return {
        success: false,
        error: { 
            message: 'Input tidak valid.',
            fieldErrors: validatedFields.error.flatten().fieldErrors,
        }
    };
  }
  
  const { client_name, redirect_uris } = validatedFields.data;
  
  // Membersihkan dan memvalidasi URIs
  const uris = redirect_uris.split(/\s*,\s*|\s+/).filter(Boolean).map(uri => {
    try {
      new URL(uri);
      return uri;
    } catch (e) {
      return null;
    }
  }).filter(Boolean) as string[];

  if (uris.length === 0) {
    return { success: false, error: { message: 'Format Redirect URI tidak valid.' } };
  }

  const clientId = `client_${generateRandomString(24)}`;
  const clientSecret = `secret_${generateRandomString(40)}`;
  const clientSecretHash = hashString(clientSecret);

  const { error: insertError } = await supabase.from('clients').insert({
    client_id: clientId,
    client_name: client_name,
    client_secret_hash: clientSecretHash,
    redirect_uris: uris,
    created_by_user_id: user.id,
    token_endpoint_auth_method: 'client_secret_post', // Default yang aman
  });

  if (insertError) {
    return { success: false, error: { message: `Gagal menyimpan ke database: ${insertError.message}` } };
  }

  // Revalidate path untuk memperbarui daftar klien di halaman
  revalidatePath('/dashboard/applications');

  return {
    success: true,
    data: {
      client_id: clientId,
      client_secret: clientSecret,
      client_name: client_name,
    },
  };
}
