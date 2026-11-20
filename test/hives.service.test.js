import { test } from "node:test";
import assert from "node:assert/strict";
import { canAccessHive } from "../src/services/hives.service.js";

const ruche = { id: "SN-CASA-001", site_id: "SN-CASA", owner_id: "u-api1" };

test("canAccessHive : chaque rôle voit ce qu'il doit voir", () => {
  assert.equal(canAccessHive({ id: "u-admin", role: "admin", site_id: null }, ruche), true);
  assert.equal(canAccessHive({ id: "u-gest", role: "gestionnaire", site_id: null }, ruche), true);
  assert.equal(canAccessHive({ id: "u-coord", role: "coordinateur", site_id: "SN-CASA" }, ruche), true);
  assert.equal(canAccessHive({ id: "u-coord2", role: "coordinateur", site_id: "CI-AGBO" }, ruche), false);
  assert.equal(canAccessHive({ id: "u-api1", role: "apiculteur", site_id: "SN-CASA" }, ruche), true);
  assert.equal(canAccessHive({ id: "u-api2", role: "apiculteur", site_id: "SN-CASA" }, ruche), false);
});