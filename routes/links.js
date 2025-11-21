import express from "express";
import { db } from "../db.js";

const router = express.Router();
const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

// Create link
router.post("/", async (req, res) => {
  const { code, target } = req.body;

  if (!target) {
    return res.status(400).json({ error: "target required" });
  }

  // validate URL
  try {
    new URL(target);
  } catch {
    return res.status(400).json({ error: "invalid url" });
  }

  // validate code if provided
  if (code && !CODE_REGEX.test(code)) {
    return res.status(400).json({ error: "invalid code" });
  }

  // helper: generate random code (6 chars)
  const generateCode = (len = 6) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let out = "";
    for (let i = 0; i < len; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return out;
  };

  try {
    // if client provided a code, try inserting it and report conflicts
    if (code) {
      await db.query(
        `INSERT INTO links(code, target)
         VALUES ($1, $2)`,
        [code, target]
      );

      return res.status(201).json({
        code,
        target,
        total_clicks: 0,
        last_clicked: null,
      });
    }

    // otherwise, generate a unique code and insert (retry on collision)
    let attempts = 0;
    let finalCode = null;
    while (attempts < 6 && !finalCode) {
      const candidate = generateCode(6);
      try {
        await db.query(
          `INSERT INTO links(code, target)
           VALUES ($1, $2)`,
          [candidate, target]
        );
        finalCode = candidate;
        break;
      } catch (err) {
        if (err.code === "23505") {
          // code exists, try again
          attempts++;
          continue;
        }
        throw err;
      }
    }

    if (!finalCode) return res.status(500).json({ error: "could not generate code" });

    return res.status(201).json({
      code: finalCode,
      target,
      total_clicks: 0,
      last_clicked: null,
    });
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "code exists" });
    throw err;
  }
});

// List all links
router.get("/", async (req, res) => {
  const result = await db.query("SELECT * FROM links ORDER BY created_at DESC");
  res.json(result.rows);
});

// Get single link
router.get("/:code", async (req, res) => {
  const result = await db.query("SELECT * FROM links WHERE code = $1", [
    req.params.code,
  ]);

  if (result.rowCount === 0) return res.status(404).json({ error: "not found" });

  res.json(result.rows[0]);
});

// Delete link
router.delete("/:code", async (req, res) => {
  const result = await db.query("DELETE FROM links WHERE code = $1", [
    req.params.code,
  ]);

  if (result.rowCount === 0) return res.status(404).json({ error: "not found" });

  res.json({ ok: true });
});

export default router;
