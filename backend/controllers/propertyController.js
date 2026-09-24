const { query, isPgConnected, fallbackData } = require('../config/db');


// =====================================================
// GET ALL PROPERTIES
// =====================================================

exports.getProperties = async (req, res) => {
    try {
        const {
            category,
            search,
            city,
            district,
            min_price,
            max_price,
            property_type,
            bhk,
            is_featured
        } = req.query;

        const userId = req.user ? req.user.id : null;

        if (isPgConnected()) {

            let sql = `
                SELECT
                    p.*,

                    COALESCE(u.name, 'Property Owner') AS seller_name,
                    COALESCE(u.role, 'seller') AS seller_role,
                    COALESCE(u.phone, '+91 9876543210') AS seller_phone,
                    u.avatar_url AS seller_avatar,

                    (
                        SELECT COALESCE(pm.file_url, pm.media_url)
                        FROM property_media pm
                        WHERE pm.property_id = p.id
                          AND (
                              pm.media_type = 'image'
                              OR pm.media_type IS NULL
                          )
                        ORDER BY pm.id ASC
                        LIMIT 1
                    ) AS cover_image

                    ${
                        userId
                            ? `,
                    EXISTS (
                        SELECT 1
                        FROM favorites f
                        WHERE (
                            f.buyer_id = $1
                            OR f.user_id = $1
                        )
                        AND f.property_id = p.id
                    ) AS is_favorite`
                            : `,
                    FALSE AS is_favorite`
                    }

                FROM properties p

                LEFT JOIN users u
                    ON p.seller_id = u.id

                WHERE 1 = 1
            `;

            const params = userId ? [userId] : [];
            let pIdx = userId ? 2 : 1;


            // CATEGORY
            if (category && category !== 'all') {
                sql += ` AND p.category = $${pIdx++}`;
                params.push(category);
            }


            // CITY
            if (city) {
                sql += ` AND LOWER(p.city) LIKE $${pIdx++}`;
                params.push(`%${city.toLowerCase()}%`);
            }


            // DISTRICT
            if (district) {
                sql += ` AND LOWER(p.district) LIKE $${pIdx++}`;
                params.push(`%${district.toLowerCase()}%`);
            }


            // PROPERTY TYPE
            if (property_type) {
                sql += ` AND p.property_type = $${pIdx++}`;
                params.push(property_type);
            }


            // BHK
            if (bhk && Number(bhk) > 0) {
                sql += ` AND p.bhk = $${pIdx++}`;
                params.push(Number(bhk));
            }


            // MIN PRICE
            if (min_price) {
                sql += ` AND p.price >= $${pIdx++}`;
                params.push(Number(min_price));
            }


            // MAX PRICE
            if (max_price) {
                sql += ` AND p.price <= $${pIdx++}`;
                params.push(Number(max_price));
            }


            // FEATURED
            if (is_featured === 'true') {
                sql += ` AND p.is_featured = TRUE`;
            }


            // SEARCH
            if (search) {
                sql += `
                    AND (
                        LOWER(p.title) LIKE $${pIdx}
                        OR LOWER(p.description) LIKE $${pIdx}
                        OR LOWER(p.city) LIKE $${pIdx}
                    )
                `;

                params.push(`%${search.toLowerCase()}%`);
                pIdx++;
            }


            sql += ` ORDER BY p.id DESC`;


            const result = await query(sql, params);

            return res.json(result.rows);

        } else {

            // =====================================================
            // FALLBACK MODE
            // =====================================================

            let list = fallbackData.properties.map(p => {

                const seller =
                    fallbackData.users.find(
                        u => u.id === p.seller_id
                    ) || {};

                const coverMedia =
                    fallbackData.property_media.find(
                        m =>
                            m.property_id === p.id &&
                            (
                                m.media_type === 'image' ||
                                !m.media_type
                            )
                    );

                const isFavorite = userId
                    ? fallbackData.favorites.some(
                        f =>
                            (
                                f.user_id === userId ||
                                f.buyer_id === userId
                            ) &&
                            f.property_id === p.id
                    )
                    : false;


                return {
                    ...p,

                    seller_name:
                        seller.name ||
                        'Property Connect Agent',

                    seller_role:
                        seller.role ||
                        'broker',

                    seller_phone:
                        seller.phone ||
                        '+91 9876543210',

                    seller_avatar:
                        seller.avatar_url,

                    // NO HARDCODED IMAGE
                    cover_image:
                        coverMedia
                            ? (
                                coverMedia.file_url ||
                                coverMedia.media_url ||
                                null
                            )
                            : null,

                    is_favorite: isFavorite
                };
            });


            if (category && category !== 'all') {
                list = list.filter(
                    p => p.category === category
                );
            }


            if (city) {
                list = list.filter(
                    p =>
                        p.city &&
                        p.city
                            .toLowerCase()
                            .includes(city.toLowerCase())
                );
            }


            if (district) {
                list = list.filter(
                    p =>
                        p.district &&
                        p.district
                            .toLowerCase()
                            .includes(district.toLowerCase())
                );
            }


            if (property_type) {
                list = list.filter(
                    p =>
                        p.property_type === property_type
                );
            }


            if (bhk && Number(bhk) > 0) {
                list = list.filter(
                    p =>
                        Number(p.bhk) === Number(bhk)
                );
            }


            if (min_price) {
                list = list.filter(
                    p =>
                        Number(p.price) >= Number(min_price)
                );
            }


            if (max_price) {
                list = list.filter(
                    p =>
                        Number(p.price) <= Number(max_price)
                );
            }


            if (is_featured === 'true') {
                list = list.filter(
                    p => p.is_featured
                );
            }


            if (search) {

                const q = search.toLowerCase();

                list = list.filter(
                    p =>
                        (p.title || '')
                            .toLowerCase()
                            .includes(q) ||

                        (p.description || '')
                            .toLowerCase()
                            .includes(q) ||

                        (p.city || '')
                            .toLowerCase()
                            .includes(q)
                );
            }


            return res.json(list.reverse());
        }

    } catch (err) {

        console.error(
            'getProperties error:',
            err
        );

        return res.status(500).json({
            error: 'Server error listing properties.'
        });
    }
};


