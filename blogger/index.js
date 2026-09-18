<!--
  Potongan frontend untuk Blogger.
  Blogger tetap menjadi frontend. File ini hanya contoh struktur yang
  dapat dipindahkan ke Page/Post/Theme Blogger.

  Jangan taruh GOOGLE_CLIENT_SECRET atau GOOGLE_REFRESH_TOKEN di sini.
-->
<div id="erp-app">
  <h2>ERP</h2>
  <div id="erp-status">Checking API...</div>

  <label>Period</label>
  <input id="erp-period" value="2026-09">

  <button id="erp-load">Load Transactions</button>
  <button id="erp-new">New Transaction</button>

  <pre id="erp-output"></pre>
</div>

<script>
  window.ERP_API_BASE = "https://api.example.com";
</script>
<script src="https://api.example.com/frontend/blogger-erp-api.js"></script>
<script>
(async function () {
  const status = document.getElementById("erp-status");
  const output = document.getElementById("erp-output");
  const period = document.getElementById("erp-period");

  try {
    const h = await ERP_API.health();
    status.textContent = h.ok ? "API online" : "API error";
  } catch (e) {
    status.textContent = "API offline: " + e.message;
  }

  document.getElementById("erp-load").onclick = async () => {
    try {
      const data = await ERP_API.list(period.value);
      output.textContent = JSON.stringify(data.transactions, null, 2);
    } catch (e) {
      output.textContent = e.message;
    }
  };

  document.getElementById("erp-new").onclick = async () => {
    try {
      const data = await ERP_API.create({
        period: period.value,
        module: "budget",
        department: "ACC",
        date: period.value + "-01",
        account: { no: "1000001", name: "Petty Cash - IDR" },
        currency: "IDR",
        amount: 1000000,
        amount_usd: 0,
        data: { example: true },
        created_by: "admin"
      });
      output.textContent = JSON.stringify(data.transaction, null, 2);
    } catch (e) {
      output.textContent = e.message;
    }
  };
})();
</script>
