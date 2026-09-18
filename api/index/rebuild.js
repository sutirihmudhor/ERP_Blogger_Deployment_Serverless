import { applyCors, handleOptions } from "../../lib/cors.js";
import { json, error } from "../../lib/response.js";
import { bloggerClient } from "../../lib/google.js";

export default async function handler(req, res) {
  applyCors(req, res);
  if (handleOptions(req, res)) return;

  if (req.method !== "POST") return error(res, 405, "POST required.");

  try {
    const blogger = bloggerClient();
    const items = [];
    let pageToken;

    do {
      const r = await blogger.posts.list({
        blogId: process.env.BLOG_ID,
        labels: "ERP-DATA",
        maxResults: 50,
        pageToken,
        fetchBodies: false
      });
      for (const p of r.data.items || []) {
        const m = p.title?.match(/^ERP\\|DATA\\|(\\d{4}-\\d{2})$/);
        if (m) items.push({ period: m[1], postId: p.id, title: p.title });
      }
      pageToken = r.data.nextPageToken;
    } while (pageToken);

    return json(res, 200, { ok: true, index: items });
  } catch (err) {
    return error(res, 500, err.message);
  }
}
