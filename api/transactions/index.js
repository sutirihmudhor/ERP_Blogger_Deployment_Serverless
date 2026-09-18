import { applyCors, handleOptions } from "../../lib/cors.js";
import { error, json } from "../../lib/response.js";
import { listTransactions, createTransaction } from "../../lib/monthly-db.js";

export default async function handler(req, res) {
  applyCors(req, res);
  if (handleOptions(req, res)) return;

  try {
    if (req.method === "GET") {
      const period = req.query.period;
      if (!period) return error(res, 400, "Query period wajib, contoh 2026-09.");
      const includeDeleted = req.query.includeDeleted === "true";
      const transactions = await listTransactions(period, includeDeleted);
      return json(res, 200, { ok: true, period, transactions });
    }

    if (req.method === "POST") {
      const trx = await createTransaction(req.body || {});
      return json(res, 201, { ok: true, transaction: trx });
    }

    return error(res, 405, "Method tidak didukung.");
  } catch (err) {
    return error(res, 500, err.message);
  }
}
