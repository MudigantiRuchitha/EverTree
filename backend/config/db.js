const { Pool, Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let pool = null;
let isPgConnected = false;

// Kept empty for legacy non-auth handlers until they are migrated to PostgreSQL.
const fallbackData = {
    users: [],
    properties: [],
    property_media: [],
    property_docs: [],
    property_amenities: [],
    enquiries: [],
    favorites: [],
    chat_messages: [],
    service_leads: []
};

// async function tryConnectPg() {
//     const host = process.env.PGHOST || 'localhost';
//     const user = process.env.PGUSER || 'postgres';
//     const port = process.env.PGPORT || 5432;
//     const dbName = process.env.PGDATABASE || 'evertree_db';
//     const password = process.env.PGPASSWORD;

//     for (const pwd of candidatePasswords) {
//         try {
//             // First connect to default 'postgres' db to ensure database 'evertree_db' exists
//             const rootClient = new Client({ host, user, password: pwd, port, database: 'postgres', connectionTimeoutMillis: 2000 });
//             await rootClient.connect();

//             // Create evertree_db if missing
//             const checkDb = await rootClient.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
//             if (checkDb.rows.length === 0) {
//                 await rootClient.query(`CREATE DATABASE "${dbName}"`);
//                 console.log(`✅ Created PostgreSQL Database: ${dbName}`);
//             }
//             await rootClient.end();

//             // Now initialize Pool with working password & database
//             pool = new Pool({ host, user, password: pwd, port, database: dbName, connectionTimeoutMillis: 3000 });
//             const client = await pool.connect();
//             console.log(`✅ Connected to PostgreSQL Database: ${dbName} on port ${port} (User: ${user})`);
//             isPgConnected = true;

//             // Execute DDL Schema initialization
//             const schemaPath = path.join(__dirname, '../schema.sql');
//             if (fs.existsSync(schemaPath)) {
//                 const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
//                 await client.query(schemaSql);
//                 console.log('✅ PostgreSQL Tables Verified / Initialized Successfully!');
//             }
//             client.release();
//             return true;
//         } catch (err) {
//             console.log(`❌ PostgreSQL connection attempt failed: ${err.message}`);

//             // Continue testing next candidate password
//         }
//     }

//     const rootClient = new Client({
//         host,
//         user,
//         password,
//         port,
//         database: 'postgres',
//         connectionTimeoutMillis: 3000
//     });
//     await rootClient.connect();

//     const checkDb = await rootClient.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
//     if (checkDb.rows.length === 0) {
//         await rootClient.query(`CREATE DATABASE "${dbName}"`);
//         console.log(`Created PostgreSQL database: ${dbName}`);
//     }
//     await rootClient.end();

//     pool = new Pool({ host, user, password, port, database: dbName, connectionTimeoutMillis: 3000 });
//     const client = await pool.connect();
//     isPgConnected = true;
//     console.log(`Connected to PostgreSQL database: ${dbName} on port ${port}`);

//     const schemaPath = path.join(__dirname, '../schema.sql');
//     if (fs.existsSync(schemaPath)) {
//         await client.query(fs.readFileSync(schemaPath, 'utf-8'));
//         console.log('PostgreSQL tables verified / initialized successfully.');
//     }

//     // Auto-migrate missing columns for database schema compatibility
//     try {
//         await client.query('ALTER TABLE properties ADD COLUMN IF NOT EXISTS views_count INT DEFAULT 0');
//         await client.query('ALTER TABLE property_media ADD COLUMN IF NOT EXISTS file_url VARCHAR(255)');
//         await client.query('UPDATE property_media SET file_url = media_url WHERE file_url IS NULL AND media_url IS NOT NULL');
//         await client.query('ALTER TABLE property_media ADD COLUMN IF NOT EXISTS media_url VARCHAR(255)');
//         await client.query('UPDATE property_media SET media_url = file_url WHERE media_url IS NULL AND file_url IS NOT NULL');
//         await client.query('ALTER TABLE favorites ADD COLUMN IF NOT EXISTS user_id INT');
//         await client.query('UPDATE favorites SET user_id = buyer_id WHERE user_id IS NULL AND buyer_id IS NOT NULL');
//         await client.query('ALTER TABLE favorites ADD COLUMN IF NOT EXISTS buyer_id INT');
//         await client.query('UPDATE favorites SET buyer_id = user_id WHERE buyer_id IS NULL AND user_id IS NOT NULL');
        
//         // Update service_leads check constraint
//         await client.query(`
//             ALTER TABLE service_leads DROP CONSTRAINT IF EXISTS service_leads_service_type_check;
//         `);
//         await client.query(`
//             ALTER TABLE service_leads DROP CONSTRAINT IF EXISTS service_lead_type_check;
//         `);
//         await client.query(`
//             ALTER TABLE service_leads ADD CONSTRAINT service_leads_service_type_check CHECK (service_type IN ('loan', 'legal', 'interior', 'broker'));
//         `);

//         console.log('PostgreSQL column migrations verified.');
//     } catch (migErr) {
//         console.warn('PostgreSQL column migration warning:', migErr.message);
//     }
//     client.release();
// }


async function tryConnectPg() {
    const host = process.env.PGHOST || 'localhost';
    const user = process.env.PGUSER || 'postgres';
    const port = Number(process.env.PGPORT) || 5432;
    const dbName = process.env.PGDATABASE || 'evertree';
    const password = process.env.PGPASSWORD;

    if (!password) {
        throw new Error('PGPASSWORD is missing from backend/.env');
    }

    console.log('🔄 Connecting to PostgreSQL...');
    console.log(`   Host: ${host}`);
    console.log(`   Port: ${port}`);
    console.log(`   Database: ${dbName}`);
    console.log(`   User: ${user}`);

    try {
        // Connect directly to the configured database
        pool = new Pool({
            host,
            user,
            password,
            port,
            database: dbName,
            connectionTimeoutMillis: 5000
        });

        const client = await pool.connect();

        console.log(
            `✅ Connected to PostgreSQL database: ${dbName} on port ${port}`
        );

        isPgConnected = true;

        // =====================================================
        // Initialize schema
        // =====================================================

        const schemaPath = path.join(__dirname, '../schema.sql');

        if (fs.existsSync(schemaPath)) {
            const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

            if (schemaSql.trim()) {
                await client.query(schemaSql);
                console.log(
                    'PostgreSQL tables verified / initialized successfully.'
                );
            }
        } else {
            console.warn(
                `⚠️ schema.sql not found at: ${schemaPath}`
            );
        }

        // =====================================================
        // Auto-migrate missing columns
        // =====================================================

        try {
            await client.query(`
                ALTER TABLE properties
                ADD COLUMN IF NOT EXISTS views_count INT DEFAULT 0
            `);

            await client.query(`
                ALTER TABLE property_media
                ADD COLUMN IF NOT EXISTS file_url VARCHAR(255)
            `);

            await client.query(`
                ALTER TABLE property_media
                ADD COLUMN IF NOT EXISTS media_url VARCHAR(255)
            `);

            await client.query(`
                UPDATE property_media
                SET file_url = media_url
                WHERE file_url IS NULL
                AND media_url IS NOT NULL
            `);

            await client.query(`
                UPDATE property_media
                SET media_url = file_url
                WHERE media_url IS NULL
                AND file_url IS NOT NULL
            `);

            await client.query(`
                ALTER TABLE favorites
                ADD COLUMN IF NOT EXISTS user_id INT
            `);

            await client.query(`
                ALTER TABLE favorites
                ADD COLUMN IF NOT EXISTS buyer_id INT
            `);

            await client.query(`
                UPDATE favorites
                SET user_id = buyer_id
                WHERE user_id IS NULL
                AND buyer_id IS NOT NULL
            `);

            await client.query(`
                UPDATE favorites
                SET buyer_id = user_id
                WHERE buyer_id IS NULL
                AND user_id IS NOT NULL
            `);

            // Update service_leads check constraint
            await client.query(`
                ALTER TABLE service_leads
                DROP CONSTRAINT IF EXISTS service_leads_service_type_check
            `);

            await client.query(`
                ALTER TABLE service_leads
                DROP CONSTRAINT IF EXISTS service_lead_type_check
            `);

            await client.query(`
                ALTER TABLE service_leads
                ADD CONSTRAINT service_leads_service_type_check
                CHECK (
                    service_type IN (
                        'loan',
                        'legal',
                        'interior',
                        'broker'
                    )
                )
            `);

            console.log(
                'PostgreSQL column migrations verified.'
            );

        } catch (migErr) {
            console.warn(
                'PostgreSQL column migration warning:',
                migErr.message
            );
        }

        client.release();

        return true;

    } catch (err) {
        isPgConnected = false;

        console.error(
            '❌ PostgreSQL connection error:',
            err.message
        );

        console.error(
            '   Error code:',
            err.code || 'N/A'
        );

        if (pool) {
            try {
                await pool.end();
            } catch (_) {}

            pool = null;
        }

        throw err;
    }
}


// async function initDB() {
//     try {
//         await tryConnectPg();
//     } catch (err) {
//         isPgConnected = false;
//         console.error('PostgreSQL connection failed. Update backend/.env and restart the server.');
//         throw err;
//     }
// }

async function initDB() {
    try {
        await tryConnectPg();
    } catch (err) {
        isPgConnected = false;

        console.error(
            'PostgreSQL connection failed:',
            err.message
        );

        throw err;
    }
}

const query = async (text, params) => {
    if (!isPgConnected || !pool) {
        throw new Error('PostgreSQL is not connected.');
    }
    return pool.query(text, params);
};

module.exports = {
    pool,
    query,
    initDB,
    isPgConnected: () => isPgConnected,
    fallbackData
};
