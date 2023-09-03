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
    
}

module.exports = nextConfig
