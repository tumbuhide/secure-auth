# Secure Auth - Self-Hosted OIDC/OAuth2 Authorization Server

## 🌟 Pengenalan

Secure Auth adalah layanan otentikasi dan otorisasi terpusat, self-hosted, yang dibangun sebagai **Authorization Server (AS)** yang sesuai dengan standar **OAuth 2.0 dan OpenID Connect (OIDC)**. Proyek ini bertujuan untuk menyediakan solusi identitas yang aman, handal, dan mudah diintegrasikan untuk berbagai aplikasi internal maupun eksternal.

Semua layanan, termasuk UI otentikasi, endpoint API, dashboard pengguna, dan admin panel, berjalan di bawah domain utama `join.tumbuhide.tech`. Pengelolaan database dilakukan melalui Supabase Studio self-hosted di `studio.tumbuhide.tech`.

Proyek ini dikembangkan dengan bantuan AI, dengan fokus pada kualitas enterprise, keamanan, dan dokumentasi yang komprehensif.

## 📁 Struktur Proyek Utama

Proyek ini menggunakan Next.js untuk frontend dan backend API, dengan Supabase sebagai backend otentikasi dan database.

```
📦 join.tumbuhide.tech/ (Root Proyek Next.js)
├── /components         # Komponen UI reusable
├── /pages              # Halaman dan API routes Next.js
│   ├── /api            # Backend API (termasuk /oauth2 untuk endpoint OIDC/OAuth2)
│   ├── /admin          # Halaman untuk Admin Panel
│   ├── /dashboard      # Halaman untuk Dashboard Pengguna
│   └── ...             # Halaman publik, login, register, consent, dll.
├── /lib                # Fungsi helper, konfigurasi, Supabase client
├── /public             # Aset statis
├── /styles             # File CSS/styling global
├── /infrastructure
│   └── supabase        # Konfigurasi Docker Compose & .env untuk Supabase self-hosted
├── /docs               # Semua dokumentasi proyek (lihat detail di bawah)
.env.local
.env.production
next.config.js
package.json
README.md               # File ini
```

## 📚 Struktur Dokumentasi (`/docs`)

Dokumentasi adalah bagian krusial dari proyek ini. Semua AI (dan kontributor manusia) **WAJIB** membaca `README.md` ini terlebih dahulu untuk memahami struktur dokumentasi, kemudian `docs/ai.md` untuk panduan kerja, dan `docs/final_app.md` sebagai blueprint teknis utama.

Berikut adalah struktur dan tujuan dari setiap bagian utama dalam direktori `/docs`:

*   **`final_app.md`**:
    *   **Blueprint Utama dan Tunggal Proyek.** Berisi spesifikasi teknis lengkap, arsitektur, model data, definisi endpoint OIDC/OAuth2, alur pengguna, dan pertimbangan keamanan untuk Secure Auth. Ini adalah sumber kebenaran utama untuk implementasi.

*   **`ai.md`**:
    *   **Panduan untuk AI (dan Kontributor).** Berisi aturan kerja, standar dokumentasi, cara melaporkan progres, dan ekspektasi lain untuk memastikan konsistensi dan kualitas.

*   **`next_step.md`**:
    *   **Roadmap Fitur Lanjutan.** Berisi daftar fitur-fitur canggih dan peningkatan yang direncanakan setelah implementasi blueprint inti di `final_app.md` selesai.

*   **`api/`**:
    *   **Direktori untuk Dokumentasi Detail Endpoint API.** Berisi file-file Markdown yang mendokumentasikan setiap endpoint API yang signifikan.
    *   **Lihat `docs/api/README.md`** untuk detail lebih lanjut mengenai struktur dan konten yang diharapkan di dalam direktori ini.

*   **`progress/`**:
    *   **Direktori untuk Laporan Progres Implementasi.** Berisi file-file Markdown yang mencatat kemajuan implementasi fitur-fitur dari `final_app.md`.
    *   **Lihat `docs/progress/README.md`** untuk detail lebih lanjut mengenai struktur dan konten yang diharapkan di dalam direktori ini.

*   **`changelog/`**:
    *   **Direktori untuk Catatan Perubahan dari Blueprint.** Berisi file-file Markdown yang mencatat deviasi, perbaikan, atau keputusan desain yang berbeda dari `final_app.md` selama implementasi, beserta alasannya.
    *   **Lihat `docs/changelog/README.md`** untuk detail lebih lanjut mengenai struktur dan konten yang diharapkan di dalam direktori ini.

## 🚀 Memulai (Untuk AI)

1.  **Baca `README.md` ini (file yang sedang Anda baca)** untuk memahami gambaran umum proyek dan struktur dokumentasi secara keseluruhan.
2.  **Baca `docs/ai.md`** untuk memahami aturan kerja, standar, dan cara berkontribusi serta cara membuat dokumentasi dinamis.
3.  **Pelajari `docs/final_app.md`** sebagai blueprint teknis utama untuk semua implementasi.
4.  Untuk fitur lanjutan yang belum ada di `final_app.md`, lihat `docs/next_step.md`.
5.  Saat mengimplementasikan fitur atau membuat dokumentasi spesifik:
    *   Untuk dokumentasi API, lihat panduan di `docs/api/README.md`.
    *   Untuk laporan progres, lihat panduan di `docs/progress/README.md`.
    *   Untuk mencatat perubahan dari blueprint, lihat panduan di `docs/changelog/README.md`.
6.  Buat dokumentasi yang relevan di subdirektori yang sesuai (`docs/api/`, `docs/progress/`, `docs/changelog/`) seiring dengan pekerjaan Anda, sesuai panduan di `docs/ai.md`.

Selamat berkontribusi dalam membangun Secure Auth!
