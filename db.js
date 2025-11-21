import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

let db;

if (process.env.DATABASE_URL) {
  db = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });
} else {
  // Lightweight in-memory store implementing `query(sql, params)` used by the app
  const store = new Map();

  const nowISO = () => new Date().toISOString();

  const fallbackQuery = async (text, params = []) => {
    const sql = (text || "").toString();

    // INSERT INTO links(code, target) VALUES ($1, $2)
    if (/insert into links/i.test(sql)) {
      const code = params[0] || null;
      const target = params[1];
      if (!target) throw new Error('target required');
      if (!code) throw new Error('code required');
      if (store.has(code)) {
        const err = new Error('duplicate');
        err.code = '23505';
        throw err;
      }
      const row = {
        code,
        target,
        created_at: nowISO(),
        total_clicks: 0,
        last_clicked: null,
      };
      store.set(code, row);
      return { rows: [row], rowCount: 1 };
    }

    // SELECT * FROM links ORDER BY created_at DESC
    if (/select \* from links/i.test(sql) && /order by/i.test(sql)) {
      const rows = Array.from(store.values()).sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      });
      return { rows, rowCount: rows.length };
    }

    // SELECT * FROM links WHERE code = $1
    if (/select \* from links where code = \$1/i.test(sql)) {
      const code = params[0];
      const row = store.get(code);
      if (!row) return { rows: [], rowCount: 0 };
      return { rows: [row], rowCount: 1 };
    }

    // DELETE FROM links WHERE code = $1
    if (/delete from links where code = \$1/i.test(sql)) {
      const code = params[0];
      const existed = store.delete(code);
      return { rows: [], rowCount: existed ? 1 : 0 };
    }

    // UPDATE links SET total_clicks = total_clicks + 1, last_clicked = now() WHERE code = $1 RETURNING target
    if (/update links\s+set\s+total_clicks = total_clicks \+ 1/i.test(sql) && /returning/i.test(sql)) {
      const code = params[0];
      const row = store.get(code);
      if (!row) return { rows: [], rowCount: 0 };
      row.total_clicks = (row.total_clicks || 0) + 1;
      row.last_clicked = nowISO();
      store.set(code, row);
      return { rows: [{ target: row.target }], rowCount: 1 };
    }

    // Fallback: throw to surface unsupported queries when running without Postgres
    throw new Error('Unsupported query in fallback DB: ' + sql.slice(0, 200));
  };

  db = { query: fallbackQuery };
}

export { db };
