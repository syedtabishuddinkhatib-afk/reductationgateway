import { Router, type IRouter } from "express";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../../data");

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
