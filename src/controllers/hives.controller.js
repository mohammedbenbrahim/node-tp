export function createHivesController({ hivesService, measuresService, inspectionsService }) {
  return {
    async getAll(req, res, next) {
      try {
        res.status(200).json(await hivesService.listHives(req.query.site_id));
      } catch (err) {
        next(err);
      }
    },
    async getById(req, res, next) {
      try {
        res.status(200).json(await hivesService.getHiveById(req.params.id));
      } catch (err) {
        next(err);
      }
    },
    async getMeasures(req, res, next) {
      try {
        res.status(200).json(await measuresService.listMeasures(req.params.id, {
          limit: req.query.limit ?? 50,
          offset: req.query.offset ?? 0,
        }));
      } catch (err) {
        next(err);
      }
    },
    async postMeasure(req, res, next) {
      try {
        res.status(201).json(await measuresService.addMeasure(req.params.id, req.body));
      } catch (err) {
        next(err);
      }
    },
    async getInspections(req, res, next) {
      try {
        res.status(200).json(await inspectionsService.listInspections(req.params.id));
      } catch (err) {
        next(err);
      }
    },
    async postInspection(req, res, next) {
      try {
        res.status(201).json(await inspectionsService.addInspection(req.params.id, req.body));
      } catch (err) {
        next(err);
      }
    },
  };
}
