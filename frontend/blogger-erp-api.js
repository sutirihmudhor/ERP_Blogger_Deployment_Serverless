/*
  Pasang script ini di halaman/template Blogger.
  Ganti API_BASE dengan URL HTTPS API hasil deployment.

  Contoh:
  const API_BASE = "https://api.example.com";
*/

window.ERP_API = (() => {
  const API_BASE = window.ERP_API_BASE || "https://api.example.com";

  async function request(path, options = {}) {
    const response = await fetch(API_BASE + path, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    return data;
  }

  return {
    health: () => request("/api/health"),
    list: period => request(`/api/transactions?period=${encodeURIComponent(period)}`),
    create: payload => request("/api/transactions", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
    update: (id, patch) => request(`/api/transactions/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(patch)
    }),
    remove: (id, updated_by) => request(`/api/transactions/${encodeURIComponent(id)}`, {
      method: "DELETE",
      body: JSON.stringify({ updated_by })
    })
  };
})();
