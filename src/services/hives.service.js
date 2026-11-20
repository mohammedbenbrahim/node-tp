import { NotFoundError, ForbiddenError } from "../errors.js";

export function canAccessHive(user, hive) {
  switch (user.role) {
    case "admin":
    case "gestionnaire":
      return true;
    case "coordinateur":
      return hive.site_id === user.site_id;
    case "apiculteur":
      return hive.owner_id === user.id;
    default:
      return false;
  }
}

export function createHivesService({ hivesRepository }) {
  return {
    async listHives(user, { site_id } = {}) {
      const cleanSiteId = site_id && site_id.trim() !== "" ? site_id.trim() : undefined;

      if (user.role === "coordinateur") {
        if (cleanSiteId && cleanSiteId !== user.site_id) {
          throw new ForbiddenError(`Vous n'avez pas accès au site ${cleanSiteId}.`);
        }
        return hivesRepository.findAll({ site_id: user.site_id });
      }

      if (user.role === "apiculteur") {
        return hivesRepository.findAll({ site_id: cleanSiteId, owner_id: user.id });
      }

      return hivesRepository.findAll({ site_id: cleanSiteId });
    },

    async getHive(user, id) {
      const hive = await hivesRepository.findById(id);
      if (!hive) {
        throw new NotFoundError(`Aucune ruche ne porte l'identifiant ${id}.`);
      }
      if (!canAccessHive(user, hive)) {
        throw new ForbiddenError(`Vous n'avez pas accès à la ruche ${id}.`);
      }
      return hive;
    },
  };
}