const getEnvVariable = (key: string): string => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
};

export const getAccessToken = async (authCode: string) => {
    const clientId = getEnvVariable('NEXT_PUBLIC_WEBFLOW_CLIENT_ID');
    const clientSecret = getEnvVariable('WEBFLOW_CLIENT_SECRET');
    const redirectUri = getEnvVariable('NEXT_PUBLIC_REDIRECT_URI');

    const tokenUrl = 'https://api.webflow.com/oauth/access_token';
    const body = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: authCode,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
    });

    console.log('Requesting access token with body:', body.toString());

    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
    });

    if (!response.ok) {
        const error = await response.json();
        console.error('Error response from Webflow:', error);
        throw new Error(error.error_description || 'Failed to obtain access token');
    }

    const tokenData = await response.json();
    return tokenData.access_token;
};
