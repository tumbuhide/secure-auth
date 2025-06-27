# Dokumentasi Endpoint: User Sessions (/api/user/sessions)

## 📋 Ringkasan

Endpoint ini memungkinkan pengguna yang terotentikasi untuk melihat dan mengelola sesi login mereka di berbagai perangkat. Sesi diidentifikasi melalui `refresh_tokens` yang aktif di database.

## 🔗 Path

`/api/user/sessions`

---

## 🌐 Metode: `GET`

### Deskripsi
Mengambil daftar semua sesi aktif milik pengguna yang sedang login. Sesi "saat ini" diidentifikasi dengan mencocokkan hash dari cookie otentikasi browser dengan yang ada di database.

### Parameter Request
Tidak ada.

### Contoh Response Sukses (JSON)
```json
HTTP/1.1 200 OK
Content-Type: application/json
[
  {
    "id": 123,
    "ip_address": "103.22.11.5",
    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "last_used_at": "2023-10-27T10:00:00Z",
    "created_at": "2023-10-20T10:00:00Z",
    "is_current": true
  },
  {
    "id": 124,
    "ip_address": "182.1.8.7",
    "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
    "last_used_at": "2023-10-26T18:30:00Z",
    "created_at": "2023-10-26T18:30:00Z",
    "is_current": false
  }
]
```

---

## 🌐 Metode: `DELETE`

### Deskripsi
Mencabut (revoke) satu atau lebih sesi aktif dengan mengatur timestamp `revoked_at` pada `refresh_token` terkait.

### Parameter Request (Query String)
| Parameter | Tipe          | Wajib/Opsional | Deskripsi                                                                    |
|-----------|---------------|----------------|------------------------------------------------------------------------------|
| `id`      | Number/String | WAJIB          | ID dari sesi (refresh token) yang akan dicabut, atau string `"all_others"` untuk mencabut semua sesi kecuali yang saat ini. |

### Contoh Response Sukses (JSON)
```json
HTTP/1.1 200 OK
Content-Type: application/json
{
  "message": "Sesi berhasil dicabut."
}
```

### Pertimbangan Keamanan
*   **Identifikasi Sesi Saat Ini:** Mekanisme untuk mengidentifikasi sesi saat ini (agar tidak bisa dicabut sendiri oleh pengguna secara tidak sengaja) harus andal. Ini dilakukan dengan membandingkan cookie dari request dengan hash di database.
*   **Verifikasi Kepemilikan:** Endpoint harus memastikan bahwa sesi yang akan dihapus benar-benar milik pengguna yang membuat permintaan. Ini dilakukan dengan mencocokkan `user_id` di klausa `WHERE` pada query database.
*   **Logging Audit:** Semua permintaan pencabutan sesi, baik berhasil maupun gagal, harus dicatat di `audit_logs`.
