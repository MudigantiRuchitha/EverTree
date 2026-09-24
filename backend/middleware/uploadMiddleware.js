// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// const uploadsDir = path.join(__dirname, '../uploads');
// if (!fs.existsSync(uploadsDir)) {
//     fs.mkdirSync(uploadsDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, uploadsDir);
//     },
//     filename: (req, file, cb) => {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         const ext = path.extname(file.originalname);
//         cb(null, file.fieldname + '-' + uniqueSuffix + ext);
//     }
// });

// const fileFilter = (req, file, cb) => {
//     // Allow images, videos, pdfs, audio
//     const allowedTypes = /jpeg|jpg|png|webp|mp4|webm|pdf|doc|docx|mp3|wav|ogg|m4a/;
//     const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = allowedTypes.test(file.mimetype);

//     if (extname || mimetype) {
//         return cb(null, true);
//     } else {
//         cb(new Error('Only images, videos, audio, and documents (PDF/DOC) are allowed!'));
//     }
// };

// const upload = multer({
//     storage,
//     limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
//     fileFilter
// });

// module.exports = upload;
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(
    __dirname,
    '..',
    'uploads',
    'properties'
);

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {
        recursive: true
    });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);

        const filename =
            `property-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

        cb(null, filename);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif',
        'video/mp4',
        'video/webm'
    ];

    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                'Only images and videos are allowed.'
            ),
            false
        );
    }
};

module.exports = multer({
    storage,
    fileFilter,
    limits: {
        files: 20,
        fileSize: 25 * 1024 * 1024
    }
});