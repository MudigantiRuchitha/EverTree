import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const MIME_TYPES = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webm': 'video/webm',
    '.mp4': 'video/mp4',
    '.pdf': 'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
};

const FALLBACK_PROPERTY_IMAGE = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';
const FALLBACK_AD_IMAGE = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';

export async function GET(request, { params }) {
    const rawSegments = (await params)?.path || [];
    const relativePath = Array.isArray(rawSegments) ? rawSegments.join('/') : String(rawSegments);

    // Prevent directory traversal
    const safePath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');

    const candidateDirs = [
        path.join(process.cwd(), 'public', 'uploads'),
        path.join(process.cwd(), 'frontend-next', 'public', 'uploads'),
        path.join(process.cwd(), '..', 'backend', 'uploads'),
        path.join(process.cwd(), 'backend', 'uploads'),
        path.resolve(__dirname, '../../../../backend/uploads'),
        path.resolve(__dirname, '../../../../frontend-next/public/uploads'),
        'C:\\Users\\Soudu Srilatha\\OneDrive\\Desktop\\evertree\\EverTree\\backend\\uploads',
        'C:\\Users\\Soudu Srilatha\\OneDrive\\Desktop\\evertree\\EverTree\\frontend-next\\public\\uploads'
    ];

    let targetFilePath = null;
    for (const dir of candidateDirs) {
        try {
            const candidate = path.join(dir, safePath);
            if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
                targetFilePath = candidate;
                break;
            }
        } catch (_) {}
    }

    if (targetFilePath) {
        try {
            const fileBuffer = fs.readFileSync(targetFilePath);
            const ext = path.extname(targetFilePath).toLowerCase();
            const contentType = MIME_TYPES[ext] || 'application/octet-stream';

            // Also sync to public/uploads if needed
            try {
                const publicDest = path.join(process.cwd(), 'public', 'uploads', safePath);
                if (!fs.existsSync(publicDest)) {
                    fs.mkdirSync(path.dirname(publicDest), { recursive: true });
                    fs.copyFileSync(targetFilePath, publicDest);
                }
            } catch (_) {}

            return new NextResponse(fileBuffer, {
                status: 200,
                headers: {
                    'Content-Type': contentType,
                    'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800'
                }
            });
        } catch (readErr) {
            console.error('Error reading upload file:', readErr);
        }
    }

    // Fallback if file does not exist on disk
    const isAd = safePath.toLowerCase().includes('ad');
    const redirectUrl = isAd ? FALLBACK_AD_IMAGE : FALLBACK_PROPERTY_IMAGE;
    return NextResponse.redirect(redirectUrl, { status: 307 });
}