// =====================================================
// GET PROPERTY BY ID
// =====================================================

exports.getPropertyById = async (req, res) => {

    try {

        const { id } = req.params;
        const propId = Number(id);


        if (!Number.isInteger(propId)) {
            return res.status(400).json({
                error: 'Invalid property ID.'
            });
        }


        if (isPgConnected()) {

            const propRes = await query(
                `
                SELECT
                    p.*,

                    u.name AS seller_name,
                    u.role AS seller_role,
                    u.phone AS seller_phone,
                    u.email AS seller_email,
                    u.avatar_url AS seller_avatar

                FROM properties p

                LEFT JOIN users u
                    ON p.seller_id = u.id

                WHERE p.id = $1
                `,
                [propId]
            );


            if (propRes.rows.length === 0) {

                return res.status(404).json({
                    error: 'Property not found'
                });
            }


            const property = propRes.rows[0];


            // Increment views
            try {

                await query(
                    `
                    UPDATE properties
                    SET views_count =
                        COALESCE(views_count, 0) + 1
                    WHERE id = $1
                    `,
                    [propId]
                );

            } catch (viewError) {

                console.log(
                    'views_count update skipped:',
                    viewError.message
                );
            }


            // =====================================================
            // PROPERTY MEDIA
            // =====================================================

            const mediaRes = await query(
                `
                SELECT
                    id,
                    property_id,

                    COALESCE(file_url, media_url) AS file_url,

                    COALESCE(file_url, media_url) AS media_url,

                    media_type

                FROM property_media

                WHERE property_id = $1

                ORDER BY id ASC
                `,
                [propId]
            );


            // =====================================================
            // PROPERTY DOCUMENTS
            // =====================================================

            const docsRes = await query(
                `
                SELECT *
                FROM property_docs
                WHERE property_id = $1
                `,
                [propId]
            );


            // =====================================================
            // AMENITIES
            // =====================================================

            let amenitiesList = [];

            try {

                const amenitiesRes = await query(
                    `
                    SELECT amenity_name
                    FROM property_amenities
                    WHERE property_id = $1
                    `,
                    [propId]
                );

                amenitiesList =
                    amenitiesRes.rows.map(
                        a => a.amenity_name
                    );

            } catch (amenityError) {

                console.log(
                    'Amenities query skipped:',
                    amenityError.message
                );

                amenitiesList = [];
            }


            property.media = mediaRes.rows;

            property.docs = docsRes.rows;

            property.amenities = amenitiesList;


            return res.json(property);

        } else {

            // =====================================================
            // FALLBACK MODE
            // =====================================================

            const property =
                fallbackData.properties.find(
                    p => p.id === propId
                );


            if (!property) {

                return res.status(404).json({
                    error: 'Property not found'
                });
            }


            property.views_count =
                (property.views_count || 0) + 1;


            const seller =
                fallbackData.users.find(
                    u => u.id === property.seller_id
                ) || {};


            const media =
                fallbackData.property_media.filter(
                    m => m.property_id === propId
                );


            const docs =
                fallbackData.property_docs.filter(
                    d => d.property_id === propId
                );


            const amenities =
                fallbackData.property_amenities
                    .filter(
                        a => a.property_id === propId
                    )
                    .map(
                        a => a.amenity_name
                    );


            return res.json({

                ...property,

                seller_name:
                    seller.name ||
                    'Property Connect Agent',

                seller_role:
                    seller.role ||
                    'broker',

                seller_phone:
                    seller.phone ||
                    '+91 9876543210',

                seller_email:
                    seller.email ||
                    'contact@evertree.in',

                seller_avatar:
                    seller.avatar_url,

                media,

                docs,

                amenities
            });
        }

    } catch (err) {

        console.error(
            'getPropertyById error:',
            err
        );

        return res.status(500).json({
            error:
                'Server error fetching property details.'
        });
    }
};


