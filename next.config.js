/** @type {import('next').NextConfig} */
const nextConfig = {

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
        }],
        domains: ["i.ytimg.com"]
    }
}

module.exports = nextConfig
