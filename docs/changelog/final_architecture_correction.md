# Changelog Final: Koreksi Logika Kritis & Perubahan Arsitektur

**Versi:** Final 3.0
**Tanggal:** 31 Juli 2024
**Referensi ke Blueprint:** Perubahan ini menyentuh hampir semua aspek implementasi teknis yang dijelaskan dalam `docs/final_app.md` dan merupakan deviasi arsitektural yang signifikan demi stabilitas dan keamanan.

## Deskripsi Perubahan Detail & Alasan

### 1. Perubahan Arsitektur: API Routes ➔ Server Actions
- **Perubahan:** Seluruh API internal untuk operasi CUD (Create, Update, Delete) telah dihapus.
- **Alasan:**
    - **Keamanan:** Server Actions memiliki perlindungan CSRF bawaan, menjadikannya lebih aman daripada endpoint API manual.
    - **Kesederhanaan:** Menghilangkan boilerplate kode `fetch` dan manajemen state API yang kompleks.
    - **Kinerja:** Mengurangi perjalanan bolak-balik (round-trip) antara klien dan server untuk mutasi data.

### 2. Perubahan Arsitektur: Client-Side Rendering (CSR) ➔ Server-Side Rendering (SSR)
- **Perubahan:** Halaman yang menampilkan data (seperti daftar di dashboard dan admin panel) diubah menjadi Server Components.
- **Alasan:**
    - **Performa Muat Awal:** Mengirim HTML yang sudah dirender dari server, mempercepat First Contentful Paint (FCP).
    - **Pengalaman Pengguna:** Mengurangi tampilan "loading" yang berkedip.
    - **Keamanan:** Logika query dan kunci API yang sensitif tidak pernah terekspos ke browser.

### 3. Koreksi Logika Kritis
- **Izin Database (`permission denied`):**
    - **Masalah:** Error `permission denied for schema public` yang persisten.
    - **Akar Masalah:** Kurangnya izin `USAGE ON SCHEMA public` untuk `service_role` dan kurangnya `SELECT` grant untuk `authenticated` role pada tabel-tabel yang dilindungi RLS.
    - **Solusi:** Dibuat satu file migrasi (`0001_fix_all_permissions.sql`) yang memberikan semua izin yang diperlukan secara eksplisit.
- **Paginasi Admin:**
    - **Koreksi:** Ditemukan bahwa `supabase.auth.admin.listUsers()` tidak mengembalikan total `count`. Logika diubah untuk melakukan query `count` terpisah.
- **Penggunaan `cookies()`:**
    - **Koreksi:** Kesalahan berulang saat memanggil `createSupabaseServerClient` tanpa `await cookies()` diperbaiki di semua Server Components dan Server Actions.
- **Tipe Data `UAParser`:**
    - **Koreksi:** Definisi tipe `ParsedSession` diselaraskan dengan tipe data asli dari library `ua-parser-js` dengan membuat tipe terpusat di `lib/types.ts`.
- **Penanganan Error Console:**
    - **Koreksi:** Logika `console.error` di halaman dashboard diubah agar tidak mencetak objek kosong `{}` ketika tidak ada error yang sebenarnya.

### 4. Fungsionalitas: Penghapusan Pengecekan Password Bocor
- **Perubahan:** Fungsi `isPasswordPwned` dihapus dari `lib/utils.ts` dan alur registrasi.
- **Alasan:** Fungsi ini secara konsisten menyebabkan build error yang kritis. Demi stabilitas aplikasi, fitur ini dihilangkan.
