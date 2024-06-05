import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { fetchAllItems } from '@/lib/webflow';

const collectionId = process.env.NEXT_PUBLIC_WEBFLOW_COLLECTION_ID;
const WEBFLOW_API_URL = 'https://api.webflow.com/v2';

export async function GET() {
    if (!collectionId) {
        return NextResponse.json({ error: 'Collection ID is not defined' }, { status: 500 });
    }

    const accessToken = process.env.WEBFLOW_ACCESS_TOKEN;

    if (!accessToken) {
        return NextResponse.json({ error: 'Missing access token' }, { status: 401 });
    }

    try {
        const data = await fetchAllItems(collectionId, accessToken);
        return NextResponse.json({ items: data });
    } catch (error) {
        console.error('Error fetching data from Webflow:', error);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    if (!collectionId) {
        return NextResponse.json({ error: 'Collection ID is not defined' }, { status: 500 });
    }

    const accessToken = process.env.WEBFLOW_ACCESS_TOKEN;
    const itemId = new URL(request.url).searchParams.get('itemId');

    if (!accessToken) {
        return NextResponse.json({ error: 'Missing access token' }, { status: 401 });
    }

    if (!itemId) {
        return NextResponse.json({ error: 'Missing item ID' }, { status: 400 });
    }

    try {
        const body = await request.json();
        const response = await fetch(`${WEBFLOW_API_URL}/collections/${collectionId}/items/${itemId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                authorization: `Bearer ${accessToken}`,
                accept: 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json({ error: errorData }, { status: response.status });
        }

        return NextResponse.json({ message: 'Item updated successfully' });
    } catch (error) {
        console.error('Error updating item in Webflow:', error);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
