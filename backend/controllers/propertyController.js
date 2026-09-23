const { query, isPgConnected, fallbackData } = require('../config/db');

exports.getProperties = async (req, res) => {
    try {
        const { category, search, city, district, min_price, max_price, property_type, bhk, is_featured } = req.query;
        const userId = req.user ? req.user.id : null;

        if (isPgConnected()) {
            let sql = `
                SELECT p.*, 
                       COALESCE(u.name, 'Property Owner') as seller_name, 
                       COALESCE(u.role, 'seller') as seller_role, 
                       COALESCE(u.phone, '+91 9876543210') as seller_phone, 
                       u.avatar_url as seller_avatar,
                       COALESCE((SELECT COALESCE(media_url, file_url) FROM property_media WHERE property_id = p.id AND (media_type = 'image' OR media_type IS NULL) LIMIT 1), 'https://images.unsplash.com/photo-1560518883-ce09059eeffa') as cover_image
                       ${userId ? `, EXISTS(SELECT 1 FROM favorites WHERE (buyer_id = $1 OR user_id = $1) AND property_id = p.id) as is_favorite` : ', FALSE as is_favorite'}
                FROM properties p
                LEFT JOIN users u ON p.seller_id = u.id
                WHERE 1=1
            `;
            const params = userId ? [userId] : [];
            let pIdx = userId ? 2 : 1;

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
            if (is_featured === 'true') {
                sql += ` AND p.is_featured = TRUE`;
            }
            if (search) {
                sql += ` AND (LOWER(p.title) LIKE $${pIdx} OR LOWER(p.description) LIKE $${pIdx} OR LOWER(p.city) LIKE $${pIdx})`;
                params.push(`%${search.toLowerCase()}%`);
                pIdx++;
            }

            sql += ` ORDER BY p.id DESC`;
            const result = await query(sql, params);
            return res.json(result.rows);
        } else {
            // Fallback filtering logic
            let list = fallbackData.properties.map(p => {
                const seller = fallbackData.users.find(u => u.id === p.seller_id) || {};
                const coverMedia = fallbackData.property_media.find(m => m.property_id === p.id && m.media_type === 'image');
                const isFavorite = userId ? fallbackData.favorites.some(f => (f.user_id === userId || f.buyer_id === userId) && f.property_id === p.id) : false;
                return {
                    ...p,
                    seller_name: seller.name || 'Property Connect Agent',
                    seller_role: seller.role || 'broker',
                    seller_phone: seller.phone || '+91 9876543210',
                    seller_avatar: seller.avatar_url,
                    cover_image: coverMedia ? (coverMedia.file_url || coverMedia.media_url) : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa',
                    is_favorite: isFavorite
                };
            });

            if (category && category !== 'all') {
                list = list.filter(p => p.category === category);
            }
            if (city) {
                list = list.filter(p => p.city.toLowerCase().includes(city.toLowerCase()));
            }
            if (district) {
                list = list.filter(p => p.district.toLowerCase().includes(district.toLowerCase()));
            }
            if (property_type) {
                list = list.filter(p => p.property_type === property_type);
            }
            if (bhk && Number(bhk) > 0) {
                list = list.filter(p => Number(p.bhk) === Number(bhk));
            }
            if (min_price) {
                list = list.filter(p => Number(p.price) >= Number(min_price));
            }
            if (max_price) {
                list = list.filter(p => Number(p.price) <= Number(max_price));
            }
            if (is_featured === 'true') {
                list = list.filter(p => p.is_featured);
            }
            if (search) {
                const q = search.toLowerCase();
                list = list.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.city.toLowerCase().includes(q));
            }

            return res.json(list.reverse());
        }
    } catch (err) {
        console.error('getProperties error:', err);
        res.status(500).json({ error: 'Server error listing properties.' });
    }
};

