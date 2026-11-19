import { ValidationError } from "../errors.js";

const PHYSICAL_RANGES = {
  position_lat: [-90, 90],
  position_lon: [-180, 180],
  weight_kg: [0, 150],
  temp_internal_c: [-10, 60],
  temp_external_c: [-20, 60],
  humidity_pct: [0, 100],
  acoustic_activity_score: [0, 1],
  battery_pct: [0, 100],
};

function validatePhysicalRanges(payload) {
  for (const [field, [min, max]] of Object.entries(PHYSICAL_RANGES)) {
    const val = payload[field];
    if (val === undefined || val === null) continue;
    if (typeof val !== "number" || Number.isNaN(val) || val < min || val > max) {
      throw new ValidationError(`Le champ ${field} doit être un nombre compris entre ${min} et ${max}.`);
    }
  }
}

export function createMeasuresService({ hivesService, measuresRepository }) {
  return {
    async addMeasure(hiveId, payload = {}) {
      const hive = await hivesService.getHiveById(hiveId);

      const { timestamp, weight_kg } = payload;

      if (!timestamp || typeof timestamp !== "string" || Number.isNaN(Date.parse(timestamp))) {
        throw new ValidationError("Le champ timestamp est obligatoire et doit être une date ISO 8601 valide.");
      }

      if (weight_kg === undefined || weight_kg === null) {
        throw new ValidationError("Le champ weight_kg est obligatoire.");
      }

      if (payload.hive_id !== undefined && payload.hive_id !== hive.id) {
        throw new ValidationError(
          `Incohérence de hive_id : ${payload.hive_id} dans le corps vs ${hive.id} dans l'URL.`
        );
      }

      validatePhysicalRanges(payload);

      const measure = {
        ...payload,
        hive_id: hive.id,
        site_id: payload.site_id ?? hive.site_id,
        timestamp,
        weight_kg,
      };

      return measuresRepository.create(measure);
    },

    async listMeasures(hiveId, { limit = 50, offset = 0 } = {}) {
      await hivesService.getHiveById(hiveId);

      const parsedLimit = Number(limit);
      const parsedOffset = Number(offset);

      if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 500) {
        throw new ValidationError("Le paramètre limit doit être un entier compris entre 1 et 500.");
      }

      if (!Number.isInteger(parsedOffset) || parsedOffset < 0) {
        throw new ValidationError("Le paramètre offset doit être un entier positif ou nul.");
      }

      const items = await measuresRepository.findByHiveId(hiveId, {
        limit: parsedLimit,
        offset: parsedOffset,
      });

      return {
        items,
        limit: parsedLimit,
        offset: parsedOffset,
      };
    },
  };
}