// =====================================================
// CREATE PROPERTY
// =====================================================

exports.createProperty = async (req, res) => {

    try {

        const {
            title,
            description,
            category,
            property_type,
            bhk,
            price,
            city,
            district,
            address,
            latitude,
            longitude,
            amenities,
            is_featured
        } = req.body;


        // =====================================================
        // VALIDATION
        // =====================================================

        if (
            !title ||
            !category ||
            !property_type ||
            !price ||
            !city ||
            !district
        ) {

            return res.status(400).json({
                error:
                    'Title, category, property type, price, city, and district are required.'
            });
        }


        const seller_id = req.user.id;


        // =====================================================
        // LISTING LIMIT
        // =====================================================

        if (isPgConnected()) {

            const listingCount =
                await query(
                    `
                    SELECT COUNT(*)::int AS count
                    FROM properties
                    WHERE seller_id = $1
                    `,
                    [seller_id]
                );


            if (
                listingCount.rows[0].count >= 10
            ) {

                return res.status(403).json({

                    code:
                        'SUBSCRIPTION_REQUIRED',

                    error:
                        'You have reached the free limit of 10 property listings. Please subscribe to post more.'
                });
            }

        } else {

            const listingCount =
                fallbackData.properties.filter(
                    property =>
                        property.seller_id === seller_id
                ).length;


            if (listingCount >= 10) {

                return res.status(403).json({

                    code:
                        'SUBSCRIPTION_REQUIRED',

                    error:
                        'You have reached the free limit of 10 property listings. Please subscribe to post more.'
                });
            }
        }


        // =====================================================
        // AMENITIES
        // =====================================================

        let parsedAmenities = [];

        try {

            parsedAmenities =
                Array.isArray(amenities)
                    ? amenities
                    : (
                        amenities
                            ? JSON.parse(amenities)
                            : []
                    );

        } catch (amenityParseError) {

            parsedAmenities = [];
        }


        // =====================================================
        // UPLOADED FILES
        // =====================================================

        const uploadedFiles =
            req.files || [];

        const mediaItems = [];
        const docItems = [];


        uploadedFiles.forEach(file => {

            // IMPORTANT:
            // This is the exact URL stored in PostgreSQL.
            const fileUrl =
                `/uploads/properties/${file.filename}`;


            console.log(
                'PROPERTY FILE:',
                {
                    originalName:
                        file.originalname,

                    filename:
                        file.filename,

                    path:
                        file.path,

                    fileUrl
                }
            );


            if (
                file.mimetype.includes('pdf') ||
                file.mimetype.includes('doc')
            ) {

                docItems.push({

                    file_url:
                        fileUrl,

                    title:
                        file.originalname
                });

            } else if (
                file.mimetype.includes('video')
            ) {

                mediaItems.push({

                    file_url:
                        fileUrl,

                    media_type:
                        'video'
                });

            } else {

                mediaItems.push({

                    file_url:
                        fileUrl,

                    media_type:
                        'image'
                });
            }
        });


        // =====================================================
        // IMAGE REQUIRED
        // =====================================================

        if (mediaItems.length === 0) {

            return res.status(400).json({

                error:
                    'Please upload at least one property image.'
            });
        }


        // =====================================================
        // POSTGRESQL
        // =====================================================

        if (isPgConnected()) {


            // =================================================
            // CREATE PROPERTY
            // =================================================

            const propRes =
                await query(
                    `
                    INSERT INTO properties
                    (
                        title,
                        description,
                        category,
                        property_type,
                        bhk,
                        price,
                        city,
                        district,
                        address,
                        latitude,
                        longitude,
                        seller_id,
                        is_featured
                    )

                    VALUES
                    (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5,
                        $6,
                        $7,
                        $8,
                        $9,
                        $10,
                        $11,
                        $12,
                        $13
                    )

                    RETURNING *
                    `,
                    [
                        title,

                        description || '',

                        category,

                        property_type,

                        Number(bhk) || 0,

                        Number(price),

                        city,

                        district,

                        address || '',

                        Number(latitude) ||
                            12.9716,

                        Number(longitude) ||
                            77.5946,

                        seller_id,

                        is_featured === 'true' ||
                        is_featured === true
                    ]
                );


            const newProperty =
                propRes.rows[0];


            // =================================================
            // INSERT PROPERTY MEDIA
            // =================================================

            for (
                const item of mediaItems
            ) {

                console.log(
                    'SAVING PROPERTY MEDIA:',
                    {
                        property_id:
                            newProperty.id,

                        file_url:
                            item.file_url,

                        media_type:
                            item.media_type
                    }
                );


                /*
                 * IMPORTANT:
                 *
                 * file_url  = /uploads/properties/xxx.jpg
                 * media_url = /uploads/properties/xxx.jpg
                 *
                 * Both are saved.
                 */

                await query(
                    `
                    INSERT INTO property_media
                    (
                        property_id,
                        file_url,
                        media_url,
                        media_type
                    )

                    VALUES
                    (
                        $1,
                        $2,
                        $3,
                        $4
                    )
                    `,
                    [
                        newProperty.id,

                        item.file_url,
                        
                        item.file_url,

                        item.media_type
                    ]
                );
            }


            // =================================================
            // INSERT DOCUMENTS
            // =================================================

            for (
                const item of docItems
            ) {

                await query(
                    `
                    INSERT INTO property_docs
                    (
                        property_id,
                        file_url,
                        title
                    )

                    VALUES
                    (
                        $1,
                        $2,
                        $3
                    )
                    `,
                    [
                        newProperty.id,

                        item.file_url,

                        item.title
                    ]
                );
            }


            // =================================================
            // INSERT AMENITIES
            // =================================================

            for (
                const amenity of parsedAmenities
            ) {

                try {

                    await query(
                        `
                        INSERT INTO property_amenities
                        (
                            property_id,
                            amenity_name
                        )

                        VALUES
                        (
                            $1,
                            $2
                        )
                        `,
                        [
                            newProperty.id,
                            amenity
                        ]
                    );

                } catch (amenityError) {

                    console.log(
                        'Amenity insert skipped:',
                        amenityError.message
                    );
                }
            }


            // =================================================
            // RETURN CREATED PROPERTY + MEDIA
            // =================================================

            const savedMedia =
                await query(
                    `
                    SELECT
                        id,
                        property_id,
                        COALESCE(file_url, media_url) AS file_url,
                        COALESCE(file_url, media_url) AS media_url,
                        media_type

                    FROM property_media

                    WHERE property_id = $1

                    ORDER BY id ASC
                    `,
                    [newProperty.id]
                );


            return res.status(201).json({

                message:
                    'Property created successfully',

                property:
                    newProperty,

                media:
                    savedMedia.rows
            });


        } else {

            // =================================================
            // FALLBACK MODE
            // =================================================

            const newId =
                fallbackData.properties.length + 1;


            const newProperty = {

                id: newId,

                title,

                description:
                    description || '',

                category,

                property_type,

                bhk:
                    Number(bhk) || 0,

                price:
                    Number(price),

                city,

                district,

                address:
                    address || '',

                latitude:
                    Number(latitude) ||
                    12.9716,

                longitude:
                    Number(longitude) ||
                    77.5946,

                seller_id,

                is_featured:
                    is_featured === 'true' ||
                    is_featured === true,

                views_count:
                    0,

                created_at:
                    new Date()
            };


            fallbackData.properties.push(
                newProperty
            );


            mediaItems.forEach(
                m => {

                    fallbackData.property_media.push({

                        id:
                            fallbackData
                                .property_media
                                .length + 1,

                        property_id:
                            newId,

                        ...m
                    });
                }
            );


            docItems.forEach(
                d => {

                    fallbackData.property_docs.push({

                        id:
                            fallbackData
                                .property_docs
                                .length + 1,

                        property_id:
                            newId,

                        ...d
                    });
                }
            );


            parsedAmenities.forEach(
                a => {

                    fallbackData.property_amenities.push({

                        id:
                            fallbackData
                                .property_amenities
                                .length + 1,

                        property_id:
                            newId,

                        amenity_name:
                            a
                    });
                }
            );


            return res.status(201).json({

                message:
                    'Property created successfully',

                property:
                    newProperty,

                media:
                    mediaItems
            });
        }

    } catch (err) {

        console.error(
            '================ CREATE PROPERTY ERROR ================'
        );

        console.error(err);

        console.error(
            '========================================================='
        );


        return res.status(500).json({

            error:
                'Server error creating property.',

            message:
                err.message,

            detail:
                err.detail || null,

            code:
                err.code || null
        });
    }
};


