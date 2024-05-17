import {NextRequest, NextResponse} from 'next/server';
import {getAccessToken} from '@/lib/webflow';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.redirect(new URL('/error?error=missing_code', process.env.NEXT_PUBLIC_BASE_URL).toString());
    }

    try {
        const accessToken = await getAccessToken(code);
        return NextResponse.redirect(new URL(`/hyperlinks?access_token=${accessToken}`, process.env.NEXT_PUBLIC_BASE_URL).toString());
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        console.error('Error obtaining access token:', errorMessage);
        return NextResponse.redirect(new URL(`/error?error=${errorMessage}`, process.env.NEXT_PUBLIC_BASE_URL).toString());
    }
}
