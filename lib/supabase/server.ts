import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { cookies } from 'next/headers'

interface SupabaseServerClientOptions {
  isAdmin?: boolean;
}

// Catatan: cookieStore sekarang harus dilewatkan sebagai argumen pertama
export function createSupabaseServerClient(
  cookieStore: ReadonlyRequestCookies,
  options: SupabaseServerClientOptions = { isAdmin: false }
) {
  const supabaseUrl = process.env.SUPABASE_URL!;
  
  const supabaseKey = options.isAdmin 
    ? process.env.SUPABASE_SERVICE_ROLE_KEY! 
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Ini terjadi jika dipanggil dari Server Component, bisa diabaikan jika middleware menangani refresh.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Ini terjadi jika dipanggil dari Server Component.
          }
        },
      },
      ...(options.isAdmin && {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    }
  )
}
