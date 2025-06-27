# Changelog: Penambahan Pengecekan Password Bocor (HIBP)

**Tanggal Perubahan:** 31 Juli 2024

**Referensi ke Blueprint:** Penambahan ini tidak secara langsung mengubah bagian yang ada, melainkan menambahkan fungsionalitas baru pada alur yang dijelaskan di `docs/final_app.md`, Bagian 7.1 (Registrasi Pengguna).

**Deskripsi Perubahan Detail:**
Selama implementasi, sebuah lapisan keamanan tambahan ditambahkan pada API registrasi (`/api/auth/register`). Sebelum membuat pengguna baru, password yang diberikan oleh pengguna sekarang diperiksa terhadap layanan "Pwned Passwords" dari Have I Been Pwned (HIBP) menggunakan API k-Anonymity mereka.

Jika hash dari password tersebut ditemukan di dalam database HIBP, proses registrasi akan dihentikan dan pengguna akan diminta untuk memilih password lain yang lebih kuat dan unik.

**Alasan Perubahan:**
Blueprint `final_app.md` sudah mencakup dasar-dasar keamanan password yang kuat (panjang minimal, hashing yang aman). Namun, untuk mencapai standar "Production Ready" yang lebih tinggi, mencegah pengguna menggunakan password yang sudah diketahui bocor adalah langkah proaktif yang sangat efektif untuk melindungi akun dari serangan *credential stuffing*. Ini adalah praktik keamanan modern yang sangat direkomendasikan.

**Dampak Perubahan:**
- **Positif:** Keamanan akun pengguna secara signifikan meningkat.
- **Negatif:** Ada ketergantungan eksternal (meskipun minimal dan aman) pada API HIBP. Jika API tersebut tidak dapat diakses, fungsi `isPasswordPwned` dirancang untuk gagal secara aman (menganggap password tidak bocor) agar tidak mengganggu proses registrasi, dengan error yang dicatat di log server.
