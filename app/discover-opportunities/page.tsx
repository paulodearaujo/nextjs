"use client";

import {useState} from 'react';
import type {Opportunity, WebflowItem} from '@/types';
import {normalizeUrl, validateUrl} from '@/lib/utils';
import {useWebflowData} from '@/context/WebflowDataContext';

const BASE_URL = 'https://www.infinitepay.io/blog/'; // Substitua pelo URL base real de sua aplicação

const DiscoverOpportunitiesPage = () => {
    const { webflowData } = useWebflowData();
    const [targetUrl, setTargetUrl] = useState<string>('');
    const [anchorPotentials, setAnchorPotentials] = useState<string>('');
    const [hyperlinkOpportunities, setHyperlinkOpportunities] = useState<Opportunity[]>([]);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const discoverHyperlinkOpportunities = () => {
        try {
            if (!targetUrl.trim()) {
                setErrorMessage('Please provide a valid URL.');
                return;
            }

            if (!validateUrl(targetUrl)) {
                setErrorMessage('Invalid URL provided.');
                return;
            }

            const normalizedTargetUrl = normalizeUrl(targetUrl);
            if (!normalizedTargetUrl) {
                setErrorMessage('URL normalization failed.');
                return;
            }

            console.log('URL validated and normalized:', normalizedTargetUrl);

            if (!anchorPotentials) {
                setErrorMessage('No anchor potentials provided.');
                return;
            }

            const anchors = anchorPotentials.split(',').map(a => a.trim().toLowerCase()).filter(a => a);
            console.log('Anchor potentials:', anchors);

            if (anchors.length === 0) {
                setErrorMessage('No valid anchors provided.');
                return;
            }

            const usedUrls = new Set<string>();

            const opportunities: Opportunity[] = webflowData.reduce((acc: Opportunity[], item: WebflowItem) => {
                const itemSlug = item.fieldData.slug;
                if (!itemSlug) {
                    console.warn(`Item without slug found: ${item.id}`);
                    return acc;
                }

                const itemUrl = `${BASE_URL}${itemSlug}`;
                if (normalizedTargetUrl === itemUrl) {
                    console.log(`Skipping target URL itself: ${itemUrl}`);
                    return acc;
                }

                const parser = new DOMParser();
                const doc = parser.parseFromString(item.fieldData['post-body'], 'text/html');
                console.log(`Parsed content for item: ${itemSlug}`);

                // Remove anchors and titles to avoid considering them
                for (const el of Array.from(doc.querySelectorAll('a, h1, h2, h3'))) {
                    el.remove();
                }

                const text = doc.body.textContent || '';
                console.log(`Processed text content: ${text.substring(0, 100)}...`);

                for (const anchor of anchors) {
                    const regex = new RegExp(`\\b${anchor}\\b`, 'gi');
                    console.log(`Searching for anchor: ${anchor} using regex: ${regex}`);
                    const matches = text.toLowerCase().matchAll(regex);

                    for (const match of matches) {
                        if (match.index !== undefined) {
                            // Skip if the match is within an anchor tag
                            const surroundingHTML = text.substring(Math.max(0, match.index - 30), Math.min(text.length, match.index + 30));
                            if (surroundingHTML.includes('<a')) {
                                console.log(`Match within an anchor tag, skipping: ${surroundingHTML}`);
                                continue;
                            }

                            const contextStart = Math.max(0, match.index - 30);
                            const contextEnd = Math.min(text.length, match.index + 30);
                            const anchorContext = text.substring(contextStart, contextEnd).replace(/\n/g, ' ').trim();
                            console.log(`Match found: ${anchorContext}`);

                            if (!usedUrls.has(itemUrl)) {
                                acc.push({
                                    urlFrom: itemUrl,
                                    anchorContext: anchorContext,
                                    completeUrl: itemUrl,
                                });
                                usedUrls.add(itemUrl);
                            }
                        }
                    }
                }

                return acc;
            }, []);

            console.log('Discovered opportunities:', opportunities);

            if (!opportunities.length) {
                setErrorMessage('No hyperlink opportunities found.');
            } else {
                setHyperlinkOpportunities(opportunities);
            }
        } catch (error) {
            console.error('Error in discoverHyperlinkOpportunities:', error);
            setErrorMessage((error as Error).message);
        }
    };

    return (
        <main className="p-4">
            <header>
                <h1 className="text-2xl font-bold text-center mb-4">Discover Hyperlink Opportunities</h1>
            </header>
            <section className="mb-8">
                <div className="flex gap-2 my-2">
                    <input
                        value={targetUrl}
                        onChange={e => setTargetUrl(e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded"
                        placeholder="Enter target URL for opportunities"
                        type="text"
                    />
                    <textarea
                        value={anchorPotentials}
                        onChange={e => setAnchorPotentials(e.target.value)}
                        className="p-2 border border-gray-300 rounded"
                        placeholder="Enter potential anchors, separated by commas"
                        rows={3}
                    />
                    <button
                        type="button"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        onClick={discoverHyperlinkOpportunities}
                    >
                        Discover Opportunities
                    </button>
                </div>
                {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                {hyperlinkOpportunities.length > 0 && (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-2 border-b">From URL</th>
                                <th className="p-2 border-b">Context</th>
                            </tr>
                        </thead>
                        <tbody>
                            {hyperlinkOpportunities.map(opportunity => (
                                <tr key={opportunity.completeUrl}>
                                    <td className="p-2 border-b">
                                        <a href={opportunity.urlFrom} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-600">
                                            {opportunity.urlFrom}
                                        </a>
                                    </td>
                                    <td className="p-2 border-b">{opportunity.anchorContext}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </main>
    );
};

export default DiscoverOpportunitiesPage;
