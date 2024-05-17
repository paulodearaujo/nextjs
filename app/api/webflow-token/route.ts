import {NextRequest, NextResponse} from 'next/server';

export async function POST(request: NextRequest) {
    const clientId = process.env.WEBFLOW_CLIENT_ID;
    const clientSecret = process.env.WEBFLOW_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        return NextResponse.json({ error: 'Missing environment variables: WEBFLOW_CLIENT_ID or WEBFLOW_CLIENT_SECRET' }, { status: 500 });
    }

    const { code } = await request.json();

    const tokenUrl = 'https://api.webflow.com/oauth/access_token';
    const body = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
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
        return NextResponse.json({ error: error.error_description || 'Failed to obtain access token' }, { status: response.status });
    }

    const tokenData = await response.json();
    return NextResponse.json(tokenData);
}
