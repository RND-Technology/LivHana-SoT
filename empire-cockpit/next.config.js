/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  images: {
    domains: [
      'localhost',
      'images.square.com',
      'i.ytimg.com',
      'img.youtube.com',
      'storage.googleapis.com',
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ]
  },

  // Redirects for domain canonicalization
  async redirects() {
    return [
      // Enforce www or non-www (configure based on preference)
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.reggieanddro.com',
          },
        ],
        destination: 'https://reggieanddro.com/:path*',
        permanent: true,
      },
    ]
  },

  // Webpack optimizations
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },

  // Environment variables available to browser
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    FEATURE_HERBITRAGE_GREEKS: process.env.FEATURE_HERBITRAGE_GREEKS,
    FEATURE_VIP_COCKPIT: process.env.FEATURE_VIP_COCKPIT,
  },

  // Experimental features
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', '@radix-ui/react-icons'],
  },
}

module.exports = nextConfig

// Optimized: 2025-10-02

// Last updated: 2025-10-02
