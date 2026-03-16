import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { AdminLoginBody, AdminLoginResponse } from "@workspace/api-zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../../data");
const UPLOADS_DIR = path.resolve(__dirname, "../../../nextstoprussia/public/images/uploads");
const LEADS_CSV = path.join(DATA_DIR, "leads.csv");

const CREDENTIALS_FILE = path.join(DATA_DIR, "adminCredentials.json");

async function getCredentials(): Promise<{ username: string; password: string }> {
  try {
    const raw = await fs.readFile(CREDENTIALS_FILE, "utf-8");
    const creds = JSON.parse(raw);
    return {
      username: creds.username || process.env.ADMIN_USERNAME || "admin",
      password: creds.password || process.env.ADMIN_PASSWORD || "admin",
    };
  } catch {
    return {
      username: process.env.ADMIN_USERNAME || "admin",
      password: process.env.ADMIN_PASSWORD || "admin",
    };
  }
}

async function saveCredentials(username: string, password: string): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(CREDENTIALS_FILE, JSON.stringify({ username, password }, null, 2), "utf-8");
}

function generateToken(username: string): string {
  const payload = { username, exp: Date.now() + 24 * 60 * 60 * 1000 };
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function verifyToken(token: string): boolean {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64url").toString("utf-8"));
    return payload.exp > Date.now();
  } catch {
    return false;
  }
}

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = auth.slice(7);
  if (!verifyToken(token)) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
  next();
}

const VALID_DATA_TYPES = [
  "services",
  "universities",
  "universityFees",
  "consultancyFees",
  "testimonials",
  "gallery",
];

async function readJsonFile(filename: string) {
  const filePath = path.join(DATA_DIR, filename);
  const content = await fs.readFile(filePath, "utf-8");
  return JSON.parse(content);
}

async function writeJsonFile(filename: string, data: unknown) {
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    try {
      await fs.mkdir(UPLOADS_DIR, { recursive: true });
      cb(null, UPLOADS_DIR);
    } catch (err) {
      cb(err as Error, UPLOADS_DIR);
    }
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

const router: IRouter = Router();

router.post("/admin/login", async (req, res) => {
  try {
    const parsed = AdminLoginBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }
    const { username, password } = parsed.data;
    const creds = await getCredentials();
    if (username !== creds.username || password !== creds.password) {
      res.status(401).json({ error: "Invalid username or password" });
      return;
    }
    const token = generateToken(username);
    const data = AdminLoginResponse.parse({
      success: true,
      token,
      message: "Login successful",
    });
    res.json(data);
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newUsername, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: "Current password and new password are required" });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ error: "New password must be at least 6 characters" });
      return;
    }
    const creds = await getCredentials();
    if (currentPassword !== creds.password) {
      res.status(401).json({ error: "Current password is incorrect" });
      return;
    }
    const updatedUsername = (newUsername && newUsername.trim()) ? newUsername.trim() : creds.username;
    await saveCredentials(updatedUsername, newPassword);
    res.json({ success: true, message: "Credentials updated. Please log in again." });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "Failed to update credentials" });
  }
});

router.get("/admin/site-content", authMiddleware, async (_req, res) => {
  try {
    const data = await readJsonFile("siteContent.json");
    res.json(data);
  } catch (err) {
    console.error("Error reading site content:", err);
    res.status(500).json({ error: "Failed to read site content" });
  }
});

router.put("/admin/site-content", authMiddleware, async (req, res) => {
  try {
    const current = await readJsonFile("siteContent.json");
    const updated = { ...current, ...req.body };
    await writeJsonFile("siteContent.json", updated);
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("Error updating site content:", err);
    res.status(500).json({ error: "Failed to update site content" });
  }
});

router.get("/admin/data/:type", authMiddleware, async (req, res) => {
  const { type } = req.params;
  if (!VALID_DATA_TYPES.includes(type)) {
    res.status(400).json({ error: "Invalid data type" });
    return;
  }
  try {
    const data = await readJsonFile(`${type}.json`);
    res.json(data);
  } catch (err) {
    console.error(`Error reading ${type}:`, err);
    res.status(500).json({ error: `Failed to read ${type}` });
  }
});

router.put("/admin/data/:type", authMiddleware, async (req, res) => {
  const { type } = req.params;
  if (!VALID_DATA_TYPES.includes(type)) {
    res.status(400).json({ error: "Invalid data type" });
    return;
  }
  try {
    const data = req.body;
    await writeJsonFile(`${type}.json`, data);
    res.json({ success: true, data });
  } catch (err) {
    console.error(`Error updating ${type}:`, err);
    res.status(500).json({ error: `Failed to update ${type}` });
  }
});

router.post(
  "/admin/upload",
  authMiddleware,
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      next();
    });
  },
  (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    const filename = req.file.filename;
    const url = `/images/uploads/${filename}`;
    res.json({ success: true, url, filename });
  }
);

router.get("/admin/leads", authMiddleware, async (_req, res) => {
  try {
    const content = await fs.readFile(LEADS_CSV, "utf-8");
    const lines = content.trim().split("\n");
    if (lines.length <= 1) {
      res.json([]);
      return;
    }
    const headers = lines[0].split(",");
    const leads = lines.slice(1).map((line) => {
      const values = line.match(/(".*?(?<!\\)"|[^,]+|(?<=,)(?=,)|^(?=,)|(?<=,)$)/g) || [];
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        obj[h.trim()] = (values[i] || "").replace(/^"|"$/g, "").replace(/""/g, '"').trim();
      });
      return obj;
    });
    res.json(leads.reverse());
  } catch (err) {
    console.error("Error reading leads:", err);
    res.json([]);
  }
});

router.delete("/admin/leads", authMiddleware, async (_req, res) => {
  try {
    await fs.writeFile(LEADS_CSV, "timestamp,fullName,phone,email,country,preferredCourse,message\n", "utf-8");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear leads" });
  }
});

export default router;
