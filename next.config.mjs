import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "*.supabase.co",
                pathname: "/storage/v1/object/public/**",
            },
            {
                protocol: "https",
                hostname: "*.supabase.in",
                pathname: "/storage/v1/object/public/**",
            },
        ],
    },
    experimental: {
        serverActions: {
            bodySizeLimit: "10mb",
        },
    },
    allowedDevOrigins: ["100.82.144.128", "157.245.148.90"],
};

const pwaConfig = withPWA({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
    buildExcludes: [/middleware-manifest\.json$/],
    runtimeCaching: [
        {
            urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
                cacheName: 'google-fonts',
                expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 365 * 24 * 60 * 60, // 365 days
                },
            },
        },
        {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
                cacheName: 'images',
                expiration: {
                    maxEntries: 100,
                    maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                },
            },
        },
        {
            urlPattern: /^https:\/\/.*\.supabase\.(?:co|in)\/storage\/.*/i,
            handler: 'CacheFirst',
            options: {
                cacheName: 'supabase-images',
                expiration: {
                    maxEntries: 200,
                    maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
                },
            },
        },
        {
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkOnly',
            options: {
                cacheName: 'api-cache',
            },
        },
        {
            urlPattern: /\/_next\/static\/.*/i,
            handler: 'CacheFirst',
            options: {
                cacheName: 'next-static',
                expiration: {
                    maxEntries: 100,
                    maxAgeSeconds: 365 * 24 * 60 * 60,
                },
            },
        },
    ],
});

export default pwaConfig(nextConfig);
