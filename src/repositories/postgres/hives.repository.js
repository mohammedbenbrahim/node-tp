export function createHivesRepository(pool) {
  return {
    async findAll({ site_id = null, owner_id = null } = {}) {
      const cleanSiteId = site_id && site_id.trim() !== "" ? site_id.trim() : null;
      const { rows } = await pool.query(
        `SELECT id, site_id, owner_id, ref_lat, ref_lon, status
         FROM hives
         WHERE ($1::text IS NULL OR site_id = $1)
           AND ($2::uuid IS NULL OR owner_id = $2)
         ORDER BY id`,
        [cleanSiteId, owner_id],
      );
      return rows;
    },

    async findById(id) {
      const { rows } = await pool.query(
        `SELECT id, site_id, owner_id, ref_lat, ref_lon, status
         FROM hives
         WHERE id = $1`,
        [id],
      );
      return rows[0] ?? null;
    },
  };
}