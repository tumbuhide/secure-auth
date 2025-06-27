# Dokumentasi Endpoint: JWKS Endpoint (/api/oauth2/certs)

## 📋 Ringkasan

JWKS (JSON Web Key Set) Endpoint adalah sumber daya publik di mana Authorization Server mempublikasikan kunci publiknya. Klien dan Resource Server menggunakan endpoint ini untuk mendapatkan kunci yang diperlukan untuk memverifikasi signature dari JSON Web Tokens (JWTs) seperti ID Token dan Access Token.

## 🔗 Path

`/api/oauth2/certs`

(Sesuai dengan `jwks_uri` yang didefinisikan di `/.well-known/openid-configuration`)

## 🌐 Metode HTTP

`GET`

## 📝 Deskripsi

Endpoint ini mengembalikan objek JSON yang berisi satu set kunci dalam format JWK. Setiap kunci dalam set ini memiliki Key ID (`kid`) unik yang sesuai dengan `kid` di header JWT. Hal ini memungkinkan klien untuk memilih kunci yang benar untuk verifikasi.

## ➡️ Parameter Request

Tidak ada parameter request.

## ⬅️ Contoh Response Sukses (JSON)

Respons adalah objek JSON yang berisi array `keys`. Setiap objek dalam array adalah representasi JWK dari kunci publik.

```json
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: public, max-age=3600

{
  "keys": [
    {
      "kty": "RSA",
      "kid": "unique-key-id-123",
      "use": "sig",
      "alg": "RS256",
      "n": "long_base64url_encoded_modulus...",
      "e": "AQAB"
    }
  ]
}
```

| Properti JWK | Deskripsi                                                                    |
|--------------|------------------------------------------------------------------------------|
| `kty`        | Key Type, contoh: `RSA`.                                                     |
| `kid`        | Key ID, identifier unik untuk kunci.                                         |
| `use`        | Public Key Use, contoh: `sig` (signature).                                   |
| `alg`        | Algorithm, algoritma yang dimaksudkan untuk digunakan dengan kunci ini, contoh: `RS256`. |
| `n`          | RSA modulus, direpresentasikan sebagai string Base64Url-encoded.             |
| `e`          | RSA exponent, direpresentasikan sebagai string Base64Url-encoded.            |

## ⚠️ Pertimbangan Keamanan & Praktik Terbaik

*   **Caching:** Klien harus melakukan cache terhadap respons JWKS untuk menghindari permintaan yang tidak perlu pada setiap verifikasi token. Header `Cache-Control` harus diatur pada respons untuk memberi tahu klien tentang durasi cache yang direkomendasikan.
*   **Rotasi Kunci:** Saat kunci penandatanganan dirotasi, Authorization Server harus mempublikasikan kunci publik yang baru di JWKS endpoint **sebelum** mulai menggunakannya untuk menandatangani token. Kunci lama harus tetap ada di set untuk beberapa waktu agar token yang ada masih dapat diverifikasi.
*   **Akses Publik:** Endpoint ini harus dapat diakses secara publik dan tidak memerlukan otentikasi.
*   **Keamanan Kunci Privat:** Kunci privat yang sesuai dengan kunci publik yang dipublikasikan di sini harus dijaga dengan sangat aman di sisi server dan tidak boleh bocor.
