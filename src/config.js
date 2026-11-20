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

const dbPassword = process.env.DB_PASSWORD ?? "";
if (dbPassword.trim() === "") {
  console.error("Configuration invalide : DB_PASSWORD est obligatoire.");
  process.exit(1);
}

const accessSecret = process.env.JWT_ACCESS_SECRET ?? "";
const refreshSecret = process.env.JWT_REFRESH_SECRET ?? "";

if (accessSecret.trim() === "" || refreshSecret.trim() === "") {
  console.error("Configuration invalide : JWT_ACCESS_SECRET et JWT_REFRESH_SECRET sont obligatoires.");
  process.exit(1);
}

if (accessSecret === refreshSecret) {
  console.error("Configuration invalide : JWT_ACCESS_SECRET et JWT_REFRESH_SECRET doivent être différents.");
  process.exit(1);
}

export const config = {
  port,
  nodeEnv,
  db: {
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? "queenbee",
    password: dbPassword,
    database: process.env.DB_NAME ?? "queenbee",
    poolMax: Number(process.env.DB_POOL_MAX ?? 10),
  },
  auth: {
    accessSecret,
    refreshSecret,
    accessTtl: process.env.JWT_ACCESS_TTL ?? "15m",
    refreshTtl: process.env.JWT_REFRESH_TTL ?? "7d",
    maxFailedLogins: 5,
    lockMinutes: 15,
  },
};