# Dokumentasi Endpoint: User API Keys (/api/user/apikeys)

## 📋 Ringkasan

Endpoint ini digunakan oleh pengguna yang terotentikasi untuk mengelola API keys mereka. API keys ini digunakan untuk otentikasi M2M (Machine-to-Machine) atau akses terprogram ke API yang dilindungi.

## 🔗 Path

`/api/user/apikeys`

---

## 🌐 Metode: `GET`

### Deskripsi
Mengambil daftar semua API key yang aktif milik pengguna yang sedang login. Respons tidak akan menyertakan hash kunci itu sendiri untuk keamanan.

### Parameter Request
Tidak ada.

### Contoh Response Sukses (JSON)
```json
HTTP/1.1 200 OK
Content-Type: application/json
[
  {
    "id": 1,
    "prefix": "sa_live_xxxxxxxxxxxx",
    "description": "Kunci untuk layanan backend A",
    "scopes": ["read:data"],
    "last_used_at": "2023-10-27T10:00:00Z",
    "created_at": "2023-01-01T10:00:00Z"
  }
]
```

---

## 🌐 Metode: `POST`

### Deskripsi
Membuat API key baru untuk pengguna. Endpoint ini akan menghasilkan key yang aman, menyimpannya dalam bentuk hash, dan mengembalikan key asli hanya sekali dalam respons.

### Parameter Request (JSON Body)
| Parameter       | Tipe   | Wajib/Opsional | Deskripsi                                     |
|-----------------|--------|----------------|-----------------------------------------------|
| `description`   | String | WAJIB          | Deskripsi untuk membantu mengidentifikasi key. |
| `scopes`        | String[] | OPSIONAL       | Array scope izin yang akan dimiliki key.      |

### Contoh Response Sukses (JSON)
```json
HTTP/1.1 201 Created
Content-Type: application/json
{
  "key": "sa_live_xxxxxxxxxxxx.secret_yyyyyyyyyyyyyyyy",
  "prefix": "sa_live_xxxxxxxxxxxx"
}
```

### Pertimbangan Keamanan
*   **Key Hanya Ditampilkan Sekali:** Key asli (secret) **tidak boleh** disimpan dalam bentuk plain text di database. Key tersebut hanya dikembalikan satu kali saat pembuatan. Pengguna harus diingatkan untuk menyimpannya di tempat yang aman.
*   **Penyimpanan Hash:** Di database, hanya hash dari key lengkap (`key_hash`) yang disimpan untuk verifikasi di masa mendatang.

---

## 🌐 Metode: `DELETE`

### Deskripsi
Mencabut (revoke) API key yang sudah ada. Ini adalah tindakan soft delete dengan mengatur timestamp `revoked_at`.

### Parameter Request (Query String)
| Parameter | Tipe   | Wajib/Opsional | Deskripsi                          |
|-----------|--------|----------------|------------------------------------|
| `id`      | Number | WAJIB          | ID dari API key yang akan dicabut. |

### Contoh Response Sukses (JSON)
```json
HTTP/1.1 200 OK
Content-Type: application/json
{
  "message": "API key berhasil dicabut."
}
```

### Pertimbangan Keamanan
*   **Verifikasi Kepemilikan:** Endpoint ini harus memverifikasi bahwa API key yang akan dihapus benar-benar milik pengguna yang membuat permintaan.
*   **Logging Audit:** Semua operasi (GET, POST, DELETE) pada API key harus dicatat dalam `audit_logs`.
