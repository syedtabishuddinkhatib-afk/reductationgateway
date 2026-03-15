import { Router, type IRouter } from "express";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../../data");

async function readJsonFile(filename: string) {
  const filePath = path.join(DATA_DIR, filename);
  const content = await fs.readFile(filePath, "utf-8");
  return JSON.parse(content);
}

const router: IRouter = Router();

router.get("/data/services", async (_req, res) => {
  try {
    const data = await readJsonFile("services.json");
    res.json(data);
  } catch (err) {
    console.error("Error reading services:", err);
    res.status(500).json({ error: "Failed to load services data" });
  }
});

router.get("/data/universities", async (_req, res) => {
  try {
    const data = await readJsonFile("universities.json");
    res.json(data);
  } catch (err) {
    console.error("Error reading universities:", err);
    res.status(500).json({ error: "Failed to load universities data" });
  }
});

router.get("/data/university-fees", async (_req, res) => {
  try {
    const data = await readJsonFile("universityFees.json");
    res.json(data);
  } catch (err) {
    console.error("Error reading university fees:", err);
    res.status(500).json({ error: "Failed to load university fees data" });
  }
});

router.get("/data/consultancy-fees", async (_req, res) => {
  try {
    const data = await readJsonFile("consultancyFees.json");
    res.json(data);
  } catch (err) {
    console.error("Error reading consultancy fees:", err);
    res.status(500).json({ error: "Failed to load consultancy fees data" });
  }
});

router.get("/data/testimonials", async (_req, res) => {
  try {
    const data = await readJsonFile("testimonials.json");
    res.json(data);
  } catch (err) {
    console.error("Error reading testimonials:", err);
    res.status(500).json({ error: "Failed to load testimonials data" });
  }
});

router.get("/data/gallery", async (_req, res) => {
  try {
    const data = await readJsonFile("gallery.json");
    res.json(data);
  } catch (err) {
    console.error("Error reading gallery:", err);
    res.status(500).json({ error: "Failed to load gallery data" });
  }
});

export default router;
