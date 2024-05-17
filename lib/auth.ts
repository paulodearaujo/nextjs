const getEnvVariable = (key: string, defaultValue?: string): string => {
    const value = process.env[key];
    if (!value) {
        if (defaultValue !== undefined) {
            return defaultValue;
        }
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
};

export const authorizeWebflow = () => {
    const clientId = getEnvVariable('NEXT_PUBLIC_WEBFLOW_CLIENT_ID');
    const redirectUri = encodeURIComponent(getEnvVariable('NEXT_PUBLIC_REDIRECT_URI'));
    const scopes = encodeURIComponent('cms:read cms:write');
    const authUrl = `https://webflow.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes}`;

    window.location.href = authUrl;
};
