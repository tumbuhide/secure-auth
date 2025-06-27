# Catatan Perubahan (Changelog) Secure Auth

Direktori ini berisi catatan tentang setiap perubahan, deviasi, atau keputusan desain yang berbeda dari blueprint utama proyek (`docs/final_app.md`) yang terjadi selama proses implementasi.

## Tujuan
*   Menjaga transparansi mengenai evolusi desain proyek.
*   Menyediakan justifikasi untuk setiap perbedaan antara implementasi aktual dan rencana awal di blueprint.
*   Memastikan bahwa `docs/final_app.md` tetap menjadi sumber kebenaran, dan semua deviasi terdokumentasi dengan baik.

## Kapan Membuat Catatan Perubahan?
Sebuah catatan perubahan **WAJIB** dibuat jika:
*   Implementasi aktual berbeda secara signifikan dari apa yang dijelaskan dalam `docs/final_app.md`.
*   Sebuah fitur yang direncanakan di `docs/final_app.md` ternyata tidak layak atau digantikan dengan pendekatan lain.
*   Ditemukan masalah keamanan atau batasan teknis yang mengharuskan perubahan desain dari blueprint.
*   Ada penambahan atau pengurangan scope fitur yang signifikan dari rencana awal.

**PENTING:** Jangan mengubah `docs/final_app.md` secara langsung untuk mencerminkan deviasi ini. `docs/final_app.md` adalah rencana awal. Deviasi dicatat di sini. Pembaruan `docs/final_app.md` hanya dilakukan secara periodik setelah diskusi dan persetujuan.

## Struktur Konten
Setiap perubahan signifikan harus memiliki file Markdown sendiri di direktori ini.

**Struktur Penamaan File yang Direkomendasikan:**
`[deskripsi-singkat-perubahan]-[versi-blueprint-terkait-atau-tanggal].md`

Contoh:
*   `penyesuaian-struktur-refresh-token-table-final-app-v1.0.md`
*   `penggantian-metode-pkce-challenge-2023-10-28.md`
*   `penghapusan-fitur-x-karena-alasan-keamanan-final-app-v1.0.md`

**Konten Minimal untuk Setiap Catatan Perubahan:**
1.  **Judul/Deskripsi Perubahan:** Penjelasan singkat tentang perubahan yang dibuat.
2.  **Tanggal Perubahan:** Tanggal keputusan atau implementasi perubahan ini.
3.  **Referensi ke Blueprint:** Sebutkan bagian atau nomor versi dari `docs/final_app.md` yang terpengaruh oleh perubahan ini.
4.  **Deskripsi Perubahan Detail:** Jelaskan secara rinci apa yang diubah dan bagaimana implementasi baru berbeda dari rencana awal di blueprint.
5.  **Alasan Perubahan:** Justifikasi yang kuat mengapa perubahan ini diperlukan (misalnya, masalah keamanan yang ditemukan, batasan teknis yang tidak terduga, persyaratan baru, peningkatan signifikan yang tidak terpikirkan sebelumnya, ketidaklayakan desain awal).
6.  **Dampak Perubahan (Jika Ada):** Bagaimana perubahan ini mempengaruhi bagian lain dari sistem atau fitur lain.
7.  **Solusi Alternatif yang Dipertimbangkan (Jika Ada):** Mengapa solusi yang diimplementasikan dipilih di atas alternatif lain.

Catatan perubahan ini bersifat dinamis dan dibuat oleh AI (atau kontributor) ketika deviasi dari blueprint terjadi. Selalu mengacu pada `docs/ai.md` untuk panduan pembuatan dokumentasi.
