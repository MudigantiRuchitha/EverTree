
require('dotenv').config({
    path: require('path').resolve(__dirname, '../.env')
});

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const path = require('path');

// Match the connection settings used in backend/config/db.js
const dbPassword = process.env.PGPASSWORD;

if (!dbPassword) {
    console.error('PGPASSWORD is missing from backend/.env');
    process.exit(1);
}

// const pool = new Pool({
//     host: process.env.PGHOST || 'localhost',
//     port: Number(process.env.PGPORT) || 5432,
//     database: process.env.PGDATABASE || 'evertree',
//     user: process.env.PGUSER || 'postgres',
//     password: dbPassword,
//     ssl: { rejectUnauthorized: false },
//     connectionTimeoutMillis: 10000
// });

const pool = new Pool({
    host: process.env.NEON_PGHOST,
    port: Number(process.env.NEON_PGPORT) || 5432,
    database: process.env.NEON_PGDATABASE,
    user: process.env.NEON_PGUSER,
    password: process.env.NEON_PGPASSWORD,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
});

const seller = {
    name: 'Harshitha',
    email: 'harshithagangipally0210@gmail.com',
    phone: '9704040757',
    role: 'seller',
    govtIdType: 'Aadhaar',
    govtIdNumber: '908065200582',
    ownershipProofRef: 'N6846540A',
    approvalStatus: 'pending_admin_verification'
};

function generateVerificationId() {
    return `EVT-SEL-${Math.floor(10000 + Math.random() * 90000)}`;
}

async function main() {
    const password = process.env.NEW_SELLER_PASSWORD;

    if (!password || password.length < 8) {
        throw new Error(
            'Set NEW_SELLER_PASSWORD in your local environment to a password of at least 8 characters.'
        );
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const existing = await client.query(
            `SELECT id FROM users
             WHERE LOWER(email) = LOWER($1) OR phone = $2
             LIMIT 1`,
            [seller.email, seller.phone]
        );

        if (existing.rows.length > 0) {
            throw new Error(
                'That email or phone already exists. No account was created.'
            );
        }

        const passwordHash = await bcrypt.hash(password, 10);

        let verificationId = null;

        for (let attempt = 0; attempt < 50; attempt++) {
            const candidate = generateVerificationId();

            const found = await client.query(
                'SELECT 1 FROM users WHERE verification_id = $1',
                [candidate]
            );

            if (found.rows.length === 0) {
                verificationId = candidate;
                break;
            }
        }

        if (!verificationId) {
            throw new Error('Could not generate a unique verification ID.');
        }

        const result = await client.query(
            `INSERT INTO users (
                name, email, password_hash, role, phone,
                verification_id, phone_verified, email_verified,
                approval_status, govt_id_type, govt_id_number,
                rera_number, agency_license, ownership_proof_ref
            )
            VALUES (
                $1, $2, $3, $4, $5,
                $6, FALSE, FALSE,
                $7, $8, $9, NULL, NULL, $10
            )
            RETURNING id, name, email, role, phone,
                      verification_id, approval_status,
                      email_verified, phone_verified`,
            [
                seller.name,
                seller.email,
                passwordHash,
                seller.role,
                seller.phone,
                verificationId,
                seller.approvalStatus,
                seller.govtIdType,
                seller.govtIdNumber,
                seller.ownershipProofRef
            ]
        );

        await client.query('COMMIT');

        console.log('Seller account created successfully:');
        console.log(JSON.stringify(result.rows[0], null, 2));
        console.log('Password hashed with bcrypt (10 rounds).');
        console.log('Email and phone remain unverified.');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

main()
    .catch(error => {
        console.error('Seller creation failed:', error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await pool.end();
    });
