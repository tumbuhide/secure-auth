# Dokumentasi Endpoint: Admin - Users (/api/admin/users)

## 📋 Ringkasan

Endpoint ini adalah bagian dari Admin Panel dan hanya dapat diakses oleh pengguna dengan peran `admin` atau `superadmin`. Endpoint ini digunakan untuk mengelola semua pengguna di dalam sistem.

## 🔗 Path

`/api/admin/users`

---

## 🌐 Metode: `GET`

### Deskripsi
Mengambil daftar lengkap semua pengguna yang terdaftar di sistem. Endpoint ini memvalidasi peran pengguna yang membuat permintaan sebelum mengembalikan data.

### Parameter Request
Tidak ada.

### Contoh Response Sukses (JSON)
```json
HTTP/1.1 200 OK
Content-Type: application/json
[
  {
    "id": "uuid-user-1",
    "email": "user1@example.com",
    "email_confirmed_at": "2023-10-27T10:00:00Z",
    "last_sign_in_at": "2023-10-28T12:00:00Z",
    "app_metadata": {
      "provider": "email",
      "roles": ["user"]
    },
    // ... properti pengguna lainnya
  },
  {
    "id": "uuid-user-2",
    "email": "admin@example.com",
    "email_confirmed_at": "2023-01-01T10:00:00Z",
    "last_sign_in_at": "2023-10-29T09:00:00Z",
    "app_metadata": {
      "provider": "email",
      "roles": ["admin", "user"]
    },
     // ... properti pengguna lainnya
  }
]
```

---

## ⚠️ Pertimbangan Keamanan

*   **Perlindungan Berbasis Peran (Role-Based Access Control - RBAC):** Ini adalah **lapisan keamanan paling kritis** untuk endpoint ini. Sebelum menjalankan logika apa pun, endpoint harus memverifikasi bahwa `id` pengguna yang diautentikasi memiliki peran (`roles`) yang sesuai di `app_metadata`. Jika tidak, respons `403 Forbidden` harus segera dikembalikan.
*   **Akses Admin Supabase:** Operasi seperti mengambil daftar semua pengguna (`listUsers`) memerlukan penggunaan **Supabase Admin Client**, yang diinisialisasi dengan `service_role_key`. Kunci ini harus dijaga kerahasiaannya dan tidak boleh diekspos ke sisi klien.
*   **Logging Audit yang Ketat:** Setiap akses ke endpoint admin, terlepas dari berhasil atau gagal, harus dicatat di `audit_logs` dengan detail yang mencakup siapa yang mencoba mengakses, kapan, dan dari mana.
*   **Data Sensitif:** Hati-hati dengan data yang dikembalikan. Meskipun endpoint ini untuk admin, pastikan tidak ada data yang terlalu sensitif (seperti hash password) yang tidak sengaja terkirim. Metode `listUsers` dari Supabase sudah aman dalam hal ini.
