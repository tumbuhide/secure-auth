# Secure Auth - Blueprint Aplikasi Final (OIDC/OAuth2 Compliant)

**Dokumen ini adalah Blueprint Utama dan Tunggal untuk proyek Secure Auth.** Dokumen ini menguraikan arsitektur, alur fitur inti, pertimbangan keamanan, prinsip desain, dan spesifikasi teknis untuk membangun Secure Auth sebagai Authorization Server (AS) yang sesuai dengan standar OAuth 2.0 dan OpenID Connect (OIDC). Tujuannya adalah menyediakan panduan yang jelas dan detail untuk implementasi, terutama yang akan dilakukan oleh AI.

**Versi Dokumen:** 1.0 (Blueprint Final)

---

## 1. Pendahuluan dan Tujuan

Secure Auth bertujuan untuk menjadi layanan otentikasi dan otorisasi terpusat, self-hosted, yang aman, handal, dan mudah diintegrasikan. Dengan mengadopsi OAuth 2.0 dan OIDC, Secure Auth akan menyediakan:
*   Single Sign-On (SSO) untuk berbagai aplikasi klien.
*   Manajemen identitas pengguna yang aman.
*   Penerbitan token standar (Access Token, ID Token, Refresh Token).
*   Mekanisme persetujuan pengguna (consent) yang transparan.
*   Kemampuan bagi aplikasi klien untuk memverifikasi identitas pengguna dan mendapatkan akses terbatas ke resource atas nama pengguna.

---

## 2. Arsitektur Sistem

### 2.1. Domain Utama
*   `join.tumbuhide.tech`: Bertindak sebagai **Authorization Server (AS)**. Menghosting semua UI terkait otentikasi (login, register, consent, dll.), endpoint OIDC/OAuth2, dashboard pengguna, dan admin panel.
*   `studio.tumbuhide.tech`: Supabase Studio (self-hosted) untuk pengelolaan database dan backend Supabase.

### 2.2. Komponen Utama
*   **Frontend (Next.js di `join.tumbuhide.tech`):** Menyediakan UI untuk pengguna dan admin.
*   **Backend API (Next.js API Routes di `join.tumbuhide.tech`):** Mengimplementasikan endpoint OIDC/OAuth2 dan logika bisnis lainnya.
*   **Supabase (Self-hosted):**
    *   **Supabase Auth (GoTrue):** Mesin otentikasi inti untuk manajemen pengguna dasar.
    *   **PostgreSQL Database:** Menyimpan data pengguna, klien, otorisasi, token, API keys, dan audit logs.
*   **Aplikasi Klien (Relying Parties / Resource Servers):** Aplikasi yang mengandalkan `join.tumbuhide.tech`.

### 2.3. Struktur Proyek (Root Directory `join.tumbuhide.tech`)
```
📦 join.tumbuhide.tech/ (Root Proyek Next.js)
├── /components         # Komponen UI reusable
├── /pages              # Halaman dan API routes Next.js
│   ├── /api            # Backend API
│   │   ├── /auth       # Endpoint terkait otentikasi non-OIDC (misal, change password)
│   │   ├── /oauth2     # Endpoint OIDC/OAuth2 (misal, /token, /userinfo, /authorize)
│   │   └── ...
│   ├── /admin          # Halaman untuk Admin Panel
│   ├── /dashboard      # Halaman untuk Dashboard Pengguna
│   └── ...             # Halaman publik, login, register, consent, dll.
├── /lib                # Fungsi helper, konfigurasi, Supabase client
├── /public             # Aset statis (termasuk untuk .well-known)
├── /styles             # File CSS/styling global
├── /infrastructure
│   └── supabase        # Konfigurasi Docker Compose & .env untuk Supabase self-hosted
├── /docs
│   ├── final_app.md    # Dokumen ini (Blueprint)
│   ├── ai.md           # Panduan untuk AI
│   └── next_step.md    # Roadmap fitur lanjutan
.env.local              # Environment variables lokal
.env.production         # Environment variables produksi
next.config.js
package.json
README.md
```

---

## 3. Prinsip Desain & Standar Umum

### Keamanan (Security by Design):
1.  **Least Privilege:** Berikan izin minimal yang diperlukan untuk setiap peran pengguna, API key, dan proses.
2.  **Defense in Depth:** Terapkan beberapa lapisan keamanan. Jangan hanya mengandalkan satu mekanisme.
3.  **Secure Defaults:** Konfigurasi default sistem harus yang paling aman.
4.  **Input Validation & Sanitization:** Validasi semua input dari pengguna dan sistem eksternal di sisi server. Sanitasi output untuk mencegah XSS.
5.  **Error Handling yang Aman:** Jangan membocorkan informasi sensitif dalam pesan error. Gunakan kode error standar.
6.  **HTTPS Everywhere:** Semua komunikasi harus melalui HTTPS.
7.  **Password Storage:** Simpan hash password menggunakan algoritma hashing yang kuat dan modern (Supabase Auth menggunakan bcrypt secara default) dengan salt unik per pengguna.
8.  **Regular Updates & Patching:** Jaga semua dependensi dan platform tetap terbarui.
9.  **PKCE (Proof Key for Code Exchange):** Wajib untuk klien publik yang menggunakan Authorization Code Grant.
10. **HttpOnly, Secure Cookies untuk Refresh Tokens:** Mencegah akses dari JavaScript (XSS) dan memastikan hanya dikirim via HTTPS.
11. **CSRF Protection:** Gunakan parameter `state` di alur OAuth2 dan token anti-CSRF untuk form state-changing di `join.tumbuhide.tech`.
12. **Security Headers:** Implementasikan `Content-Security-Policy` (CSP), `HTTP Strict-Transport-Security` (HSTS), `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`.

