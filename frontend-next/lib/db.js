const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

let pool = null;

function getPool() {
    if (!pool) {
        pool = new Pool({
            host: process.env.PGHOST || 'localhost',
            user: process.env.PGUSER || 'postgres',
            password: process.env.PGPASSWORD || 'srilatha',
            database: process.env.PGDATABASE || 'evertree',
            port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
            max: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000
        });

        pool.on('error', (err) => {
            console.warn('⚠️ [Next PG Pool] Unexpected client error:', err?.message || err);
        });
    }
    return pool;
}

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

export function getDefaultPropertyImage(propertyType) {
    if (propertyType && defaultImagesByType[propertyType]) {
        return defaultImagesByType[propertyType];
    }
    return defaultFallbackPhoto;
}

export function normalizeMediaUrl(url, fallback = '') {
    if (!url || typeof url !== 'string') return fallback;
    let cleaned = url.trim();
    if (cleaned.includes('localhost:5000/uploads/')) {
        cleaned = cleaned.substring(cleaned.indexOf('/uploads/'));
    }
    if (cleaned.startsWith('uploads/')) {
        cleaned = `/${cleaned}`;
    }
    return cleaned;
}

function getSnapshotData() {
    const candidatePaths = [
        path.join(process.cwd(), '..', 'backend', 'data', 'offline_snapshot.json'),
        path.join(process.cwd(), 'backend', 'data', 'offline_snapshot.json'),
        path.join(process.cwd(), 'data', 'offline_snapshot.json'),
        'C:\\Users\\Soudu Srilatha\\OneDrive\\Desktop\\evertree\\EverTree\\backend\\data\\offline_snapshot.json'
    ];

    for (const p of candidatePaths) {
        try {
            if (fs.existsSync(p)) {
                const raw = fs.readFileSync(p, 'utf-8');
                return JSON.parse(raw);
            }
        } catch (_) {}
    }
    return null;
}

