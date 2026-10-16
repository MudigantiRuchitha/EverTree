const { query, isPgConnected, fallbackData, saveSnapshotToDisk } = require("../config/db");

/*
|--------------------------------------------------------------------------
| GET ALL ACTIVE SUBSCRIPTION PLANS
|--------------------------------------------------------------------------
| GET /api/subscriptions/plans
|--------------------------------------------------------------------------
*/
const getSubscriptionPlans = async (req, res) => {
    try {
        if (isPgConnected()) {
            const result = await query(`
                SELECT
                    id,
                    name,
                    description,
                    price,
                    currency,
                    duration_days,
                    property_limit,
                    features
                FROM subscription_plans
                WHERE is_active = TRUE
                ORDER BY price ASC
            `);

            return res.status(200).json({
                success: true,
                plans: result.rows
            });
        } else {
            // Offline fallback
            const plans = (fallbackData.subscription_plans && fallbackData.subscription_plans.length > 0)
                ? fallbackData.subscription_plans
                : [
                    {
                        id: 1,
                        name: 'Basic',
                        description: 'For sellers with a small number of listings',
                        price: '999.00',
                        currency: 'INR',
                        duration_days: 30,
                        property_limit: 25,
                        features: ['25 property listings', 'Seller dashboard', 'Buyer enquiries'],
                        is_active: true
                    },
                    {
                        id: 2,
                        name: 'Professional',
                        description: 'For sellers with growing property listings',
                        price: '1999.00',
                        currency: 'INR',
                        duration_days: 30,
                        property_limit: 50,
                        features: ['50 property listings', 'Seller dashboard', 'Buyer enquiries', 'Priority listing'],
                        is_active: true
                    },
                    {
                        id: 3,
                        name: 'Business',
                        description: 'For sellers managing larger property portfolios',
                        price: '3999.00',
                        currency: 'INR',
                        duration_days: 30,
                        property_limit: 100,
                        features: ['100 property listings', 'Seller dashboard', 'Buyer enquiries', 'Priority listing', 'Featured properties'],
                        is_active: true
                    }
                ];

            return res.status(200).json({
                success: true,
                plans
            });
        }
    } catch (error) {
        console.error("GET SUBSCRIPTION PLANS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to load subscription plans."
        });
    }
};

/*
|--------------------------------------------------------------------------
| GET CURRENT USER SUBSCRIPTION & QUOTA
|--------------------------------------------------------------------------
| GET /api/subscriptions/current
|--------------------------------------------------------------------------
*/
const getCurrentSubscription = async (req, res) => {
    try {
        const seller_id = req.user?.id;
        if (!seller_id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        let plan_name = 'Free';
        let property_limit = 10;
        let status = 'active';
        let start_date = null;
        let end_date = null;
        let current_count = 0;

        if (isPgConnected()) {
            // Find latest active subscription
            const subRes = await query(`
                SELECT * FROM seller_subscriptions
                WHERE seller_id = $1 AND status = 'active'
                  AND (end_date IS NULL OR end_date > NOW())
                ORDER BY property_limit DESC, id DESC
                LIMIT 1
            `, [seller_id]);

            if (subRes.rows.length > 0) {
                const sub = subRes.rows[0];
                plan_name = sub.plan_name;
                property_limit = sub.property_limit;
                status = sub.status;
                start_date = sub.start_date;
                end_date = sub.end_date;
            }

            const countRes = await query(`
                SELECT COUNT(*)::int AS count
                FROM properties
                WHERE (seller_id = $1 OR broker_id = $1)
                  AND deleted_at IS NULL
            `, [seller_id]);

            current_count = countRes.rows[0]?.count || 0;
        } else {
            // Offline fallback
            const subs = fallbackData.seller_subscriptions || [];
            const sub = subs.find(s => 
                String(s.seller_id) === String(seller_id) && 
                s.status === 'active' && 
                (!s.end_date || new Date(s.end_date) > new Date())
            );

            if (sub) {
                plan_name = sub.plan_name;
                property_limit = Number(sub.property_limit) || 10;
                status = sub.status;
                start_date = sub.start_date;
                end_date = sub.end_date;
            }

            const props = fallbackData.properties || [];
            current_count = props.filter(p => (String(p.seller_id) === String(seller_id) || String(p.broker_id) === String(seller_id)) && !p.deleted_at).length;
        }

        const remaining_quota = Math.max(0, property_limit - current_count);
        const is_limit_reached = current_count >= property_limit;

        return res.status(200).json({
            success: true,
            subscription: {
                seller_id,
                plan_name,
                property_limit,
                current_count,
                remaining_quota,
                is_limit_reached,
                status,
                start_date,
                end_date,
                is_free: plan_name.toLowerCase() === 'free'
            }
        });
    } catch (error) {
        console.error("GET CURRENT SUBSCRIPTION ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to retrieve current subscription status."
        });
    }
};

