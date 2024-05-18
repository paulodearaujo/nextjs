import type {WebflowData, WebflowItem} from '@/types';

const API_BASE_URL = 'https://api.webflow.com/v2';
const COLLECTION_ID = process.env.NEXT_PUBLIC_WEBFLOW_COLLECTION_ID;
const API_URL = `${API_BASE_URL}/collections/${COLLECTION_ID}/items`;

const fetchWithToken = async (url: string, accessToken: string) => {
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch data from Webflow');
    }

    return response.json();
};

export const fetchAllItems = async (accessToken: string): Promise<WebflowData> => {
    const allItems: WebflowItem[] = [];
    let offset = 0;
    const limit = 100;

    while (true) {
        const data: WebflowData = await fetchWithToken(`${API_URL}?offset=${offset}&limit=${limit}`, accessToken);
        allItems.push(...data.items);

        if (data.items.length < limit) {
            break;
        }

        offset += limit;
    }

    return { items: allItems };
};