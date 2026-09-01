/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:5000/api/:path*'
            },
            {
                source: '/uploads/:path*',
                destination: 'http://localhost:5000/uploads/:path*'
            }
        ];
    },
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'http', hostname: 'localhost' }
        ]
    }
};

export default nextConfig;