### Desain API:
1.  **RESTful Principles & OAuth2/OIDC Standards:** Ikuti standar yang relevan untuk endpoint.
2.  **Versioning:** Semua endpoint API kustom harus di-versi (misal: `/api/v1/...`). Endpoint OIDC/OAuth2 mengikuti path standar mereka.
3.  **Statelessness:** API harus stateless.
4.  **Konsistensi:** Gunakan format request dan response yang konsisten.
5.  **Idempotency:** Untuk operasi yang mengubah data, usahakan agar bersifat idempoten.
6.  **Error Responses Standar:** Gunakan format JSON error yang telah ditentukan (lihat Bagian 10).
7.  **Dokumentasi API:** Setiap endpoint API kustom dan endpoint OIDC/OAuth2 harus didokumentasikan dengan jelas.

### Privasi (Privacy by Design):
1.  **Minimisasi Data:** Hanya kumpulkan dan simpan data pengguna yang mutlak diperlukan.
2.  **Transparansi:** Sediakan informasi yang jelas kepada pengguna tentang bagaimana data mereka dikumpulkan, digunakan, dan dilindungi (melalui Kebijakan Privasi).
3.  **Persetujuan (Consent):** Dapatkan persetujuan yang sesuai sebelum mengumpulkan atau memproses data pribadi, terutama untuk tujuan di luar fungsionalitas inti otentikasi. Alur consent OAuth2 adalah implementasi utama dari ini.
4.  **Keamanan Data Pengguna:** Terapkan langkah-langkah teknis dan organisasi yang kuat untuk melindungi data pengguna.
5.  **Hak Pengguna:** Hormati hak pengguna atas data mereka, termasuk hak untuk mengakses, mengoreksi, dan menghapus informasi mereka.
6.  **Pembatasan Tujuan:** Gunakan data pengguna hanya untuk tujuan yang telah ditentukan dan disetujui.

### Performa & Skalabilitas:
1.  **Optimasi Database:** Gunakan indexing yang tepat, query yang efisien, dan connection pooling.
2.  **Caching:** Terapkan strategi caching yang sesuai.
3.  **Operasi Asinkron:** Manfaatkan sifat non-blocking I/O.
4.  **Payload Ringkas:** Kirim hanya data yang diperlukan. Gunakan kompresi.

---

## 4. Entitas Utama & Model Data

### 4.1. Pengguna (`auth.users` - Tabel Bawaan Supabase)
*   Dikelola oleh Supabase Auth.
*   **Atribut Standar Utama yang Digunakan:** `id` (UUID), `email`, `encrypted_password`, `email_confirmed_at`, `last_sign_in_at`, `created_at`, `updated_at`, `phone` (jika fitur login via phone diaktifkan nanti), `confirmation_sent_at`, `recovery_sent_at`, `email_change_sent_at`, `banned_until`, `deleted_at`.
*   **`raw_app_meta_data` (JSONB):** Dikelola Supabase, berisi info seperti `provider` (misal "email", "google") dan `providers` (array).
*   **`raw_user_meta_data` (JSONB):** Digunakan untuk menyimpan data profil pengguna yang dapat diedit dan data kustom lainnya. Sistem Secure Auth akan menggunakan ini untuk menyimpan klaim OIDC standar:
    *   `full_name` (String)
    *   `given_name` (String)
    *   `family_name` (String)
    *   `picture` (URL String, foto profil)
    *   `locale` (String, misal "id-ID", "en-US")
    *   `zoneinfo` (String, misal "Asia/Jakarta")
    *   Data ini bisa diisi (sebagian bersifat opsional bagi pengguna) saat registrasi atau diupdate melalui dashboard profil.
*   **Pemanfaatan Field Lain:**
    *   `banned_until`: Digunakan oleh Admin Panel untuk men-suspend pengguna sementara.
    *   `deleted_at`: Diisi saat akun pengguna dihapus (soft delete), dikelola oleh Supabase saat fungsi `deleteUser` dipanggil.

