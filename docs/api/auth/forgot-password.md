# Dokumentasi Endpoint: Forgot Password (/api/auth/forgot-password)

## 📋 Ringkasan

Endpoint ini memulai alur reset password untuk pengguna. Endpoint ini menerima alamat email dan memicu layanan Supabase untuk mengirimkan email berisi link reset password kepada pengguna.

## 🔗 Path

`/api/auth/forgot-password`

## 🌐 Metode HTTP

`POST`

## 📝 Deskripsi

Untuk alasan keamanan, endpoint ini akan selalu mengembalikan respons sukses generik, terlepas dari apakah email yang diberikan terdaftar di sistem atau tidak. Ini adalah praktik terbaik untuk mencegah serangan enumerasi email (kemampuan untuk menebak-nebak email mana yang valid dan terdaftar).

## ➡️ Parameter Request (JSON Body)

| Parameter      | Tipe   | Wajib/Opsional | Deskripsi                               |
|----------------|--------|----------------|-----------------------------------------|
| `email`        | String | WAJIB          | Alamat email pengguna yang lupa password. |

## ⬅️ Contoh Response Sukses (JSON)

```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "message": "Jika akun dengan email tersebut ada, kami telah mengirimkan instruksi untuk reset password."
}
```
*(Respons ini selalu sama, baik email ditemukan maupun tidak)*

## ⚠️ Pertimbangan Keamanan

*   **Pencegahan Enumerasi Email:** Seperti yang dijelaskan, respons yang seragam sangat penting untuk keamanan. Error aktual (jika ada) hanya boleh dicatat di log sisi server (`audit_logs`) dan tidak boleh diekspos ke klien.
*   **Masa Berlaku Link Reset:** Link reset password yang dikirim melalui email harus memiliki masa berlaku yang singkat untuk mengurangi jendela waktu serangan.
*   **Rate Limiting:** Terapkan rate limiting untuk mencegah penyerang mengirimkan email reset massal ke banyak alamat.
*   **Logging Audit:** Catat setiap permintaan reset password, baik yang valid maupun tidak, untuk memantau aktivitas yang mencurigakan.
