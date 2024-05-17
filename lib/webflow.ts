export const getAccessToken = async (authCode: string) => {
    const response = await fetch('/api/webflow-token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: authCode }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to obtain access token');
    }

    const { access_token } = await response.json();
    return access_token;
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
