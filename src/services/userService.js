const pool = require('../config/db');


async function createUsersTable() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR NOT NULL,
      age INTEGER NOT NULL,
      address JSONB NULL,
      additional_info JSONB NULL
    );
  `;
  await pool.query(createTableSQL);
}

/**
 * Insert a batch of user records into the database.  A single INSERT
 * statement is constructed with parameter placeholders for each row to
 * minimise round trips to the database server.  Each value from the
 * `users` array is bound in order.
 *
 * @param {Array<{ name: string, age: number, address: any, additionalInfo: any }>} users The rows to insert.
 */
async function insertUsersBatch(users) {
  if (!users.length) return;

  const valueStrings = [];
  const values = [];
  let paramIndex = 1;
  users.forEach((user) => {
    valueStrings.push(`($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3})`);
    values.push(user.name);
    values.push(user.age);
    values.push(user.address || null);
    values.push(user.additionalInfo || null);
    paramIndex += 4;
  });
  const insertSQL = `INSERT INTO users (name, age, address, additional_info) VALUES ${valueStrings.join(', ')}`;
  await pool.query(insertSQL, values);
}

/**
 * @returns {Promise<Record<string, number>>} A mapping of age group labels to percentages.
 */
async function getAgeDistribution() {
  const sql = `
    SELECT
      COUNT(*) FILTER (WHERE age < 20) AS under_20,
      COUNT(*) FILTER (WHERE age >= 20 AND age <= 40) AS between_20_40,
      COUNT(*) FILTER (WHERE age > 40 AND age <= 60) AS between_40_60,
      COUNT(*) FILTER (WHERE age > 60) AS above_60,
      COUNT(*) AS total_count
    FROM users;
  `;
  const { rows } = await pool.query(sql);
  const result = rows[0];
  const total = parseInt(result.total_count, 10) || 0;
  if (total === 0) {
    return {
      '<20': 0,
      '20-40': 0,
      '40-60': 0,
      '>60': 0,
    };
  }
  return {
    '<20': Number(((result.under_20 / total) * 100).toFixed(2)),
    '20-40': Number(((result.between_20_40 / total) * 100).toFixed(2)),
    '40-60': Number(((result.between_40_60 / total) * 100).toFixed(2)),
    '>60': Number(((result.above_60 / total) * 100).toFixed(2)),
  };
}

module.exports = {
  createUsersTable,
  insertUsersBatch,
  getAgeDistribution,
};