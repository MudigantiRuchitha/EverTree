/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return [
            {
                source: '/home-loans',
                destination: '/loan',
                permanent: true
            },
            {
                source: '/legal-services',
                destination: '/legal',
                permanent: true
            },
            {
                source: '/interior-design',
                destination: '/interior',
                permanent: true
            },
            {
                source: '/properties',
                destination: '/search',
                permanent: true
            },
            {
                source: '/my-listings',
                destination: '/my-listing',
                permanent: true
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
