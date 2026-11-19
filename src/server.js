import { config } from "./config.js";
import { createApp } from "./app.js";
import { createMemoryHivesRepository } from "./repositories/memory/hives.repository.js";
import { createMemoryMeasuresRepository } from "./repositories/memory/measures.repository.js";
import { createMemoryInspectionsRepository } from "./repositories/memory/inspections.repository.js";

const hivesRepository = createMemoryHivesRepository();
const measuresRepository = createMemoryMeasuresRepository();
const inspectionsRepository = createMemoryInspectionsRepository();

const app = createApp({ hivesRepository, measuresRepository, inspectionsRepository });

app.listen(config.port, () => {
  console.log(`Serveur Queen Bee (${config.nodeEnv}) sur http://localhost:${config.port}`);
});
