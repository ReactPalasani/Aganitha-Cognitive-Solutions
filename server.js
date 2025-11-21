import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import linksRouter from "./routes/links.js";
import redirectRouter from "./routes/redirect.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// health check
app.get("/healthz", (req, res) => {
  res.status(200).json({ ok: true, version: "1.0" });
});

// API routes
app.use("/api/links", linksRouter);

// serve stats page for /code/:code (must be before redirect handler)
app.get('/code/:code', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'stats.html'));
});

// redirect route (must be last!)
app.use("/", redirectRouter);

// start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`TinyLink running on port ${PORT}`));
