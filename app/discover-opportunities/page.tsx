"use client";

import {useCallback, useEffect, useState} from 'react';
import type {AnchorContext, Opportunity, WebflowItem} from '@/types';
import {normalizeUrl, validateUrl} from '@/lib/utils';
import {useWebflowData} from '@/context/WebflowDataContext';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {restoreItemToWebflow, sendItemToWebflow} from '@/lib/webflow';

const BASE_URL = 'https://www.infinitepay.io/blog/';
const COLLECTION_ID = process.env.NEXT_PUBLIC_WEBFLOW_COLLECTION_ID;

if (!COLLECTION_ID) {
    throw new Error("Missing environment variable: NEXT_PUBLIC_WEBFLOW_COLLECTION_ID");
}

type OpportunityWithContext = Omit<Opportunity, 'anchorContext'> & {
    anchorContext: AnchorContext;
};

const DiscoverOpportunitiesPage = () => {
    const { webflowData } = useWebflowData();
    const [targetUrl, setTargetUrl] = useState<string>('');
    const [anchorPotentials, setAnchorPotentials] = useState<string>('');
    const [hyperlinkOpportunities, setHyperlinkOpportunities] = useState<OpportunityWithContext[]>([]);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
    const [sentBacklink, setSentBacklink] = useState<{ [key: string]: boolean }>({});

    const validateAndNormalizeUrl = useCallback((url: string) => {
        if (!url.trim()) {
            return '';
        }

        if (!validateUrl(url)) {
            throw new Error('Invalid URL provided.');
        }

        const normalizedUrl = normalizeUrl(url);
        if (!normalizedUrl) {
            throw new Error('URL normalization failed.');
        }

        return normalizedUrl;
    }, []);

    const processAnchors = useCallback((anchors: string) => {
        if (!anchors.trim()) {
            throw new Error('No anchor potentials provided.');
        }

        const anchorList = anchors.split(',').map(a => a.trim().toLowerCase()).filter(a => a);
        if (anchorList.length === 0) {
            throw new Error('No valid anchors provided.');
        }

        return anchorList;
    }, []);

    const discoverHyperlinkOpportunities = useCallback(async () => {
        try {
            const normalizedTargetUrl = targetUrl.trim() ? validateAndNormalizeUrl(targetUrl) : '';
            if (targetUrl.trim() && !normalizedTargetUrl) {
                throw new Error('Invalid or empty target URL.');
            }
            console.log('URL validated and normalized:', normalizedTargetUrl);

            const anchors = processAnchors(anchorPotentials);
            console.log('Anchor potentials:', anchors);

            const usedUrls = new Set<string>();

            const opportunities: OpportunityWithContext[] = webflowData.reduce((acc: OpportunityWithContext[], item: WebflowItem) => {
                const itemSlug = item.fieldData.slug;
                if (!itemSlug) {
                    console.warn(`Item without slug found: ${item.id}`);
                    return acc;
                }

                const itemUrl = `${BASE_URL}${itemSlug}`;
                if (normalizedTargetUrl && normalizedTargetUrl === itemUrl) {
                    console.log(`Skipping target URL itself: ${itemUrl}`);
                    return acc;
                }

                const parser = new DOMParser();
                const doc = parser.parseFromString(item.fieldData['post-body'], 'text/html');
                console.log(`Parsed content for item: ${itemSlug}`);

                for (const el of Array.from(doc.querySelectorAll('a, h1, h2, h3'))) {
                    el.remove();
                }

                const text = doc.body.textContent || '';
                console.log(`Processed text content: ${text.substring(0, 100)}...`);

                for (const anchor of anchors) {
                    const regex = new RegExp(`\\b(${anchor})\\b`, 'gi');
                    console.log(`Searching for anchor: ${anchor} using regex: ${regex}`);
                    const matches = text.matchAll(regex);

                    for (const match of matches) {
                        if (match.index !== undefined) {
                            let contextStart = Math.max(0, match.index - 30);
                            let contextEnd = Math.min(text.length, match.index + anchor.length + 30);

                            // Ajustar para não truncar palavras no início
                            while (contextStart > 0 && !/\s/.test(text[contextStart - 1])) {
                                contextStart--;
                            }

                            // Ajustar para não truncar palavras no fim
                            while (contextEnd < text.length && !/\s/.test(text[contextEnd])) {
                                contextEnd++;
                            }

                            const contextBefore = text.substring(contextStart, match.index).replace(/\n/g, ' ').trim();
                            const contextAfter = text.substring(match.index + anchor.length, contextEnd).replace(/\n/g, ' ').trim();
                            const anchorContext: AnchorContext = { before: contextBefore, anchor: match[0], after: contextAfter };
                            console.log(`Match found: ...${contextBefore} <strong>${match[0]}</strong> ${contextAfter}...`);

                            if (!usedUrls.has(itemUrl)) {
                                acc.push({
                                    id: item.id,
                                    urlFrom: itemUrl,
                                    anchorContext: anchorContext,
                                    completeUrl: itemUrl,
                                    lastUpdated: item.lastUpdated || '',
                                    collectionId: COLLECTION_ID
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
        } finally {
            setIsSearching(false);
        }
    }, [anchorPotentials, targetUrl, validateAndNormalizeUrl, processAnchors, webflowData]);

    useEffect(() => {
        if (isSearching) {
            const runDiscovery = async () => {
                await discoverHyperlinkOpportunities();
            };
            runDiscovery().catch(console.error); // Ensuring the promise is handled correctly
        }
    }, [isSearching, discoverHyperlinkOpportunities]);

    const initiateSearch = () => {
        setHyperlinkOpportunities([]);
        setErrorMessage('');
        setIsSearching(true);
    };

    const handleSendBacklink = async (id: string, urlFrom: string, anchor: string) => {
        setLoading(prev => ({ ...prev, [id]: true }));
        try {
            console.log('Sending backlink:', { id, urlFrom, anchor, collectionId: COLLECTION_ID });
            await sendItemToWebflow(id, urlFrom, anchor);
            setSentBacklink(prev => ({ ...prev, [id]: true }));
        } catch (error) {
            console.error('Error sending backlink:', error);
            setErrorMessage('Failed to send backlink.');
        } finally {
            setLoading(prev => ({ ...prev, [id]: false }));
        }
    };

    const handleRestoreItem = async (id: string) => {
        setLoading(prev => ({ ...prev, [id]: true }));
        try {
            await restoreItemToWebflow(id);
            setErrorMessage('');
        } catch (error) {
            console.error('Error restoring item:', error);
            setErrorMessage('Failed to restore item.');
        } finally {
            setLoading(prev => ({ ...prev, [id]: false }));
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <Card className="w-full max-w-4xl mx-auto shadow-lg rounded-lg bg-gray-800 text-white">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center mb-4">Discover Hyperlink Opportunities</CardTitle>
                    <CardDescription className="text-center mb-4">Enter a target URL and potential anchors to discover hyperlink opportunities in blog content.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4 mb-4">
                        <Input
                            value={targetUrl}
                            onChange={(e) => setTargetUrl(e.target.value)}
                            placeholder="Enter target URL for opportunities"
                            type="text"
                            className="p-2 border border-gray-700 rounded bg-gray-800 text-white"
                        />
                        <Input
                            value={anchorPotentials}
                            onChange={(e) => setAnchorPotentials(e.target.value)}
                            placeholder="Enter potential anchors, separated by commas"
                            type="text"
                            className="p-2 border border-gray-700 rounded bg-gray-800 text-white"
                        />
                        <Button onClick={initiateSearch} className="bg-gray-700 text-white hover:bg-gray-600">
                            {isSearching ? 'Searching...' : 'Discover opportunities'}
                        </Button>
                        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                    </div>
                    {hyperlinkOpportunities.length > 0 && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>From URL</TableHead>
                                    <TableHead>Context</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {hyperlinkOpportunities.map((opportunity) => (
                                    <TableRow key={opportunity.id}>
                                        <TableCell>
                                            <a href={opportunity.urlFrom} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-600">{opportunity.urlFrom}</a>
                                        </TableCell>
                                        <TableCell>
                                            <span>...{opportunity.anchorContext.before} </span>
                                            <strong>{opportunity.anchorContext.anchor}</strong>
                                            <span> {opportunity.anchorContext.after}...</span>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                onClick={() => handleSendBacklink(opportunity.id, opportunity.completeUrl, opportunity.anchorContext.anchor)}
                                                className="bg-green-700 text-white hover:bg-green-600 mr-2"
                                                disabled={loading[opportunity.id]}
                                            >
                                                {loading[opportunity.id] ? 'Sending...' : 'Send Backlink'}
                                            </Button>
                                            {sentBacklink[opportunity.id] && (
                                                <Button
                                                    onClick={() => handleRestoreItem(opportunity.id)}
                                                    className="bg-red-700 text-white hover:bg-red-600"
                                                    disabled={loading[opportunity.id]}
                                                >
                                                    {loading[opportunity.id] ? 'Restoring...' : 'Restore Item'}
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default DiscoverOpportunitiesPage;
