import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import { connectDb } from "./config/db.js";
import { startCleanupJob } from "./jobs/cleanupDoneCalls.js";
import authRoutes from "./routes/authRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import demoRoutes from "./routes/demoRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());

const allowedOrigins = [
  "https://gplussolution.com",
  "https://www.gplussolution.com",
  "http://localhost:5173",
  "http://localhost:3000",
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: "1mb" }));

app.get("/cron-job", (req, res) => {
  console.log("✅ Cron job hit at:", new Date().toLocaleString());
  res.status(200).send("Cron job executed");
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many login attempts. Try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth/login", loginLimiter);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: "Too many requests. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

app.use((err, _req, res, _next) => {
  if (err.type === "entity.too.large") {
    return res.status(413).json({ error: "Request body too large" });
  }
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "File too large" });
  }
  if (err.message?.includes("Only image files")) {
    return res.status(400).json({ error: err.message });
  }
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: "Origin not allowed" });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/demo-requests", demoRoutes);
app.use("/api/projects", projectRoutes);

const distPath = path.join(__dirname, "..", "dist");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
  startCleanupJob();
});
