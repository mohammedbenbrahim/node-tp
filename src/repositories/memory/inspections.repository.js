export function createMemoryInspectionsRepository() {
  const inspections = [];

  return {
    async create(inspection) {
      inspections.push(inspection);
      return { ...inspection };
    },
    async findByHiveId(hiveId) {
      return inspections
        .filter((i) => i.hive_id === hiveId)
        .sort((a, b) => Date.parse(b.inspected_at) - Date.parse(a.inspected_at));
    },
  };
}