### 4.2. Klien OAuth2/OIDC (`clients`)
Aplikasi yang meminta otentikasi dan otorisasi.
| Kolom                 | Tipe Data        | Deskripsi                                                                 |
|-----------------------|------------------|---------------------------------------------------------------------------|
| `id`                  | SERIAL           | Primary Key                                                               |
| `client_id`           | VARCHAR(255)     | UNIK. Identifier publik untuk klien.                                      |
| `client_secret_hash`  | VARCHAR(255)     | HANYA untuk confidential clients. Hash dari client secret.                |
| `client_name`         | VARCHAR(255)     | Nama aplikasi klien (untuk ditampilkan di halaman consent).                 |
| `redirect_uris`       | TEXT[]           | Array URL callback yang diizinkan.                                        |
| `response_types`      | TEXT[]           | Tipe respons yang diizinkan (misal, `code`).                              |
| `grant_types`         | TEXT[]           | Tipe grant yang diizinkan (misal, `authorization_code`, `refresh_token`, `client_credentials`, `password`). |
| `scope`               | TEXT             | Daftar default scope yang bisa diminta klien (dipisahkan spasi).          |
| `token_endpoint_auth_method` | VARCHAR(50) | Metode otentikasi klien di token endpoint (misal, `client_secret_basic`, `client_secret_post`, `none` untuk public client). |
| `logo_uri`            | VARCHAR(255)     | URL logo klien.                                                           |
| `client_uri`          | VARCHAR(255)     | URL homepage klien.                                                       |
| `tos_uri`             | VARCHAR(255)     | URL Terms of Service klien.                                               |
| `policy_uri`          | VARCHAR(255)     | URL Privacy Policy klien.                                                 |
| `jwks_uri`            | VARCHAR(255)     | Untuk enkripsi request object atau otentikasi klien berbasis JWT.         |
| `id_token_signed_response_alg` | VARCHAR(50) | Algoritma signing ID Token (default: `RS256`).                          |
| `userinfo_signed_response_alg` | VARCHAR(50)| Algoritma signing UserInfo response (jika disign).                      |
| `contacts`            | TEXT[]           | Email kontak untuk klien.                                                 |
| `software_id`         | VARCHAR(255)     | Identifier software klien.                                                |
| `software_version`    | VARCHAR(255)     | Versi software klien.                                                     |
| `is_active`           | BOOLEAN          | Default TRUE. Apakah klien aktif.                                         |
| `created_by_user_id`  | UUID             | Foreign Key ke `auth.users.id` (pengguna yang mendaftarkan klien).        |
| `created_at`          | TIMESTAMPTZ      |                                                                           |
| `updated_at`          | TIMESTAMPTZ      |                                                                           |

### 4.3. Otorisasi / Persetujuan Pengguna (`authorizations`)
Mencatat persetujuan yang diberikan pengguna kepada klien untuk scope tertentu.
| Kolom             | Tipe Data     | Deskripsi                                                              |
|-------------------|---------------|------------------------------------------------------------------------|
| `id`              | SERIAL        | Primary Key                                                            |
| `user_id`         | UUID          | Foreign Key ke `auth.users.id`.                                        |
| `client_id`       | VARCHAR(255)  | Foreign Key ke `clients.client_id`.                                    |
| `scopes_granted`  | TEXT[]        | Array scope yang disetujui (misal, `["openid", "profile", "email"]`).  |
| `granted_at`      | TIMESTAMPTZ   |                                                                        |
| `expires_at`      | TIMESTAMPTZ   | Opsional, jika persetujuan memiliki masa berlaku.                      |
| `last_updated_at` | TIMESTAMPTZ   |                                                                        |

### 4.4. Refresh Tokens (`refresh_tokens`)
| Kolom          | Tipe Data     | Deskripsi                                                              |
|----------------|---------------|------------------------------------------------------------------------|
| `id`           | SERIAL        | Primary Key                                                            |
| `token_hash`   | VARCHAR(255)  | UNIK. Hash dari refresh token.                                         |
| `user_id`      | UUID          | Foreign Key ke `auth.users.id`.                                        |
| `client_id`    | VARCHAR(255)  | Foreign Key ke `clients.client_id` (klien yang menerbitkan token ini). |
| `scopes`       | TEXT[]        | Scope yang terkait dengan refresh token ini.                           |
| `expires_at`   | TIMESTAMPTZ   | Timestamp kedaluwarsa.                                                 |
| `revoked_at`   | TIMESTAMPTZ   | Timestamp jika dicabut.                                                |
| `created_at`   | TIMESTAMPTZ   |                                                                        |
| `last_used_at` | TIMESTAMPTZ   | Untuk deteksi rotasi dan penyalahgunaan.                               |
| `user_agent`   | TEXT          | User agent saat token dibuat.                                          |
| `ip_address`   | VARCHAR(45)   | IP address saat token dibuat.                                          |
| `parent_token_hash` | VARCHAR(255)| Opsional. Hash dari refresh token sebelumnya (untuk melacak rantai rotasi). |

### 4.5. Authorization Codes (`authorization_codes`)
Penyimpanan sementara untuk authorization code.
| Kolom             | Tipe Data     | Deskripsi                                                              |
|-------------------|---------------|------------------------------------------------------------------------|
| `id`              | SERIAL        | Primary Key                                                            |
| `code_hash`       | VARCHAR(255)  | UNIK. Hash dari authorization code.                                    |
| `user_id`         | UUID          | Foreign Key ke `auth.users.id`.                                        |
| `client_id`       | VARCHAR(255)  | Foreign Key ke `clients.client_id`.                                    |
| `redirect_uri`    | VARCHAR(255)  | Redirect URI yang digunakan saat code diminta.                         |
| `scopes`          | TEXT[]        | Scope yang terkait dengan code ini.                                    |
| `expires_at`      | TIMESTAMPTZ   | Timestamp kedaluwarsa (biasanya sangat singkat, misal 60 detik).       |
| `used_at`         | TIMESTAMPTZ   | Timestamp jika code sudah digunakan (code hanya bisa dipakai sekali).  |
| `code_challenge`  | VARCHAR(255)  | Untuk PKCE.                                                            |
| `code_challenge_method` | VARCHAR(10) | Untuk PKCE (misal, `S256`).                                        |
| `nonce`           | VARCHAR(255)  | Opsional, dari request OIDC.                                           |
| `created_at`      | TIMESTAMPTZ   |                                                                        |

