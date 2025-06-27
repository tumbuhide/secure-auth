'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { generateRandomString, hashString } from '@/lib/utils';
import { redirect } from 'next/navigation';

const createClientSchema = z.object({
  client_name: z.string().min(3, 'Nama aplikasi minimal 3 karakter.'),
  redirect_uris: z.string().min(1, 'Minimal satu Redirect URI diperlukan.'),
});

const updateDetailsSchema = z.object({
  clientId: z.string(),
  client_name: z.string().min(3, 'Nama aplikasi minimal 3 karakter.'),
  logo_uri: z.string().url('URL Logo tidak valid.').or(z.literal('')),
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

async function verifyClientOwnership(supabase: any, clientId: string, userId: string) {
    const { data: client, error } = await supabase.from('clients').select('id').eq('client_id', clientId).eq('created_by_user_id', userId).single();
    if (error || !client) throw new Error('Akses ditolak atau klien tidak ditemukan.');
}

export async function createClientAction(
  prevState: any,
  formData: FormData
): Promise<ActionResult> {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: { message: 'Akses ditolak: Pengguna tidak terotentikasi.' } };
  }

  const validatedFields = createClientSchema.safeParse(Object.fromEntries(formData));
  if (!validatedFields.success) {
    return { success: false, error: { message: 'Input tidak valid.', fieldErrors: validatedFields.error.flatten().fieldErrors } };
  }
  
  const { client_name, redirect_uris } = validatedFields.data;
  
  const uris = redirect_uris.split(/[\s,]+/).filter(Boolean).map((uri: string) => {
    try {
      new URL(uri.trim());
      return uri.trim();
    } catch (e) { return null; }
  }).filter(Boolean) as string[];

  if (uris.length === 0) {
    return { success: false, error: { message: 'Format Redirect URI tidak valid.' } };
  }

  const clientId = `client_${generateRandomString(24)}`;
  const clientSecret = `secret_${generateRandomString(40)}`;
  const clientSecretHash = hashString(clientSecret);

  const { error: insertError } = await supabase.from('clients').insert({
    client_id: clientId,
    client_name,
    client_secret_hash: clientSecretHash,
    redirect_uris: uris,
    created_by_user_id: user.id,
    token_endpoint_auth_method: 'client_secret_post',
  });

  if (insertError) {
    return { success: false, error: { message: `Gagal menyimpan ke database: ${insertError.message}` } };
  }

  revalidatePath('/dashboard/applications');
  return { success: true, data: { client_id: clientId, client_secret: clientSecret, client_name } };
}

export async function updateClientDetailsAction(state: any, formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'Akses ditolak.' };

  const validated = updateDetailsSchema.safeParse(Object.fromEntries(formData));
  if (!validated.success) {
    return { success: false, message: validated.error.flatten().fieldErrors.toString() };
  }

  const { clientId, client_name, logo_uri, redirect_uris } = validated.data;

  try {
    await verifyClientOwnership(supabase, clientId, user.id);
  } catch(e: any) {
    return { success: false, message: e.message };
  }
  
  const uris = redirect_uris.split(/[\s,]+/).filter(Boolean);

  const { error } = await supabase
    .from('clients')
    .update({ client_name, logo_uri: logo_uri || null, redirect_uris: uris, updated_at: new Date().toISOString() })
    .eq('client_id', clientId);

  if (error) return { success: false, message: `Gagal memperbarui: ${error.message}` };
  
  revalidatePath(`/dashboard/applications/${clientId}`);
  return { success: true, message: 'Detail aplikasi berhasil diperbarui.' };
}

export async function regenerateClientSecretAction(clientId: string) {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'Akses ditolak.' };
  
  try {
    await verifyClientOwnership(supabase, clientId, user.id);
  } catch(e: any) {
    return { success: false, message: e.message };
  }

  const newSecret = `secret_${generateRandomString(40)}`;
  const newSecretHash = hashString(newSecret);

  const { error } = await supabase
    .from('clients')
    .update({ client_secret_hash: newSecretHash, updated_at: new Date().toISOString() })
    .eq('client_id', clientId);

  if (error) return { success: false, message: `Gagal membuat rahasia: ${error.message}` };
  
  revalidatePath(`/dashboard/applications/${clientId}`);
  return { success: true, message: 'Rahasia baru dibuat.', newSecret };
}

export async function deleteClientAction(clientId: string) {
    const cookieStore = await cookies();
    const supabase = createSupabaseServerClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect('/login');

    try {
        await verifyClientOwnership(supabase, clientId, user.id);
    } catch(e: any) {
        console.error(e.message);
        return;
    }

    const { error } = await supabase.from('clients').delete().eq('client_id', clientId);
    if (error) {
        console.error("Delete client error:", error);
        return;
    }
    
    redirect('/dashboard/applications');
}
