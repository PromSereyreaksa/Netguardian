import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

/* ======================
   GLOBAL STATS
====================== */
const globalStats = {
  totalPackets: 0,
  startTime: Date.now(),
  timestamps: []
};

const ipStats = new Map();

/* ======================
   MIDDLEWARE
====================== */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  console.log("[HIT]", req.method, req.url);
  next();
});

/* ======================
   HELPERS
====================== */
function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

function cleanOld(timestamps, windowMs = 60_000) {
  const now = Date.now();
  return timestamps.filter(t => t > now - windowMs);
}

function calculatePps(timestamps) {
  return timestamps.length / 60;
}

/* ======================
   DASHBOARD (SERVE FIRST)
====================== */
app.use("/dashboard", express.static(path.join(__dirname, "dashboard")));

app.get("/", (req, res) => {
  res.redirect("/dashboard");
});

/* ======================
   METRICS API
====================== */
app.get("/api/metrics", (req, res) => {
  const uptime = (Date.now() - globalStats.startTime) / 1000;

  res.json({
    global: {
      totalPackets: globalStats.totalPackets,
      pps: calculatePps(globalStats.timestamps).toFixed(2),
      uptime: uptime.toFixed(1),
      uniqueIps: ipStats.size
    },
    ips: [...ipStats.entries()].map(([ip, s]) => ({
      ip,
      packets: s.packets,
      pps: calculatePps(s.timestamps).toFixed(2),
      lastSeen: s.lastSeen
    }))
  });
});

/* ======================
   TRAFFIC SINK (CATCH-ALL)
   MUST BE LAST
====================== */
app.use((req, res) => {
  const ip = getClientIp(req);
  const now = Date.now();

  globalStats.totalPackets++;
  globalStats.timestamps.push(now);
  globalStats.timestamps = cleanOld(globalStats.timestamps);

  if (!ipStats.has(ip)) {
    ipStats.set(ip, {
      packets: 0,
      timestamps: [],
      lastSeen: now
    });
  }

  const stats = ipStats.get(ip);
  stats.packets++;
  stats.timestamps.push(now);
  stats.timestamps = cleanOld(stats.timestamps);
  stats.lastSeen = now;

  res.status(200).send("OK");
});

/* ======================
   START SERVER
====================== */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Listening on http://0.0.0.0:${PORT}`);
});
