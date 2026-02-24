/** @type {import('next').NextConfig} */

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api-backend/:path*',
        // A Vercel vai interceptar e mandar para o HTTP inseguro na AWS, por debaixo dos panos
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`, 
      },
    ]
  },
};

export default nextConfig; // Se for .js, use: module.exports = nextConfig