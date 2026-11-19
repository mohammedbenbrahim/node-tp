const rawPort = process.env.PORT ?? "3000";
const port = Number(rawPort);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error(`Configuration invalide : PORT="${rawPort}" doit être un entier entre 1 et 65535.`);
  process.exit(1);
}

const nodeEnv = process.env.NODE_ENV ?? "development";
const allowedEnvs = ["development", "test", "production"];

if (!allowedEnvs.includes(nodeEnv)) {
  console.error(`Configuration invalide : NODE_ENV="${nodeEnv}" doit être parmi ${allowedEnvs.join(", ")}.`);
  process.exit(1);
}

export const config = { port, nodeEnv };
