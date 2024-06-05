import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { fetchAllItems } from '@/lib/webflow';

const getEnvVariable = (key: string): string => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
};

export async function GET() {
    try {
        const collectionId = getEnvVariable('NEXT_PUBLIC_WEBFLOW_COLLECTION_ID');
        const accessToken = getEnvVariable('WEBFLOW_ACCESS_TOKEN');

        console.log('Collection ID:', collectionId);
        console.log('Access Token:', accessToken ? 'Exists' : 'Not Found');

        const items = await fetchAllItems(collectionId, accessToken);
        return NextResponse.json({ items });
    } catch (error) {
        console.error('Error fetching items from Webflow:', error);
        return NextResponse.json({ error: 'Failed to fetch data from Webflow' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
        return NextResponse.json({ error: 'Missing itemId parameter' }, { status: 400 });
    }

    const accessToken = getEnvVariable('WEBFLOW_ACCESS_TOKEN');
    const body = await request.json();

    try {
        const response = await fetch(`${getEnvVariable('WEBFLOW_API_URL')}/collections/${itemId}`, {
            method: 'PATCH',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json({ error: errorData.msg || 'Failed to update item in Webflow' }, { status: response.status });
        }

        return NextResponse.json({ message: 'Item updated successfully' });
    } catch (error) {
        console.error('Error updating item in Webflow:', error);
        return NextResponse.json({ error: 'Failed to update item in Webflow' }, { status: 500 });
    }
}
