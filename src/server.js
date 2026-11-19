import express from "express";
import morgan from "morgan";

const app = express();
const PORT = process.env.PORT ?? 3000;

// --- 1. Journalisation (gardez-en un seul actif à la fois pour comparer) ---
function requestLogger(req, res, next) {
  const debut = performance.now();
  const date = new Date().toISOString();

  res.on("finish", () => {
    const duree = (performance.now() - debut).toFixed(2);
    console.log(`[${date}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duree} ms`);
  });

  next();
}

app.use(requestLogger);
// Décommentez la ligne ci-dessous (et commentez requestLogger) pour comparer avec morgan :
// app.use(morgan("dev"));

// --- 2. Middleware JSON (obligatoirement avant les routes) ---
app.use(express.json());

// --- 3. Données en mémoire ---
const hives = [
  { id: "SN-CASA-001", site_id: "SN-CASA", status: "active" },
  { id: "SN-CASA-002", site_id: "SN-CASA", status: "active" },
  { id: "SN-CASA-003", site_id: "SN-CASA", status: "active" },
  { id: "CI-MAN-001", site_id: "CI-MAN", status: "active" },
  { id: "CI-MAN-002", site_id: "CI-MAN", status: "active" },
];

const measures = [];

// --- 4. Routes ---

// Route 1 : GET /health
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Route 2 : GET /api/hives (avec filtre optionnel ?site_id=...)
app.get("/api/hives", (req, res) => {
  const { site_id } = req.query;

  // Vérifie que site_id est défini et non vide (?site_id= vide ne filtre pas)
  if (site_id && site_id.trim() !== "") {
    const filtered = hives.filter((h) => h.site_id === site_id.trim());
    return res.status(200).json(filtered);
  }

  res.status(200).json(hives);
});

// Route 3 : GET /api/hives/:id
app.get("/api/hives/:id", (req, res) => {
  const hive = hives.find((h) => h.id === req.params.id);

  if (!hive) {
    return res.status(404).json({ error: `Ruche ${req.params.id} introuvable.` });
  }

  res.status(200).json(hive);
});

// Route 4 : POST /api/hives/:id/measures
app.post("/api/hives/:id/measures", (req, res) => {
  const hive = hives.find((h) => h.id === req.params.id);

  if (!hive) {
    return res.status(404).json({ error: `Ruche ${req.params.id} introuvable.` });
  }

  const body = req.body ?? {};
  const { timestamp, weight_kg } = body;

  // Vérification des champs obligatoires
  if (!timestamp || weight_kg === undefined || weight_kg === null) {
    return res.status(400).json({ error: "Les champs timestamp et weight_kg sont obligatoires." });
  }

  // Si la trame contient un hive_id, il doit correspondre à celui de l'URL
  if (body.hive_id !== undefined && body.hive_id !== hive.id) {
    return res.status(400).json({
      error: `Incohérence de hive_id : ${body.hive_id} dans le corps vs ${hive.id} dans l'URL.`,
    });
  }

  const nouvelleMesure = {
    ...body,
    hive_id: hive.id,
    site_id: body.site_id ?? hive.site_id,
    timestamp,
    weight_kg,
  };

  measures.push(nouvelleMesure);
  res.status(201).json(nouvelleMesure);
});

app.listen(PORT, () => {
  console.log(`Serveur Queen Bee démarré sur http://localhost:${PORT}`);
});