### 4.6. API Keys (`api_keys`)
Untuk otentikasi M2M atau akses langsung ke API `join.tumbuhide.tech` oleh pengguna/layanan terpercaya.
| Kolom          | Tipe Data     | Deskripsi                                                              |
|----------------|---------------|------------------------------------------------------------------------|
| `id`           | SERIAL        | Primary Key                                                            |
| `key_hash`     | VARCHAR(255)  | UNIK. Hash dari API key.                                               |
| `prefix`       | VARCHAR(10)   | UNIK. Bagian awal key yang tidak sensitif (misal, `sa_live_`).         |
| `user_id`      | UUID          | Opsional. Foreign Key ke `auth.users.id` jika key milik pengguna.      |
| `client_id`    | VARCHAR(255)  | Opsional. Foreign Key ke `clients.client_id` jika key milik klien M2M. |
| `description`  | TEXT          | Deskripsi kegunaan key.                                                |
| `scopes`       | TEXT[]        | Scope izin yang dimiliki key ini.                                      |
| `expires_at`   | TIMESTAMPTZ   | Opsional. Timestamp kedaluwarsa.                                       |
| `revoked_at`   | TIMESTAMPTZ   | Timestamp jika dicabut.                                                |
| `last_used_at` | TIMESTAMPTZ   |                                                                        |
| `created_at`   | TIMESTAMPTZ   |                                                                        |

### 4.7. Audit Logs (`audit_logs`)
Mencatat semua event penting sistem.
| Kolom          | Tipe Data     | Deskripsi                                                              |
|----------------|---------------|------------------------------------------------------------------------|
| `id`           | BIGSERIAL     | Primary Key                                                            |
| `timestamp`    | TIMESTAMPTZ   | Waktu event terjadi.                                                   |
| `event_type`   | VARCHAR(100)  | Jenis event (misal, `USER_LOGIN`, `PASSWORD_RESET`, `TOKEN_ISSUED`, `ADMIN_ACTION`). |
| `user_id`      | UUID          | Opsional. Pengguna yang terkait dengan event.                          |
| `client_id`    | VARCHAR(255)  | Opsional. Klien yang terkait dengan event.                             |
| `ip_address`   | VARCHAR(45)   | Alamat IP asal request.                                                |
| `user_agent`   | TEXT          | User agent request.                                                    |
| `status`       | VARCHAR(20)   | `SUCCESS` atau `FAILURE`.                                              |
| `details`      | JSONB         | Detail tambahan tentang event.                                         |
| `actor_user_id`| UUID          | Opsional. Jika aksi dilakukan oleh admin atas nama pengguna lain.      |

---

## 5. Endpoint OIDC/OAuth2 Standar (`join.tumbuhide.tech`)

Semua endpoint ini diimplementasikan di bawah path `/oauth2`.

### 5.1. Discovery Endpoint
*   **Path:** `/.well-known/openid-configuration` (dan alias di `/oauth2/.well-known/openid-configuration`)
*   **Method:** `GET`
*   **Deskripsi:** Mengembalikan JSON object yang berisi metadata Authorization Server, termasuk URL endpoint lain, algoritma signing yang didukung, scope yang didukung, klaim yang didukung, dll. Sesuai spesifikasi OIDC Discovery.

### 5.2. Authorization Endpoint
*   **Path:** `/oauth2/authorize`
*   **Method:** `GET` (bisa juga `POST`)
*   **Deskripsi:** Memulai alur otentikasi dan meminta persetujuan pengguna.
*   **Parameter Request (Query String):**
    *   `response_type`: WAJIB. Menentukan alur (misal, `code` untuk Authorization Code Grant).
    *   `client_id`: WAJIB. ID klien yang meminta.
    *   `redirect_uri`: WAJIB (jika lebih dari satu terdaftar untuk klien) atau OPSIONAL (jika hanya satu). URL callback klien.
    *   `scope`: WAJIB. Daftar scope yang diminta (dipisahkan spasi, misal `openid profile email`).
    *   `state`: DIREKOMENDASIKAN. String opaque untuk menjaga state antara request dan callback, melindungi dari CSRF.
    *   `nonce`: WAJIB untuk alur OIDC yang mengembalikan ID Token. String acak untuk mitigasi replay attack.
    *   `code_challenge` (PKCE): WAJIB untuk klien publik. Transformasi dari `code_verifier`.
    *   `code_challenge_method` (PKCE): WAJIB jika `code_challenge` ada. Metode transformasi (misal, `S256`).
    *   `prompt`: OPSIONAL. Mengontrol UI otentikasi (misal, `none`, `login`, `consent`, `select_account`).
    *   `login_hint`: OPSIONAL. Petunjuk email pengguna.
    *   `max_age`: OPSIONAL. Waktu maksimum (detik) sejak otentikasi terakhir pengguna.
    *   `display`: OPSIONAL. Bagaimana AS menampilkan UI (misal, `page`, `popup`).
