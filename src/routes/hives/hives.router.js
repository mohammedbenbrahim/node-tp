import express from "express";
import { requireRole } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { hivesQuerySchema, paginationSchema, measureSchema, inspectionSchema } from "../../validators/schemas.js";

export function createHivesRouter({ controller, requireAuth }) {
  const router = express.Router();

  router.use(requireAuth);

  router.get("/", validate(hivesQuerySchema, "query"), controller.listHives);
  router.get("/:id", controller.getHive);
  router.get("/:id/measures", validate(paginationSchema, "query"), controller.listMeasures);
  router.post("/:id/measures", requireRole("admin"), validate(measureSchema), controller.addMeasure);
  router.get("/:id/inspections", controller.listInspections);
  router.post("/:id/inspections", requireRole("apiculteur", "coordinateur"), validate(inspectionSchema), controller.addInspection);

  return router;
}