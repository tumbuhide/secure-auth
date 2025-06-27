# Log Kesalahan: Rekapitulasi Final & Pembelajaran dari Kesalahan Berulang

**Versi:** 4.0 (Final & Locked)
**Tanggal:** 31 Juli 2024
**Tujuan:** Dokumen ini adalah "batu pengingat" definitif yang mencatat semua kesalahan mendasar yang terjadi selama proses refaktorisasi. Tujuannya adalah untuk menjadi acuan tunggal agar kesalahan yang sama **TIDAK PERNAH TERULANG LAGI**.

---

### 1. Kesalahan Fatal: `Unterminated string literal` di dalam Atribut JSX

- **Masalah:** Menggunakan karakter baris baru (newline) secara langsung di dalam atribut string pada JSX.
- **Contoh Salah yang Terus Diulang:**
  ```jsx
  <Textarea defaultValue={myArray.join('
  ')} />
  ```
- **Akar Masalah:** JSX parser tidak mengizinkan newline literal di dalam string atribut. Ini akan merusak struktur JSX dan menyebabkan serangkaian error turunan yang membingungkan (seperti `Cannot find name 'required'`, `',' expected`, dll), yang membuat debugging menjadi sulit.
- **Solusi Definitif (Referensi dari AI Sebelah):** Selalu gunakan escape sequence `
` untuk karakter baris baru di dalam string JavaScript.
  ```jsx
  <Textarea defaultValue={myArray.join('
')} />
  ```
- **Pelajaran:** Ini adalah kesalahan sintaks fundamental. Periksa kembali semua string multiline di dalam JSX, terutama pada atribut seperti `defaultValue`.

---

### 2. Kesalahan Fatal: Salah Menggunakan `cookies()` di Server Context

- **Masalah:** Lupa menggunakan `await` saat memanggil `cookies()` dari `next/headers` di dalam Server Actions atau Server Components.
- **Error Signature:** `Argument of type 'Promise<ReadonlyRequestCookies>' is not assignable to parameter of type 'ReadonlyRequestCookies'.`
- **Akar Masalah (Referensi dari AI Sebelah):** `cookies()` di dalam App Router **adalah async function** dan mengembalikan sebuah `Promise`. Melewatkan Promise ini ke fungsi lain yang mengharapkan objek cookie secara langsung akan menyebabkan error tipe yang jelas.
- **Solusi Definitif:** **Selalu** gunakan `await` saat memanggil `cookies()` di lingkungan server sebelum melewatkannya ke fungsi lain.
  ```typescript
  // Pola yang WAJIB diikuti
  export async function myServerAction() {
      const cookieStore = await cookies(); // WAJIB ada await
      const supabase = createSupabaseServerClient(cookieStore);
      // ...
  }
  ```
- **Pelajaran:** Pahami sifat asinkron dari fungsi-fungsi inti di Next.js App Router. Jangan membuat asumsi.

---

### 3. Kesalahan Fatal: Salah Menggunakan Hook `useActionState`

- **Masalah:** Menggunakan hook `useActionState` (sebelumnya `useFormState`) dengan tidak benar, menyebabkan error `No overload matches this call` dan `message: null is not assignable to type string`.
- **Akar Masalah (Referensi dari AI Sebelah):** Hook ini memiliki tipe data yang ketat dan implementasinya mungkin berbeda antar versi React. Selain itu, `useFormStatus` (yang sering digunakan bersamanya) tidak bisa diimpor dari `'react'`.
- **Solusi Definitif & Lebih Stabil:** Kembali ke pola yang lebih stabil dan universal: **`useState` + `useTransition`**. Ini memberikan kontrol penuh atas state pending dan hasil dari Server Action tanpa bergantung pada hook eksperimental.
  ```typescript
  // Pola yang WAJIB diikuti untuk form dengan Server Actions
  const [state, setState] = useState(initialState);
  const [isPending, startTransition] = useTransition();

  async function formAction(formData: FormData) {
    startTransition(async () => {
      const result = await myServerAction(formData);
      setState(result);
    });
  }
  ```
- **Pelajaran:** Untuk production-ready code, utamakan stabilitas. Jika sebuah hook baru menyebabkan masalah, kembali ke pola dasar yang terbukti andal.

---
### 4. Kesalahan Fatal: Izin Database `permission denied`
- **Masalah:** Error `permission denied for schema public` terus muncul bahkan setelah `GRANT ALL ON TABLES` diberikan.
- **Akar Masalah:** Pada Supabase (terutama self-hosted), `service_role` tidak hanya butuh izin pada tabel, tetapi juga izin **`USAGE`** pada skema (`public`) itu sendiri untuk dapat berinteraksi dengannya. Selain itu, peran `authenticated` memerlukan izin `SELECT` eksplisit pada tabel yang datanya perlu mereka baca di dashboard, yang dibatasi oleh kebijakan RLS.
- **Solusi Definitif:** Membuat satu file migrasi yang komprehensif (`0001_fix_all_permissions.sql`) yang melakukan:
    1. `GRANT USAGE ON SCHEMA public TO service_role;`
    2. `GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;`
    3. Mengaktifkan RLS pada tabel yang relevan.
    4. Memberikan `GRANT SELECT` pada tabel tersebut untuk peran `authenticated`.
- **Pelajaran:** Izin database bersifat berlapis. Pahami hierarki izin dari skema, tabel, hingga baris (RLS). Jangan pernah berasumsi peran memiliki izin default.
