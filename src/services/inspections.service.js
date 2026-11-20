import { AppError, ConflictError, ValidationError } from "../errors.js";

export function createInspectionsService({ hivesService, inspectionsRepository }) {
  function toInspection(user, hive, data) {
    return {
      id: data.id,
      hive_id: hive.id,
      author_id: user.id,
      inspected_at: data.inspected_at,
      colony_status: data.colony_status,
      queen_present: data.queen_present ?? null,
      observations: data.observations ?? null,
    };
  }

  async function syncOne(user, item) {
    try {
      const hive = await hivesService.getHive(user, item.hive_id);
      const inspection = toInspection(user, hive, item);

      if (item.version === undefined) {
        const { inspection: stored, created } = await inspectionsRepository.insertIfAbsent(inspection);
        if (created) {
          return { id: item.id, status: "created", version: stored.version };
        }
        if (stored.hive_id !== hive.id) {
          return {
            id: item.id,
            status: "rejected",
            detail: "Cet identifiant est déjà utilisé par une inspection d'une autre ruche.",
          };
        }
        return { id: item.id, status: "unchanged", version: stored.version };
      }

      const updated = await inspectionsRepository.updateIfVersion(inspection, item.version);
      if (updated) {
        return { id: item.id, status: "updated", version: updated.version };
      }

      const current = await inspectionsRepository.findById(item.id);
      if (!current || current.hive_id !== hive.id) {
        return {
          id: item.id,
          status: "rejected",
          detail: "Inspection inconnue pour cette ruche : envoyez-la sans version pour la créer.",
        };
      }

      return {
        id: item.id,
        status: "conflict",
        detail: `L'inspection a été modifiée entre-temps : version ${current.version} sur le serveur, ${item.version} sur l'appareil.`,
        current,
      };
    } catch (err) {
      if (err instanceof AppError) {
        return { id: item.id, status: "rejected", detail: err.message };
      }
      throw err;
    }
  }

  return {
    async listInspections(user, hiveId) {
      await hivesService.getHive(user, hiveId);
      return inspectionsRepository.findByHive(hiveId);
    },

    async addInspection(user, hiveId, data) {
      const hive = await hivesService.getHive(user, hiveId);

      if (data.hive_id !== undefined && data.hive_id !== hive.id) {
        throw new ValidationError(`Le hive_id du corps (${data.hive_id}) ne correspond pas à la ruche ${hive.id}.`);
      }

      const result = await inspectionsRepository.insertIfAbsent(toInspection(user, hive, data));

      if (!result.created && result.inspection.hive_id !== hive.id) {
        throw new ConflictError(`L'identifiant ${data.id} est déjà utilisé par une inspection d'une autre ruche.`);
      }

      return result;
    },

    async syncInspections(user, items) {
      const results = [];
      for (const item of items) {
        results.push(await syncOne(user, item));
      }

      const summary = { created: 0, unchanged: 0, updated: 0, conflict: 0, rejected: 0 };
      for (const result of results) {
        summary[result.status] += 1;
      }

      return { summary, results };
    },
  };
}