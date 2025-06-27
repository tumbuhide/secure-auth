# Dokumentasi Endpoint: Logout Endpoint (/api/oauth2/logout)

## 📋 Ringkasan

Logout Endpoint memungkinkan aplikasi klien (Relying Party) untuk meminta agar Pengguna Akhir (End-User) di-logout dari Authorization Server. Ini memberikan alur logout yang terintegrasi di mana pengguna dapat di-logout dari sesi Single Sign-On (SSO) secara keseluruhan.

## 🔗 Path

`/api/oauth2/logout`

## 🌐 Metode HTTP

`GET` atau `POST`

## 📝 Deskripsi

Ketika pengguna diarahkan ke endpoint ini, Authorization Server akan berusaha mengakhiri sesi otentikasi pengguna. Setelah sesi diakhiri (termasuk mencabut refresh token yang aktif), server akan mengarahkan pengguna kembali ke URL yang diizinkan (`post_logout_redirect_uri`) jika disediakan dan valid.

## ➡️ Parameter Request (Query String)

| Parameter                    | Wajib/Opsional | Deskripsi                                                                    |
|------------------------------|----------------|------------------------------------------------------------------------------|
| `id_token_hint`              | DIREKOMENDASIKAN | ID Token yang sebelumnya diterbitkan untuk pengguna. Ini digunakan sebagai indikasi kuat tentang sesi pengguna yang akan di-logout. |
| `post_logout_redirect_uri`   | OPSIONAL       | URL ke mana pengguna akan diarahkan kembali setelah logout berhasil. URL ini harus terdaftar sebelumnya di konfigurasi klien. |
| `state`                      | OPSIONAL       | String opaque yang digunakan oleh klien untuk menjaga state antara permintaan logout dan callback, yang akan dikembalikan di `post_logout_redirect_uri`. |

## ⬅️ Contoh Alur & Response

**1. Logout Berhasil dengan Redirect:**
Jika `post_logout_redirect_uri` valid dan disediakan, server akan mengakhiri sesi dan mengarahkan pengguna kembali.

```
HTTP/1.1 302 Found
Location: https://client.example.com/logged-out?state=OPAQUE_STATE
```

**2. Logout Berhasil tanpa Redirect:**
Jika `post_logout_redirect_uri` tidak disediakan atau tidak valid, server akan mengakhiri sesi dan mengarahkan pengguna ke halaman konfirmasi logout default di `join.tumbuhide.tech`.

```
HTTP/1.1 302 Found
Location: https://join.tumbuhide.tech/logout-success
```

## ⚠️ Pertimbangan Keamanan

*   **Validasi `post_logout_redirect_uri`:** Sangat penting untuk memvalidasi `post_logout_redirect_uri` terhadap daftar URL yang telah disetujui untuk klien (yang didapat dari `id_token_hint`) untuk mencegah serangan pengalihan terbuka (open redirection).
*   **Validasi `id_token_hint`:** Meskipun tidak wajib, memvalidasi `id_token_hint` membantu memastikan bahwa permintaan logout berasal dari pihak yang sah dan berlaku untuk pengguna yang benar.
*   **Pencabutan Token:** Proses logout harus secara andal mencabut semua Refresh Token yang terkait dengan sesi pengguna untuk mencegah akses yang tidak sah setelah logout.
*   **CSRF:** Meskipun `state` bersifat opsional, penggunaannya direkomendasikan jika ada tindakan sensitif yang terkait dengan callback logout di sisi klien.
*   **Logging Audit:** Setiap permintaan logout harus dicatat dalam `audit_logs`.
