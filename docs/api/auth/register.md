# Dokumentasi Endpoint: Register (/api/auth/register)

## 📋 Ringkasan

Endpoint ini menangani pendaftaran pengguna baru di sistem. Ini membuat entri pengguna di layanan otentikasi Supabase dan mengirimkan email verifikasi.

## 🔗 Path

`/api/auth/register`

## 🌐 Metode HTTP

`POST`

## 📝 Deskripsi

Endpoint ini menerima detail pengguna (nama lengkap, email, password), melakukan validasi dasar, dan kemudian memanggil metode `signUp` dari Supabase. Data tambahan seperti `full_name` disimpan di `raw_user_meta_data`.

## ➡️ Parameter Request (JSON Body)

| Parameter      | Tipe   | Wajib/Opsional | Deskripsi                               |
|----------------|--------|----------------|-----------------------------------------|
| `email`        | String | WAJIB          | Alamat email unik untuk pengguna baru.    |
| `password`     | String | WAJIB          | Password untuk akun baru (minimal 8 karakter). |
| `fullName`     | String | WAJIB          | Nama lengkap pengguna.                    |

## ⬅️ Contoh Response Sukses (JSON)

```json
HTTP/1.1 201 Created
Content-Type: application/json

{
  "message": "Pendaftaran berhasil. Silakan periksa email Anda untuk verifikasi."
}
```

## ❌ Contoh Response Error (JSON)

**Jika validasi gagal (contoh: password terlalu pendek):**
```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": {
    "message": "Password harus memiliki minimal 8 karakter."
  }
}
```

**Jika pengguna sudah ada:**
```json
HTTP/1.1 409 Conflict
Content-Type: application/json

{
  "error": {
    "message": "User already registered"
  }
}
```

## ⚠️ Pertimbangan Keamanan

*   **Validasi Sisi Server:** Semua validasi (seperti panjang password) harus dilakukan di sisi server, bahkan jika sudah ada di sisi klien.
*   **Email Verifikasi:** Mengaktifkan konfirmasi email adalah wajib untuk memastikan pengguna memiliki akses ke alamat email yang mereka daftarkan.
*   **Logging Audit:** Setiap upaya registrasi (berhasil atau gagal) harus dicatat dalam `audit_logs` untuk melacak aktivitas pembuatan akun.
*   **Rate Limiting:** Terapkan rate limiting pada endpoint ini untuk mencegah serangan registrasi massal (user flooding).
