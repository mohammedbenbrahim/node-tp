import { test } from "node:test";
import assert from "node:assert/strict";
import { validate } from "../src/middlewares/validate.js";
import { measureSchema, inspectionSchema } from "../src/validators/schemas.js";
import { ValidationError } from "../src/errors.js";

function run(schema, data, source = "body") {
  const req = { [source]: data };
  validate(schema, source)(req, {}, () => {});
  return req.validated;
}

test("refuse un poids hors de sa plage physique", () => {
  assert.throws(
    () => run(measureSchema, { timestamp: "2026-10-31T00:00:00Z", weight_kg: 500 }),
    ValidationError,
  );
});

test("refuse une inspection avec un champ non autorisé ou dans le futur", () => {
  assert.throws(
    () =>
      run(inspectionSchema, {
        id: "550e8400-e29b-41d4-a716-446655440000",
        inspected_at: "2026-10-24T09:00:00Z",
        colony_status: "forte",
        author_id: "pirate",
      }),
    ValidationError,
  );

  assert.throws(
    () =>
      run(inspectionSchema, {
        id: "550e8400-e29b-41d4-a716-446655440000",
        inspected_at: "2099-01-01T00:00:00Z",
        colony_status: "forte",
      }),
    ValidationError,
  );
});