# Deployment: GitHub -> Vercel -> Blogger

## A. GitHub

1. Buat repository, misalnya `smartbudget-erp-api`.
2. Upload semua isi ZIP ini.
3. Pastikan `.env` tidak pernah di-upload.
4. Commit dan push.

GitHub berfungsi sebagai source code/version control.

## B. Vercel

1. Buat project baru dari repository GitHub.
2. Vercel akan deploy Functions dari folder `api/`.
3. Tambahkan Environment Variables:
   - BLOG_ID
   - GOOGLE_CLIENT_ID
   - GOOGLE_CLIENT_SECRET
   - GOOGLE_REDIRECT_URI
   - GOOGLE_REFRESH_TOKEN
   - ERP_JWT_SECRET
   - ALLOWED_ORIGINS
   - ADMIN_EMAIL
4. Redeploy.

Jika memakai domain custom, misalnya:

`https://api.smartbudget.example`

maka:

`GOOGLE_REDIRECT_URI=https://api.smartbudget.example/api/auth/google/callback`

## C. Google Cloud

Buat OAuth Client type Web application.

Authorized redirect URI:

`https://api.smartbudget.example/api/auth/google/callback`

Untuk testing boleh localhost, tetapi deployment production memakai HTTPS.

## D. One-time authorization

Setelah deployment:

`https://api.smartbudget.example/api/auth/google/start`

Login akun Google yang memiliki Blogger.

Setelah callback, salin refresh token ke:

`GOOGLE_REFRESH_TOKEN`

di Vercel Environment Variables, lalu redeploy.

## E. Blogger

Frontend Blogger memanggil:

`https://api.smartbudget.example/api/...`

Blogger tidak menyimpan client secret.

## F. CORS

Isi:

`ALLOWED_ORIGINS=https://nama-blog.blogspot.com`

Jika custom domain Blogger:

`ALLOWED_ORIGINS=https://erp.example.com`

Untuk beberapa origin, pisahkan dengan koma.

## G. Database

Contoh post:

Title:
`ERP|DATA|2026-09`

Labels:
- ERP-DATA
- YEAR-2026
- MONTH-09
- PERIOD-2026-09

Content adalah JSON ERP bulanan.

## H. Update deployment

Setiap push ke branch yang terhubung dengan Vercel akan dapat deployment baru sesuai konfigurasi project.

User ERP tidak perlu:
- `npm install`
- `npm start`
- localhost
- menjalankan Node sendiri

Yang menjalankan API adalah platform serverless.
