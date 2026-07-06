// next.config.mjs — Next 14 does not support next.config.ts; see README note
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { remotePatterns: [{ protocol: 'http', hostname: 'localhost' }] },
  async headers() {
    return [
      {
        // Allow viewer.html to be embedded in iframe from dashboard
        source: '/viewer',
        headers: [{ key: 'X-Frame-Options', value: 'SAMEORIGIN' }],
      },
      {
        // Allow dashboard to call backend API (CORS for dev)
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'http://localhost:3000' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,PATCH,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        // Proxy /viewer requests to backend so iframe is same origin
        source: '/viewer',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/viewer`,
      },
      {
        // Proxy /files requests for GLB and photo serving
        source: '/files/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/files/:path*`,
      },
    ]
  },
}
export default nextConfig