// =====================================================
// GET USER PROPERTIES
// =====================================================

exports.getUserProperties = async (req, res) => {

    try {

        const userId =
            req.user.id;


        if (isPgConnected()) {

            const result =
                await query(
                    `
                    SELECT
                        p.*,

                        (
                            SELECT
                                COALESCE(
                                    pm.file_url,
                                    pm.media_url
                                )

                            FROM property_media pm

                            WHERE pm.property_id = p.id

                            AND (
                                pm.media_type = 'image'
                                OR pm.media_type IS NULL
                            )

                            ORDER BY pm.id ASC

                            LIMIT 1

                        ) AS cover_image

                    FROM properties p

                    WHERE p.seller_id = $1

                    ORDER BY p.id DESC
                    `,
                    [userId]
                );


            return res.json(
                result.rows
            );

        } else {

            const userProps =
                fallbackData.properties

                    .filter(
                        p =>
                            p.seller_id === userId
                    )

                    .map(p => {

                        const cover =
                            fallbackData
                                .property_media
                                .find(
                                    m =>
                                        m.property_id === p.id &&
                                        (
                                            m.media_type === 'image' ||
                                            !m.media_type
                                        )
                                );


                        return {

                            ...p,

                            cover_image:
                                cover
                                    ? (
                                        cover.file_url ||
                                        cover.media_url ||
                                        null
                                    )
                                    : null
                        };
                    });


            return res.json(
                userProps.reverse()
            );
        }

    } catch (err) {

        console.error(
            'getUserProperties error:',
            err
        );

        return res.status(500).json({

            error:
                'Server error loading dashboard properties.'
        });
    }
};


