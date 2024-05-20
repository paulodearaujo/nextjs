import type {NextApiRequest, NextApiResponse} from 'next';
import {fetchAllItems} from '@/lib/webflow';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const collectionId = process.env.NEXT_PUBLIC_WEBFLOW_COLLECTION_ID;
    const accessToken = req.headers.authorization?.split(' ')[1];

    if (!collectionId) {
        return res.status(500).json({ error: 'Collection ID is not defined' });
    }

    if (!accessToken) {
        return res.status(401).json({ error: 'Missing access token' });
    }

    try {
        const items = await fetchAllItems(collectionId, accessToken);
        return res.status(200).json({ items });
    } catch (error) {
        const err = error as Error;
        console.error('Error fetching data from Webflow:', err.message);
        return res.status(500).json({ error: 'An unexpected error occurred' });
    }
}