// =====================================================
// GET PROPERTIES (DIRECT FROM POSTGRESQL / SNAPSHOT)
// =====================================================
export async function getDbProperties(filters = {}) {
    try {
        const p = getPool();
        const {
            category,
            search,
            city,
            district,
            min_price,
            max_price,
            property_type,
            bhk,
            is_featured,
            status
        } = filters;

        let sql = `
            SELECT
                p.*,
                COALESCE(u.name, 'Property Owner') AS seller_name,
                COALESCE(u.role, 'seller') AS seller_role,
                COALESCE(u.phone, '+91 9876543210') AS seller_phone,
                u.avatar_url AS seller_avatar,
                (
                    SELECT COALESCE(pm.file_url, pm.media_url)
                    FROM property_media pm
                    WHERE pm.property_id = p.id
                      AND (
                          pm.media_type = 'image'
                          OR pm.media_type IS NULL
                      )
                    ORDER BY pm.id ASC
                    LIMIT 1
                ) AS cover_image
            FROM properties p
            LEFT JOIN users u ON p.seller_id = u.id
            WHERE p.deleted_at IS NULL
        `;

        const params = [];
        let pIdx = 1;

        if (status) {
            sql += ` AND p.status = $${pIdx++}`;
            params.push(status);
        }

        if (category && category !== 'all') {
            sql += ` AND p.category = $${pIdx++}`;
            params.push(category);
        }

        if (city) {
            sql += ` AND LOWER(p.city) LIKE $${pIdx++}`;
            params.push(`%${city.toLowerCase()}%`);
        }

        if (district) {
            sql += ` AND LOWER(p.district) LIKE $${pIdx++}`;
            params.push(`%${district.toLowerCase()}%`);
        }

        if (property_type) {
            sql += ` AND p.property_type = $${pIdx++}`;
            params.push(property_type);
        }

        if (bhk && Number(bhk) > 0) {
            sql += ` AND p.bhk = $${pIdx++}`;
            params.push(Number(bhk));
        }

        if (min_price) {
            sql += ` AND p.price >= $${pIdx++}`;
            params.push(Number(min_price));
        }

        if (max_price) {
            sql += ` AND p.price <= $${pIdx++}`;
            params.push(Number(max_price));
        }

        if (is_featured !== undefined && is_featured !== null && is_featured !== '') {
            sql += ` AND p.is_featured = $${pIdx++}`;
            params.push(String(is_featured) === 'true');
        }

        if (search) {
            sql += ` AND (
                LOWER(p.title) LIKE $${pIdx}
                OR LOWER(p.description) LIKE $${pIdx}
                OR LOWER(p.city) LIKE $${pIdx}
                OR LOWER(p.district) LIKE $${pIdx}
            )`;
            params.push(`%${search.toLowerCase()}%`);
            pIdx++;
        }

        sql += ` ORDER BY p.id DESC`;

        const res = await p.query(sql, params);

        return res.rows.map(row => {
            const rawCover = row.cover_image;
            const coverImage = rawCover
                ? normalizeMediaUrl(rawCover)
                : getDefaultPropertyImage(row.property_type);

            return {
                ...row,
                cover_image: coverImage,
                is_favorite: false
            };
        });
    } catch (err) {
        console.warn('⚠️ [Next DB] PostgreSQL query failed, checking offline snapshot:', err.message);
        const snapshot = getSnapshotData();
        if (snapshot && Array.isArray(snapshot.properties)) {
            let list = snapshot.properties;
            const mediaList = snapshot.property_media || [];
            const users = snapshot.users || [];

            return list.map(item => {
                const seller = users.find(u => String(u.id) === String(item.seller_id)) || {};
                const coverMedia = mediaList.find(m => String(m.property_id) === String(item.id) && (m.media_type === 'image' || !m.media_type));
                const rawCover = coverMedia ? (coverMedia.file_url || coverMedia.media_url) : item.cover_image;
                const cover = rawCover ? normalizeMediaUrl(rawCover) : getDefaultPropertyImage(item.property_type);

                return {
                    ...item,
                    seller_name: seller.name || 'Property Owner',
                    seller_role: seller.role || 'seller',
                    seller_phone: seller.phone || '+91 9876543210',
                    seller_avatar: seller.avatar_url,
                    cover_image: cover,
                    is_favorite: false
                };
            });
        }
        return [];
    }
}

