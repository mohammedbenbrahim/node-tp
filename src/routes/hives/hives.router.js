import { Router } from "express";

export function createHivesRouter({ hivesController }) {
  const router = Router();
  router.get("/", hivesController.getAll);
  router.get("/:id", hivesController.getById);
  router.get("/:id/measures", hivesController.getMeasures);
  router.post("/:id/measures", hivesController.postMeasure);
  router.get("/:id/inspections", hivesController.getInspections);
  router.post("/:id/inspections", hivesController.postInspection);
  return router;
}
