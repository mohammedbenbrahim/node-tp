import { NotFoundError } from "../errors.js";

export function createHivesService({ hivesRepository }) {
  return {
    async listHives(siteId) {
      const cleanSiteId = typeof siteId === "string" && siteId.trim() !== "" ? siteId.trim() : undefined;
      return hivesRepository.findAll({ siteId: cleanSiteId });
    },
    async getHiveById(id) {
      const hive = await hivesRepository.findById(id);
      if (!hive) throw new NotFoundError(`Aucune ruche ne porte l'identifiant ${id}.`);
      return hive;
    },
  };
}
