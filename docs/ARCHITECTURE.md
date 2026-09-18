# Architecture

```text
                    ┌─────────────────────────┐
                    │       Blogger           │
                    │  Frontend ERP           │
                    │  HTML/CSS/JS            │
                    └────────────┬────────────┘
                                 │ HTTPS
                                 ▼
                    ┌─────────────────────────┐
                    │   Serverless API        │
                    │   Vercel Functions      │
                    │                         │
                    │ Auth / CRUD / Validation │
                    │ Accounting / Budget     │
                    │ Inventory / Purchasing  │
                    │ Production / Reports    │
                    └────────────┬────────────┘
                                 │ Blogger API
                                 ▼
                    ┌─────────────────────────┐
                    │       Blogger           │
                    │     Database            │
                    │                         │
                    │ ERP|DATA|YYYY-MM        │
                    │ ERP|INDEX|TRANSACTION   │
                    │ ERP|AUDIT|YYYY-MM       │
                    └─────────────────────────┘

                    ┌─────────────────────────┐
                    │        GitHub            │
                    │ source code + workflow   │
                    └────────────┬────────────┘
                                 │ auto deployment
                                 ▼
                         Serverless platform
```

GitHub bukan database transaksi dan bukan runtime API.

GitHub Pages juga bukan tempat untuk menjalankan Express/Node server. Ia adalah static hosting.

Serverless platform menjalankan kode API secara HTTPS.
