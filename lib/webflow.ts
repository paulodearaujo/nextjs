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

    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error_description || 'Failed to obtain access token');
    }

    const tokenData = await response.json();
    return tokenData.access_token;
};

export const fetchWebflowData = async (accessToken: string) => {
    const proxyUrl = '/api/webflow-proxy';
    console.log('Fetching data from proxy:', proxyUrl);

    try {
        const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response from proxy:', errorText);
            throw new Error('Failed to fetch data from Webflow');
        }

        const data = await response.json();
        console.log('Data received from proxy:', data);
        return data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching data from Webflow:', error.message);
            throw new Error(`Error fetching data from Webflow: ${error.message}`);
        }
        console.error('Unexpected error:', error);
        throw new Error('An unexpected error occurred while fetching data from Webflow');
    }
};