*   **Proses:**
    1.  Validasi `client_id` dan `redirect_uri`.
    2.  Jika pengguna belum login, tampilkan halaman login `join.tumbuhide.tech`.
    3.  Setelah login, periksa apakah pengguna sudah memberikan persetujuan untuk `client_id` dan `scope` yang diminta.
    4.  Jika belum ada persetujuan atau `prompt=consent`, tampilkan halaman persetujuan (Consent Screen).
    5.  Jika disetujui:
        *   Untuk `response_type=code`: Generate authorization code, simpan (beserta `code_challenge`, `scopes`, `user_id`, `client_id`, `redirect_uri`, `nonce`), lalu redirect ke `redirect_uri` klien dengan `code` dan `state`.
    6.  Jika ditolak atau error: Redirect ke `redirect_uri` dengan parameter error (misal, `error=access_denied`).

### 5.3. Token Endpoint
*   **Path:** `/oauth2/token`
*   **Method:** `POST`
*   **Deskripsi:** Menukar authorization code, refresh token, atau client credentials dengan token.
*   **Otentikasi Klien:** Confidential clients harus mengotentikasi diri menggunakan `client_id` dan `client_secret` (via HTTP Basic Auth header atau body request) atau metode lain yang dikonfigurasi. Public clients tidak menggunakan client secret.
*   **Parameter Request (x-www-form-urlencoded):**
    *   **Untuk Authorization Code Grant:**
        *   `grant_type=authorization_code`
        *   `code`: Authorization code yang diterima dari `/authorize`.
        *   `redirect_uri`: Harus sama dengan yang digunakan saat meminta code.
        *   `client_id`: ID klien.
        *   `code_verifier` (PKCE): String acak asli yang digunakan untuk menghasilkan `code_challenge`.
    *   **Untuk Refresh Token Grant:**
        *   `grant_type=refresh_token`
        *   `refresh_token`: Refresh token yang dimiliki klien.
        *   `client_id`: ID klien (opsional jika refresh token unik global, tapi direkomendasikan).
        *   `scope`: Opsional. Scope yang diminta (tidak boleh melebihi scope asli).
    *   **Untuk Client Credentials Grant:**
        *   `grant_type=client_credentials`
        *   `client_id` & `client_secret` (jika tidak di header).
        *   `scope`: Opsional. Scope yang diminta untuk token M2M.
    *   **Untuk Resource Owner Password Credentials (ROPC) Grant (HANYA KLIEN FIRST-PARTY TERPERCAYA):**
        *   `grant_type=password`
        *   `username`: Email pengguna.
        *   `password`: Password pengguna.
        *   `client_id` & `client_secret` (jika klien confidential).
        *   `scope`: Opsional.
*   **Respons Sukses (JSON):**
    *   `access_token`: Access Token JWT.
    *   `token_type`: Biasanya `Bearer`.
    *   `expires_in`: Masa berlaku Access Token (detik).
    *   `refresh_token`: (Jika diminta dan diizinkan) Refresh Token baru (dengan rotasi).
    *   `id_token`: (Jika scope `openid` diminta) ID Token JWT.
    *   `scope`: Scope yang diberikan (bisa berbeda dari yang diminta).
*   **Respons Error (JSON):** Sesuai standar OAuth2 (misal, `error`, `error_description`).

### 5.4. UserInfo Endpoint
*   **Path:** `/oauth2/userinfo`
*   **Method:** `GET` atau `POST`
*   **Otentikasi:** Memerlukan Access Token yang valid di header `Authorization: Bearer <access_token>`.
*   **Deskripsi:** Mengembalikan klaim tentang pengguna yang terotentikasi. Klaim yang dikembalikan tergantung pada scope yang diberikan saat Access Token diterbitkan.
*   **Respons Sukses (JSON):**
    *   `sub`: WAJIB. Subject identifier (ID pengguna).
    *   Klaim lain sesuai scope (misal, `name`, `email`, `email_verified`, `picture`, `profile`, `address`, `phone_number` - bersumber dari `auth.users` dan `raw_user_meta_data`).
    *   Respons bisa ditandatangani (JWS) atau dienkripsi (JWE) sesuai konfigurasi klien.

### 5.5. JWKS (JSON Web Key Set) Endpoint
*   **Path:** `/oauth2/certs` (atau `/jwks.json` yang dirujuk dari discovery doc)
*   **Method:** `GET`
*   **Deskripsi:** Mengembalikan JSON object yang berisi public keys Authorization Server dalam format JWK. Digunakan oleh klien untuk memverifikasi signature ID Token dan Access Token (jika JWT).

### 5.6. Logout Endpoint (RP-Initiated Logout)
*   **Path:** `/oauth2/logout`
*   **Method:** `GET` atau `POST`
*   **Deskripsi:** Memungkinkan Relying Party (klien) untuk meminta logout pengguna dari Authorization Server.
*   **Parameter Request (Query String):**
    *   `id_token_hint`: DIREKOMENDASIKAN. ID Token yang sebelumnya diterbitkan untuk pengguna dan klien.
    *   `post_logout_redirect_uri`: OPSIONAL. URL ke mana pengguna akan diarahkan setelah logout. Harus terdaftar di konfigurasi klien.
    *   `state`: OPSIONAL. Untuk menjaga state.
