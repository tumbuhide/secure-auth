# Dokumentasi Endpoint: Authorization Endpoint (/api/oauth2/authorize)

## 📋 Ringkasan

Authorization Endpoint adalah titik awal dari sebagian besar alur OAuth 2.0 dan OpenID Connect. Klien mengarahkan pengguna ke endpoint ini untuk otentikasi dan mendapatkan persetujuan pengguna (consent) untuk mengakses sumber daya yang dilindungi.

## 🔗 Path

`/api/oauth2/authorize`

## 🌐 Metode HTTP

`GET` (Dapat juga mendukung `POST`)

## 📝 Deskripsi

Ketika pengguna diarahkan ke endpoint ini, Secure Auth akan melakukan validasi parameter, memeriksa sesi login pengguna, dan, jika diperlukan, menampilkan halaman login atau halaman persetujuan. Setelah otentikasi dan persetujuan berhasil, Authorization Server akan menerbitkan Authorization Code dan mengarahkan kembali pengguna ke `redirect_uri` klien yang terdaftar.

## ➡️ Parameter Request (Query String)

| Parameter                 | Wajib/Opsional | Deskripsi                                                                    |
|---------------------------|----------------|------------------------------------------------------------------------------|
| `response_type`           | WAJIB          | Menentukan alur otorisasi. Contoh: `code` (untuk Authorization Code Grant).  |
| `client_id`               | WAJIB          | Identifier publik klien yang meminta otorisasi.                              |
| `redirect_uri`            | WAJIB          | URL di mana Authorization Server akan mengarahkan kembali pengguna. Harus terdaftar untuk `client_id` yang diberikan. |
| `scope`                   | WAJIB          | Daftar scope yang diminta, dipisahkan spasi (misal: `openid profile email`). |
| `state`                   | DIREKOMENDASIKAN | String opaque yang digunakan oleh klien untuk menjaga state antara request dan callback, mencegah CSRF. |
| `nonce`                   | OPSIONAL       | String acak yang digunakan oleh klien untuk mitigasi replay attack, terutama untuk ID Token. Wajib jika scope `openid` diminta. |
| `code_challenge`          | WAJIB (untuk klien publik) | Transformasi dari `code_verifier` yang digunakan dalam PKCE.               |
| `code_challenge_method`   | WAJIB (jika `code_challenge` ada) | Metode transformasi yang digunakan (saat ini hanya `S256` yang didukung). |
| `prompt`                  | OPSIONAL       | Mengontrol UI otentikasi. Contoh: `none`, `login`, `consent`, `select_account`. |
| `login_hint`              | OPSIONAL       | Petunjuk tentang nama login atau alamat email pengguna.                      |
| `max_age`                 | OPSIONAL       | Waktu maksimum (detik) sejak otentikasi terakhir pengguna yang diizinkan.    |
| `display`                 | OPSIONAL       | Bagaimana AS menampilkan UI (misal: `page`, `popup`).                      |

## ⬅️ Contoh Alur & Response

**1. Pengguna Belum Login atau Memerlukan Otentikasi Ulang:**
Jika pengguna belum login atau `prompt=login`, Authorization Server akan mengarahkan pengguna ke halaman login Secure Auth (`/login`).

**2. Pengguna Memerlukan Persetujuan (Consent):**
Jika pengguna sudah login tetapi belum memberikan persetujuan untuk scope yang diminta atau `prompt=consent`, Authorization Server akan mengarahkan pengguna ke halaman persetujuan (`/consent`).

**3. Otorisasi Berhasil:**
Setelah otentikasi dan persetujuan berhasil, Secure Auth akan mengarahkan pengguna kembali ke `redirect_uri` klien dengan Authorization Code dan `state`:

```
HTTP/1.1 302 Found
Location: https://client.example.com/cb?code=AUTHORIZATION_CODE&state=OPAQUE_STATE
```

**4. Otorisasi Gagal (Contoh Error Redirect):**
Jika terjadi kesalahan (misal: `invalid_request`, `access_denied`, `unauthorized_client`, `invalid_scope`, `unsupported_response_type`), Secure Auth akan mengarahkan kembali ke `redirect_uri` dengan parameter error:

```
HTTP/1.1 302 Found
Location: https://client.example.com/cb?error=access_denied&error_description=User%20denied%20access&state=OPAQUE_STATE
```

**5. Otorisasi Gagal (Redirect URI Tidak Valid):**
Jika `redirect_uri` yang disediakan tidak valid atau tidak terdaftar, server tidak dapat mengarahkan kembali dan akan mengembalikan respons error HTTP:

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "invalid_redirect_uri",
  "error_description": "URI pengalihan tidak valid."
}
```

## ⚠️ Pertimbangan Keamanan

*   **Validasi `redirect_uri`:** Sangat penting untuk memvalidasi `redirect_uri` terhadap daftar yang terdaftar sebelumnya untuk klien guna mencegah serangan pengalihan terbuka.
*   **Parameter `state`:** Klien harus selalu menggunakan parameter `state` untuk melindungi dari serangan CSRF.
*   **PKCE (Proof Key for Code Exchange):** Wajib diimplementasikan untuk klien publik yang menggunakan Authorization Code Grant untuk mencegah serangan intersepsi kode.
*   **Validasi `scope`:** Memastikan scope yang diminta valid dan tidak melebihi scope yang diizinkan untuk klien.
*   **Logging Audit:** Setiap permintaan otorisasi (berhasil atau gagal) harus dicatat dalam `audit_logs` untuk tujuan keamanan dan pemantauan.
*   **Pesan Error:** Pesan error yang dikembalikan harus informatif tetapi tidak membocorkan informasi sensitif tentang sistem atau pengguna.
