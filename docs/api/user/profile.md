# Dokumentasi Endpoint: User Profile (/api/user/profile)

## 📋 Ringkasan

Endpoint ini adalah pusat untuk manajemen akun oleh pengguna yang sedang login. Endpoint ini menangani beberapa metode HTTP untuk fungsi yang berbeda: mengubah password dan menghapus akun.

## 🔗 Path

`/api/user/profile`

---

## 🌐 Metode: `PUT` (Ubah Password)

### Deskripsi
Mengubah password pengguna saat ini. Endpoint ini memerlukan verifikasi password lama untuk keamanan.

### Parameter Request (JSON Body)
| Parameter           | Tipe   | Wajib/Opsional | Deskripsi                                     |
|---------------------|--------|----------------|-----------------------------------------------|
| `currentPassword`   | String | WAJIB          | Password pengguna yang saat ini aktif.        |
| `newPassword`       | String | WAJIB          | Password baru yang diinginkan (min. 8 karakter). |

### Contoh Response Sukses (JSON)
```json
HTTP/1.1 200 OK
Content-Type: application/json
{
  "message": "Password berhasil diubah."
}
```

### Contoh Response Error (JSON)
```json
HTTP/1.1 403 Forbidden
Content-Type: application/json
{
  "error": { "message": "Password saat ini salah." }
}
```

### Pertimbangan Keamanan
*   **Verifikasi Password Lama:** Wajib untuk memverifikasi password lama sebelum mengizinkan perubahan untuk mencegah pengambilalihan akun jika sesi pengguna dibajak.
*   **Logout Sesi Lain:** Setelah password berhasil diubah, semua sesi lain (refresh token) harus dicabut (`signOut({ scope: 'global' })`) untuk mengakhiri sesi yang mungkin aktif di perangkat lain.
*   **Logging Audit:** Catat setiap upaya perubahan password, baik berhasil maupun gagal.

---

## 🌐 Metode: `DELETE` (Hapus Akun)

### Deskripsi
Menghapus akun pengguna yang sedang login secara permanen. Ini adalah tindakan yang merusak dan tidak dapat dibatalkan.

### Parameter Request
Tidak ada parameter body yang diperlukan.

### Contoh Response Sukses (JSON)
```json
HTTP/1.1 200 OK
Content-Type: application/json
{
  "message": "Akun berhasil dihapus."
}
```

### Contoh Response Error (JSON)
```json
HTTP/1.1 500 Internal Server Error
Content-Type: application/json
{
  "error": { "message": "Gagal menghapus akun: [Pesan Error dari Server]" }
}
```

### Pertimbangan Keamanan
*   **Otentikasi:** Endpoint ini harus sangat dilindungi dan hanya dapat diakses oleh pengguna yang terotentikasi.
*   **Konfirmasi Ulang:** Sangat direkomendasikan untuk memiliki konfirmasi ulang yang kuat di sisi UI (misalnya, meminta pengguna mengetikkan teks tertentu) sebelum memanggil endpoint ini.
*   **Penghapusan Data:** Proses penghapusan harus memastikan semua data terkait pengguna (di `clients`, `authorizations`, dll.) juga dihapus atau dianonimkan sesuai dengan kebijakan privasi, biasanya melalui foreign key dengan `ON DELETE CASCADE`.
*   **Logging Audit:** Catat setiap permintaan penghapusan akun.
