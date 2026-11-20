export function createHivesController({ hivesService, measuresService, inspectionsService }) {
  return {
    async listHives(req, res) {
      res.json(await hivesService.listHives(req.user, req.validated));
    },

    async getHive(req, res) {
      res.json(await hivesService.getHive(req.user, req.params.id));
    },

    async listMeasures(req, res) {
      res.json(await measuresService.listMeasures(req.user, req.params.id, req.validated));
    },

    async addMeasure(req, res) {
      const { measure, created } = await measuresService.addMeasure(req.user, req.params.id, req.validated);
      res.status(created ? 201 : 200).json(measure);
    },

    async listInspections(req, res) {
      res.json(await inspectionsService.listInspections(req.user, req.params.id));
    },

    async addInspection(req, res) {
      const { inspection, created } = await inspectionsService.addInspection(req.user, req.params.id, req.validated);
      res.status(created ? 201 : 200).json(inspection);
    },
  };
}