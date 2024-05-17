export const authorizeWebflow = () => {
    const clientId = process.env.NEXT_PUBLIC_WEBFLOW_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI;

    if (!clientId || !redirectUri) {
        throw new Error('Missing environment variables: NEXT_PUBLIC_WEBFLOW_CLIENT_ID or NEXT_PUBLIC_REDIRECT_URI');
    }

    const encodedRedirectUri = encodeURIComponent(redirectUri);
    const scopes = encodeURIComponent('cms:read cms:write');
    const authUrl = `https://webflow.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodedRedirectUri}&scope=${scopes}`;

    window.location.href = authUrl;
};