// =====================================================
// GET SINGLE PROPERTY DETAILS (WITH MEDIA & AMENITIES)
// =====================================================
export async function getDbPropertyById(id) {
    const propId = Number(id);
    if (!Number.isInteger(propId)) return null;

    try {
        const p = getPool();
        const propRes = await p.query(`
            SELECT
                p.*,
                u.name AS seller_name,
                u.role AS seller_role,
                u.phone AS seller_phone,
                u.email AS seller_email,
                u.avatar_url AS seller_avatar
            FROM properties p
            LEFT JOIN users u ON p.seller_id = u.id
            WHERE p.id = $1 AND p.deleted_at IS NULL
        `, [propId]);

        if (propRes.rows.length === 0) return null;
        const property = propRes.rows[0];

        // Increment views in background
        p.query(`UPDATE properties SET views_count = COALESCE(views_count, 0) + 1 WHERE id = $1`, [propId]).catch(() => {});

        // Fetch media
        let media = [];
        try {
            const mediaRes = await p.query(`
                SELECT
                    id, property_id,
                    COALESCE(file_url, media_url) AS file_url,
                    COALESCE(file_url, media_url) AS media_url,
                    media_type
                FROM property_media
                WHERE property_id = $1
                ORDER BY id ASC
            `, [propId]);
            media = mediaRes.rows.map(m => ({
                ...m,
                file_url: normalizeMediaUrl(m.file_url),
                media_url: normalizeMediaUrl(m.media_url)
            }));
        } catch (_) {}

        // Fetch amenities
        let amenities = [];
        try {
            const amRes = await p.query(`SELECT amenity FROM property_amenities WHERE property_id = $1`, [propId]);
            amenities = amRes.rows.map(r => r.amenity);
        } catch (_) {}

        // Fetch documents
        let documents = [];
        try {
            const docRes = await p.query(`SELECT * FROM property_docs WHERE property_id = $1`, [propId]);
            documents = docRes.rows.map(d => ({
                ...d,
                file_url: normalizeMediaUrl(d.file_url)
            }));
        } catch (_) {}

        const coverImage = media.length > 0 && media[0].file_url
            ? media[0].file_url
            : (property.cover_image ? normalizeMediaUrl(property.cover_image) : getDefaultPropertyImage(property.property_type));

        return {
            ...property,
            cover_image: coverImage,
            media: media.length > 0 ? media : [
                {
                    id: `default-${property.id}`,
                    property_id: property.id,
                    file_url: coverImage,
                    media_url: coverImage,
                    media_type: 'image'
                }
            ],
            amenities,
            documents,
            is_favorite: false
        };
    } catch (err) {
        console.warn('⚠️ [Next DB] getPropertyById query failed, checking snapshot:', err.message);
        const snapshot = getSnapshotData();
        if (snapshot && Array.isArray(snapshot.properties)) {
            const found = snapshot.properties.find(p => String(p.id) === String(propId));
            if (!found) return null;

            const media = (snapshot.property_media || [])
                .filter(m => String(m.property_id) === String(propId))
                .map(m => ({
                    ...m,
                    file_url: normalizeMediaUrl(m.file_url || m.media_url),
                    media_url: normalizeMediaUrl(m.media_url || m.file_url)
                }));

            const coverImage = media.length > 0
                ? media[0].file_url
                : getDefaultPropertyImage(found.property_type);

            return {
                ...found,
                cover_image: coverImage,
                media: media.length > 0 ? media : [
                    {
                        id: `default-${found.id}`,
                        property_id: found.id,
                        file_url: coverImage,
                        media_url: coverImage,
                        media_type: 'image'
                    }
                ],
                amenities: [],
                documents: [],
                is_favorite: false
            };
        }
        return null;
    }
}

// =====================================================
// GET ADVERTISEMENTS (DIRECT FROM POSTGRESQL / SNAPSHOT)
// =====================================================
export async function getDbAdvertisements() {
    try {
        const p = getPool();
        const res = await p.query(`
            SELECT *
            FROM advertisements
            WHERE deleted_at IS NULL
            ORDER BY position ASC, id ASC
        `);

        return res.rows.map(ad => ({
            ...ad,
            image_url: normalizeMediaUrl(ad.image_url)
        }));
    } catch (err) {
        console.warn('⚠️ [Next DB] getDbAdvertisements failed, checking snapshot:', err.message);
        const snapshot = getSnapshotData();
        if (snapshot && Array.isArray(snapshot.advertisements)) {
            return snapshot.advertisements.map(ad => ({
                ...ad,
                image_url: normalizeMediaUrl(ad.image_url)
            }));
        }
        return [];
    }
}

// =====================================================
// GET SUBSCRIPTION PLANS
// =====================================================
export async function getDbSubscriptionPlans() {
    try {
        const p = getPool();
        const res = await p.query(`
            SELECT *
            FROM subscription_plans
            WHERE is_active = TRUE
            ORDER BY price ASC
        `);
        return res.rows;
    } catch (err) {
        const snapshot = getSnapshotData();
        return snapshot?.subscription_plans || [];
    }
}

// =====================================================
// INSERT LEAD / ENQUIRY
// =====================================================
export async function saveDbEnquiry(data) {
    try {
        const p = getPool();
        const res = await p.query(`
            INSERT INTO enquiries (property_id, user_id, name, email, phone, message)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [
            data.property_id || null,
            data.user_id || null,
            data.name || 'Anonymous',
            data.email || null,
            data.phone || null,
            data.message || ''
        ]);
        return res.rows[0];
    } catch (err) {
        console.warn('⚠️ [Next DB] saveDbEnquiry failed:', err.message);
        return { id: Date.now(), ...data, created_at: new Date().toISOString() };
    }
}

export async function saveDbLead(data) {
    try {
        const p = getPool();
        const res = await p.query(`
            INSERT INTO service_leads (service_type, name, phone, email, notes)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [
            data.service_type || data.service || 'general',
            data.name || 'Lead',
            data.phone || '',
            data.email || null,
            data.notes || data.message || ''
        ]);
        return res.rows[0];
    } catch (err) {
        console.warn('⚠️ [Next DB] saveDbLead failed:', err.message);
        return { id: Date.now(), ...data, created_at: new Date().toISOString() };
    }
}

