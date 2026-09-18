import { applyCors, handleOptions } from "../../../lib/cors.js";
import { oauthClient } from "../../../lib/google.js";

export default async function handler(req, res) {
  applyCors(req, res);
  if (handleOptions(req, res)) return;

  try {
    const code = req.query.code;
    if (!code) {
      res.status(400).end("Authorization code tidak ditemukan.");
      return;
    }

    const auth = oauthClient();
    const { tokens } = await auth.getToken(code);

    res.status(200).setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(`<!doctype html>
<html><head><meta charset="utf-8"><title>ERP OAuth</title></head>
<body style="font-family:Arial;padding:24px">
<h2>Google OAuth berhasil.</h2>
<p>Simpan nilai <b>refresh_token</b> berikut sebagai environment variable
<code>GOOGLE_REFRESH_TOKEN</code> di serverless hosting.</p>
<pre style="white-space:pre-wrap;word-break:break-all">${tokens.refresh_token || "(Google tidak mengirim refresh token baru; gunakan token lama jika ada.)"}</pre>
<p>Setelah disimpan di environment variable, redeploy API.</p>
</body></html>`);
  } catch (err) {
    res.status(500).end(`OAuth gagal: ${err.message}`);
  }
}
