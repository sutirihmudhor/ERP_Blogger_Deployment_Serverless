import { applyCors, handleOptions } from "../../../lib/cors.js";
import { googleAuthUrl } from "../../../lib/google.js";

export default function handler(req, res) {
  applyCors(req, res);
  if (handleOptions(req, res)) return;

  if (req.method !== "GET") {
    res.status(405).end("Method Not Allowed");
    return;
  }

  const url = googleAuthUrl("erp-blogger-setup");
  res.writeHead(302, { Location: url });
  res.end();
}
