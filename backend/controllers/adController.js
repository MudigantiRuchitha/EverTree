const { query } = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads/ads directory exists
const adsUploadDir = path.join(__dirname, '..', 'uploads', 'ads');
if (!fs.existsSync(adsUploadDir)) {
    fs.mkdirSync(adsUploadDir, { recursive: true });
}

// Multer storage for ad photos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, adsUploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `ad-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, filename);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (JPEG, PNG, WEBP, GIF) are allowed.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 15 * 1024 * 1024 } // 15MB
});

// Middleware for single photo upload
exports.adUploadMiddleware = upload.single('photo');

// Direct upload endpoint
exports.uploadAdPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No photo uploaded. Please select an image file.' });
        }
        const photoUrl = `/uploads/ads/${req.file.filename}`;
        return res.status(200).json({
            message: 'Photo uploaded successfully',
            imageUrl: photoUrl
        });
    } catch (err) {
        console.error('Error uploading ad photo:', err);
        return res.status(500).json({ error: 'Failed to upload ad photo.' });
    }
};

exports.getAds = async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        const result = await query('SELECT * FROM advertisements ORDER BY position ASC, id ASC');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching ads:', err);
        res.status(500).json({ error: 'Failed to fetch ads from database.' });
    }
};

exports.createAd = async (req, res) => {
    try {
        const { title, description, image_url, target_url, position, start_date, end_date } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Ad title is required.' });
        }

        const result = await query(
            'INSERT INTO advertisements (title, description, image_url, target_url, position, start_date, end_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [title, description || null, image_url || null, target_url || null, position || null, start_date || null, end_date || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Failed to create ad:', err.message, err.detail || '');
        res.status(500).json({ error: 'Failed to create ad: ' + (err.message || 'Unknown error') });
    }
};

exports.updateAd = async (req, res) => {
    const { id } = req.params;
    try {
        const { title, description, image_url, target_url, position, start_date, end_date } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Ad title is required.' });
        }

        const result = await query(
            'UPDATE advertisements SET title=$1, description=$2, image_url=$3, target_url=$4, position=$5, start_date=$6, end_date=$7 WHERE id=$8 RETURNING *',
            [title, description || null, image_url || null, target_url || null, position || null, start_date || null, end_date || null, id]
        );
        if (!result.rows[0]) {
            return res.status(404).json({ error: 'Advertisement not found.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Failed to update ad:', err.message, err.detail || '');
        res.status(500).json({ error: 'Failed to update ad: ' + (err.message || 'Unknown error') });
    }
};

exports.deleteAd = async (req, res) => {
    const { id } = req.params;
    try {
        await query('DELETE FROM advertisements WHERE id=$1', [id]);
        res.status(200).json({ message: 'Ad deleted successfully' });
    } catch (err) {
        console.error('Failed to delete ad:', err);
        res.status(500).json({ error: 'Failed to delete ad.' });
    }
};

