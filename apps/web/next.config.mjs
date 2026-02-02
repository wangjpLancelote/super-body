/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react']
  },
  eslint: {
    dirs: ['pages', 'utils', 'components', 'app', 'lib']
  }
}

export default nextConfig