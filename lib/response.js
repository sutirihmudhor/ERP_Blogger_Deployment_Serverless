export function json(res, status, data) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

export function error(res, status, message, extra = {}) {
  json(res, status, { ok: false, error: message, ...extra });
}
