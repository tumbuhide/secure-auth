# 🤖 Panduan AI untuk Proyek Secure Auth

## 📌 Tujuan File Ini

Dokumen ini adalah panduan wajib bagi setiap AI (atau kontributor manusia) yang bekerja pada proyek Secure Auth. Tujuannya adalah untuk:
*   Memastikan pemahaman konteks proyek yang benar dan konsisten.
*   Menetapkan standar untuk implementasi kode dan pembuatan dokumentasi.
*   Mengatur alur kerja pelaporan progres dan penanganan perubahan.
*   Menghasilkan sistem Secure Auth yang berkualitas enterprise, aman, dan terdokumentasi dengan baik.

**Kegagalan untuk mengikuti panduan ini dapat mengakibatkan pekerjaan yang tidak konsisten atau tidak lengkap.**

## 🧠 Ringkasan Proyek

Secure Auth adalah **Authorization Server (AS)** self-hosted yang dibangun sesuai standar **OAuth 2.0 dan OpenID Connect (OIDC)**.
*   **Domain Utama:** `join.tumbuhide.tech` (AS, UI, API, Dashboard, Admin Panel).
*   **Supabase Studio:** `studio.tumbuhide.tech` (Manajemen DB).
*   **Blueprint Utama:** Semua detail teknis, arsitektur, dan alur fitur didefinisikan dalam **`docs/final_app.md`**. Ini adalah sumber kebenaran tunggal untuk implementasi.

## 📜 Aturan Kerja Utama & Standar

### 1. Acuan Utama Implementasi
*   **`docs/final_app.md` adalah kitab suci Anda.** Semua implementasi fitur, endpoint API, struktur data, dan logika bisnis HARUS mengacu pada dokumen ini.
*   Jika ada ambiguitas atau sesuatu yang tidak jelas dalam `final_app.md`, **BERTANYALAH** sebelum membuat asumsi atau melanjutkan implementasi.

### 2. Dokumentasi adalah Bagian dari Pekerjaan (WAJIB)
Setiap kali Anda mengimplementasikan atau memodifikasi fungsionalitas, Anda **WAJIB** membuat atau memperbarui dokumentasi yang relevan secara dinamis. Ini berarti membuat file Markdown baru sesuai kebutuhan.

*   **Dokumentasi Endpoint API (`docs/api/`):**
    *   Untuk setiap endpoint OIDC/OAuth2 atau API kustom yang signifikan yang Anda implementasikan atau modifikasi, buat file dokumentasi detail.
    *   **Struktur Penamaan File:** `docs/api/[nama-grup-endpoint-atau-fitur]/[nama-spesifik-atau-versi].md`
        *   Contoh: `docs/api/token-endpoint/v1.0-details.md`, `docs/api/user-management/create-user-v1.1.md`.
    *   **Konten Minimal:** Deskripsi endpoint, HTTP Method, Path, Parameter (query, path, body), Contoh Request, Contoh Response Sukses, Contoh Response Error, Pertimbangan Keamanan.

*   **Laporan Progres Implementasi (`docs/progress/`):**
    *   Saat Anda menyelesaikan implementasi bagian signifikan dari sebuah fitur atau modul yang didefinisikan di `final_app.md`, buat laporan progres.
    *   **Struktur Penamaan File:** `docs/progress/[deskripsi-fitur-atau-modul]-[versi-implementasi].md`
        *   Contoh: `docs/progress/authorization-code-grant-with-pkce-v1.0-completed.md`.
    *   **Konten Minimal:** Ringkasan pekerjaan yang dilakukan, referensi ke bagian `final_app.md` yang diimplementasikan, tantangan yang dihadapi (jika ada), dan status penyelesaian.

*   **Catatan Perubahan dari Blueprint (`docs/changelog/`):**
    *   Jika selama implementasi Anda menemukan bahwa suatu bagian dari `final_app.md` perlu diubah, tidak layak, atau ada pendekatan yang lebih baik, **JANGAN langsung mengubah `final_app.md`**.
    *   Implementasikan solusi yang Anda yakini benar, lalu **catat deviasi tersebut** di direktori ini.
    *   **Struktur Penamaan File:** `docs/changelog/[deskripsi-perubahan]-[versi-terkait-di-final_app].md`
        *   Contoh: `docs/changelog/penyesuaian-struktur-refresh-token-table-v1.0.md`.
    *   **Konten Minimal:** Deskripsi perubahan yang dibuat, alasan kuat mengapa perubahan tersebut diperlukan (misalnya, masalah keamanan, batasan teknis, peningkatan signifikan), dan bagaimana implementasi baru berbeda dari blueprint awal.

### 3. Standar Umum
*   **Bahasa:** Semua dokumentasi dan komentar kode (jika relevan) ditulis dalam **Bahasa Indonesia** yang baik dan benar, kecuali untuk istilah teknis, kode, atau payload JSON/API.
*   **Format:** Gunakan Markdown yang valid untuk semua file `.md`.
*   **Kualitas Kode:** Tulis kode yang bersih, efisien, aman, dan mudah dipahami, sesuai dengan best practices Next.js, Node.js, dan Supabase.
*   **Keamanan:** Selalu prioritaskan keamanan. Ikuti prinsip-prinsip yang diuraikan dalam `final_app.md` (Bagian 3).
*   **Konsistensi:** Jaga konsistensi dalam penamaan variabel, fungsi, file, dan struktur direktori.

### 4. Alur Kerja yang Diharapkan
1.  Terima tugas atau pilih bagian dari `final_app.md` untuk diimplementasikan.
2.  Pahami sepenuhnya persyaratan dari `final_app.md`.
3.  Implementasikan fitur atau perbaikan.
4.  Buat atau perbarui dokumentasi yang relevan di `docs/api/`, `docs/progress/`, dan/atau `docs/changelog/` **SEGERA** setelah implementasi selesai.
5.  Sampaikan hasil pekerjaan beserta link ke dokumentasi yang baru dibuat/diperbarui.

### 5. Struktur Dokumentasi yang Perlu Diperhatikan
*   `docs/final_app.md` (Blueprint Utama)
*   `docs/ai.md` (Panduan Ini)
*   `docs/next_step.md` (Fitur Lanjutan)
*   `docs/api/` (Dokumentasi API Detail - Anda yang membuat isinya)
*   `docs/progress/` (Laporan Progres - Anda yang membuat isinya)
*   `docs/changelog/` (Catatan Perubahan - Anda yang membuat isinya)

## 🚀 Tujuan Akhir

Kita sedang membangun sistem otentikasi kelas enterprise. Kualitas, keamanan, dan dokumentasi adalah kunci. Kontribusi Anda sangat berharga untuk mencapai tujuan ini. Bekerjalah dengan cermat, detail, dan selalu mengacu pada standar yang telah ditetapkan.

Jika ada keraguan, selalu lebih baik bertanya daripada membuat kesalahan.
