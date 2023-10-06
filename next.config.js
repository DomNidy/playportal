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
        }, {
            protocol: 'https',
            hostname: 'lineup-images.scdn.co'
        }, {
            protocol: 'https',
            hostname: 'image-cdn-ak.spotifycdn.com'
        }, {
            protocol: 'https',
            hostname: 'image-cdn-fa.spotifycdn.com'
        }],
        domains: ["i.ytimg.com"]
    },

}

module.exports = nextConfig
