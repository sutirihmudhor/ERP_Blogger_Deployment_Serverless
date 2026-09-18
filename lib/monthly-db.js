import { bloggerClient } from "./google.js";

const LABEL = "ERP-DATA";

function periodTitle(period) {
  return `ERP|DATA|${period}`;
}

function validatePeriod(period) {
  if (!/^\d{4}-\d{2}$/.test(period)) {
    throw new Error("Period harus YYYY-MM.");
  }
  return period;
}

async function findPostByTitle(blogger, title) {
  let pageToken;
  do {
    const result = await blogger.posts.list({
      blogId: process.env.BLOG_ID,
      maxResults: 50,
      pageToken,
      fetchBodies: false
    });
    const found = (result.data.items || []).find(p => p.title === title);
    if (found) return found;
    pageToken = result.data.nextPageToken;
  } while (pageToken);
  return null;
}

function emptyDoc(period) {
  return {
    schema: "ERP_MONTHLY_V1",
    period,
    updated_at: new Date().toISOString(),
    transactions: []
  };
}

function bodyFromDoc(doc) {
  return `<pre>${escapeHtml(JSON.stringify(doc, null, 2))}</pre>`;
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function ensureMonthlyPost(period) {
  validatePeriod(period);
  const blogger = bloggerClient();
  const title = periodTitle(period);
  let post = await findPostByTitle(blogger, title);

  if (!post) {
    const doc = emptyDoc(period);
    const created = await blogger.posts.insert({
      blogId: process.env.BLOG_ID,
      requestBody: {
        kind: "blogger#post",
        title,
        content: bodyFromDoc(doc),
        labels: [LABEL, `YEAR-${period.slice(0,4)}`, `MONTH-${period.slice(5,7)}`, `PERIOD-${period}`]
      }
    });
    post = created.data;
    return { post, doc };
  }

  const doc = await readPost(post.id);
  return { post, doc };
}

async function readPost(postId) {
  const blogger = bloggerClient();
  const result = await blogger.posts.get({
    blogId: process.env.BLOG_ID,
    postId,
    fetchBody: true
  });

  const html = result.data.content || "";
  const match = html.match(/<pre>([\s\S]*?)<\/pre>/i);
  if (!match) {
    throw new Error(`Post ${postId} tidak berisi JSON ERP.`);
  }
  const raw = match[1]
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

  return JSON.parse(raw);
}

async function savePost(post, doc) {
  const blogger = bloggerClient();
  doc.updated_at = new Date().toISOString();

  await blogger.posts.update({
    blogId: process.env.BLOG_ID,
    postId: post.id,
    requestBody: {
      ...post,
      title: periodTitle(doc.period),
      content: bodyFromDoc(doc),
      labels: post.labels || [LABEL]
    }
  });
  return doc;
}

export async function listTransactions(period, includeDeleted = false) {
  const { doc } = await ensureMonthlyPost(period);
  return includeDeleted ? doc.transactions : doc.transactions.filter(t => t.status !== "deleted");
}

export async function createTransaction(input) {
  const period = validatePeriod(input.period);
  const { post, doc } = await ensureMonthlyPost(period);

  const seq = doc.transactions.length + 1;
  const id = `TRX-${period.replace("-", "")}-${String(seq).padStart(8, "0")}`;

  const now = new Date().toISOString();
  const trx = {
    id,
    module: input.module || "general",
    department: input.department || "",
    date: input.date || `${period}-01`,
    account: input.account || {},
    currency: input.currency || "USD",
    amount: Number(input.amount || 0),
    amount_usd: Number(input.amount_usd || 0),
    status: "active",
    data: input.data || {},
    created_by: input.created_by || "system",
    created_at: now,
    updated_by: input.created_by || "system",
    updated_at: now
  };

  doc.transactions.push(trx);
  await savePost(post, doc);
  return trx;
}

export async function updateTransaction(id, patch) {
  const match = id.match(/^TRX-(\d{4})(\d{2})-/);
  if (!match) throw new Error("Format ID transaksi tidak valid.");

  const period = `${match[1]}-${match[2]}`;
  const { post, doc } = await ensureMonthlyPost(period);
  const idx = doc.transactions.findIndex(t => t.id === id);
  if (idx < 0) throw new Error("Transaksi tidak ditemukan.");

  const old = doc.transactions[idx];
  const now = new Date().toISOString();
  doc.transactions[idx] = {
    ...old,
    ...patch,
    id: old.id,
    updated_at: now,
    updated_by: patch.updated_by || "system"
  };

  await savePost(post, doc);
  return doc.transactions[idx];
}

export async function softDeleteTransaction(id, user = "system") {
  return updateTransaction(id, {
    status: "deleted",
    updated_by: user
  });
}
