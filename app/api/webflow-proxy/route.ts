import type {NextRequest} from 'next/server';
import {NextResponse} from 'next/server';

const API_URL = `https://api.webflow.com/v2/collections/${process.env.NEXT_PUBLIC_WEBFLOW_COLLECTION_ID}/items`;

export async function GET(request: NextRequest) {
    const accessToken = request.headers.get('Authorization')?.split(' ')[1];

    if (!accessToken) {
        return NextResponse.json({ error: 'Missing access token' }, { status: 401 });
    }

    try {
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
    } catch (error) {
        console.error('Error fetching data from Webflow:', error);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}