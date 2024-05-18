"use client";

import {useEffect, useState} from 'react';
import type {Link, Opportunity} from '@/types';
import {fetchWebflowData} from '@/lib/webflow';
import {normalizeUrl, validateUrl} from '@/lib/utils';
import {authorizeWebflow} from '@/lib/auth';

const HyperlinksPage = () => {
    const [targetUrl, setTargetUrl] = useState<string>('');
    const [existingLinks, setExistingLinks] = useState<Link[]>([]);
    const [anchorPotentials, setAnchorPotentials] = useState<string>('');
    const [hyperlinkOpportunities, setHyperlinkOpportunities] = useState<Opportunity[]>([]);
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        const accessToken = query.get('access_token');

        if (accessToken) {
            localStorage.setItem('webflow_access_token', accessToken);
        }
    }, []);

    const clearResults = () => {
        setExistingLinks([]);
        setHyperlinkOpportunities([]);
        setErrorMessage('');
    };

    const identifyExistingHyperlinks = async () => {
        try {
            validateUrl(targetUrl);
            const normalizedTargetUrl = normalizeUrl(targetUrl);

            const accessToken = localStorage.getItem('webflow_access_token');
            if (!accessToken) {
                authorizeWebflow();
                return;
            }

            const data = await fetchWebflowData(accessToken);

            console.log('Fetched data:', data);

            const links = data.items.flatMap((item: { fieldData: { 'post-body': string, slug: string }, Address: string }) => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(item.fieldData['post-body'], 'text/html');
                const anchors = Array.from(doc.querySelectorAll('a[href]')) as HTMLAnchorElement[];
                return anchors
                    .filter(link => normalizeUrl(link.href) === normalizedTargetUrl)
                    .map(link => ({
                        urlFrom: item.fieldData.slug,
                        anchor: link.textContent || '',
                        completeUrl: link.href,
                    }));
            });

            console.log('Identified links:', links);

            if (!links.length) {
                setErrorMessage('No links found matching the URL.');
            } else {
                setExistingLinks(links);
            }
        } catch (error) {
            console.error(error);
            setErrorMessage((error as Error).message);
        }
    };

    const discoverHyperlinkOpportunities = async () => {
        try {
            validateUrl(targetUrl);
            const normalizedTargetUrl = normalizeUrl(targetUrl);
            const anchors = anchorPotentials.split(',').map(a => a.trim().toLowerCase());
            const usedUrls = new Set<string>();

            const accessToken = localStorage.getItem('webflow_access_token');
            if (!accessToken) {
                authorizeWebflow();
                return;
            }

            const data = await fetchWebflowData(accessToken);

            console.log('Fetched data:', data);

            const opportunities: Opportunity[] = data.items.reduce((acc: Opportunity[], item: { fieldData: { 'post-body': string, slug: string }, Address: string }) => {
                if (usedUrls.has(normalizeUrl(item.Address))) return acc;
                const parser = new DOMParser();
                const doc = parser.parseFromString(item.fieldData['post-body'], 'text/html');

                for (const el of Array.from(doc.querySelectorAll('a, h1, h2, h3'))) {
                    el.remove();
                }

                const text = doc.body.textContent || '';

                for (const anchor of anchors) {
                    const regex = new RegExp(`\\b${anchor}\\b`, 'gi');
                    if (regex.test(text.toLowerCase())) {
                        const match = regex.exec(text.toLowerCase());
                        if (match) {
                            const contextStart = Math.max(0, match.index - 30);
                            const contextEnd = Math.min(text.length, match.index + 30);
                            acc.push({
                                urlFrom: item.fieldData.slug,
                                anchorContext: text.substring(contextStart, contextEnd).replace(/\n/g, ' ').trim(),
                                completeUrl: item.fieldData.slug,
                            });
                            usedUrls.add(normalizeUrl(item.Address));
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
            console.error(error);
            setErrorMessage((error as Error).message);
        }
    };

    return (
        <main className="p-4">
            <header>
                <h1 className="text-2xl font-bold text-center mb-4">InfinitePay Blog Hyperlink Analyzer Tool</h1>
            </header>
            <section className="mb-8">
                <h2 className="text-xl font-semibold">Identify Existing Hyperlinks</h2>
                <div className="flex gap-2 my-2">
                    <input
                        value={targetUrl}
                        onChange={e => setTargetUrl(e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded"
                        placeholder="Enter target URL"
                        type="text"
                    />
                    <button
                        type="button"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        onClick={identifyExistingHyperlinks}
                    >
                        Identify Hyperlinks
                    </button>
                    <button
                        type="button"
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        onClick={clearResults}
                    >
                        Clear Results
                    </button>
                </div>
                {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                {existingLinks.length > 0 && (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-2 border-b">From URL</th>
                                <th className="p-2 border-b">Anchor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {existingLinks.map(link => (
                                <tr key={link.completeUrl}>
                                    <td className="p-2 border-b">
                                        <a href={link.urlFrom} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-600">
                                            {link.urlFrom}
                                        </a>
                                    </td>
                                    <td className="p-2 border-b">{link.anchor}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
            <section>
                <h2 className="text-xl font-semibold">Discover Hyperlink Opportunities</h2>
                <div className="flex flex-col gap-2 my-2">
                    <input
                        value={targetUrl}
                        onChange={e => setTargetUrl(e.target.value)}
                        className="p-2 border border-gray-300 rounded"
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
                    <button
                        type="button"
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        onClick={clearResults}
                    >
                        Clear Results
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

export default HyperlinksPage;
