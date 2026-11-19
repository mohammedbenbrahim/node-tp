export function createMemoryHivesRepository() {
  const hives = [
    { id: "SN-CASA-001", site_id: "SN-CASA", status: "active" },
    { id: "SN-CASA-002", site_id: "SN-CASA", status: "active" },
    { id: "SN-CASA-003", site_id: "SN-CASA", status: "active" },
    { id: "CI-MAN-001", site_id: "CI-MAN", status: "active" },
    { id: "CI-MAN-002", site_id: "CI-MAN", status: "active" },
  ];

  return {
    async findAll({ siteId } = {}) {
      if (siteId) return hives.filter((h) => h.site_id === siteId);
      return [...hives];
    },
    async findById(id) {
      return hives.find((h) => h.id === id) ?? null;
    },
  };
}
