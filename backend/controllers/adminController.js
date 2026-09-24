const { query } = require("../config/db");

// Get dashboard overview
const getOverview = async (req, res) => {
    try {
        const usersResult = await query(`
            SELECT
                COUNT(*) AS total_users,
                COUNT(*) FILTER (WHERE role = 'buyer') AS buyers,
                COUNT(*) FILTER (WHERE role = 'seller') AS sellers,
                COUNT(*) FILTER (WHERE role = 'broker') AS brokers,
                COUNT(*) FILTER (WHERE approval_status = 'pending_admin_verification')
                    AS pending_users
            FROM users
        `);

        const propertiesResult = await query(`
            SELECT
                COUNT(*) AS total_properties,
                COUNT(*) FILTER (WHERE status = 'pending') AS pending_properties,
                COUNT(*) FILTER (WHERE status = 'approved') AS approved_properties,
                COUNT(*) FILTER (WHERE status = 'rejected') AS rejected_properties,
                COUNT(*) FILTER (WHERE status = 'sold') AS sold_properties,
                COUNT(*) FILTER (WHERE status = 'rented') AS rented_properties
            FROM properties
            WHERE deleted_at IS NULL
        `);

        res.json({
            users: usersResult.rows[0],
            properties: propertiesResult.rows[0]
        });
    } catch (error) {
        console.error("Admin overview error:", error);
        res.status(500).json({
            message: "Failed to load admin overview"
        });
    }
};


// Get all users
const getUsers = async (req, res) => {
    try {
        const result = await query(`
            SELECT
                id,
                name,
                email,
                phone,
                role,
                approval_status,
                phone_verified,
                email_verified,
                created_at
            FROM users
            ORDER BY created_at DESC
        `);

        res.json(result.rows);
    } catch (error) {
        console.error("Admin users error:", error);
        res.status(500).json({
            message: "Failed to load users"
        });
    }
};


// Get users waiting for admin verification
const getPendingUsers = async (req, res) => {
    try {
        const result = await query(`
            SELECT
                id,
                name,
                email,
                phone,
                role,
                verification_id,
                govt_id_type,
                govt_id_number,
                rera_number,
                agency_license,
                ownership_proof_ref,
                created_at
            FROM users
            WHERE approval_status = 'pending_admin_verification'
            ORDER BY created_at ASC
        `);

        res.json(result.rows);
    } catch (error) {
        console.error("Pending users error:", error);
        res.status(500).json({
            message: "Failed to load pending users"
        });
    }
};


