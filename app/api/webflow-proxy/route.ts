import type {NextRequest} from 'next/server';
import {NextResponse} from 'next/server';

export async function GET(request: NextRequest) {
    const collectionId = process.env.WEBFLOW_COLLECTION_ID;
    if (!collectionId) {
        return NextResponse.json({ error: 'Missing environment variable: WEBFLOW_COLLECTION_ID' }, { status: 500 });
    }

    const API_URL = `https://api.webflow.com/v2/collections/${collectionId}/items`;
    const accessToken = request.headers.get('Authorization')?.split(' ')[1];

    if (!accessToken) {
        return NextResponse.json({ error: 'Missing access token' }, { status: 401 });
    }

    const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
            accept: 'application/json',
            authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        const errorResponse = await response.json().catch(() => ({}));
        const errorMessage = errorResponse?.msg || 'Failed to fetch data from Webflow';
        return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
}
