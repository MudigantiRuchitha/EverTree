const { query } = require("../config/db");

/*
|--------------------------------------------------------------------------
| GET ALL ACTIVE SUBSCRIPTION PLANS
|--------------------------------------------------------------------------
| GET /api/subscriptions/plans
|--------------------------------------------------------------------------
*/

const getSubscriptionPlans = async (req, res) => {
    try {
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

    } catch (error) {
        console.error(
            "GET SUBSCRIPTION PLANS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to load subscription plans."
        });
    }
};


module.exports = {
    getSubscriptionPlans
};