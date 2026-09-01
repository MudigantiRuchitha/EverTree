const { query, isPgConnected, fallbackData } = require('../config/db');

exports.submitLead = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : null;
        const { service_type, details } = req.body;

        if (!service_type || !details) {
            return res.status(400).json({ error: 'Service type and details are required.' });
        }

        if (isPgConnected()) {
            const result = await query(
                `INSERT INTO service_leads (user_id, service_type, details)
                 VALUES ($1, $2, $3) RETURNING *`,
                [userId, service_type, JSON.stringify(details)]
            );
            return res.status(201).json({ message: 'Request submitted successfully!', lead: result.rows[0] });
        } else {
            const newLead = {
                id: fallbackData.service_leads.length + 1,
                user_id: userId,
                service_type,
                details,
                status: 'new',
                created_at: new Date()
            };
            fallbackData.service_leads.push(newLead);
            return res.status(201).json({ message: 'Request submitted successfully!', lead: newLead });
        }
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