/*
|--------------------------------------------------------------------------
| SUBSCRIBE / ACTIVATE PLAN WITH PAYMENT DETAILS
|--------------------------------------------------------------------------
| POST /api/subscriptions/subscribe
| Body: { plan_id, payment_method, transaction_id, amount }
|--------------------------------------------------------------------------
*/
const subscribe = async (req, res) => {
    try {
        const seller_id = req.user?.id;
        if (!seller_id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        const { plan_id, payment_method, transaction_id, amount } = req.body;

        if (!plan_id) {
            return res.status(400).json({
                success: false,
                message: "Plan ID is required to subscribe."
            });
        }

        // Fetch plan details
        let selectedPlan = null;

        if (isPgConnected()) {
            const planRes = await query(`
                SELECT * FROM subscription_plans
                WHERE id = $1 AND is_active = TRUE
            `, [plan_id]);

            if (planRes.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Subscription plan not found or inactive."
                });
            }
            selectedPlan = planRes.rows[0];
        } else {
            const plans = fallbackData.subscription_plans || [];
            selectedPlan = plans.find(p => String(p.id) === String(plan_id));
            if (!selectedPlan) {
                // Default fallback plans
                const defaults = [
                    { id: 1, name: 'Basic', property_limit: 25, duration_days: 30, price: '999.00' },
                    { id: 2, name: 'Professional', property_limit: 50, duration_days: 30, price: '1999.00' },
                    { id: 3, name: 'Business', property_limit: 100, duration_days: 30, price: '3999.00' }
                ];
                selectedPlan = defaults.find(d => String(d.id) === String(plan_id)) || defaults[1];
            }
        }

        const durationDays = selectedPlan.duration_days || 30;
        const propertyLimit = selectedPlan.property_limit || 25;
        const planName = selectedPlan.name;
        const finalTxnId = transaction_id || `TXN_EVT_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
        const finalPaymentMethod = payment_method || 'UPI';
        const finalAmount = amount || selectedPlan.price;

        let activeSubscription = null;

        if (isPgConnected()) {
            // Mark previous active subscriptions as superseded
            await query(`
                UPDATE seller_subscriptions
                SET status = 'superseded', updated_at = NOW()
                WHERE seller_id = $1 AND status = 'active'
            `, [seller_id]);

            // Insert new subscription
            const startDate = new Date();
            const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

            const insertRes = await query(`
                INSERT INTO seller_subscriptions (
                    seller_id,
                    plan_name,
                    property_limit,
                    status,
                    start_date,
                    end_date,
                    payment_method,
                    transaction_id,
                    amount_paid,
                    created_at,
                    updated_at
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    'active',
                    $4,
                    $5,
                    $6,
                    $7,
                    $8,
                    NOW(),
                    NOW()
                )
                RETURNING *
            `, [
                seller_id,
                planName,
                propertyLimit,
                startDate,
                endDate,
                finalPaymentMethod,
                finalTxnId,
                finalAmount
            ]);

            activeSubscription = insertRes.rows[0];

            // Sync snapshot
            if (!fallbackData.seller_subscriptions) {
                fallbackData.seller_subscriptions = [];
            }
            fallbackData.seller_subscriptions = fallbackData.seller_subscriptions.filter(
                s => !(String(s.seller_id) === String(seller_id) && s.status === 'active')
            );
            fallbackData.seller_subscriptions.push(activeSubscription);
            saveSnapshotToDisk();
        } else {
            // Offline fallback
            const now = new Date();
            const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

            activeSubscription = {
                id: Date.now(),
                seller_id,
                plan_name: planName,
                property_limit: propertyLimit,
                status: 'active',
                start_date: now.toISOString(),
                end_date: endDate.toISOString(),
                payment_method: finalPaymentMethod,
                transaction_id: finalTxnId,
                amount_paid: finalAmount,
                created_at: now.toISOString(),
                updated_at: now.toISOString()
            };

            if (!fallbackData.seller_subscriptions) {
                fallbackData.seller_subscriptions = [];
            }
            fallbackData.seller_subscriptions = fallbackData.seller_subscriptions.filter(
                s => !(String(s.seller_id) === String(seller_id) && s.status === 'active')
            );
            fallbackData.seller_subscriptions.push(activeSubscription);
            saveSnapshotToDisk();
        }

        return res.status(200).json({
            success: true,
            message: `🎉 Payment successful! You are now subscribed to the ${planName} Plan. Your listing limit is increased to ${propertyLimit} properties.`,
            subscription: activeSubscription,
            property_limit: propertyLimit,
            transaction_id: finalTxnId,
            plan_name: planName
        });

    } catch (error) {
        console.error("SUBSCRIBE ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to process subscription payment."
        });
    }
};

module.exports = {
    getSubscriptionPlans,
    getCurrentSubscription,
    subscribe
};