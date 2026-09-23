require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
    host: process.env.PGHOST || 'localhost',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT || 5432,
    database: process.env.PGDATABASE || 'evertree_db'
});
pool.query("ALTER TABLE service_leads ADD CONSTRAINT service_lead_status_check CHECK (status IN ('new','in_progress','closed'))")
    .then(() => { console.log('Status constraint restored'); pool.end(); })
    .catch(e => { console.log('Note:', e.message); pool.end(); });
