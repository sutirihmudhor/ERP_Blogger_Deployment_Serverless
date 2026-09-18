import { applyCors, handleOptions } from "../../lib/cors.js";
import { json } from "../../lib/response.js";

export default function handler(req, res) {
  applyCors(req, res);
  if (handleOptions(req, res)) return;
  json(res, 200, {
    ok: true,
    service: "erp-blogger-api",
    mode: "serverless",
    timestamp: new Date().toISOString()
  });
}
