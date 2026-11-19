export function requestLogger(req, res, next) {
  const debut = performance.now();
  const date = new Date().toISOString();

  res.on("finish", () => {
    const duree = (performance.now() - debut).toFixed(2);
    console.log(`[${date}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duree} ms`);
  });

  next();
}
