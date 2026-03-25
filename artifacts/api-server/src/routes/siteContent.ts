import { Router, type IRouter } from "express";
import { promises as fs } from "fs";
import path from "path";
const DATA_DIR = process.env.DATA_DIR ||
  path.resolve(process.cwd(), "data");

const router: IRouter = Router();

router.get("/data/site-content", async (_req, res) => {
  try {
    const filePath = path.join(DATA_DIR, "siteContent.json");
    const content = await fs.readFile(filePath, "utf-8");
    res.json(JSON.parse(content));
  } catch (err) {
    console.error("Error reading site content:", err);
    res.status(500).json({ error: "Failed to load site content" });
  }
});

export default router;
