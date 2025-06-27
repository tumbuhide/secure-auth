# Dokumentasi Endpoint: OpenID Connect Discovery (/.well-known/openid-configuration)

## 📋 Ringkasan

Endpoint ini menyediakan metadata konfigurasi untuk Secure Auth sebagai OpenID Provider. Klien (Relying Parties) dapat menggunakan endpoint ini untuk menemukan informasi penting tentang Authorization Server, termasuk URL endpoint lainnya, algoritma penandatanganan yang didukung, scope yang tersedia, dan klaim yang didukung. Ini memfasilitasi integrasi otomatis dan aman.

## 🔗 Path

`/.well-known/openid-configuration`

Alias: `/api/oauth2/.well-known/openid-configuration`

## 🌐 Metode HTTP

`GET`

## 📝 Deskripsi

Ketika diakses, endpoint ini mengembalikan objek JSON yang sesuai dengan Spesifikasi OpenID Connect Discovery 1.0. Objek ini berisi serangkaian klaim yang menjelaskan kemampuan dan konfigurasi OpenID Provider.

## ➡️ Parameter Request

Tidak ada parameter request.

## ⬅️ Contoh Response Sukses (JSON)

```json
{
  "issuer": "https://join.tumbuhide.tech",
  "authorization_endpoint": "https://join.tumbuhide.tech/api/oauth2/authorize",
  "token_endpoint": "https://join.tumbuhide.tech/api/oauth2/token",
  "userinfo_endpoint": "https://join.tumbuhide.tech/api/oauth2/userinfo",
  "jwks_uri": "https://join.tumbuhide.tech/api/oauth2/certs",
  "end_session_endpoint": "https://join.tumbuhide.tech/api/oauth2/logout",
  "response_types_supported": [
    "code"
  ],
  "subject_types_supported": [
    "public"
  ],
  "id_token_signing_alg_values_supported": [
    "RS256"
  ],
  "scopes_supported": [
    "openid",
    "profile",
    "email",
    "phone",
    "address"
  ],
  "token_endpoint_auth_methods_supported": [
    "client_secret_basic",
    "client_secret_post",
    "client_secret_jwt",
    "private_key_jwt",
    "none"
  ],
  "claims_supported": [
    "iss",
    "sub",
    "aud",
    "exp",
    "iat",
    "auth_time",
    "nonce",
    "acr",
    "amr",
    "azp",
    "name",
    "given_name",
    "family_name",
    "middle_name",
    "nickname",
    "profile",
    "picture",
    "website",
    "email",
    "email_verified",
    "gender",
    "birthdate",
    "zoneinfo",
    "locale",
    "phone_number",
    "phone_number_verified",
    "address",
    "updated_at"
  ],
  "code_challenge_methods_supported": [
    "S256"
  ]
}
```

## ⚠️ Pertimbangan Keamanan

*   Endpoint ini harus dapat diakses secara publik karena fungsinya adalah untuk penemuan otomatis oleh klien.
*   Data yang dikembalikan tidak berisi informasi sensitif yang dapat disalahgunakan secara langsung.
*   Pastikan `issuer` URL dan URL endpoint lainnya dikonfigurasi dengan benar dan sesuai dengan domain yang digunakan (`join.tumbuhide.tech`).
