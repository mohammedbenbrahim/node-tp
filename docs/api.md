# Contrat de l'API Queen Bee (v0)

Toutes les erreurs respectent le format **RFC 9457** (`Content-Type: application/problem+json`).

---

### GET /health
Vérifie que le serveur est opérationnel.
- **Paramètres** : Aucun.
- **200** : `{ "status": "ok" }`

---

### GET /api/hives
Liste toutes les ruches, avec filtrage optionnel par site.
- **Paramètres de requête** :
  - `site_id` *(string, facultatif)* : identifiant du site (ex. `SN-CASA`). Ignoré si absent ou vide.
- **200** : `[ { "id": "SN-CASA-001", "site_id": "SN-CASA", "status": "active" } ]`

---

### GET /api/hives/:id
Retourne le détail d'une ruche.
- **Paramètres de chemin** :
  - `id` *(string, obligatoire)* : identifiant de la ruche (ex. `SN-CASA-001`).
- **200** : `{ "id": "SN-CASA-001", "site_id": "SN-CASA", "status": "active" }`
- **404** : `{ "type": "about:blank", "title": "Ressource introuvable", "status": 404, "detail": "Aucune ruche ne porte l'identifiant XX-NOPE-999." }`

---

### POST /api/hives/:id/measures
Enregistre une nouvelle mesure transmise par une passerelle.
- **Paramètres de chemin** :
  - `id` *(string, obligatoire)* : identifiant de la ruche.
- **Corps attendu (`application/json`)** :
  - `timestamp` *(string ISO 8601, obligatoire)* : date/heure de capture.
  - `weight_kg` *(number, obligatoire)* : poids en kg, compris entre `0` et `150`.
  - `hive_id` *(string, facultatif)* : s'il est fourni, doit être identique à `:id`.
  - `site_id` *(string, facultatif)* : code du site.
  - `position_lat` *(number, facultatif)* : latitude entre `-90` et `90`.
  - `position_lon` *(number, facultatif)* : longitude entre `-180` et `180`.
  - `temp_internal_c` *(number, facultatif)* : température interne entre `-10` et `60`.
  - `temp_external_c` *(number, facultatif)* : température externe entre `-20` et `60`.
  - `humidity_pct` *(number, facultatif)* : humidité entre `0` et `100`.
  - `acoustic_activity_score` *(number, facultatif)* : score entre `0` et `1`.
  - `battery_pct` *(number, facultatif)* : batterie entre `0` et `100`.
- **201** : `{ "hive_id": "SN-CASA-001", "site_id": "SN-CASA", "timestamp": "2026-10-31T10:00:00Z", "weight_kg": 36.84 }`
- **400** : `{ "type": "about:blank", "title": "Requête invalide", "status": 400, "detail": "Le champ weight_kg doit être compris entre 0 et 150." }`
- **404** : `{ "type": "about:blank", "title": "Ressource introuvable", "status": 404, "detail": "Aucune ruche ne porte l'identifiant XX-NOPE-999." }`

---

### GET /api/hives/:id/measures
Historique des mesures d'une ruche, trié de la plus récente à la plus ancienne.
- **Paramètres de chemin** :
  - `id` *(string, obligatoire)* : identifiant de la ruche.
- **Paramètres de requête** :
  - `limit` *(entier, facultatif)* : de `1` à `500`, `50` par défaut.
  - `offset` *(entier, facultatif)* : entier $\ge 0$, `0` par défaut.
- **200** : `{ "items": [ { "hive_id": "SN-CASA-001", "timestamp": "2026-10-31T10:00:00Z", "weight_kg": 36.84 } ], "limit": 50, "offset": 0 }`
- **400** : `{ "type": "about:blank", "title": "Requête invalide", "status": 400, "detail": "Le paramètre limit doit être un entier compris entre 1 et 500." }`
- **404** : `{ "type": "about:blank", "title": "Ressource introuvable", "status": 404, "detail": "Aucune ruche ne porte l'identifiant XX-NOPE-999." }`

---

### GET /api/hives/:id/inspections
Liste les inspections enregistrées pour une ruche.
- **Paramètres de chemin** :
  - `id` *(string, obligatoire)* : identifiant de la ruche.
- **200** : `[ { "id": "550e8400-e29b-41d4-a716-446655440000", "hive_id": "SN-CASA-001", "inspected_at": "2026-10-24T09:30:00Z", "colony_status": "forte", "queen_present": true, "observations": "Bonne activité" } ]`
- **404** : `{ "type": "about:blank", "title": "Ressource introuvable", "status": 404, "detail": "Aucune ruche ne porte l'identifiant XX-NOPE-999." }`

---

### POST /api/hives/:id/inspections
Enregistre une inspection terrain synchronisée par l'application mobile.
- **Paramètres de chemin** :
  - `id` *(string, obligatoire)* : identifiant de la ruche.
- **Corps attendu (`application/json`)** :
  - `id` *(UUID v4 string, obligatoire)* : généré côté client mobile.
  - `inspected_at` *(string ISO 8601, obligatoire)* : date/heure de l'inspection.
  - `colony_status` *(string, obligatoire)* : valeur parmi `"forte"`, `"normale"`, `"faible"`, `"morte"`.
  - `queen_present` *(boolean, facultatif)* : présence de la reine.
  - `observations` *(string, facultatif)* : notes libres.
- **201** : `{ "id": "550e8400-e29b-41d4-a716-446655440000", "hive_id": "SN-CASA-001", "inspected_at": "2026-10-24T09:30:00Z", "colony_status": "forte", "queen_present": true, "observations": "Bonne activité" }`
- **400** : `{ "type": "about:blank", "title": "Requête invalide", "status": 400, "detail": "Le champ colony_status doit être parmi : forte, normale, faible, morte." }`
- **404** : `{ "type": "about:blank", "title": "Ressource introuvable", "status": 404, "detail": "Aucune ruche ne porte l'identifiant XX-NOPE-999." }`