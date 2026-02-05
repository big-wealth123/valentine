import express from "express";
import webpush from "web-push";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Store subscriptions in memory (simple). For real hosting, store in DB/file.
let subscriptions = [];

/* 1) Generate keys once:
   node -e "const webpush=require('web-push'); console.log(webpush.generateVAPIDKeys())"
   Then paste them below.
*/
const VAPID_PUBLIC_KEY = "PASTE_PUBLIC_KEY_HERE";
const VAPID_PRIVATE_KEY = "PASTE_PRIVATE_KEY_HERE";

webpush.setVapidDetails(
  "mailto:example@valentine.local",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// Serve your public site
app.use(express.static(path.join(__dirname, "..", "public")));

// Give public key to the client
app.get("/api/vapidPublicKey", (req, res) => {
  res.status(200).send(VAPID_PUBLIC_KEY);
});

// Receive subscription
app.post("/api/subscribe", (req, res) => {
  const sub = req.body;
  subscriptions.push(sub);
  res.status(201).json({ ok: true });
});

// Send test push to all subs
app.post("/api/pushTest", async (req, res) => {
  const payload = JSON.stringify({
    title: "HER_NAME 💖",
    body: "Thinking of you… 🌸",
    icon: "/her.jpg",
    url: "/"
  });

  const results = await Promise.allSettled(
    subscriptions.map(s => webpush.sendNotification(s, payload))
  );

  // Remove invalid subs
  subscriptions = subscriptions.filter((_, i) => results[i].status === "fulfilled");

  res.json({ sent: true, total: subscriptions.length });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on http://localhost:" + PORT));
