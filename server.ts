import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // EnableBanking Mock / Real-Time Bank Sync API
  app.get("/api/enablebanking/status", (req, res) => {
    res.json({
      connected: true,
      provider: "EnableBanking PSD2 Hub",
      bankName: "ING Bank N.V.",
      iban: "NL83INGB0004565868",
      holderName: "Mark Eilander",
      lastSync: new Date().toISOString(),
      status: "ACTIVE",
      environment: process.env.ENABLEBANKING_ENV || "sandbox",
    });
  });

  app.post("/api/enablebanking/sync", (req, res) => {
    const now = new Date();
    // Simulate real-time bank pull with instant transaction feed
    res.json({
      success: true,
      syncedAt: now.toISOString(),
      newTransactionsCount: 2,
      accountBalance: 5129.02,
      availableBalance: 5129.02,
      message: "Succesvol gesynchroniseerd met ING Bank via EnableBanking PSD2.",
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Realtime Budget Server running on http://localhost:${PORT}`);
  });
}

startServer();