// =====================================================
// GET USER SUBSCRIPTION QUOTA
// =====================================================
export async function getUserSubscription(userId) {
    const defaultSub = {
        seller_id: userId,
        plan_name: 'Free',
        property_limit: 10,
        current_count: 0,
        remaining_quota: 10,
        is_limit_reached: false,
        status: 'active',
        is_free: true
    };
    if (!userId) return defaultSub;

    try {
        const p = getPool();
        let plan_name = 'Free';
        let property_limit = 10;
        let status = 'active';
        let start_date = null;
        let end_date = null;

        const subRes = await p.query(`
            SELECT * FROM seller_subscriptions
            WHERE seller_id = $1 AND status = 'active'
              AND (end_date IS NULL OR end_date > NOW())
            ORDER BY property_limit DESC, id DESC
            LIMIT 1
        `, [userId]);

        if (subRes.rows.length > 0) {
            const sub = subRes.rows[0];
            plan_name = sub.plan_name || 'Active Plan';
            property_limit = Number(sub.property_limit) || 10;
            status = sub.status;
            start_date = sub.start_date;
            end_date = sub.end_date;
        }

        const countRes = await p.query(`
            SELECT COUNT(*)::int AS count
            FROM properties
            WHERE (seller_id = $1 OR broker_id = $1)
              AND deleted_at IS NULL
        `, [userId]);

        const current_count = Number(countRes.rows[0]?.count) || 0;
        const remaining_quota = Math.max(0, property_limit - current_count);
        const is_limit_reached = current_count >= property_limit;

        return {
            seller_id: userId,
            plan_name,
            property_limit,
            current_count,
            remaining_quota,
            is_limit_reached,
            status,
            start_date,
            end_date,
            is_free: plan_name.toLowerCase() === 'free'
        };
    } catch (err) {
        console.warn('⚠️ [Next DB] getUserSubscription error:', err.message);
        return defaultSub;
    }
}

// =====================================================
// SUBSCRIBE USER PLAN
// =====================================================
export async function subscribeUserPlan(userId, planId, paymentDetails = {}) {
    try {
        const p = getPool();
        const planRes = await p.query(`
            SELECT * FROM subscription_plans WHERE id = $1 AND is_active = TRUE
        `, [planId]);

        let plan = planRes.rows[0];
        if (!plan) {
            const plans = await getDbSubscriptionPlans();
            plan = plans.find(pl => String(pl.id) === String(planId)) || plans[0];
        }

        const durationDays = plan?.duration_days || 30;
        const propertyLimit = plan?.property_limit || 25;
        const planName = plan?.name || 'Basic';
        const txnId = paymentDetails.transaction_id || `TXN_EVT_${Date.now()}`;
        const paymentMethod = paymentDetails.payment_method || 'UPI';
        const amount = paymentDetails.amount || plan?.price || '999.00';

        // Mark previous active subscriptions as superseded
        await p.query(`
            UPDATE seller_subscriptions
            SET status = 'superseded', updated_at = NOW()
            WHERE seller_id = $1 AND status = 'active'
        `, [userId]);

        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

        const insertRes = await p.query(`
            INSERT INTO seller_subscriptions
                (seller_id, plan_name, property_limit, status, start_date, end_date, payment_method, transaction_id, amount_paid, created_at, updated_at)
            VALUES
                ($1, $2, $3, 'active', $4, $5, $6, $7, $8, NOW(), NOW())
            RETURNING *
        `, [userId, planName, propertyLimit, startDate, endDate, paymentMethod, txnId, amount]);

        return insertRes.rows[0];
    } catch (err) {
        console.warn('⚠️ [Next DB] subscribeUserPlan error:', err.message);
        return null;
    }
}