*   **Proses:**
    1.  Validasi `id_token_hint` (jika ada) dan `post_logout_redirect_uri`.
    2.  Invalidasi sesi pengguna di Authorization Server (hapus cookie sesi, cabut refresh token terkait).
    3.  Redirect ke `post_logout_redirect_uri` (jika valid) atau tampilkan halaman konfirmasi logout.

---

## 6. Spesifikasi Token

### 6.1. Access Token (JWT)
*   **Format:** JWT, ditandatangani dengan RS256 (atau algoritma asimetris lain).
*   **Masa Berlaku:** Singkat (misal, 15-60 menit).
*   **Klaim Standar:**
    *   `iss` (Issuer): URL Authorization Server (`https://join.tumbuhide.tech`).
    *   `sub` (Subject): ID pengguna unik.
    *   `aud` (Audience): `client_id` dari Resource Server yang dituju, atau array `client_id`. Bisa juga identifier API internal.
    *   `exp` (Expiration Time): Timestamp kedaluwarsa.
    *   `iat` (Issued At): Timestamp penerbitan.
    *   `jti` (JWT ID): Identifier unik untuk token.
    *   `scope`: Scope yang diberikan (string dipisahkan spasi).
    *   `client_id`: ID klien yang meminta token.
*   **Tujuan:** Digunakan oleh klien untuk mengakses Resource Server yang dilindungi atas nama pengguna.

### 6.2. ID Token (JWT, OIDC Specific)
*   **Format:** JWT, ditandatangani dengan RS256 (atau algoritma yang dikonfigurasi klien).
*   **Masa Berlaku:** Singkat.
*   **Klaim Standar (Minimal):**
    *   `iss`: URL Authorization Server.
    *   `sub`: ID pengguna unik.
    *   `aud`: `client_id` dari klien yang meminta.
    *   `exp`: Timestamp kedaluwarsa.
    *   `iat`: Timestamp penerbitan.
    *   `nonce`: (Jika ada di request otentikasi) Harus sama dengan nilai nonce yang dikirim klien.
*   **Klaim Opsional (tergantung scope `profile`, `email`, dll., bersumber dari `raw_user_meta_data` dan `auth.users`):**
    *   `auth_time`: Timestamp otentikasi terakhir pengguna.
    *   `amr` (Authentication Methods Reference): Metode otentikasi yang digunakan (misal, `pwd` untuk password).
    *   `name`, `given_name`, `family_name`, `picture`, `locale`, `zoneinfo`.
    *   `email`, `email_verified`.
*   **Tujuan:** Digunakan oleh klien untuk mendapatkan informasi identitas pengguna yang terotentikasi. Klien WAJIB memvalidasi signature, `iss`, `aud`, `exp`, dan `nonce` ID Token.

### 6.3. Refresh Token
*   **Format:** String opaque. Disimpan dengan aman di sisi server (dihash di tabel `refresh_tokens`).
*   **Masa Berlaku:** Panjang (misal, 7 hari, 30 hari, atau sesuai konfigurasi).
*   **Penyimpanan Klien:** WAJIB disimpan dalam **HttpOnly, Secure cookie** dengan path yang sesuai (misal, `/oauth2/token`).
*   **Rotasi:** Setiap kali digunakan, refresh token lama dicabut dan yang baru diterbitkan.
*   **Pencabutan:** Harus bisa dicabut oleh pengguna (logout semua sesi) atau admin, atau otomatis saat ganti password/reset password.
*   **Tujuan:** Digunakan oleh klien untuk mendapatkan Access Token (dan ID Token) baru tanpa pengguna harus login ulang.

---

## 7. Alur Pengguna & UI (`join.tumbuhide.tech`)

### 7.1. Registrasi Pengguna
*   **UI:** Form di `/register`.
*   **Input Wajib:** Email, Password, Konfirmasi Password.
*   **Input Opsional (bagi pengguna, tapi sistem mendukung):** Nama Lengkap (`full_name`), Nama Panggilan (bisa jadi `given_name` atau `nickname` di `raw_user_meta_data`).
*   **Proses:**
    1.  Validasi input.
    2.  Panggil Supabase Auth untuk membuat pengguna. Data opsional (Nama Lengkap, dll.) disimpan ke `raw_user_meta_data` pengguna yang baru dibuat.
    3.  Kirim email verifikasi (link & OTP) via Supabase Auth.
    4.  Arahkan ke halaman `/verify-email` dengan instruksi.
*   **Verifikasi Email:**
    *   Pengguna klik link atau masukkan OTP di `/verify-email`.
    *   Supabase Auth memverifikasi.
    *   Arahkan ke halaman konfirmasi atau login.

### 7.2. Login Pengguna (Password-based)
*   **UI:** Form di `/login`.
*   **Input:** Email, Password.
*   **Proses:**
    1.  Panggil Supabase Auth untuk otentikasi.
    2.  Jika berhasil dan ini adalah bagian dari alur OAuth2/OIDC (misal, dipicu dari `/oauth2/authorize`), lanjutkan ke proses consent.
    3.  Jika login langsung ke `join.tumbuhide.tech`: Terbitkan Access Token & Refresh Token (untuk sesi `join.tumbuhide.tech` sendiri), arahkan ke dashboard.

