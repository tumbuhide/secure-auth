# Dokumentasi Endpoint: UserInfo Endpoint (/api/oauth2/userinfo)

## 📋 Ringkasan

UserInfo Endpoint adalah sumber daya yang dilindungi oleh OAuth 2.0 yang mengembalikan klaim tentang Pengguna Akhir yang terotentikasi. Endpoint ini memberikan informasi identitas pengguna kepada klien yang telah diberikan Access Token dengan scope yang sesuai.

## 🔗 Path

`/api/oauth2/userinfo`

## 🌐 Metode HTTP

`GET` atau `POST`

## 📝 Deskripsi

Klien membuat permintaan ke UserInfo Endpoint dengan menyertakan Access Token yang valid di header `Authorization`. Server akan memvalidasi token tersebut, kemudian mengambil dan mengembalikan klaim pengguna yang sesuai dengan scope yang diberikan kepada token tersebut.

## ➡️ Parameter Request

**Header**

| Parameter       | Wajib/Opsional | Deskripsi                                                                    |
|-----------------|----------------|------------------------------------------------------------------------------|
| `Authorization` | WAJIB          | `Bearer <access_token>`. Berisi Access Token yang diterbitkan oleh Authorization Server. |

**Body (jika menggunakan `POST`)**

Tidak ada parameter body yang diperlukan, otentikasi hanya melalui header `Authorization`.

## ⬅️ Contoh Response Sukses (JSON)

Respons adalah objek JSON yang berisi klaim pengguna. Klaim yang dikembalikan bergantung pada scope yang ada di dalam Access Token.

**Jika Access Token memiliki scope `openid profile email`:**

```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "sub": "a-uuid-for-the-user",
  "name": "Budi Santoso",
  "given_name": "Budi",
  "family_name": "Santoso",
  "picture": "https://example.com/path/to/profile.jpg",
  "locale": "id-ID",
  "zoneinfo": "Asia/Jakarta",
  "email": "budi.santoso@example.com",
  "email_verified": true
}
```

**Jika Access Token hanya memiliki scope `openid`:**

```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "sub": "a-uuid-for-the-user"
}
```

## ❌ Contoh Response Error (JSON)

```json
HTTP/1.1 401 Unauthorized
Content-Type: application/json
WWW-Authenticate: Bearer error="invalid_token", error_description="Access token tidak valid atau kadaluarsa."

{
  "error": "invalid_token",
  "error_description": "Access token tidak valid atau kadaluarsa."
}
```

## ⚠️ Pertimbangan Keamanan

*   **Validasi Access Token:** Endpoint ini harus memvalidasi Access Token secara menyeluruh, termasuk signature, masa berlaku (`exp`), dan issuer (`iss`).
*   **Scope:** Server harus secara ketat mengembalikan klaim yang sesuai dengan scope yang diberikan dalam Access Token. Informasi di luar scope yang disetujui tidak boleh dibagikan.
*   **HTTPS:** Komunikasi dengan UserInfo Endpoint harus selalu melalui HTTPS untuk melindungi kerahasiaan Access Token dan data pengguna yang dikembalikan.
*   **Logging Audit:** Setiap permintaan ke UserInfo Endpoint (berhasil atau gagal) harus dicatat dalam `audit_logs` untuk melacak siapa yang mengakses informasi pengguna dan kapan.
