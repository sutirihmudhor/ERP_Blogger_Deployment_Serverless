# ERP Blogger Deployment

Arsitektur produksi:

Blogger = Frontend + Database
GitHub = Source Code
Vercel Functions = HTTPS Serverless API
Blogger API = akses database Blogger dari serverless

## 1. Struktur

- `api/` — endpoint serverless HTTPS.
- `lib/` — helper auth, CORS, Blogger API, database bulanan.
- `blogger/` — template/panduan halaman frontend Blogger.
- `frontend/` — contoh JavaScript yang dipasang di Blogger.
- `docs/` — panduan deployment.
- `.env.example` — nama environment variable; JANGAN masukkan secret asli.

## 2. Database Blogger

Satu post per bulan untuk seluruh transaksi:

`ERP|DATA|2026-09`

Body post berisi JSON:

```json
{
  "schema": "ERP_MONTHLY_V1",
  "period": "2026-09",
  "transactions": []
}
```

ID transaksi global:

`TRX-202609-00000001`

Index:

`ERP|INDEX|TRANSACTION`

Audit:

`ERP|AUDIT|2026-09`

`<!-- more -->` tidak digunakan sebagai delimiter database. Blogger post tetap menjadi satu dokumen JSON bulanan.

## 3. Production OAuth

API ini TIDAK memakai localhost.

Contoh callback produksi:

`https://api.example.com/api/auth/google/callback`

Google OAuth redirect URI harus HTTPS untuk production. Simpan client secret dan refresh token di environment variables serverless, bukan di GitHub/Blogger frontend.

## 4. Deployment

Repository ini dirancang untuk dihubungkan ke Vercel. Vercel menjalankan folder `api/` sebagai Functions dan menyediakan HTTPS.

Set environment variables di Vercel:

- `BLOG_ID`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `GOOGLE_REFRESH_TOKEN`
- `ERP_JWT_SECRET`
- `ALLOWED_ORIGINS`
- `ADMIN_EMAIL`

Contoh:

`GOOGLE_REDIRECT_URI=https://api.example.com/api/auth/google/callback`

Tidak ada `npm start` untuk user ERP.

## 5. Alur

Blogger page
  -> HTTPS fetch
Vercel Function
  -> Blogger API
Blogger post database

GitHub hanya menyimpan source code dan menjadi sumber deployment.

## 6. One-time Blogger authorization

Setelah API online, buka:

`https://api.example.com/api/auth/google/start`

Login akun Google pemilik Blogger dan izinkan akses. Callback mengembalikan refresh token. Untuk produksi, simpan refresh token tersebut sebagai `GOOGLE_REFRESH_TOKEN` di Vercel Environment Variables, lalu redeploy.

## 7. Endpoint

- `GET /api/health`
- `GET /api/auth/google/start`
- `GET /api/auth/google/callback`
- `GET /api/transactions?period=2026-09`
- `POST /api/transactions`
- `PUT /api/transactions/:id`
- `DELETE /api/transactions/:id`

DELETE menggunakan soft delete: `status = "deleted"`.

## Catatan keamanan

Jangan commit:
- `.env`
- client secret
- refresh token
- access token
- JWT secret

File `.env.example` hanya berisi nama variable.