### 7.3. Halaman Persetujuan (Consent Screen)
*   **UI:** Ditampilkan setelah login jika pengguna belum memberikan persetujuan untuk klien & scope yang diminta, atau jika `prompt=consent`.
*   **Tampilan:** Menampilkan nama klien, logo klien, dan daftar scope (izin) yang diminta dengan deskripsi yang mudah dipahami.
*   **Aksi:** Tombol "Izinkan" dan "Tolak".
*   **Proses "Izinkan":** Catat persetujuan di tabel `authorizations`. Lanjutkan alur OAuth2 (misal, terbitkan authorization code).
*   **Proses "Tolak":** Redirect ke `redirect_uri` klien dengan `error=access_denied`.

### 7.4. Lupa Password & Reset Password
*   **UI Lupa Password:** Form di `/forgot-password`. Input: Email.
*   **Proses Lupa Password:** Panggil Supabase Auth untuk mengirim email reset password.
*   **UI Reset Password:** Form di `/reset-password?token=...`. Input: Password Baru, Konfirmasi Password Baru.
*   **Proses Reset Password:**
    1.  Validasi token reset.
    2.  Panggil Supabase Auth untuk update password.
    3.  **WAJIB: Cabut semua Refresh Token aktif untuk pengguna tersebut.**
    4.  Arahkan ke halaman konfirmasi atau login.

### 7.5. Ganti Password (Saat Sesi Aktif)
*   **UI:** Form di `/dashboard/profile/change-password`.
*   **Input:** Password Lama, Password Baru, Konfirmasi Password Baru.
*   **Proses:**
    1.  Verifikasi Password Lama terhadap kredensial pengguna saat ini.
    2.  Jika valid, panggil Supabase Auth untuk update password.
    3.  **WAJIB: Cabut semua Refresh Token aktif untuk pengguna tersebut.** Pengguna akan logout dari semua sesi lain. Sesi saat ini mungkin perlu di-refresh dengan token baru atau pengguna diminta login ulang.
    4.  Tampilkan pesan sukses.

### 7.6. Hapus Akun (User-initiated)
*   **UI:** Opsi di `/dashboard/profile/delete-account`.
*   **Proses:**
    1.  Konfirmasi ulang (misal, ketik password, atau konfirmasi via email).
    2.  Panggil fungsi Supabase Auth `admin.deleteUser(userId)` untuk soft delete (mengisi `deleted_at`).
    3.  Hapus atau anonimisasi data terkait di tabel lain (`authorizations`, `refresh_tokens`, `api_keys`, dll.).
    4.  **WAJIB: Cabut semua token terkait.**
    5.  Logout pengguna dan tampilkan pesan konfirmasi.

---

## 8. Dashboard Pengguna (`join.tumbuhide.tech/dashboard`)

Dilindungi oleh otentikasi (memerlukan Access Token & Refresh Token untuk `join.tumbuhide.tech`).

### 8.1. Manajemen Profil (`/dashboard/profile`)
*   Lihat & edit informasi profil (Nama Lengkap, foto profil, dll. yang disimpan di `raw_user_meta_data`).
*   Ubah alamat email (dengan proses verifikasi email baru).
*   Ganti Password (lihat 7.5).
*   Hapus Akun (lihat 7.6).

### 8.2. Manajemen Aplikasi Klien (`/dashboard/applications`) - Untuk Developer
*   Lihat daftar aplikasi klien yang telah didaftarkan oleh pengguna.
*   Daftarkan aplikasi klien baru:
    *   Input: Nama Klien, Redirect URIs, Logo URI, Tipe Grant yang Diinginkan, Scope Default, dll.
    *   Output: `client_id` dan `client_secret` (jika confidential client, secret hanya ditampilkan sekali).
*   Edit detail aplikasi klien yang sudah ada.
*   Nonaktifkan/Aktifkan aplikasi klien.
*   Regenerate `client_secret`.

### 8.3. Manajemen API Keys (`/dashboard/apikeys`)
*   Lihat daftar API keys yang telah dibuat pengguna untuk mengakses API `join.tumbuhide.tech` secara langsung.
*   Buat API key baru:
    *   Input: Deskripsi, Scope Izin, Opsional Masa Berlaku.
    *   Output: API key (hanya ditampilkan sekali).
*   Edit deskripsi API key.
*   Cabut API key.

### 8.4. Manajemen Sesi Aktif (`/dashboard/sessions`)
*   Lihat daftar sesi aktif pengguna (berdasarkan refresh token yang aktif).
    *   Tampilkan: Perkiraan Lokasi (dari IP), User Agent, Waktu Login Terakhir.
*   Opsi untuk "Logout Sesi Ini" atau "Logout Semua Sesi Lainnya" (mencabut refresh token terkait).

### 8.5. Manajemen Persetujuan (`/dashboard/consents`)
*   Lihat daftar aplikasi klien yang telah diberi persetujuan oleh pengguna.
*   Lihat scope apa saja yang telah disetujui untuk setiap klien.
*   Opsi untuk mencabut persetujuan untuk klien tertentu.

