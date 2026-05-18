const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS health_logs (
        id SERIAL PRIMARY KEY,
        logged_date DATE NOT NULL UNIQUE,
        weight_kg DECIMAL(5,2),
        sleep_hours DECIMAL(4,1),
        sleep_quality INT CHECK (sleep_quality BETWEEN 1 AND 10),
        energy INT CHECK (energy BETWEEN 1 AND 10),
        mood INT CHECK (mood BETWEEN 1 AND 10),
        food_quality INT CHECK (food_quality BETWEEN 1 AND 10),
        portions INT CHECK (portions BETWEEN 1 AND 5),
        symptoms TEXT[],
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_health_logs_date ON health_logs(logged_date DESC);
    `);
    console.log('✅ Migration complete');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
