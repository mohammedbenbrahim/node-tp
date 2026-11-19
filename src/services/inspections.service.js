import { ValidationError } from "../errors.js";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ALLOWED_COLONY_STATUS = ["forte", "normale", "faible", "morte"];

export function createInspectionsService({ hivesService, inspectionsRepository }) {
  return {
    async listInspections(hiveId) {
      await hivesService.getHiveById(hiveId);
      return inspectionsRepository.findByHiveId(hiveId);
    },
    async addInspection(hiveId, payload = {}) {
      const hive = await hivesService.getHiveById(hiveId);
      const { id, inspected_at, colony_status, queen_present, observations } = payload;

      if (!id || typeof id !== "string" || !UUID_REGEX.test(id)) {
        throw new ValidationError("Le champ id est obligatoire et doit être un UUID valide.");
      }
      if (!inspected_at || typeof inspected_at !== "string" || Number.isNaN(Date.parse(inspected_at))) {
        throw new ValidationError("Le champ inspected_at est obligatoire et doit être une date ISO 8601 valide.");
      }
      if (!colony_status || !ALLOWED_COLONY_STATUS.includes(colony_status)) {
        throw new ValidationError(`Le champ colony_status est obligatoire et doit être parmi : ${ALLOWED_COLONY_STATUS.join(", ")}.`);
      }
      if (queen_present !== undefined && typeof queen_present !== "boolean") {
        throw new ValidationError("Le champ queen_present doit être un booléen.");
      }
      if (observations !== undefined && typeof observations !== "string") {
        throw new ValidationError("Le champ observations doit être une chaîne de caractères.");
      }

      return inspectionsRepository.create({
        id,
        hive_id: hive.id,
        inspected_at,
        colony_status,
        ...(queen_present !== undefined ? { queen_present } : {}),
        ...(observations !== undefined ? { observations } : {}),
      });
    },
  };
}
