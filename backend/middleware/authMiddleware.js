const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'evertree_secret_key_2026_property_connect';

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
};

const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: `Forbidden. Requires one of roles: ${roles.join(', ')}` });
        }
        next();
    };
};

module.exports = { verifyToken, requireRole, JWT_SECRET };
