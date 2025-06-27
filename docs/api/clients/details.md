# Dokumentasi Endpoint: Client Details (/api/clients/[clientId])

## 📋 Ringkasan

Endpoint dinamis ini digunakan untuk mengelola satu aplikasi klien spesifik milik pengguna. Ini memungkinkan untuk mengambil detail, memperbarui, dan menghapus klien yang sudah ada.

## 🔗 Path

`/api/clients/[clientId]`

Contoh: `/api/clients/client_a1b2c3d4e5f6g7h8i9j0k1l2`

---

## 🌐 Metode: `GET`

### Deskripsi
Mengambil detail lengkap dari satu aplikasi klien spesifik. Endpoint ini akan memverifikasi bahwa klien tersebut milik pengguna yang sedang login.

### Parameter Request
- **Path Parameter**: `clientId` (string, wajib) - ID dari klien yang akan diambil.

### Contoh Response Sukses (JSON)
```json
HTTP/1.1 200 OK
Content-Type: application/json
{
  "client_id": "client_a1b2c3d4e5f6g7h8i9j0k1l2",
  "client_name": "Aplikasi Web Saya",
  "redirect_uris": ["https://myapp.com/callback", "http://localhost:3000/callback"],
  "logo_uri": "https://myapp.com/logo.png"
  // Properti lain yang tidak sensitif akan disertakan
}
```

---

## 🌐 Metode: `PUT`

### Deskripsi
Memperbarui detail dari aplikasi klien yang ada, seperti nama aplikasi atau daftar `redirect_uris`.

### Parameter Request
- **Path Parameter**: `clientId` (string, wajib)
- **JSON Body**:
    - `client_name` (string, wajib)
    - `redirect_uris` (string[], wajib)
    - `logo_uri` (string, opsional)

### Contoh Response Sukses (JSON)
```json
HTTP/1.1 200 OK
Content-Type: application/json
{
  "client_id": "client_a1b2c3d4e5f6g7h8i9j0k1l2",
  "client_name": "Nama Aplikasi Baru Saya"
}
```

---

## 🌐 Metode: `DELETE`

### Deskripsi
Menghapus aplikasi klien secara permanen. Ini adalah tindakan yang merusak.

### Parameter Request
- **Path Parameter**: `clientId` (string, wajib)

### Contoh Response Sukses (JSON)
```json
HTTP/1.1 200 OK
Content-Type: application/json
{
  "message": "Aplikasi berhasil dihapus."
}
```

### Pertimbangan Keamanan
*   **Verifikasi Kepemilikan:** **Krusial**. Setiap operasi (GET, PUT, DELETE) harus memverifikasi bahwa `created_by_user_id` dari klien di database cocok dengan `id` pengguna yang sedang membuat permintaan. Ini mencegah satu pengguna mengelola aplikasi milik pengguna lain.
*   **Jangan Bocorkan Data Sensitif:** Respons `GET` tidak boleh menyertakan `client_secret_hash`.
*   **Logging Audit:** Semua operasi, terutama `PUT` dan `DELETE`, harus dicatat secara detail di `audit_logs`.
