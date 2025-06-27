# Dokumentasi Endpoint: Clients (/api/clients)

## 📋 Ringkasan

Endpoint ini adalah titik utama bagi pengguna (developer) untuk mengelola aplikasi klien OAuth2 mereka. Endpoint ini menangani pembuatan klien baru dan (nantinya) pengambilan daftar klien.

## 🔗 Path

`/api/clients`

---

## 🌐 Metode: `POST`

### Deskripsi
Membuat aplikasi klien OAuth2 baru milik pengguna yang sedang login. Endpoint ini secara otomatis menghasilkan `client_id` dan `client_secret` yang aman, menyimpan hash dari secret, dan mengembalikan secret asli hanya sekali.

### Parameter Request (JSON Body)
| Parameter         | Tipe     | Wajib/Opsional | Deskripsi                                       |
|-------------------|----------|----------------|-------------------------------------------------|
| `client_name`     | String   | WAJIB          | Nama aplikasi yang akan ditampilkan ke pengguna.  |
| `redirect_uris`   | String[] | WAJIB          | Array berisi satu atau lebih URL callback yang valid. |

### Contoh Response Sukses (JSON)
```json
HTTP/1.1 201 Created
Content-Type: application/json
{
  "client_id": "client_a1b2c3d4e5f6g7h8i9j0k1l2",
  "client_name": "Aplikasi Web Saya",
  "client_secret": "secret_z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4"
}
```

### Pertimbangan Keamanan
*   **Rahasia Klien Sekali Tampil:** `client_secret` hanya dikembalikan dalam respons ini dan tidak pernah lagi. Pengguna harus segera menyimpannya.
*   **Penyimpanan Hash:** Di database, hanya hash dari `client_secret` (`client_secret_hash`) yang disimpan.
*   **Validasi `redirect_uris`:** Meskipun validasi dasar dilakukan, validasi format URL yang ketat di sisi server sangat penting untuk mencegah kerentanan.
*   **Kepemilikan:** Setiap klien yang dibuat harus terikat dengan `created_by_user_id` untuk memastikan hanya pemilik yang dapat mengelolanya.
*   **Logging Audit:** Setiap pembuatan klien harus dicatat di `audit_logs`.
