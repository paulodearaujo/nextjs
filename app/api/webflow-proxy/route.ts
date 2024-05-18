import type {NextRequest} from 'next/server';
import {NextResponse} from 'next/server';
import {fetchAllItems} from '@/app/api/webflow';

export async function GET(request: NextRequest) {
    const accessToken = request.headers.get('Authorization')?.split(' ')[1];

    if (!accessToken) {
        return NextResponse.json({ error: 'Missing access token' }, { status: 401 });
    }

    try {
        const data = await fetchAllItems(accessToken);
        return NextResponse.json(data);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        console.error('Error fetching data from Webflow:', errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
