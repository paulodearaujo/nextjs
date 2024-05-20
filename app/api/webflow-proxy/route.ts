import type {NextRequest} from 'next/server';
import {NextResponse} from 'next/server';
import {fetchAllItems} from '@/lib/webflow';

const collectionId = process.env.NEXT_PUBLIC_WEBFLOW_COLLECTION_ID;

export async function GET(request: NextRequest) {
    if (!collectionId) {
        return NextResponse.json({ error: 'Collection ID is not defined' }, { status: 500 });
    }

    const accessToken = request.headers.get('Authorization')?.split(' ')[1];

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