// =====================================================
// TOGGLE FAVORITE
// =====================================================

exports.toggleFavorite = async (req, res) => {

    try {

        const userId =
            Number(req.user?.id);

        const propertyId =
            Number(req.body?.property_id);


        if (!userId || isNaN(userId)) {

            return res.status(401).json({

                error:
                    'Authentication required.'
            });
        }


        if (!propertyId || isNaN(propertyId)) {

            return res.status(400).json({

                error:
                    'Valid property_id is required.'
            });
        }


        if (isPgConnected()) {

            const check =
                await query(
                    `
                    SELECT id
                    FROM favorites

                    WHERE (
                        buyer_id = $1
                        OR user_id = $2
                    )

                    AND property_id = $3
                    `,
                    [
                        userId,
                        userId,
                        propertyId
                    ]
                );


            if (check.rows.length > 0) {

                await query(
                    `
                    DELETE FROM favorites

                    WHERE (
                        buyer_id = $1
                        OR user_id = $2
                    )

                    AND property_id = $3
                    `,
                    [
                        userId,
                        userId,
                        propertyId
                    ]
                );


                return res.json({

                    favorited: false,

                    message:
                        'Removed from favorites'
                });
            }


            await query(
                `
                INSERT INTO favorites
                (
                    buyer_id,
                    user_id,
                    property_id
                )

                VALUES
                (
                    $1,
                    $2,
                    $3
                )
                `,
                [
                    userId,
                    userId,
                    propertyId
                ]
            );


            return res.json({

                favorited: true,

                message:
                    'Added to favorites'
            });

        } else {

            const idx =
                fallbackData.favorites.findIndex(
                    f =>
                        (
                            f.user_id === userId ||
                            f.buyer_id === userId
                        ) &&
                        f.property_id === propertyId
                );


            if (idx >= 0) {

                fallbackData.favorites.splice(
                    idx,
                    1
                );


                return res.json({

                    favorited: false,

                    message:
                        'Removed from favorites'
                });
            }


            fallbackData.favorites.push({

                id:
                    fallbackData.favorites.length + 1,

                user_id:
                    userId,

                buyer_id:
                    userId,

                property_id:
                    propertyId,

                created_at:
                    new Date()
            });


            return res.json({

                favorited: true,

                message:
                    'Added to favorites'
            });
        }

    } catch (err) {

        console.error(
            'toggleFavorite error:',
            err
        );

        return res.status(500).json({

            error:
                'Error toggling favorite status.'
        });
    }
};


