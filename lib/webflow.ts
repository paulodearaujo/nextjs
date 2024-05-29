import type {WebflowItem, WebflowResponse} from '@/types';
import {getSpecificItem} from './supabase';

const CLIENT_ID = process.env.NEXT_PUBLIC_WEBFLOW_CLIENT_ID;
const CLIENT_SECRET = process.env.WEBFLOW_CLIENT_SECRET;
const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI;
const TOKEN_URL = process.env.NEXT_PUBLIC_WEBFLOW_TOKEN_URL || 'https://api.webflow.com/oauth/access_token';
const API_URL = process.env.NEXT_PUBLIC_BASE_URL;
const COLLECTION_ID = process.env.NEXT_PUBLIC_WEBFLOW_COLLECTION_ID || '65c1399ac999a342139b5099';
const PROXY_URL = process.env.NEXT_PUBLIC_WEBFLOW_PROXY_URL || '/api/webflow-proxy';

if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI || !TOKEN_URL || !API_URL || !COLLECTION_ID || !PROXY_URL) {
    throw new Error('Missing necessary environment variables.');
}

export const getAccessToken = async (authCode: string): Promise<string> => {
    const body = new URLSearchParams({
        client_id: CLIENT_ID as string,
        client_secret: CLIENT_SECRET as string,
        code: authCode,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI as string,
    });

    const response = await fetch(TOKEN_URL, {
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

export const fetchAllItems = async (accessToken: string): Promise<WebflowItem[]> => {
    const limit = 100;
    let offset = 0;
    let allItems: WebflowItem[] = [];
    let hasMoreItems = true;

    try {
        while (hasMoreItems) {
            const response = await fetch(`${API_URL}/collections/${COLLECTION_ID}/items?offset=${offset}&limit=${limit}`, {
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

export const fetchWebflowData = async (accessToken: string): Promise<WebflowResponse> => {
    console.log('Fetching data from proxy:', PROXY_URL);

    try {
        const response = await fetch(PROXY_URL, {
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

export const sendItemToWebflow = async (itemId: string, targetUrl: string, anchor: string): Promise<void> => {
    const item = await getSpecificItem(itemId);

    if (!item) {
        throw new Error('Item not found');
    }

    const updatedBody = item.fieldData['post-body'].replace(new RegExp(`\\b${anchor}\\b`, 'gi'), `<a href="${targetUrl}">${anchor}</a>`);

    const updatedItem = {
        ...item,
        fieldData: {
            ...item.fieldData,
            'post-body': updatedBody,
            lastPublished: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        }
    };

    const accessToken = localStorage.getItem('webflow_access_token'); // Certifique-se de que isso esteja sendo recuperado corretamente

    const options = {
        method: 'PATCH',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            isArchived: false,
            isDraft: false,
            fields: updatedItem.fieldData
        })
    };

    console.log('Sending PATCH request with options:', options);

    // Log the data being sent in the PATCH request
    console.log('PATCH request body:', options.body);

    const response = await fetch(`${API_URL}/collections/${COLLECTION_ID}/items/${itemId}`, options);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to send item to Webflow: ${JSON.stringify(errorData)}`);
    }

    console.log('Item sent successfully to Webflow');
};

export const restoreItemToWebflow = async (itemId: string): Promise<void> => {
    const item = await getSpecificItem(itemId);

    if (!item) {
        throw new Error('Item not found');
    }

    const accessToken = localStorage.getItem('webflow_access_token'); // Certifique-se de que isso esteja sendo recuperado corretamente

    const options = {
        method: 'PATCH',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            isArchived: false,
            isDraft: false,
            fields: item.fieldData
        })
    };

    console.log('Sending PATCH request with options:', options);

    console.log('PATCH request body:', options.body);

    const response = await fetch(`${API_URL}/collections/${COLLECTION_ID}/items/${itemId}`, options);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to restore item to Webflow: ${JSON.stringify(errorData)}`);
    }

    console.log('Item restored successfully to Webflow');
};
