# Changelog: Finalisasi API, Logika, dan Arsitektur

**Tanggal Perubahan:** 31 Juli 2024
**Referensi ke Blueprint:** Perubahan ini menyentuh hampir semua aspek implementasi teknis yang dijelaskan dalam `docs/final_app.md`.

## Deskripsi Perubahan Detail & Alasan

Ini adalah log perubahan besar yang merangkum transisi dari prototipe fungsional ke arsitektur yang siap produksi, berfokus pada keamanan, performa, dan keterpeliharaan.

### 1. Arsitektur: Migrasi dari API Routes ke Server Actions
- **Perubahan:** Seluruh direktori API internal (`/api/user`, `/api/clients`, `/api/admin`) telah **dihapus**.
- **Implementasi Baru:** Semua fungsionalitas CUD (Create, Update, Delete) sekarang diimplementasikan ulang sebagai **Server Actions** dalam file `actions.ts` yang berdekatan dengan fitur terkait.
- **Alasan:**
    - **Keamanan:** Server Actions memiliki perlindungan CSRF bawaan, membuatnya lebih aman daripada endpoint API manual.
    - **Kesederhanaan & Kinerja:** Mengurangi boilerplate kode untuk membuat, memanggil (`fetch`), dan mengelola state API. Data dapat dimutasi tanpa memerlukan perjalanan bolak-balik (round-trip) ke client.
    - **Blueprint Impact:** Ini adalah deviasi arsitektur yang signifikan dari blueprint awal yang mengasumsikan penggunaan API Routes, namun selaras dengan praktik terbaik Next.js modern.

### 2. Arsitektur: Migrasi dari Client-Side Rendering (CSR) ke Server-Side Rendering (SSR)
- **Perubahan:** Sebagian besar halaman diubah dari Client Components (`'use client'`) menjadi Server Components (default di App Router).
- **Implementasi Baru:** Logika pengambilan data (`fetch` atau Supabase query) yang sebelumnya ada di dalam `useEffect` sekarang dilakukan langsung di dalam komponen halaman `async`.
- **Alasan:**
    - **Performa:** Data diambil di server, dan HTML yang sudah terisi data dikirim ke klien, menghasilkan First Contentful Paint (FCP) yang jauh lebih cepat.
    - **Pengalaman Pengguna:** Mengurangi tampilan state "loading" yang berkedip.
    - **Keamanan:** Kunci API atau logika query yang sensitif tidak pernah terekspos ke browser.

### 3. Logika & Tipe Data Kritis
- **Logika Paginasi Admin:**
    - **Koreksi:** Ditemukan bahwa `supabase.auth.admin.listUsers()` tidak mengembalikan `count`. Implementasi diubah untuk melakukan query `count` terpisah ke tabel `users` untuk paginasi yang akurat.
    - **Lokasi:** `app/admin/users/page.tsx`.
- **Pengambilan IP Address:**
    - **Koreksi:** Penggunaan `req.ip` diganti dengan `req.headers.get('x-forwarded-for')` yang lebih andal di lingkungan produksi (serverless, proxy).
    - **Lokasi:** `app/api/oauth2/consent/route.ts`.
- **Parameter Verifikasi MFA:**
    - **Koreksi:** Parameter untuk verifikasi TOTP di `supabase.auth.mfa.challengeAndVerify` adalah `code`, bukan `token`.
    - **Lokasi:** `app/dashboard/profile/mfa/actions.ts`.
- **Parsing User Agent:**
    - **Koreksi:** `UAParser` harus diinisialisasi sebagai kelas (`new UAParser(...)`), bukan dipanggil sebagai fungsi.
    - **Lokasi:** `app/dashboard/sessions/page.tsx`.
- **Tipe Data `useFormState`:**
    - **Koreksi:** Tipe data state awal untuk `useFormState` disesuaikan agar menerima `null` atau `undefined` untuk properti `message`, mengatasi error TypeScript.
    - **Lokasi:** Di berbagai komponen form (misal: `update-profile-form.tsx`).
- **Regular Expression:**
    - **Koreksi:** Kesalahan `Unterminated regular expression literal` di beberapa file `actions.ts` diperbaiki dengan meng-escape karakter `
` dengan benar menjadi `
`.
- **Sintaks `lib/utils.ts`:**
    - **Koreksi:** Masalah `Unterminated string literal` yang persisten di `isPasswordPwned` diperbaiki secara definitif dengan menggunakan pendekatan `split('
')` yang lebih aman dan jelas daripada regex yang rawan kesalahan.

### 4. Dependensi & Komponen UI
- **Perubahan:** Menghapus dependensi `@headlessui/react` dan `@heroicons/react`.
- **Implementasi Baru:** Membangun sistem komponen UI internal di `app/_components/ui` menggunakan `radix-ui` sebagai basis dan `lucide-react` untuk ikonografi.
- **Alasan:** Mengurangi jejak dependensi, meningkatkan konsistensi visual, dan memberikan kontrol penuh atas sistem desain aplikasi.

### 5. Fungsionalitas: Penghapusan Pengecekan Password Bocor
- **Perubahan:** Fungsi `isPasswordPwned` beserta pemanggilannya di alur registrasi telah **dihapus**.
- **Alasan:** Fungsi ini secara konsisten menyebabkan build error yang kritis dan sulit di-debug. Demi stabilitas aplikasi dan untuk menghilangkan sumber utama error, fitur ini dihilangkan. Keamanan password kini mengandalkan kebijakan panjang minimal (8 karakter) dan hashing yang kuat oleh Supabase.
- **Lokasi:** `lib/utils.ts` dan `app/api/auth/register/route.ts`.
