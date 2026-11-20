import { test } from "node:test";
import assert from "node:assert/strict";
import { createInspectionsService } from "../src/services/inspections.service.js";
import { NotFoundError, ForbiddenError } from "../src/errors.js";

const beekeeper = { id: "u-api1", role: "apiculteur", site_id: "SN-CASA" };
const hive = { id: "SN-CASA-001", site_id: "SN-CASA", owner_id: "u-api1" };

const fakeHivesService = {
  async getHive(user, id) {
    if (id !== hive.id) throw new NotFoundError(`Aucune ruche ne porte l'identifiant ${id}.`);
    if (hive.owner_id !== user.id) throw new ForbiddenError(`Vous n'avez pas accès à la ruche ${id}.`);
    return hive;
  },
};

function createFakeInspectionsRepository() {
  const rows = new Map();
  return {
    rows,
    async findById(id) {
      return rows.get(id) ?? null;
    },
    async insertIfAbsent(inspection) {
      if (rows.has(inspection.id)) {
        return { inspection: rows.get(inspection.id), created: false };
      }
      const stored = { ...inspection, version: 1 };
      rows.set(inspection.id, stored);
      return { inspection: stored, created: true };
    },
    async updateIfVersion(inspection, expectedVersion) {
      const current = rows.get(inspection.id);
      if (!current || current.hive_id !== inspection.hive_id || current.version !== expectedVersion) {
        return null;
      }
      const updated = {
        ...current,
        ...inspection,
        author_id: current.author_id,
        version: current.version + 1,
      };
      rows.set(inspection.id, updated);
      return updated;
    },
  };
}

const inspection = {
  id: "0b6c4a0e-6f1f-4d8e-9a39-2f3c9b1d7e55",
  inspected_at: "2026-11-01T09:30:00Z",
  colony_status: "forte",
};

test("envoyer deux fois la même inspection ne crée pas de doublon", async () => {
  const inspectionsRepository = createFakeInspectionsRepository();
  const service = createInspectionsService({ hivesService: fakeHivesService, inspectionsRepository });

  await service.addInspection(beekeeper, "SN-CASA-001", inspection);
  const second = await service.addInspection(beekeeper, "SN-CASA-001", inspection);

  assert.equal(second.created, false);
  assert.equal(inspectionsRepository.rows.size, 1);
});

test("une version périmée donne un conflit, et le serveur garde sa donnée", async () => {
  const inspectionsRepository = createFakeInspectionsRepository();
  const service = createInspectionsService({ hivesService: fakeHivesService, inspectionsRepository });

  await service.addInspection(beekeeper, "SN-CASA-001", inspection);

  // Un autre appareil modifie l'inspection -> version 2
  await inspectionsRepository.updateIfVersion(
    { ...inspection, hive_id: "SN-CASA-001", colony_status: "faible" },
    1,
  );

  const { results } = await service.syncInspections(beekeeper, [
    { ...inspection, hive_id: "SN-CASA-001", colony_status: "morte", version: 1 },
  ]);

  assert.equal(results[0].status, "conflict");
  assert.equal(results[0].current.version, 2);
  assert.equal(results[0].current.colony_status, "faible");
});