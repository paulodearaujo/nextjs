import dotenv from 'dotenv';

dotenv.config();

const getEnvVariable = (key: string): string => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
};

export const API_URL = getEnvVariable('NEXT_PUBLIC_BASE_URL');
export const TOKEN_URL = 'https://api.webflow.com/oauth/access_token';
export const PROXY_URL = '/api/webflow-proxy';
export const CLIENT_ID = '02baeafb8e87098f7908d6c3f0e1854e50756b7b35672a9fb62aaaf61535b509';
export const CLIENT_SECRET = 'cf966ac70b03351be62d69714f37e811a8cfb113f3f1745c5b84afb2ce21cf99';
export const REDIRECT_URI = 'https://intern-infinitepay.vercel.app/api/auth/callback';
export const BASE_URL = 'https://intern-infinitepay.vercel.app/';
export const COLLECTION_ID = '65c1399ac999a342139b5099';
export const SUPABASE_URL = 'https://tmlkzkaeemhxeyrhyiic.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtbGt6a2FlZW1oeGV5cmh5aWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY4NDA2OTUsImV4cCI6MjAzMjQxNjY5NX0.CIqTeVYlMWDxmOwyHtfnb5Z7JqLb332KwcR6CZ2-Ips';