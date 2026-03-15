import { Router, type IRouter } from "express";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { SubmitLeadBody, SubmitLeadResponse } from "@workspace/api-zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../../data");
const LEADS_CSV = path.join(DATA_DIR, "leads.csv");

const CSV_HEADER = "timestamp,fullName,phone,email,country,preferredCourse,message\n";

async function ensureLeadsFile() {
  try {
    await fs.access(LEADS_CSV);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(LEADS_CSV, CSV_HEADER, "utf-8");
  }
}

function escapeCsv(value: string): string {
  if (!value) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

async function appendLeadToCsv(lead: {
  fullName: string;
  phone: string;
  email: string;
  country: string;
  preferredCourse: string;
  message: string;
}) {
  await ensureLeadsFile();
  const timestamp = new Date().toISOString();
  const row = [
    timestamp,
    lead.fullName,
    lead.phone,
    lead.email,
    lead.country,
    lead.preferredCourse,
    lead.message,
  ]
    .map(escapeCsv)
    .join(",");

  await fs.appendFile(LEADS_CSV, row + "\n", "utf-8");
}

async function sendTelegramNotification(lead: {
  fullName: string;
  phone: string;
  email: string;
  country: string;
  preferredCourse: string;
  message: string;
}) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.log("Telegram not configured, skipping notification");
    return;
  }

  const text = `🎓 *New Student Inquiry - NextStopRussia*\n\n` +
    `👤 *Name:* ${lead.fullName}\n` +
    `📞 *Phone:* ${lead.phone}\n` +
    `📧 *Email:* ${lead.email || "Not provided"}\n` +
    `🌍 *Country:* ${lead.country}\n` +
    `📚 *Course:* ${lead.preferredCourse}\n` +
    `💬 *Message:* ${lead.message || "No message"}\n\n` +
    `⏰ ${new Date().toLocaleString()}`;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "Markdown",
        }),
      }
    );
    if (!response.ok) {
      const err = await response.text();
      console.error("Telegram API error:", err);
    }
  } catch (err) {
    console.error("Failed to send Telegram notification:", err);
  }
}

function buildWhatsAppUrl(lead: {
  fullName: string;
  phone: string;
  country: string;
  preferredCourse: string;
  message: string;
}): string {
  const whatsappNumber = process.env.WHATSAPP_NUMBER || "79000000000";
  const text = encodeURIComponent(
    `Hello NextStopRussia! I am interested in studying in Russia.\n\n` +
    `Name: ${lead.fullName}\n` +
    `Phone: ${lead.phone}\n` +
    `Country: ${lead.country}\n` +
    `Course: ${lead.preferredCourse}\n` +
    `Message: ${lead.message || "Please contact me for more information."}`
  );
  return `https://wa.me/${whatsappNumber}?text=${text}`;
}

const router: IRouter = Router();

router.post("/submit-lead", async (req, res) => {
  try {
    const parsed = SubmitLeadBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid form data. Please fill all required fields." });
      return;
    }

    const lead = parsed.data;
    const leadData = {
      fullName: lead.fullName,
      phone: lead.phone,
      email: lead.email ?? "",
      country: lead.country,
      preferredCourse: lead.preferredCourse,
      message: lead.message ?? "",
    };

    await appendLeadToCsv(leadData);
    await sendTelegramNotification(leadData);

    const whatsappUrl = buildWhatsAppUrl(leadData);
    const data = SubmitLeadResponse.parse({
      success: true,
      message: "Your application has been received! We will contact you shortly.",
      whatsappUrl,
    });

    res.json(data);
  } catch (err) {
    console.error("Lead submission error:", err);
    res.status(500).json({ error: "An internal error occurred. Please try again." });
  }
});

export default router;
