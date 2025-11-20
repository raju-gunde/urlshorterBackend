import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import db from "./models/index.js";
import linksRouter from "./routes/links.js";

dotenv.config();

const app = express();

// Allow frontend to access backend
app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sync database
db.sequelize.sync().then(() => {
  console.log("Database synced");
});

// API Routes
app.use("/api/links", linksRouter);

// Health Check
app.get("/healthz", (req, res) => {
  res.json({ ok: true, version: "1.0" });
});

// Redirect Short URL
app.get("/:code", async (req, res) => {
  const link = await db.Link.findOne({ where: { code: req.params.code } });
  if (!link) return res.status(404).send("Not found");

  await link.update({
    total_clicks: link.total_clicks + 1,
    last_clicked: new Date()
  });

  res.redirect(link.url);
});

// Start
app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});
