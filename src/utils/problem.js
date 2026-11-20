const STATUS_TITLES = {
  400: "Requête invalide",
  401: "Authentification requise",
  403: "Accès refusé",
  404: "Ressource introuvable",
  409: "Conflit",
  413: "Contenu trop volumineux",
  500: "Erreur interne",
};

export function sendProblem(res, status, detail) {
  const title = STATUS_TITLES[status] ?? "Erreur";
  return res
    .status(status)
    .type("application/problem+json")
    .json({
      type: "about:blank",
      title,
      status,
      detail,
    });
}