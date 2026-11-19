export function createMemoryMeasuresRepository() {
  const measures = [];

  return {
    async create(measure) {
      measures.push(measure);
      return { ...measure };
    },
    async findByHiveId(hiveId, { limit = 50, offset = 0 } = {}) {
      const sorted = measures
        .filter((m) => m.hive_id === hiveId)
        .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
      return sorted.slice(offset, offset + limit);
    },
  };
}
