import dotenv from 'dotenv';

dotenv.config();

const getEnvVariable = (key: string): string => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
};

export const API_URL = getEnvVariable('NEXT_PUBLIC_BASE_URL'); // URL base do seu projeto
export const TOKEN_URL = 'https://api.webflow.com/oauth/access_token'; // URL de token do Webflow
export const PROXY_URL = '/api/webflow-proxy'; // Proxy local para evitar CORS
export const CLIENT_ID = getEnvVariable('NEXT_PUBLIC_WEBFLOW_CLIENT_ID');
export const CLIENT_SECRET = getEnvVariable('WEBFLOW_CLIENT_SECRET');
export const REDIRECT_URI = getEnvVariable('NEXT_PUBLIC_REDIRECT_URI');
export const COLLECTION_ID = getEnvVariable('NEXT_PUBLIC_WEBFLOW_COLLECTION_ID');
export const SUPABASE_URL = getEnvVariable('NEXT_PUBLIC_SUPABASE_URL');
export const SUPABASE_ANON_KEY = getEnvVariable('NEXT_PUBLIC_SUPABASE_ANON_KEY');