---

## 9. Admin Panel (`join.tumbuhide.tech/admin`)

Akses sangat terbatas untuk peran `superadmin`, idealnya dilindungi MFA (fitur MFA di `next_step.md`). Semua aksi admin dicatat di `audit_logs`.

### 9.1. Manajemen Pengguna (Global)
*   Lihat daftar semua pengguna sistem.
*   Lihat detail pengguna, termasuk status verifikasi, metadata, peran, sesi aktif, `banned_until`, `deleted_at`.
*   Aktifkan/Nonaktifkan akun pengguna.
*   Set/Clear `banned_until` untuk men-suspend atau mengaktifkan kembali pengguna.
*   Kirim email reset password atas nama pengguna.
*   Cabut sesi pengguna tertentu atau semua sesi.
*   Tetapkan/Ubah peran pengguna (misal, `user`, `admin_panel_viewer`, `superadmin`).
*   (Opsional, dengan sangat hati-hati, di `next_step.md`) Impersonasi pengguna untuk troubleshooting.

### 9.2. Manajemen Aplikasi Klien (Global)
*   Lihat daftar semua aplikasi klien yang terdaftar di sistem.
*   Setujui/Tolak pendaftaran klien baru (jika ada alur approval).
*   Edit detail aplikasi klien mana pun.
*   Nonaktifkan/Aktifkan aplikasi klien secara global.
*   Kelola `client_secret` untuk klien mana pun.

### 9.3. Manajemen API Keys (Global)
*   Lihat semua API keys yang diterbitkan di sistem.
*   Cabut API key mana pun jika terindikasi penyalahgunaan.

### 9.4. Lihat Audit Logs
*   Akses penuh ke tabel `audit_logs` dengan fitur filter dan pencarian.

### 9.5. Konfigurasi Sistem
*   Pengaturan default token lifetimes (Access Token, Refresh Token, Authorization Code).
*   Pengaturan default untuk fitur keamanan (misal, panjang minimal password, kebijakan lockout).
*   Kelola daftar scope yang tersedia di sistem dan deskripsinya.
*   Pengaturan email templates.

---

## 10. Pertimbangan Keamanan Tambahan & Error Format

*   **PKCE (Proof Key for Code Exchange):** WAJIB untuk semua klien publik yang menggunakan Authorization Code Grant.
*   **HttpOnly, Secure Cookies untuk Refresh Tokens.**
*   **Password Hashing:** Ditangani Supabase Auth (bcrypt).
*   **Rate Limiting:** Terapkan pada endpoint sensitif (`/oauth2/token`, `/login`, `/register`, `/forgot-password`).
*   **Input Validation & Sanitization:** Di semua input pengguna dan parameter API.
*   **CSRF Protection:**
    *   Gunakan parameter `state` di alur OAuth2.
    *   Untuk form di `join.tumbuhide.tech` (login, register, dll.), gunakan token anti-CSRF.
*   **Security Headers:** `Content-Security-Policy` (CSP), `HTTP Strict-Transport-Security` (HSTS), `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`.
*   **Pencabutan Token:** Mekanisme yang andal untuk mencabut Refresh Token. Access Token bersifat short-lived dan validasinya stateless (cukup verifikasi signature dan exp).
*   **Kebijakan Password yang Kuat:** Minimal panjang. (Cek terhadap kebocoran dan kompleksitas lebih lanjut di `next_step.md`).
*   **Verifikasi Email:** Wajib sebelum akun bisa digunakan sepenuhnya untuk alur sensitif.
*   **Format Error JSON API (Konsisten):**
    ```json
    {
      "error": {
        "code": "INVALID_REQUEST", // Kode error spesifik, misal: E400_MISSING_PARAMETER, E401_INVALID_TOKEN
        "message": "Permintaan tidak valid. Parameter 'client_id' tidak ditemukan.", // Pesan umum yang aman untuk ditampilkan
        "details": { // Opsional, untuk debugging atau info tambahan yang tidak sensitif
          "missing_parameter": "client_id"
        }
      }
    }
    ```

---

## 11. Alur Akses API Langsung (ROPC Grant - Resource Owner Password Credentials)

*   **Endpoint:** `/oauth2/token` (dengan `grant_type=password`).
*   **Klien:** HANYA untuk klien first-party yang sangat terpercaya dan dikonfigurasi sebagai "confidential" dengan `client_secret`. Klien harus diizinkan menggunakan grant type ini (cek `clients.grant_types`).
*   **Request:** Klien mengirim `username` (email), `password`, `client_id`, `client_secret`, `scope`.
*   **Respons:** Sama seperti grant type lain yang menghasilkan token (Access Token, Refresh Token, ID Token).
*   **Peringatan Keamanan:** Flow ini meningkatkan risiko karena klien menangani kredensial pengguna secara langsung. Gunakan dengan sangat hati-hati dan hanya jika tidak ada alternatif yang lebih baik (seperti Authorization Code Grant with PKCE).

---

Dokumen blueprint ini akan menjadi dasar untuk pengembangan Secure Auth. Detail implementasi spesifik untuk setiap fungsi akan mengacu pada standar dan alur yang dijelaskan di sini.
