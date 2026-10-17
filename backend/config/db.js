const { Pool, Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let pool = null;
let isPgConnected = false;
let reconnectTimer = null;
let syncTimer = null;

const SNAPSHOT_FILE = path.join(__dirname, '../data/offline_snapshot.json');

// Default property type curated photos
const defaultImagesByType = {
    villa: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    apartment: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    independent_house: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
    plot: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    agricultural_land: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    commercial_office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    commercial_shop: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80'
};
const defaultFallbackPhoto = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';

function getDefaultPropertyImage(propertyType, id = 0) {
    if (propertyType && defaultImagesByType[propertyType]) {
        return defaultImagesByType[propertyType];
    }
    return defaultFallbackPhoto;
}

// In-Memory Resilient Engine Data
const fallbackData = {
    users: [],
    properties: [],
    property_media: [],
    property_docs: [],
    property_amenities: [],
    enquiries: [],
    favorites: [],
    chat_messages: [],
    service_leads: [],
    advertisements: [],
    subscription_plans: [],
    seller_subscriptions: []
};

// -------------------------------------------------------------
// Load offline snapshot into fallbackData on startup
// -------------------------------------------------------------
function loadSnapshotIntoFallback() {
    try {
        if (fs.existsSync(SNAPSHOT_FILE)) {
            const raw = fs.readFileSync(SNAPSHOT_FILE, 'utf-8');
            const data = JSON.parse(raw);
            if (Array.isArray(data.properties) && data.properties.length > 0) {
                fallbackData.properties = data.properties;
            }
            if (Array.isArray(data.property_media) && data.property_media.length > 0) {
                fallbackData.property_media = data.property_media;
            }
            if (Array.isArray(data.advertisements) && data.advertisements.length > 0) {
                fallbackData.advertisements = data.advertisements;
            }
            if (Array.isArray(data.users) && data.users.length > 0) {
                fallbackData.users = data.users;
            }
            if (Array.isArray(data.service_leads)) {
                fallbackData.service_leads = data.service_leads;
            }
            if (Array.isArray(data.property_amenities)) {
                fallbackData.property_amenities = data.property_amenities;
            }
            if (Array.isArray(data.property_docs)) {
                fallbackData.property_docs = data.property_docs;
            }
            if (Array.isArray(data.subscription_plans)) {
                fallbackData.subscription_plans = data.subscription_plans;
            }
            if (Array.isArray(data.seller_subscriptions)) {
                fallbackData.seller_subscriptions = data.seller_subscriptions;
            }
            console.log(`📦 [Resilient DB Engine] Loaded offline snapshot into memory: ${fallbackData.properties.length} properties, ${fallbackData.property_media.length} photos, ${fallbackData.advertisements.length} ads.`);
        }
    } catch (err) {
        console.warn('⚠️ [Resilient DB Engine] Failed to load offline snapshot:', err.message);
    }
}

// Immediately load snapshot on file load
loadSnapshotIntoFallback();

// -------------------------------------------------------------
// Persist latest state to offline_snapshot.json on disk
// -------------------------------------------------------------
function saveSnapshotToDisk() {
    try {
        const dir = path.dirname(SNAPSHOT_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const snapshot = {
            updated_at: new Date().toISOString(),
            properties: fallbackData.properties,
            property_media: fallbackData.property_media,
            property_amenities: fallbackData.property_amenities,
            property_docs: fallbackData.property_docs,
            users: fallbackData.users,
            advertisements: fallbackData.advertisements,
            service_leads: fallbackData.service_leads,
            subscription_plans: fallbackData.subscription_plans || [],
            seller_subscriptions: fallbackData.seller_subscriptions || []
        };
        fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(snapshot, null, 2));
        console.log(`💾 [Resilient DB Engine] Saved latest snapshot (${fallbackData.properties.length} properties, ${fallbackData.property_media.length} photos, ${fallbackData.advertisements.length} ads).`);
    } catch (err) {
        console.warn('⚠️ [Resilient DB Engine] Failed to persist snapshot:', err.message);
    }
}

// -------------------------------------------------------------
// Synchronize latest database state into snapshot & fallbackData
// -------------------------------------------------------------
async function syncSnapshotFromPg() {
    if (!isPgConnected || !pool) return;
    try {
        const propsRes = await pool.query('SELECT * FROM properties ORDER BY id DESC');
        const mediaRes = await pool.query('SELECT * FROM property_media ORDER BY id ASC');
        const adsRes = await pool.query('SELECT * FROM advertisements ORDER BY position ASC, id ASC');
        const usersRes = await pool.query('SELECT id, name, email, role, phone, avatar_url FROM users');
        const leadsRes = await pool.query('SELECT * FROM service_leads ORDER BY id DESC');

        let amenities = [];
        try {
            const amRes = await pool.query('SELECT * FROM property_amenities');
            amenities = amRes.rows;
        } catch (_) {}

        let docs = [];
        try {
            const dRes = await pool.query('SELECT * FROM property_docs');
            docs = dRes.rows;
        } catch (_) {}

        let plans = [];
        try {
            const pRes = await pool.query('SELECT * FROM subscription_plans WHERE is_active = TRUE ORDER BY price ASC');
            plans = pRes.rows;
        } catch (_) {}

        let subs = [];
        try {
            const sRes = await pool.query('SELECT * FROM seller_subscriptions');
            subs = sRes.rows;
        } catch (_) {}

        // Ensure all properties have media entries in memory & snapshot
        const mediaList = [...mediaRes.rows];
        for (const p of propsRes.rows) {
            const hasMedia = mediaList.some(m => String(m.property_id) === String(p.id));
            if (!hasMedia) {
                const img = getDefaultPropertyImage(p.property_type, p.id);
                mediaList.push({
                    id: 'gen-' + p.id,
                    property_id: p.id,
                    media_type: 'image',
                    file_url: img,
                    media_url: img
                });
            }
        }

        fallbackData.properties = propsRes.rows;
        fallbackData.property_media = mediaList;
        fallbackData.advertisements = adsRes.rows;
        fallbackData.users = usersRes.rows;
        fallbackData.service_leads = leadsRes.rows;
        fallbackData.property_amenities = amenities;
        fallbackData.property_docs = docs;
        fallbackData.subscription_plans = plans;
        fallbackData.seller_subscriptions = subs;

        saveSnapshotToDisk();
    } catch (err) {
        console.warn('⚠️ [Resilient DB Engine] syncSnapshotFromPg warning:', err.message);
    }
}

// -------------------------------------------------------------
// PostgreSQL Connection Attempt
// -------------------------------------------------------------
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
    console.log(`   Host: ${host}:${port} | Database: ${dbName} | User: ${user}`);

    try {
        pool = new Pool({
            host,
            user,
            password,
            port,
            database: dbName,
            ssl: {
                rejectUnauthorized: false
            },
            connectionTimeoutMillis: 10000
        });

        // Test connection
        const client = await pool.connect();

        console.log(`✅ Connected to PostgreSQL database: ${dbName} on port ${port}`);
        isPgConnected = true;

        // Initialize schema
        const schemaPath = path.join(__dirname, '../schema.sql');
        if (fs.existsSync(schemaPath)) {
            const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
            if (schemaSql.trim()) {
                await client.query(schemaSql);
                console.log('PostgreSQL tables verified / initialized successfully.');
            }
        }

        // Auto-migrate columns
        try {
            await client.query('ALTER TABLE properties ADD COLUMN IF NOT EXISTS views_count INT DEFAULT 0');
            await client.query('ALTER TABLE property_media ADD COLUMN IF NOT EXISTS file_url VARCHAR(255)');
            await client.query('ALTER TABLE property_media ADD COLUMN IF NOT EXISTS media_url VARCHAR(255)');
            await client.query('UPDATE property_media SET file_url = media_url WHERE file_url IS NULL AND media_url IS NOT NULL');
            await client.query('UPDATE property_media SET media_url = file_url WHERE media_url IS NULL AND file_url IS NOT NULL');
            await client.query('ALTER TABLE favorites ADD COLUMN IF NOT EXISTS user_id INT');
            await client.query('ALTER TABLE favorites ADD COLUMN IF NOT EXISTS buyer_id INT');
            await client.query('UPDATE favorites SET user_id = buyer_id WHERE user_id IS NULL AND buyer_id IS NOT NULL');
            await client.query('UPDATE favorites SET buyer_id = user_id WHERE buyer_id IS NULL AND user_id IS NOT NULL');

            await client.query('ALTER TABLE seller_subscriptions ADD COLUMN IF NOT EXISTS payment_method VARCHAR(100)');
            await client.query('ALTER TABLE seller_subscriptions ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(100)');
            await client.query('ALTER TABLE seller_subscriptions ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(10, 2)');

            await client.query('ALTER TABLE service_leads DROP CONSTRAINT IF EXISTS service_leads_service_type_check');
            await client.query('ALTER TABLE service_leads DROP CONSTRAINT IF EXISTS service_lead_type_check');
            await client.query(`
                ALTER TABLE service_leads
                ADD CONSTRAINT service_leads_service_type_check
                CHECK (service_type IN ('loan', 'legal', 'interior', 'broker'))
            `);

            await client.query(`
                CREATE TABLE IF NOT EXISTS advertisements (
                    id SERIAL PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    image_url TEXT,
                    target_url TEXT,
                    position VARCHAR(50),
                    start_date TIMESTAMP,
                    end_date TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Seed default ads if table is empty
            const advCount = await client.query('SELECT COUNT(*) FROM advertisements');
            if (parseInt(advCount.rows[0].count) === 0) {
                await client.query(`
                    INSERT INTO advertisements (title, description, image_url, target_url, position) VALUES
                    ('Lowest Home Loan Interest Rates', 'Special interest rates starting at 8.35% p.a. for all verified properties.', 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80', '/loan', '1'),
                    ('Premium Interior Design Solutions', 'Transform your newly purchased home with top-tier interior decorators.', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80', '/interior', '2'),
                    ('Luxury Villas & Estates', 'Experience resort-style luxury living with private pools and lush green views.', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80', '/search?type=villa', '3'),
                    ('Reliable Packers & Movers Partner', 'Save up to 40% on seamless relocation and packing services across India.', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', '/services', '4'),
                    ('Expert Legal Verification & Title Checks', 'Get property ownership documents verified by certified real estate lawyers.', 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80', '/legal', '5')
                `);
            }

            console.log('PostgreSQL column migrations verified.');
        } catch (migErr) {
            console.warn('PostgreSQL column migration warning:', migErr.message);
        }

        client.release();

        // Immediately sync database to snapshot
        await syncSnapshotFromPg();

        return true;
    } catch (err) {
        isPgConnected = false;
        if (pool) {
            try { await pool.end(); } catch (_) {}
            pool = null;
        }
        throw err;
    }
}

// -------------------------------------------------------------
// Resilient Background Monitor & Auto-Reconnect Engine
// -------------------------------------------------------------
function startResilientMonitor() {
    // Periodic synchronization (every 30 seconds when PG is connected)
    if (!syncTimer) {
        syncTimer = setInterval(async () => {
            if (isPgConnected) {
                await syncSnapshotFromPg();
            }
        }, 30000);
    }

    // Periodic auto-reconnect (every 10 seconds when PG is offline)
    if (!reconnectTimer) {
        reconnectTimer = setInterval(async () => {
            if (!isPgConnected) {
                try {
                    await tryConnectPg();
                    console.log('🎉 [Resilient DB Engine] Successfully reconnected to PostgreSQL database!');
                } catch (_) {
                    // Silently wait for database service to restart
                }
            }
        }, 10000);
    }
}

// -------------------------------------------------------------
// Non-crashing initDB function
// -------------------------------------------------------------
async function initDB() {
    try {
        await tryConnectPg();
        console.log('🚀 PostgreSQL initialization complete.');
    } catch (err) {
        isPgConnected = false;
        console.warn('⚠️ [Resilient DB Engine] PostgreSQL connection failed at startup:', err.message);
        console.log(`🛡️ [Resilient DB Engine] Active! Serving ${fallbackData.properties.length} latest properties, ${fallbackData.property_media.length} photos, ${fallbackData.advertisements.length} ads from persistent snapshot.`);
    }

    startResilientMonitor();
}

// -------------------------------------------------------------
// Resilient Query Function
// -------------------------------------------------------------
const query = async (text, params) => {
    if (!isPgConnected || !pool) {
        const err = new Error('PostgreSQL is not connected.');
        err.code = 'PG_OFFLINE';
        throw err;
    }
    try {
        return await pool.query(text, params);
    } catch (err) {
        // Handle disconnect/database shutdown errors
        if (
            err.code === 'ECONNREFUSED' ||
            err.code === '57P01' || // admin shutdown
            err.code === '57P02' || // crash shutdown
            err.code === '57P03' || // cannot connect now
            err.message.includes('Connection terminated') ||
            err.message.includes('closed the connection') ||
            err.message.includes('timeout')
        ) {
            console.warn('⚠️ [Resilient DB Engine] PostgreSQL connection lost during query:', err.message);
            isPgConnected = false;
            err.code = 'PG_OFFLINE';
        }
        throw err;
    }
};

module.exports = {
    pool,
    query,
    initDB,
    isPgConnected: () => isPgConnected,
    fallbackData,
    saveSnapshotToDisk,
    syncSnapshotFromPg,
    getDefaultPropertyImage
};
