import type { WebflowItem, WebflowResponse } from '@/types';
import { getSpecificItem } from './supabase';

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

export const fetchAllItems = async (collectionId: string, accessToken: string): Promise<WebflowItem[]> => {
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

export const fetchWebflowData = async (accessToken: string): Promise<WebflowResponse> => {
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
        console.log('fetchWebflowData Access Token:', accessToken);

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
            'post-body': updatedBody
        },
        lastPublished: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
    };

    const accessToken = getEnvVariable('WEBFLOW_ACCESS_TOKEN');
    const options = {
        method: 'PATCH',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            isArchived: false,
            isDraft: false,
            fields: updatedItem.fieldData,
        })
    };

    try {
        const response = await fetch(`/api/webflow-proxy?itemId=${itemId}`, options);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error response from Webflow:', errorData);
            throw new Error(`Failed to send item to Webflow: ${errorData}`);
        }

        console.log('Item sent successfully to Webflow');
    } catch (error) {
        console.error('Error in sendItemToWebflow:', error);
        throw error;
    }
};

export const restoreItemToWebflow = async (itemId: string): Promise<void> => {
    const item = await getSpecificItem(itemId);

    if (!item) {
        throw new Error('Item not found');
    }

    const accessToken = getEnvVariable('WEBFLOW_ACCESS_TOKEN');
    const options = {
        method: 'PATCH',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            isArchived: false,
            isDraft: false,
            fields: item.fieldData,
        })
    };

    try {
        const response = await fetch(`/api/webflow-proxy?itemId=${itemId}`, options);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Response error data:', errorData);
            throw new Error(`Failed to restore item to Webflow: ${errorData}`);
        }

        console.log('Item restored successfully to Webflow');
    } catch (error) {
        console.error('Error in restoreItemToWebflow:', error);
        throw error;
    }
};
