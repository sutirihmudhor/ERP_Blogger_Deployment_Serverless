import { applyCors, handleOptions } from "../../lib/cors.js";
import { error, json } from "../../lib/response.js";
import { updateTransaction, softDeleteTransaction } from "../../lib/monthly-db.js";

export default async function handler(req, res) {
  applyCors(req, res);
  if (handleOptions(req, res)) return;

  try {
    const id = req.query.id;
    if (!id) return error(res, 400, "ID transaksi wajib.");

    if (req.method === "PUT") {
      const trx = await updateTransaction(id, req.body || {});
      return json(res, 200, { ok: true, transaction: trx });
    }

    if (req.method === "DELETE") {
      const trx = await softDeleteTransaction(id, req.body?.updated_by || "system");
      return json(res, 200, { ok: true, transaction: trx });
    }

    return error(res, 405, "Method tidak didukung.");
  } catch (err) {
    const status = /tidak ditemukan/i.test(err.message) ? 404 : 500;
    return error(res, status, err.message);
  }
}
