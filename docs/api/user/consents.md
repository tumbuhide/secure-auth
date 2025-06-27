# Dokumentasi Endpoint: User Consents (/api/user/consents)

## 📋 Ringkasan

Endpoint ini memungkinkan pengguna untuk melihat dan mengelola persetujuan (izin) yang telah mereka berikan kepada aplikasi klien pihak ketiga.

## 🔗 Path

`/api/user/consents`

---

## 🌐 Metode: `GET`

### Deskripsi
Mengambil daftar semua persetujuan aktif yang telah diberikan oleh pengguna yang sedang login. Ini melibatkan join antara tabel `authorizations` dan `clients` untuk mendapatkan detail aplikasi.

### Parameter Request
Tidak ada.

### Contoh Response Sukses (JSON)
```json
HTTP/1.1 200 OK
Content-Type: application/json
[
  {
    "client_id": "client_abc123",
    "scopes_granted": ["openid", "profile", "email"],
    "granted_at": "2023-10-25T09:00:00Z",
    "client_name": "Aplikasi Analitik Keren",
    "logo_uri": "https://example.com/logo.png"
  },
    {
    "client_id": "client_def456",
    "scopes_granted": ["openid", "read:data"],
    "granted_at": "2023-09-15T14:20:00Z",
    "client_name": "Layanan Produktivitas",
    "logo_uri": null
  }
]
```

---

## 🌐 Metode: `DELETE`

### Deskripsi
Mencabut persetujuan yang telah diberikan kepada aplikasi klien tertentu. Ini akan menghapus entri yang relevan dari tabel `authorizations`.

### Parameter Request (Query String)
| Parameter  | Tipe   | Wajib/Opsional | Deskripsi                                     |
|------------|--------|----------------|-----------------------------------------------|
| `clientId` | String | WAJIB          | `client_id` dari aplikasi yang izinnya akan dicabut. |

### Contoh Response Sukses (JSON)
```json
HTTP/1.1 200 OK
Content-Type: application/json
{
  "message": "Persetujuan berhasil dicabut."
}
```

### Pertimbangan Keamanan
*   **Efek Pencabutan:** Mencabut persetujuan berarti pada saat pengguna mencoba login berikutnya ke aplikasi tersebut, mereka akan diminta untuk memberikan persetujuan lagi.
*   **Pencabutan Token Terkait:** Idealnya, saat persetujuan dicabut, semua `refresh_tokens` yang terkait dengan pasangan `user_id` dan `client_id` tersebut juga harus dicabut untuk memastikan akses segera diakhiri. (Ini perlu ditambahkan ke implementasi API jika belum ada).
*   **Verifikasi Kepemilikan:** Endpoint harus memastikan bahwa persetujuan yang dihapus benar-benar milik pengguna yang membuat permintaan.
*   **Logging Audit:** Semua tindakan pencabutan persetujuan harus dicatat di `audit_logs`.
