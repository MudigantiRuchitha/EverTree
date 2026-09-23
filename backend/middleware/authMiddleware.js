// const jwt = require('jsonwebtoken');

// const JWT_SECRET = process.env.JWT_SECRET || 'evertree_secret_key_2026_property_connect';

// const verifyToken = (req, res, next) => {
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//         return res.status(401).json({ error: 'Access denied. No token provided.' });
//     }

//     const token = authHeader.split(' ')[1];
//     try {
//         const decoded = jwt.verify(token, JWT_SECRET);
//         req.user = decoded;
//         next();
//     } catch (err) {
//         return res.status(401).json({ error: 'Invalid or expired token.' });
//     }
// };

// const requireRole = (...roles) => {
//     return (req, res, next) => {
//         if (!req.user || !roles.includes(req.user.role)) {
//             return res.status(403).json({ error: `Forbidden. Requires one of roles: ${roles.join(', ')}` });
//         }
//         next();
//     };
// };

// module.exports = { verifyToken, requireRole, JWT_SECRET };
const jwt = require('jsonwebtoken');

const JWT_SECRET =
    process.env.JWT_SECRET ||
    'evertree_secret_key_2026_property_connect';


// =====================================================
// VERIFY JWT TOKEN
// =====================================================

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: 'Access denied. No token provided.'
        });
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        /*
         * Keep the complete JWT payload.
         *
         * Different login implementations sometimes store
         * the user ID as:
         *   id
         *   user_id
         *   userId
         *
         * Normalize it so controllers can always use:
         *
         *   req.user.id
         */

        const userId =
            decoded.id ??
            decoded.user_id ??
            decoded.userId ??
            null;

        req.user = {
            ...decoded,
            id: userId
        };

        next();

    } catch (error) {
        console.error('JWT VERIFICATION ERROR:', error.message);

        return res.status(401).json({
            success: false,
            error: 'Invalid or expired token.'
        });
    }
};


// =====================================================
// OPTIONAL JWT VERIFICATION (For public routes)
// =====================================================

const optionalVerifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);

        try {
            const decoded = jwt.verify(token, JWT_SECRET);

            const userId =
                decoded.id ??
                decoded.user_id ??
                decoded.userId ??
                null;

            req.user = {
                ...decoded,
                id: userId
            };
        } catch (error) {
            req.user = null;
        }
    } else {
        req.user = null;
    }

    next();
};


// =====================================================
// ROLE CHECK
// =====================================================

const requireRole = (...roles) => {
    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required.'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `Forbidden. Requires one of roles: ${roles.join(', ')}`
            });
        }

        next();
    };
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    verifyToken,
    optionalVerifyToken,
    requireRole,
    JWT_SECRET
};