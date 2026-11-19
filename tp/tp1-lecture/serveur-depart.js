// TP 1 — Lire les mesures sans bloquer la boucle d'événements.
//
//   GET  /ping              déjà écrite : elle joue « l'autre utilisateur »
//   POST /import/bloquant   lire tout le fichier d'un coup (readFileSync)
//   POST /import/flux       lire le fichier ligne par ligne (createReadStream + readline)

import express from "express";
import { existsSync, readFileSync, createReadStream } from "node:fs";
import { createInterface } from "node:readline";

const FICHIER = process.argv[2] ?? "data/mesures-SN-CASA-2026-10-31.ndjson";

if (!existsSync(FICHIER)) {
  console.error(`Fichier introuvable : ${FICHIER}`);
  console.error("Lancez le serveur depuis la racine du projet. Pour générer le fichier de 30 jours :");
  console.error("  node scripts/generate-measures.js SN-CASA 2026-10-31 30");
  process.exit(1);
}

const app = express();

app.get("/ping", (req, res) => {
  res.json({ pong: true });
});

app.post("/import/bloquant", (req, res) => {
  const debut = performance.now();

  const contenu = readFileSync(FICHIER, "utf-8");
  const lignes = contenu.split("\n");

  let mesures = 0;
  let sommePoids = 0;

  for (const ligne of lignes) {
    if (!ligne.trim()) continue;
    const mesure = JSON.parse(ligne);
    sommePoids += mesure.weight_kg;
    mesures++;
  }

  const duree_ms = Math.round(performance.now() - debut);
  const poids_moyen_kg = Number((sommePoids / mesures).toFixed(2));

  res.json({ mesures, poids_moyen_kg, duree_ms });
});

app.post("/import/flux", async (req, res) => {
  const debut = performance.now();

  const lignes = createInterface({
    input: createReadStream(FICHIER, { encoding: "utf-8" }),
    crlfDelay: Infinity,
  });

  let mesures = 0;
  let sommePoids = 0;

  for await (const ligne of lignes) {
    if (!ligne.trim()) continue;
    const mesure = JSON.parse(ligne);
    sommePoids += mesure.weight_kg;
    mesures++;
  }

  const duree_ms = Math.round(performance.now() - debut);
  const poids_moyen_kg = Number((sommePoids / mesures).toFixed(2));

  res.json({ mesures, poids_moyen_kg, duree_ms });
});

app.listen(4000, () => {
  console.log(`Serveur du TP 1 sur http://localhost:4000, fichier : ${FICHIER}`);
});