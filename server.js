import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import db from "./models/index.js";
import linksRouter from "./routes/links.js";

dotenv.config();
const app = express();

// __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Frontend URLs allowed to access API
const FRONTEND_URLS = [
  "http://localhost:5173",
  "https://urlshorter-frontend.vercel.app"
];

app.use(cors({ origin: FRONTEND_URLS }));

// Parse JSON & URL-encoded requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sync database
db.sequelize.sync().then(() => console.log("Database synced"));

// API routes
app.use("/api/links", linksRouter);

// Health check
app.get("/healthz", (req, res) => res.json({ ok: true }));

// Serve frontend (dist folder from Vite build)
app.use(express.static(path.join(__dirname, "dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Redirect short URL
app.get("/:code", async (req, res) => {
  const link = await db.Link.findOne({ where: { code: req.params.code } });
  if (!link) return res.status(404).send("Not found");

  await link.update({
    total_clicks: link.total_clicks + 1,
    last_clicked: new Date()
  });

  res.redirect(link.url);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