// =====================================================
// GET FAVORITES
// =====================================================

exports.getFavorites = async (req, res) => {

    try {

        const userId =
            Number(req.user?.id);


        if (!userId || isNaN(userId)) {

            return res.status(401).json({

                error:
                    'Authentication required.'
            });
        }


        if (isPgConnected()) {

            const result =
                await query(
                    `
                    SELECT
                        p.*,

                        TRUE AS is_favorite,

                        (
                            SELECT
                                COALESCE(
                                    pm.file_url,
                                    pm.media_url
                                )

                            FROM property_media pm

                            WHERE pm.property_id = p.id

                            AND (
                                pm.media_type = 'image'
                                OR pm.media_type IS NULL
                            )

                            ORDER BY pm.id ASC

                            LIMIT 1

                        ) AS cover_image

                    FROM favorites f

                    JOIN properties p
                        ON f.property_id = p.id

                    WHERE (
                        f.buyer_id = $1
                        OR f.user_id = $2
                    )

                    ORDER BY f.id DESC
                    `,
                    [
                        userId,
                        userId
                    ]
                );


            return res.json(
                result.rows
            );

        } else {

            const favPropIds =
                fallbackData.favorites

                    .filter(
                        f =>
                            f.user_id === userId ||
                            f.buyer_id === userId
                    )

                    .map(
                        f =>
                            f.property_id
                    );


            const favProps =
                fallbackData.properties

                    .filter(
                        p =>
                            favPropIds.includes(p.id)
                    )

                    .map(p => {

                        const cover =
                            fallbackData
                                .property_media
                                .find(
                                    m =>
                                        m.property_id === p.id &&
                                        (
                                            m.media_type === 'image' ||
                                            !m.media_type
                                        )
                                );


                        return {

                            ...p,

                            is_favorite:
                                true,

                            cover_image:
                                cover
                                    ? (
                                        cover.file_url ||
                                        cover.media_url ||
                                        null
                                    )
                                    : null
                        };
                    });


            return res.json(
                favProps
            );
        }

    } catch (err) {

        console.error(
            'getFavorites error:',
            err
        );

        return res.status(500).json({

            error:
                'Error loading favorites.'
        });
    }
};


