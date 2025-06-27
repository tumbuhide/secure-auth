# Dokumentasi Endpoint: Token Endpoint (/api/oauth2/token)

## 📋 Ringkasan

Token Endpoint adalah titik di mana klien dapat menukar Authorization Code, Refresh Token, atau kredensial klien (Client Credentials) dengan Access Token, ID Token, dan Refresh Token baru. Endpoint ini selalu diakses melalui `POST` dan memerlukan otentikasi klien untuk confidential clients.

## 🔗 Path

`/api/oauth2/token`

## 🌐 Metode HTTP

`POST`

## 📝 Deskripsi

Endpoint ini memvalidasi permintaan berdasarkan `grant_type` yang disediakan. Setelah validasi berhasil, Access Token (JWT), dan opsional ID Token (JWT) serta Refresh Token (opaque), akan diterbitkan kepada klien.

## ➡️ Parameter Request (Content-Type: `application/x-www-form-urlencoded`)

| Parameter                 | Wajib/Opsional | Deskripsi                                                                    |
|---------------------------|----------------|------------------------------------------------------------------------------|
| `grant_type`              | WAJIB          | Menentukan alur pemberian token. Nilai yang didukung: `authorization_code`, `refresh_token`, `client_credentials`, `password`. |
| `client_id`               | WAJIB          | Identifier publik klien. Jika `client_secret_basic` digunakan, ini ada di header `Authorization`. |
| `client_secret`           | WAJIB (untuk confidential clients jika tidak di header) | Rahasia klien. Jika `client_secret_post` digunakan, ini ada di body. |
| `redirect_uri`            | WAJIB (untuk `authorization_code` grant) | Harus sama dengan `redirect_uri` yang digunakan saat meminta authorization code. |
| `code`                    | WAJIB (untuk `authorization_code` grant) | Authorization Code yang diterima dari Authorization Endpoint.             |
| `code_verifier`           | WAJIB (untuk `authorization_code` grant jika PKCE digunakan) | String acak asli yang digunakan untuk menghasilkan `code_challenge`. |
| `refresh_token`           | WAJIB (untuk `refresh_token` grant) | Refresh Token yang akan ditukar dengan Access Token baru.             |
| `scope`                   | OPSIONAL       | Daftar scope yang diminta, dipisahkan spasi. Jika ada, harus subset dari scope yang semula diberikan. |
| `username`                | WAJIB (untuk `password` grant) | Nama pengguna (biasanya email) untuk otentikasi.                          |
| `password`                | WAJIB (untuk `password` grant) | Kata sandi pengguna untuk otentikasi.                                   |

## ⬅️ Contoh Response Sukses (JSON)

**Untuk `authorization_code` atau `refresh_token` grant (dengan ID Token dan Refresh Token):**

```json
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store
Pragma: no-cache

{
  "access_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": " opaque_refresh_token_string",
  "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...",
  "scope": "openid profile email"
}
```

**Untuk `client_credentials` grant:**

```json
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store
Pragma: no-cache

{
  "access_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "default_client_scope"
}
```

## ❌ Contoh Response Error (JSON)

Sesuai standar OAuth 2.0, respons error menggunakan format JSON dengan `error` dan `error_description`.

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "invalid_grant",
  "error_description": "Kode otorisasi tidak valid, sudah digunakan, atau kadaluarsa."
}
```

| Kode Error                 | Deskripsi                                                                    |
|----------------------------|------------------------------------------------------------------------------|
| `invalid_request`          | Parameter request wajib tidak ada atau tidak valid.                        |
| `unauthorized_client`      | Klien tidak diizinkan untuk grant type ini atau otentikasi klien gagal.    |
| `access_denied`            | Sumber daya pemilik atau server otorisasi menolak permintaan.              |
| `unsupported_grant_type`   | Grant type yang diminta tidak didukung oleh Authorization Server atau klien. |
| `invalid_scope`            | Scope yang diminta tidak valid, tidak diketahui, atau melebihi izin klien. |
| `invalid_grant`            | Kode otorisasi atau refresh token tidak valid, kadaluarsa, atau sudah dicabut. |
| `server_error`             | Terjadi kesalahan internal pada server.                                    |

## ⚠️ Pertimbangan Keamanan

*   **Otentikasi Klien:** Confidential clients harus selalu mengotentikasi diri dengan aman (misal: HTTP Basic Auth atau `client_secret_post`).
*   **PKCE:** Wajib memverifikasi `code_verifier` terhadap `code_challenge` untuk `authorization_code` grant dari klien publik.
*   **Rotasi Refresh Token:** Saat `refresh_token` digunakan, token lama harus dicabut dan token baru diterbitkan untuk mengurangi risiko replay attack.
*   **Kadaluwarsa Kode Otorisasi:** Kode otorisasi harus memiliki masa berlaku yang sangat singkat (misal: 60 detik) dan hanya dapat digunakan sekali.
*   **Validasi `redirect_uri`:** Harus sama persis dengan yang digunakan pada `/authorize` endpoint.
*   **ROPC Grant (`password` grant):** **Hanya boleh digunakan oleh klien pihak pertama yang sangat terpercaya** karena melibatkan penanganan kredensial pengguna secara langsung oleh klien. Risiko keamanan sangat tinggi jika disalahgunakan.
*   **Logging Audit:** Semua permintaan token (berhasil atau gagal) harus dicatat secara detail di `audit_logs`.
*   **Kunci Penandatanganan JWT:** Pastikan kunci privat untuk penandatanganan Access Token dan ID Token disimpan dengan sangat aman dan dirotasi secara berkala.
