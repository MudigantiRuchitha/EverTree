const { query, isPgConnected, fallbackData, saveSnapshotToDisk } = require('../config/db');

exports.submitLead = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : null;
        const { service_type, details } = req.body;

        if (!service_type || !details) {
            return res.status(400).json({ error: 'Service type and details are required.' });
        }

        let savedLead = null;
        if (isPgConnected()) {
            try {
                const result = await query(
                    `INSERT INTO service_leads (user_id, service_type, details)
                     VALUES ($1, $2, $3) RETURNING *`,
                    [userId, service_type, JSON.stringify(details)]
                );
                savedLead = result.rows[0];
            } catch (pgErr) {
                console.warn('⚠️ [Resilient DB Engine] submitLead PG query failed, saving to snapshot:', pgErr.message);
            }
        }

        if (!savedLead) {
            savedLead = {
                id: (fallbackData.service_leads?.length || 0) + 1,
                user_id: userId,
                service_type,
                details,
                status: 'new',
                created_at: new Date().toISOString()
            };
        }

        fallbackData.service_leads = fallbackData.service_leads || [];
        fallbackData.service_leads.push(savedLead);
        saveSnapshotToDisk();

        return res.status(201).json({ message: 'Request submitted successfully!', lead: savedLead });
    } catch (err) {
        console.error('submitLead error:', err);
        res.status(500).json({ error: 'Failed to submit service inquiry.' });
    }
};

exports.calculateEmi = (req, res) => {
    try {
        const { principal, rate, tenureYears } = req.body;
        const p = Number(principal);
        const r = Number(rate) / (12 * 100); // monthly rate
        const n = Number(tenureYears) * 12; // months

        if (!p || !r || !n) {
            return res.status(400).json({ error: 'Valid principal, rate, and tenureYears are required.' });
        }

        const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        const totalPayment = emi * n;
        const totalInterest = totalPayment - p;

        res.json({
            monthlyEmi: Math.round(emi),
            totalInterest: Math.round(totalInterest),
            totalPayment: Math.round(totalPayment),
            loanAmount: p
        });
    } catch (err) {
        res.status(500).json({ error: 'EMI calculation error' });
    }
};

exports.getBrokerRequests = async (req, res) => {
    try {
        if (isPgConnected()) {
            try {
                const result = await query(
                    `SELECT sl.*, u.name as user_name, u.email as user_email, u.phone as user_phone, u.role as user_role
                     FROM service_leads sl
                     LEFT JOIN users u ON sl.user_id = u.id
                     WHERE sl.service_type = 'broker'
                     ORDER BY sl.created_at DESC`
                );
                return res.json(result.rows);
            } catch (pgErr) {
                console.warn('⚠️ [Resilient DB Engine] getBrokerRequests PG error, falling back to snapshot:', pgErr.message);
            }
        }

        const brokerLeads = (fallbackData.service_leads || []).filter(l => l.service_type === 'broker');
        return res.json(brokerLeads);
    } catch (err) {
        console.error('getBrokerRequests error:', err);
        return res.json((fallbackData.service_leads || []).filter(l => l.service_type === 'broker'));
    }
};
