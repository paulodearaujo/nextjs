import type {WebflowItem, WebflowResponse} from '@/types';
// biome-ignore lint/style/useImportType: <explanation>
import axios, {AxiosError} from 'axios';

interface WebflowErrorResponse {
    error_description?: string;
    message?: string;
}

const API_URL = "https://api.webflow.com/v2/collections";

const getEnvVariable = (key: string): string => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
};

export const getAccessToken = async (authCode: string): Promise<string> => {
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

    try {
        const response = await axios.post(tokenUrl, body.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        return response.data.access_token;
    } catch (err) {
        const error = err as AxiosError<WebflowErrorResponse>;
        const errorMessage = error.response?.data?.error_description || 'Failed to obtain access token';
        throw new Error(errorMessage);
    }
};

export const fetchAllItems = async (collectionId: string, accessToken: string): Promise<WebflowItem[]> => {
    const limit = 100;
    let offset = 0;
    let allItems: WebflowItem[] = [];
    let hasMoreItems = true;

    try {
        while (hasMoreItems) {
            const response = await axios.get(`${API_URL}/${collectionId}/items`, {
                params: { offset, limit },
                headers: {
                    accept: 'application/json',
                    authorization: `Bearer ${accessToken}`,
                },
            });

            const data: WebflowResponse = response.data;
            allItems = allItems.concat(data.items);

            if (data.items.length < limit) {
                hasMoreItems = false;
            } else {
                offset += limit;
            }
        }
    } catch (err) {
        const error = err as AxiosError<WebflowErrorResponse>;
        console.error("Error fetching items from Webflow:", error.message);
        throw error;
    }

    return allItems;
};

export const fetchWebflowData = async (accessToken: string): Promise<WebflowResponse> => {
    const apiUrl = 'https://api.webflow.com/v2/collections';
    console.log('Fetching data from Webflow API:', apiUrl);

    try {
        const response = await axios.get(apiUrl, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return response.data;
    } catch (err) {
        const error = err as AxiosError<WebflowErrorResponse>;
        const errorMessage = error.response?.data?.message || 'Failed to fetch data from Webflow';
        console.error('Error fetching data from Webflow:', errorMessage);
        throw new Error(`Error fetching data from Webflow: ${errorMessage}`);
    }
};
