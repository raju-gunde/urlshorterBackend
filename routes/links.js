import express from "express";
import db from "../models/index.js";

const router = express.Router();
const Link = db.Link;

// Generate random short code
function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let c = "";
  for (let i = 0; i < 6; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

//create router url
router.post("/", async (req, res) => {
  let { url, code } = req.body;

  if (!url) return res.status(400).json({ error: "URL required" });
  if (!code) code = generateCode();

  try {
    const exists = await Link.findOne({ where: { code } });
    if (exists) return res.status(409).json({ error: "Code already exists" });

    const link = await Link.create({ url, code });

    res.json(link);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// All likns
router.get("/", async (req, res) => {
  const links = await Link.findAll({ order: [["id", "DESC"]] });
  res.json(links);
});

// get one
router.get("/:code", async (req, res) => {
  const link = await Link.findOne({ where: { code: req.params.code } });
  if (!link) return res.status(404).json({ error: "Not found" });
  res.json(link);
});

// DELETE
router.delete("/:code", async (req, res) => {
  try {
    const deleted = await Link.destroy({
      where: { code: req.params.code }
    });

    if (!deleted) {
      return res.status(404).json({ error: "Not found" });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