// =====================================================
// CREATE ENQUIRY
// =====================================================

exports.createEnquiry = async (req, res) => {

    try {

        const buyer_id =
            req.user.id;

        const {
            property_id,
            message
        } = req.body;


        if (!property_id || !message) {

            return res.status(400).json({

                error:
                    'Property ID and message are required.'
            });
        }


        if (isPgConnected()) {

            const result =
                await query(
                    `
                    INSERT INTO enquiries
                    (
                        property_id,
                        buyer_id,
                        message
                    )

                    VALUES
                    (
                        $1,
                        $2,
                        $3
                    )

                    RETURNING *
                    `,
                    [
                        property_id,
                        buyer_id,
                        message
                    ]
                );


            return res.status(201).json({

                message:
                    'Enquiry sent to seller!',

                enquiry:
                    result.rows[0]
            });

        } else {

            const newEnquiry = {

                id:
                    fallbackData.enquiries.length + 1,

                property_id:
                    Number(property_id),

                buyer_id,

                message,

                status:
                    'pending',

                created_at:
                    new Date()
            };


            fallbackData.enquiries.push(
                newEnquiry
            );


            return res.status(201).json({

                message:
                    'Enquiry sent to seller!',

                enquiry:
                    newEnquiry
            });
        }

    } catch (err) {

        console.error(
            'createEnquiry error:',
            err
        );

        return res.status(500).json({

            error:
                'Failed to send enquiry.'
        });
    }
};


// =====================================================
// GET ENQUIRIES
// =====================================================

exports.getEnquiries = async (req, res) => {

    try {

        const userId =
            req.user.id;


        if (isPgConnected()) {

            const result =
                await query(
                    `
                    SELECT
                        e.*,

                        p.title AS property_title,

                        u.name AS buyer_name,

                        u.phone AS buyer_phone,

                        u.email AS buyer_email

                    FROM enquiries e

                    JOIN properties p
                        ON e.property_id = p.id

                    JOIN users u
                        ON e.buyer_id = u.id

                    WHERE
                        p.seller_id = $1
                        OR e.buyer_id = $1

                    ORDER BY e.id DESC
                    `,
                    [userId]
                );


            return res.json(
                result.rows
            );

        } else {

            const enqs =
                fallbackData.enquiries

                    .filter(e => {

                        const prop =
                            fallbackData.properties.find(
                                p =>
                                    p.id === e.property_id
                            );


                        return (
                            (
                                prop &&
                                prop.seller_id === userId
                            ) ||
                            e.buyer_id === userId
                        );
                    })

                    .map(e => {

                        const prop =
                            fallbackData.properties.find(
                                p =>
                                    p.id === e.property_id
                            ) || {};


                        const buyer =
                            fallbackData.users.find(
                                u =>
                                    u.id === e.buyer_id
                            ) || {};


                        return {

                            ...e,

                            property_title:
                                prop.title ||
                                'Property',

                            buyer_name:
                                buyer.name ||
                                'Buyer',

                            buyer_phone:
                                buyer.phone ||
                                '',

                            buyer_email:
                                buyer.email ||
                                ''
                        };
                    });


            return res.json(
                enqs
            );
        }

    } catch (err) {

        console.error(
            'getEnquiries error:',
            err
        );

        return res.status(500).json({

            error:
                'Failed to fetch enquiries.'
        });
    }
};


