/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true
    },
    images: {
        remotePatterns: [{
            protocol: 'https',
            hostname: 'i.scdn.co',
            port: ''

        }, {
            protocol: 'https',
            hostname: 'mosaic.scdn.co',
            port: ''
        }, {
            protocol: "https",
            hostname: "lh3.googleusercontent.com",
            port: ''
        }, {
            protocol: 'https',
            hostname: 'cdn.pixabay.com',
            port: ''
        }, {
            protocol: 'https',
            hostname: 'images-ak.spotifycdn.com'
        }, {
            protocol: 'https',
            hostname: 'i.ytimg.com'
        }, {
            protocol: "https",
            hostname: 'yt3.ggpht.com'
        }, {
            protocol: "https",
            hostname: 'upload.wikimedia.org'
        }],
        domains: ["i.ytimg.com"]
    },
    async headers() {
        return [
            {
                // Permit browser to load resources from /api/
                source: "/api/:path",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "*" },
                    { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
                    { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
                ]
            }
        ]
    }
}

module.exports = nextConfig
