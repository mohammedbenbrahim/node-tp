import { test } from "node:test";
import assert from "node:assert/strict";
import { createMeasuresService } from "../src/services/measures.service.js";
import { ValidationError } from "../src/errors.js";

const admin = { id: "u-admin", role: "admin", site_id: null };
const validMeasure = { timestamp: "2026-10-31T10:00:00Z", weight_kg: 36.84 };

const fakeHivesService = {
  async getHive(user, id) {
    return { id, site_id: "SN-CASA", status: "active" };
  },
};

function createFakeMeasuresRepository() {
  const added = [];
  return {
    added,
    async add(measure) {
      const existing = added.find((m) => m.hive_id === measure.hive_id && m.timestamp === measure.timestamp);
      if (existing) {
        return { measure: existing, created: false };
      }
      added.push(measure);
      return { measure, created: true };
    },
  };
}

test("refuse une trame qui désigne une autre ruche que le chemin", async () => {
  const measuresRepository = createFakeMeasuresRepository();
  const service = createMeasuresService({ hivesService: fakeHivesService, measuresRepository });

  await assert.rejects(
    service.addMeasure(admin, "SN-CASA-001", { ...validMeasure, hive_id: "SN-CASA-002" }),
    ValidationError,
  );
  assert.equal(measuresRepository.added.length, 0);
});

test("une trame reçue deux fois n'est enregistrée qu'une fois", async () => {
  const measuresRepository = createFakeMeasuresRepository();
  const service = createMeasuresService({ hivesService: fakeHivesService, measuresRepository });

  const first = await service.addMeasure(admin, "SN-CASA-001", validMeasure);
  const second = await service.addMeasure(admin, "SN-CASA-001", validMeasure);

  assert.equal(first.created, true);
  assert.equal(second.created, false);
  assert.equal(measuresRepository.added.length, 1);
});