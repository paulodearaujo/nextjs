/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;

module.exports = {
    env: {
        WEBFLOW_CLIENT_SECRET: process.env.WEBFLOW_CLIENT_SECRET,
        NEXT_PUBLIC_WEBFLOW_CLIENT_ID: process.env.NEXT_PUBLIC_WEBFLOW_CLIENT_ID,
        NEXT_PUBLIC_REDIRECT_URI: process.env.NEXT_PUBLIC_REDIRECT_URI,
        NEXT_PUBLIC_WEBFLOW_TOKEN_URL: process.env.NEXT_PUBLIC_WEBFLOW_TOKEN_URL,
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
        NEXT_PUBLIC_WEBFLOW_COLLECTION_ID: process.env.NEXT_PUBLIC_WEBFLOW_COLLECTION_ID,
        NEXT_PUBLIC_WEBFLOW_PROXY_URL: process.env.NEXT_PUBLIC_WEBFLOW_PROXY_URL,
    },
};