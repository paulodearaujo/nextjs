const API_URL = `https://api.webflow.com/v2/collections/${process.env.NEXT_PUBLIC_WEBFLOW_COLLECTION_ID}/items`;

export const fetchWebflowData = async () => {
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            authorization: `Bearer ${process.env.WEBFLOW_API_KEY}`,
        },
    };

    try {
        const response = await fetch(API_URL, options);
        if (!response.ok) {
            const errorResponse = await response.json();
            const errorMessage = errorResponse?.msg || 'Failed to fetch data from Webflow';
            throw new Error(errorMessage);
        }
        return response.json();
    } catch (error) {
        console.error('Error fetching data from Webflow:', error);
        throw error;
    }
};
