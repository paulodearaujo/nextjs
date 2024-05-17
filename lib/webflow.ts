const getEnvVariable = (key: string): string => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
};

export const getAccessToken = async (authCode: string) => {
    const clientId = getEnvVariable('WEBFLOW_CLIENT_ID');
    const clientSecret = getEnvVariable('WEBFLOW_CLIENT_SECRET');

    const tokenUrl = 'https://api.webflow.com/oauth/access_token';
    const body = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: authCode,
        grant_type: 'authorization_code',
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

const PROXY_API_URL = '/api/webflow-proxy';

export const fetchWebflowData = async (accessToken: string) => {
    try {
        const response = await fetch(PROXY_API_URL, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const errorResponse = await response.json().catch(() => ({}));
            const errorMessage = errorResponse?.msg || 'Failed to fetch data from Webflow';
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error fetching data from Webflow:', errorMessage);
        throw new Error(`Error fetching data from Webflow: ${errorMessage}`);
    }
};