// =====================================================
// DELETE USER PROPERTY
// =====================================================

exports.deleteProperty = async (req, res) => {

    try {

        const userId =
            Number(req.user?.id);

        const propertyId =
            Number(req.params.id);


        console.log(
            'DELETE PROPERTY REQUEST:',
            {
                userId,
                propertyId,
                role: req.user?.role
            }
        );


        if (
            !Number.isInteger(userId) ||
            !Number.isInteger(propertyId)
        ) {

            return res.status(400).json({

                error:
                    'Invalid user ID or property ID.'
            });
        }


        // =================================================
        // CHECK PROPERTY
        // =================================================

        const propertyResult =
            await query(
                `
                SELECT
                    id,
                    seller_id

                FROM properties

                WHERE id = $1
                `,
                [propertyId]
            );


        console.log(
            'PROPERTY FOUND:',
            propertyResult.rows
        );


        if (
            propertyResult.rows.length === 0
        ) {

            return res.status(404).json({

                error:
                    'Property not found.'
            });
        }


        const property =
            propertyResult.rows[0];


        const sellerId =
            Number(property.seller_id);


        console.log(
            'OWNERSHIP CHECK:',
            {
                sellerId,
                loggedInUserId:
                    userId
            }
        );


        // =================================================
        // CHECK OWNERSHIP
        // =================================================

        if (sellerId !== userId) {

            return res.status(403).json({

                error:
                    'You are not authorized to delete this property.'
            });
        }


        // =================================================
        // DELETE MEDIA
        // =================================================

        await query(
            `
            DELETE FROM property_media
            WHERE property_id = $1
            `,
            [propertyId]
        );


        // =================================================
        // DELETE DOCUMENTS
        // =================================================

        await query(
            `
            DELETE FROM property_docs
            WHERE property_id = $1
            `,
            [propertyId]
        );


        // =================================================
        // DELETE AMENITIES
        // =================================================

        await query(
            `
            DELETE FROM property_amenities
            WHERE property_id = $1
            `,
            [propertyId]
        );


        // =================================================
        // DELETE FAVORITES
        // =================================================

        await query(
            `
            DELETE FROM favorites
            WHERE property_id = $1
            `,
            [propertyId]
        );


        // =================================================
        // DELETE ENQUIRIES
        // =================================================

        await query(
            `
            DELETE FROM enquiries
            WHERE property_id = $1
            `,
            [propertyId]
        );


        // =================================================
        // DELETE CART ITEMS
        // =================================================

        try {

            await query(
                `
                DELETE FROM cart_items
                WHERE property_id = $1
                `,
                [propertyId]
            );

        } catch (cartError) {

            console.log(
                'cart_items delete skipped:',
                cartError.message
            );
        }


        // =================================================
        // DELETE PROPERTY
        // =================================================

        const deleteResult =
            await query(
                `
                DELETE FROM properties

                WHERE id = $1
                  AND seller_id = $2

                RETURNING id
                `,
                [
                    propertyId,
                    userId
                ]
            );


        console.log(
            'DELETE RESULT:',
            deleteResult.rows
        );


        if (
            deleteResult.rows.length === 0
        ) {

            return res.status(404).json({

                error:
                    'Property was not deleted.'
            });
        }


        return res.status(200).json({

            success:
                true,

            message:
                'Property deleted successfully.',

            property_id:
                deleteResult.rows[0].id
        });


    } catch (error) {

        console.error(
            '================ DELETE PROPERTY ERROR ================'
        );

        console.error(error);

        console.error(
            '========================================================'
        );


        return res.status(500).json({

            error:
                'Failed to delete property.',

            message:
                error.message,

            detail:
                error.detail || null,

            code:
                error.code || null
        });
    }
};