exports.getPropertyById = async (req, res) => {
    try {
        const { id } = req.params;
        const propId = Number(id);

        if (isPgConnected()) {
            const propRes = await query(
                `SELECT p.*, u.name as seller_name, u.role as seller_role, u.phone as seller_phone, u.email as seller_email, u.avatar_url as seller_avatar
                 FROM properties p LEFT JOIN users u ON p.seller_id = u.id WHERE p.id = $1`,
                [propId]
            );
            if (propRes.rows.length === 0) return res.status(404).json({ error: 'Property not found' });

            const property = propRes.rows[0];

            // increment views safely
            try {
                await query('UPDATE properties SET views_count = COALESCE(views_count, 0) + 1 WHERE id = $1', [propId]);
            } catch (vErr) {
                // ignore error if views_count column unavailable
            }

            const mediaRes = await query('SELECT id, property_id, COALESCE(media_url, file_url) as file_url, COALESCE(media_url, file_url) as media_url, media_type FROM property_media WHERE property_id = $1', [propId]);
            const docsRes = await query('SELECT * FROM property_docs WHERE property_id = $1', [propId]);
            let amenitiesList = [];
            try {
                const amenitiesRes = await query('SELECT amenity_name FROM property_amenities WHERE property_id = $1', [propId]);
                amenitiesList = amenitiesRes.rows.map(a => a.amenity_name);
            } catch (aErr) {
                amenitiesList = [];
            }

            property.media = mediaRes.rows;
            property.docs = docsRes.rows;
            property.amenities = amenitiesList;

            return res.json(property);
        } else {
            const property = fallbackData.properties.find(p => p.id === propId);
            if (!property) return res.status(404).json({ error: 'Property not found' });

            property.views_count = (property.views_count || 0) + 1;

            const seller = fallbackData.users.find(u => u.id === property.seller_id) || {};
            const media = fallbackData.property_media.filter(m => m.property_id === propId);
            const docs = fallbackData.property_docs.filter(d => d.property_id === propId);
            const amenities = fallbackData.property_amenities.filter(a => a.property_id === propId).map(a => a.amenity_name);

            return res.json({
                ...property,
                seller_name: seller.name || 'Property Connect Agent',
                seller_role: seller.role || 'broker',
                seller_phone: seller.phone || '+91 9876543210',
                seller_email: seller.email || 'contact@evertree.in',
                seller_avatar: seller.avatar_url,
                media,
                docs,
                amenities
            });
        }
    } catch (err) {
        console.error('getPropertyById error:', err);
        res.status(500).json({ error: 'Server error fetching property details.' });
    }
};

