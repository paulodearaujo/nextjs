import type {WebflowItem, WebflowResponse} from '@/types';

const API_URL = "https://api.webflow.com/v2/collections";

const getAccessToken = async (authCode: string): Promise<string> => {
    const clientId = process.env.NEXT_PUBLIC_WEBFLOW_CLIENT_ID;
    const clientSecret = process.env.WEBFLOW_CLIENT_SECRET;
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
        throw new Error('Missing environment variables for Webflow API');
    }

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

export const fetchAllItems = async (collectionId: string, authCode: string): Promise<WebflowItem[]> => {
    const accessToken = await getAccessToken(authCode);
    const limit = 100;
    let offset = 0;
    let allItems: WebflowItem[] = [];
    let hasMoreItems = true;

    try {
        while (hasMoreItems) {
            const response = await fetch(`${API_URL}/${collectionId}/items?offset=${offset}&limit=${limit}`, {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    authorization: `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                const errorResponse = await response.json();
                throw new Error(errorResponse.msg || 'Failed to fetch data from Webflow');
            }

            const data: WebflowResponse = await response.json();
            allItems = allItems.concat(data.items);

            if (data.items.length < limit) {
                hasMoreItems = false;
            } else {
                offset += limit;
            }
        }
    } catch (error) {
        console.error("Error fetching items from Webflow:", error);
        throw error;
    }

    return allItems;
};

export const fetchWebflowData = async (authCode: string): Promise<WebflowResponse> => {
    const accessToken = await getAccessToken(authCode);
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

        const data: WebflowResponse = await response.json();
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
