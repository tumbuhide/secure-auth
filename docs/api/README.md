# Dokumentasi API Secure Auth

Direktori ini berisi dokumentasi teknis detail untuk setiap endpoint API yang signifikan dalam sistem Secure Auth, termasuk endpoint OIDC/OAuth2 dan API kustom lainnya.

## Tujuan
*   Menyediakan referensi lengkap bagi pengembang yang akan mengintegrasikan atau menggunakan API Secure Auth.
*   Memastikan pemahaman yang jelas tentang fungsionalitas, parameter, request, response, dan perilaku error setiap endpoint.

## Struktur Konten
Setiap endpoint atau grup endpoint yang terkait erat harus memiliki file Markdown sendiri di dalam direktori ini atau subdirektori yang sesuai.

**Struktur Penamaan File yang Direkomendasikan:**
`[nama-grup-endpoint-atau-fitur]/[nama-spesifik-atau-versi].md`

Contoh:
*   `token-endpoint/v1.0-details.md`
*   `userinfo-endpoint/v1.0-details.md`
*   `admin-user-management/create-user-v1.0.md`

**Konten Minimal untuk Setiap Dokumentasi Endpoint:**
1.  **Deskripsi Umum:** Penjelasan singkat tentang fungsi endpoint.
2.  **HTTP Method & Path:** Misal, `POST /oauth2/token`.
3.  **Otentikasi & Otorisasi:** Bagaimana endpoint ini diamankan (misal, memerlukan Access Token, otentikasi klien, dll.).
4.  **Parameter Request:**
    *   Parameter Path (jika ada).
    *   Parameter Query String (jika ada).
    *   Header Request yang relevan.
    *   Body Request (dengan contoh format JSON atau x-www-form-urlencoded).
5.  **Contoh Request Lengkap.**
6.  **Respons Sukses:**
    *   Kode Status HTTP (misal, `200 OK`, `201 Created`).
    *   Header Respons yang relevan.
    *   Body Respons (dengan contoh format JSON).
7.  **Respons Error:**
    *   Kode Status HTTP untuk berbagai skenario error (misal, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`).
    *   Body Respons Error (mengikuti format error standar proyek).
8.  **Pertimbangan Keamanan Spesifik** (jika ada).
9.  **Rate Limiting** (jika berlaku untuk endpoint ini).

Dokumentasi ini bersifat dinamis dan akan dibuat serta diperbarui oleh AI (atau kontributor) seiring dengan implementasi dan evolusi API. Selalu mengacu pada `docs/final_app.md` untuk desain API secara keseluruhan dan `docs/ai.md` untuk panduan pembuatan dokumentasi.