exports.createProperty = async (req, res) => {
    try {
        const { title, description, category, property_type, bhk, price, city, district, address, latitude, longitude, amenities, is_featured } = req.body;

        if (!title || !category || !property_type || !price || !city || !district) {
            return res.status(400).json({ error: 'Title, category, property type, price, city, and district are required.' });
        }

        const seller_id = req.user.id;

        if (isPgConnected()) {
            const listingCount = await query(
                'SELECT COUNT(*)::int AS count FROM properties WHERE seller_id = $1',
                [seller_id]
            );

            if (listingCount.rows[0].count >= 10) {
                return res.status(403).json({
                    code: 'SUBSCRIPTION_REQUIRED',
                    error: 'You have reached the free limit of 10 property listings. Please subscribe to post more.'
                });
            }
        } else {
            const listingCount = fallbackData.properties.filter(property => property.seller_id === seller_id).length;

            if (listingCount >= 10) {
                return res.status(403).json({
                    code: 'SUBSCRIPTION_REQUIRED',
                    error: 'You have reached the free limit of 10 property listings. Please subscribe to post more.'
                });
            }
        }

        const parsedAmenities = Array.isArray(amenities) ? amenities : (amenities ? JSON.parse(amenities) : []);

        // Uploaded files processing
        const uploadedFiles = req.files || [];
        const mediaItems = [];
        const docItems = [];

        uploadedFiles.forEach(file => {
            const fileUrl = `/uploads/${file.filename}`;
            if (file.mimetype.includes('pdf') || file.mimetype.includes('doc')) {
                docItems.push({ file_url: fileUrl, title: file.originalname });
            } else if (file.mimetype.includes('video')) {
                mediaItems.push({ file_url: fileUrl, media_type: 'video' });
            } else {
                mediaItems.push({ file_url: fileUrl, media_type: 'image' });
            }
        });

        // Add fallback image if none provided
        if (mediaItems.length === 0) {
            mediaItems.push({ file_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c', media_type: 'image' });
        }

        if (isPgConnected()) {
            const propRes = await query(
                `INSERT INTO properties 
                 (title, description, category, property_type, bhk, price, city, district, address, latitude, longitude, seller_id, is_featured)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                 RETURNING *`,
                [
                    title, description || '', category, property_type, Number(bhk) || 0, Number(price),
                    city, district, address || '', Number(latitude) || 12.9716, Number(longitude) || 77.5946,
                    seller_id, is_featured === 'true' || is_featured === true
                ]
            );

            const newProperty = propRes.rows[0];

            // Insert media — use file_url as the primary column (matches schema.sql),
            // then mirror it into media_url for backward compatibility.
            for (const item of mediaItems) {
                try {
                    await query(
                        'INSERT INTO property_media (property_id, file_url, media_type) VALUES ($1, $2, $3)',
                        [newProperty.id, item.file_url, item.media_type]
                    );
                    // Mirror file_url into media_url if the column exists
                    try {
                        await query(
                            'UPDATE property_media SET media_url = file_url WHERE property_id = $1 AND media_url IS NULL',
                            [newProperty.id]
                        );
                    } catch (_mirrorErr) {
                        // media_url column may not exist yet — safe to ignore
                    }
                } catch (mediaErr) {
                    console.error('Error inserting property media:', mediaErr.message);
                }
            }
            // Insert docs
            for (const item of docItems) {
                await query('INSERT INTO property_docs (property_id, file_url, title) VALUES ($1, $2, $3)', [newProperty.id, item.file_url, item.title]);
            }
            // Insert amenities
            for (const amenity of parsedAmenities) {
                try {
                    await query('INSERT INTO property_amenities (property_id, amenity_name) VALUES ($1, $2)', [newProperty.id, amenity]);
                } catch (aErr) {
                    // Ignore if schema differs
                }
            }

            return res.status(201).json({ message: 'Property created successfully', property: newProperty });
        } else {
            // Fallback mode
            const newId = fallbackData.properties.length + 1;
            const newProperty = {
                id: newId,
                title,
                description: description || '',
                category,
                property_type,
                bhk: Number(bhk) || 0,
                price: Number(price),
                city,
                district,
                address: address || '',
                latitude: Number(latitude) || 12.9716,
                longitude: Number(longitude) || 77.5946,
                seller_id,
                is_featured: is_featured === 'true' || is_featured === true,
                views_count: 0,
                created_at: new Date()
            };
            fallbackData.properties.push(newProperty);

            mediaItems.forEach((m, idx) => fallbackData.property_media.push({ id: fallbackData.property_media.length + 1, property_id: newId, ...m }));
            docItems.forEach((d, idx) => fallbackData.property_docs.push({ id: fallbackData.property_docs.length + 1, property_id: newId, ...d }));
            parsedAmenities.forEach(a => fallbackData.property_amenities.push({ id: fallbackData.property_amenities.length + 1, property_id: newId, amenity_name: a }));

            return res.status(201).json({ message: 'Property created successfully', property: newProperty });
        }
    } catch (err) {
        console.error('createProperty error:', err.message, err.stack);
        res.status(500).json({ error: 'Server error creating property: ' + err.message });
    }
};

exports.getUserProperties = async (req, res) => {
    try {
        const userId = req.user.id;
        if (isPgConnected()) {
            const result = await query(
                `SELECT p.*, COALESCE((SELECT COALESCE(media_url, file_url) FROM property_media WHERE property_id = p.id AND (media_type = 'image' OR media_type IS NULL) LIMIT 1), 'https://images.unsplash.com/photo-1560518883-ce09059eeffa') as cover_image
                 FROM properties p WHERE p.seller_id = $1 ORDER BY p.id DESC`,
                [userId]
            );
            return res.json(result.rows);
        } else {
            const userProps = fallbackData.properties.filter(p => p.seller_id === userId).map(p => {
                const cover = fallbackData.property_media.find(m => m.property_id === p.id && m.media_type === 'image');
                return { ...p, cover_image: cover ? (cover.file_url || cover.media_url) : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa' };
            });
            return res.json(userProps.reverse());
        }
    } catch (err) {
        console.error('getUserProperties error:', err);
        res.status(500).json({ error: 'Server error loading dashboard properties.' });
    }
};

exports.toggleFavorite = async (req, res) => {
    try {
        const userId = Number(req.user?.id);
        const propertyId = Number(req.body?.property_id);

        if (!userId || isNaN(userId)) {
            return res.status(401).json({ error: 'Authentication required.' });
        }
        if (!propertyId || isNaN(propertyId)) {
            return res.status(400).json({ error: 'Valid property_id is required.' });
        }

        if (isPgConnected()) {
            const check = await query(
                'SELECT id FROM favorites WHERE (buyer_id = $1 OR user_id = $2) AND property_id = $3',
                [userId, userId, propertyId]
            );
            if (check.rows.length > 0) {
                await query(
                    'DELETE FROM favorites WHERE (buyer_id = $1 OR user_id = $2) AND property_id = $3',
                    [userId, userId, propertyId]
                );
                return res.json({ favorited: false, message: 'Removed from favorites' });
            } else {
                await query(
                    'INSERT INTO favorites (buyer_id, user_id, property_id) VALUES ($1, $2, $3)',
                    [userId, userId, propertyId]
                );
                return res.json({ favorited: true, message: 'Added to favorites' });
            }
        } else {
            const idx = fallbackData.favorites.findIndex(f => (f.user_id === userId || f.buyer_id === userId) && f.property_id === propertyId);
            if (idx >= 0) {
                fallbackData.favorites.splice(idx, 1);
                return res.json({ favorited: false, message: 'Removed from favorites' });
            } else {
                fallbackData.favorites.push({ id: fallbackData.favorites.length + 1, user_id: userId, buyer_id: userId, property_id: propertyId, created_at: new Date() });
                return res.json({ favorited: true, message: 'Added to favorites' });
            }
        }
    } catch (err) {
        console.error('toggleFavorite error:', err);
        res.status(500).json({ error: 'Error toggling favorite status.' });
    }
};

exports.getFavorites = async (req, res) => {
    try {
        const userId = Number(req.user?.id);
        if (!userId || isNaN(userId)) {
            return res.status(401).json({ error: 'Authentication required.' });
        }

        if (isPgConnected()) {
            const result = await query(
                `SELECT p.*, TRUE as is_favorite, COALESCE((SELECT COALESCE(media_url, file_url) FROM property_media WHERE property_id = p.id AND (media_type = 'image' OR media_type IS NULL) LIMIT 1), 'https://images.unsplash.com/photo-1560518883-ce09059eeffa') as cover_image
                 FROM favorites f JOIN properties p ON f.property_id = p.id WHERE (f.buyer_id = $1 OR f.user_id = $2) ORDER BY f.id DESC`,
                [userId, userId]
            );
            return res.json(result.rows);
        } else {
            const favPropIds = fallbackData.favorites.filter(f => f.user_id === userId || f.buyer_id === userId).map(f => f.property_id);
            const favProps = fallbackData.properties.filter(p => favPropIds.includes(p.id)).map(p => {
                const cover = fallbackData.property_media.find(m => m.property_id === p.id && m.media_type === 'image');
                return { ...p, is_favorite: true, cover_image: cover ? (cover.file_url || cover.media_url) : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa' };
            });
            return res.json(favProps);
        }
    } catch (err) {
        console.error('getFavorites error:', err);
        res.status(500).json({ error: 'Error loading favorites.' });
    }
};

exports.createEnquiry = async (req, res) => {
    try {
        const buyer_id = req.user.id;
        const { property_id, message } = req.body;

        if (!property_id || !message) {
            return res.status(400).json({ error: 'Property ID and message are required.' });
        }

        if (isPgConnected()) {
            const result = await query(
                'INSERT INTO enquiries (property_id, buyer_id, message) VALUES ($1, $2, $3) RETURNING *',
                [property_id, buyer_id, message]
            );
            return res.status(201).json({ message: 'Enquiry sent to seller!', enquiry: result.rows[0] });
        } else {
            const newEnquiry = { id: fallbackData.enquiries.length + 1, property_id: Number(property_id), buyer_id, message, status: 'pending', created_at: new Date() };
            fallbackData.enquiries.push(newEnquiry);
            return res.status(201).json({ message: 'Enquiry sent to seller!', enquiry: newEnquiry });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to send enquiry.' });
    }
};

exports.getEnquiries = async (req, res) => {
    try {
        const userId = req.user.id;
        if (isPgConnected()) {
            const result = await query(
                `SELECT e.*, p.title as property_title, u.name as buyer_name, u.phone as buyer_phone, u.email as buyer_email
                 FROM enquiries e 
                 JOIN properties p ON e.property_id = p.id
                 JOIN users u ON e.buyer_id = u.id
                 WHERE p.seller_id = $1 OR e.buyer_id = $1 ORDER BY e.id DESC`,
                [userId]
            );
            return res.json(result.rows);
        } else {
            const enqs = fallbackData.enquiries.filter(e => {
                const prop = fallbackData.properties.find(p => p.id === e.property_id);
                return (prop && prop.seller_id === userId) || e.buyer_id === userId;
            }).map(e => {
                const prop = fallbackData.properties.find(p => p.id === e.property_id) || {};
                const buyer = fallbackData.users.find(u => u.id === e.buyer_id) || {};
                return {
                    ...e,
                    property_title: prop.title || 'Property',
                    buyer_name: buyer.name || 'Buyer',
                    buyer_phone: buyer.phone || '',
                    buyer_email: buyer.email || ''
                };
            });
            return res.json(enqs);
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch enquiries.' });
    }
};
