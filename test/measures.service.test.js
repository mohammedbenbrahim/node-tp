import { test } from "node:test";
import assert from "node:assert/strict";
import { createMeasuresService } from "../src/services/measures.service.js";
import { ValidationError } from "../src/errors.js";

test("refuse un poids hors de sa plage physique", async () => {
  // Préparer : un faux repository qui garde ce qu'on lui donne, injecté dans le service
  const enregistrees = [];
  const fakeMeasuresRepository = {
    async create(measure) {
      enregistrees.push(measure);
      return measure;
    },
    async findByHiveId() {
      return [];
    },
  };

  const fakeHivesService = {
    async getHiveById(id) {
      return { id, site_id: "SN-CASA", status: "active" };
    },
  };

  const measuresService = createMeasuresService({
    hivesService: fakeHivesService,
    measuresRepository: fakeMeasuresRepository,
  });

  // Agir & Vérifier : ajouter une mesure de 500 kg -> ValidationError levée et rien n'est enregistré
  await assert.rejects(
    async () => {
      await measuresService.addMeasure("SN-CASA-001", {
        timestamp: "2026-10-31T10:00:00Z",
        weight_kg: 500,
      });
    },
    (err) => err instanceof ValidationError
  );

  assert.equal(enregistrees.length, 0);
});