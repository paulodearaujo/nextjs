import {NextRequest, NextResponse} from 'next/server';
import {getAccessToken} from '@/lib/webflow';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
        console.error('Missing code');
        return NextResponse.redirect('/error?error=missing_code');
    }

    try {
        const accessToken = await getAccessToken(code);
        console.log('Access token received:', accessToken);
        return NextResponse.redirect(`/success?access_token=${accessToken}`);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        console.error('Error obtaining access token:', errorMessage);
        return NextResponse.redirect(`/error?error=${errorMessage}`);
    }
}
