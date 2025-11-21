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

// -------------------------
// CORS setup
// -------------------------
const FRONTEND_URLS = [
  "http://localhost:5173",
  "https://urlshorter-frontend.vercel.app"
];
app.use(cors({ origin: FRONTEND_URLS }));

// -------------------------
// Body parser
// -------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------------
// Database sync
// -------------------------
db.sequelize.sync().then(() => console.log("Database synced"));

// -------------------------
// API routes
// -------------------------
app.use("/api/links", linksRouter);

// Health check
app.get("/healthz", (req, res) => res.json({ ok: true }));

// -------------------------
// Redirect short URL
// -------------------------
app.get("/:code", async (req, res) => {
  try {
    const link = await db.Link.findOne({ where: { code: req.params.code } });
    if (!link) return res.status(404).send("Not found");

    await link.update({
      total_clicks: link.total_clicks + 1,
      last_clicked: new Date()
    });

    res.redirect(link.url);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// -------------------------
// Serve frontend (SPA)
// -------------------------
// Must come **after API and redirect routes**
app.use(express.static(path.join(__dirname, "dist")));
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// -------------------------
// Start server
// -------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
