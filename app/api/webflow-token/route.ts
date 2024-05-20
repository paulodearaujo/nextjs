import type {NextRequest} from 'next/server';
import {NextResponse} from 'next/server';
// biome-ignore lint/style/useImportType: <explanation>
import axios, {AxiosError} from 'axios';

interface WebflowErrorResponse {
    error_description?: string;
}

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

    try {
        const response = await axios.post(tokenUrl, body.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        return NextResponse.json(response.data);
    } catch (err) {
        const error = err as AxiosError<WebflowErrorResponse>;
        const errorMessage = error.response?.data?.error_description || 'Failed to obtain access token';
        return NextResponse.json({ error: errorMessage }, { status: error.response?.status || 500 });
    }
}