// Approve a user
// Approve a user
const approveUser = async (req, res) => {
    const { id } = req.params;

    try {
        const userResult = await query(
            `
            UPDATE users
            SET approval_status = 'approved'
            WHERE id = $1
            RETURNING id, name, email, role, approval_status
            `,
            [id]
        );

        if (userResult.rowCount === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        await query(
            `
            INSERT INTO user_admin_approvals
            (user_id, status, reviewed_by, remarks, reviewed_at)
            VALUES ($1, 'approved', $2, NULL, NOW())
            `,
            [id, req.user.id]
        );

        await query(
            `
            INSERT INTO user_verification_audit
            (user_id, action, performed_by, notes, created_at)
            VALUES ($1, 'approved', $2, 'User approved by admin', NOW())
            `,
            [id, req.user.id]
        );

        await query(
            `
            INSERT INTO admin_actions
            (admin_id, action_type, target_type, target_id, description, created_at)
            VALUES ($1, 'approve_user', 'user', $2, 'User approved by admin', NOW())
            `,
            [req.user.id, id]
        );

        res.json({
            message: "User approved successfully",
            user: userResult.rows[0]
        });

    } catch (error) {
        console.error("Approve user error:", error);

        res.status(500).json({
            message: "Failed to approve user"
        });
    }
};


// Reject a user
const rejectUser = async (req, res) => {
    const { id } = req.params;
    const { remarks } = req.body;

    try {
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const userResult = await client.query(
                `
                UPDATE users
                SET approval_status = 'rejected'
                WHERE id = $1
                RETURNING id, name, email, role, approval_status
                `,
                [id]
            );

            if (userResult.rowCount === 0) {
                await client.query("ROLLBACK");

                return res.status(404).json({
                    message: "User not found"
                });
            }

            await client.query(
                `
                INSERT INTO user_admin_approvals
                (user_id, status, reviewed_by, remarks, reviewed_at)
                VALUES ($1, 'rejected', $2, $3, NOW())
                `,
                [id, req.user.id, remarks || null]
            );

            await client.query(
                `
                INSERT INTO admin_actions
                (admin_id, action_type, target_type, target_id, description, metadata, created_at)
                VALUES (
                    $1,
                    'reject_user',
                    'user',
                    $2,
                    'User rejected by admin',
                    $3,
                    NOW()
                )
                `,
                [
                    req.user.id,
                    id,
                    JSON.stringify({ remarks: remarks || null })
                ]
            );

            await client.query("COMMIT");

            res.json({
                message: "User rejected successfully",
                user: userResult.rows[0]
            });
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Reject user error:", error);

        res.status(500).json({
            message: "Failed to reject user"
        });
    }
};


// Get all properties for admin
const getProperties = async (req, res) => {
    try {
        const result = await query(`
            SELECT
                p.id,
                p.title,
                p.description,
                p.category,
                p.property_type,
                p.bhk,
                p.price,
                p.city,
                p.district,
                p.address,
                p.status,
                p.is_featured,
                p.created_at,
                p.updated_at,
                p.seller_id,
                p.broker_id,
                u.name AS owner_name,
                u.email AS owner_email
            FROM properties p
            LEFT JOIN users u
                ON u.id = COALESCE(p.seller_id, p.broker_id)
            WHERE p.deleted_at IS NULL
            ORDER BY p.created_at DESC
        `);

        res.json(result.rows);
    } catch (error) {
        console.error("Admin properties error:", error);

        res.status(500).json({
            message: "Failed to load properties"
        });
    }
};


// Update property status
exports.updatePropertyStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, remarks } = req.body;

        const allowedStatuses = ["pending", "approved", "rejected"];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                error: "Invalid property status."
            });
        }

        const propertyResult = await query(
            `
            SELECT id, title, status
            FROM properties
            WHERE id = $1
              AND deleted_at IS NULL
            `,
            [id]
        );

        if (propertyResult.rows.length === 0) {
            return res.status(404).json({
                error: "Property not found."
            });
        }

        const updatedProperty = await query(
            `
            UPDATE properties
            SET
                status = $1,
                updated_at = NOW()
            WHERE id = $2
            RETURNING *
            `,
            [status, id]
        );

        await query(
            `
            INSERT INTO admin_actions
            (admin_id, action_type, target_type, target_id, description, metadata)
            VALUES ($1, $2, $3, $4, $5, $6)
            `,
            [
                req.user.id,
                status === "approved"
                    ? "PROPERTY_APPROVED"
                    : status === "rejected"
                    ? "PROPERTY_REJECTED"
                    : "PROPERTY_STATUS_UPDATED",
                "property",
                id,
                remarks || `Property status changed to ${status}`,
                JSON.stringify({
                    previous_status: propertyResult.rows[0].status,
                    new_status: status
                })
            ]
        );

        return res.status(200).json({
            message: `Property ${status} successfully.`,
            property: updatedProperty.rows[0]
        });

    } catch (err) {
        console.error("Update property status error:", err);

        return res.status(500).json({
            error: "Server error updating property status."
        });
    }
};

module.exports = {
    getOverview,
    getUsers,
    getPendingUsers,
    approveUser,
    rejectUser,
    getProperties,
    updatePropertyStatus: exports.updatePropertyStatus
};