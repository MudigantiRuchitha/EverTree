require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.PGHOST || 'localhost',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT || 5432,
    database: process.env.PGDATABASE || 'evertree_db',
    connectionTimeoutMillis: 5000
});

async function fix() {
    const client = await pool.connect();
    try {
        console.log('Connected to PostgreSQL...');

        // Show existing constraints
        const existing = await client.query(`
            SELECT conname FROM pg_constraint
            WHERE conrelid = 'service_leads'::regclass AND contype = 'c';
        `);
        console.log('Existing constraints:', existing.rows);

        // Drop ALL check constraints on service_leads
        for (const row of existing.rows) {
            await client.query(`ALTER TABLE service_leads DROP CONSTRAINT IF EXISTS "${row.conname}";`);
            console.log(`Dropped: ${row.conname}`);
        }

        // Add the correct one
        await client.query(`
            ALTER TABLE service_leads 
            ADD CONSTRAINT service_leads_service_type_check 
            CHECK (service_type IN ('loan', 'legal', 'interior', 'broker'));
        `);
        console.log('✅ New constraint added successfully!');

        // Test insert
        const test = await client.query(`
            SELECT COUNT(*) FROM service_leads WHERE service_type = 'broker';
        `);
        console.log(`Broker records in DB: ${test.rows[0].count}`);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

fix();
