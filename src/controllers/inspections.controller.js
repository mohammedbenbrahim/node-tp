export function createInspectionsController({ inspectionsService }) {
  return {
    async sync(req, res) {
      res.json(await inspectionsService.syncInspections(req.user, req.validated.inspections));
    },
  };
}