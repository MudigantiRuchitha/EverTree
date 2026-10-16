const { initDB, query } = require('./config/db');

async function test() {
    await initDB();
    const seller_id = 2;
    const subRes = await query(`
        SELECT * FROM seller_subscriptions
        WHERE seller_id = $1 AND status = 'active'
          AND (end_date IS NULL OR end_date > NOW())
        ORDER BY property_limit DESC, id DESC
        LIMIT 1
    `, [seller_id]);
    console.log('ACTIVE SUB FOR SELLER 2:', subRes.rows);

    const countRes = await query(`
        SELECT COUNT(*)::int AS count
        FROM properties
        WHERE seller_id = $1
    `, [seller_id]);
    console.log('COUNT FOR SELLER 2:', countRes.rows);

    // Let's also check all sellers
    const allUsers = await query(`SELECT id, name, email, role FROM users`);
    console.log('USERS:', allUsers.rows);

    const allActiveSubs = await query(`SELECT * FROM seller_subscriptions WHERE status = 'active'`);
    console.log('ALL ACTIVE SUBS:', allActiveSubs.rows);
    process.exit(0);
}

test();
