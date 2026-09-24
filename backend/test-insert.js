require('dotenv').config({path: './backend/.env'});
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.PGHOST || 'localhost',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT || 5432,
    database: process.env.PGDATABASE || 'evertree_db',
    connectionTimeoutMillis: 5000
});

async function test() {
    try {
        const client = await pool.connect();
        console.log("Connected");
        const res = await client.query(`
            INSERT INTO properties
            (
                title,
                description,
                category,
                property_type,
                bhk,
                price,
                city,
                district,
                address,
                latitude,
                longitude,
                seller_id,
                is_featured
            )
            VALUES
            (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
            )
            RETURNING *
        `, [
            'Test Property', 'Description', 'sell', 'apartment', 2, 8500000, 'Bengaluru', 'Urban', 'Address', 12.97, 77.59, 1, false
        ]);
        console.log("Insert success:", res.rows[0].id);
        client.release();
    } catch(e) {
        console.error("Insert failed:", e);
    }
    pool.end();
}
test();
