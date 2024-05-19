"use client";

import {useState} from 'react';
import type {Opportunity, WebflowItem} from '@/types';
import {filterByDateRange, normalizeUrl, validateUrl} from '@/lib/utils';
import {useWebflowData} from '@/context/WebflowDataContext';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {DateRangePicker} from '@/components/ui/date-picker-range';
import type {DateRange} from 'react-day-picker';

const BASE_URL = 'https://www.infinitepay.io/blog/';

const DiscoverOpportunitiesPage = () => {
    const { webflowData } = useWebflowData();
    const [targetUrl, setTargetUrl] = useState<string>('');
    const [anchorPotentials, setAnchorPotentials] = useState<string>('');
    const [hyperlinkOpportunities, setHyperlinkOpportunities] = useState<Opportunity[]>([]);
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
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

            if (!anchorPotentials) {
                setErrorMessage('No anchor potentials provided.');
                return;
            }

            const anchors = anchorPotentials.split(',').map(a => a.trim().toLowerCase()).filter(a => a);

            if (anchors.length === 0) {
                setErrorMessage('No valid anchors provided.');
                return;
            }

            const usedUrls = new Set<string>();

            let opportunities: Opportunity[] = webflowData.reduce((acc: Opportunity[], item: WebflowItem) => {
                const itemSlug = item.fieldData.slug;
                if (!itemSlug) {
                    return acc;
                }

                const itemUrl = `${BASE_URL}${itemSlug}`;
                if (normalizedTargetUrl === itemUrl) {
                    return acc;
                }

                const parser = new DOMParser();
                const doc = parser.parseFromString(item.fieldData['post-body'], 'text/html');

                for (const el of Array.from(doc.querySelectorAll('a, h1, h2, h3'))) {
                    el.remove();
                }

                const text = doc.body.textContent || '';

                for (const anchor of anchors) {
                    const regex = new RegExp(`\\b${anchor}\\b`, 'gi');
                    const matches = text.toLowerCase().matchAll(regex);

                    for (const match of matches) {
                        if (match.index !== undefined) {
                            const surroundingHTML = text.substring(Math.max(0, match.index - 30), Math.min(text.length, match.index + 30));
                            if (surroundingHTML.includes('<a')) {
                                continue;
                            }

                            const contextStart = Math.max(0, match.index - 30);
                            const contextEnd = Math.min(text.length, match.index + 30);
                            const anchorContext = text.substring(contextStart, contextEnd).replace(/\n/g, ' ').trim();

                            if (!usedUrls.has(itemUrl)) {
                                acc.push({
                                    urlFrom: itemUrl,
                                    anchorContext: anchorContext,
                                    completeUrl: itemUrl,
                                    lastUpdated: item.lastUpdated,
                                });
                                usedUrls.add(itemUrl);
                            }
                        }
                    }
                }

                return acc;
            }, []);

            if (dateRange?.from && dateRange?.to) {
                opportunities = filterByDateRange(opportunities, { from: dateRange.from, to: dateRange.to }, "lastUpdated");
            }

            if (!opportunities.length) {
                setErrorMessage('No hyperlink opportunities found.');
            } else {
                setHyperlinkOpportunities(opportunities);
                setErrorMessage('');
            }
        } catch (error) {
            console.error('Error in discoverHyperlinkOpportunities:', error);
            setErrorMessage((error as Error).message);
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
                        <Input value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} placeholder="Enter target URL for opportunities" type="text" className="p-2 border border-gray-700 rounded bg-gray-800 text-white" />
                        <Input value={anchorPotentials} onChange={(e) => setAnchorPotentials(e.target.value)} placeholder="Enter potential anchors, separated by commas" type="text" className="p-2 border border-gray-700 rounded bg-gray-800 text-white" />
                        <DateRangePicker range={dateRange} setRange={setDateRange} />
                        <Button onClick={discoverHyperlinkOpportunities} className="bg-gray-700 text-white hover:bg-gray-600">Discover opportunities</Button>
                        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                    </div>
                    {hyperlinkOpportunities.length > 0 && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>From URL</TableHead>
                                    <TableHead>Context</TableHead>
                                    <TableHead>Last Updated</TableHead>
                                </TableRow>
                            </TableHeader>
<TableBody>
    {hyperlinkOpportunities.map((opportunity) => (
        <TableRow key={opportunity.completeUrl}>
            <TableCell>
                <a href={opportunity.urlFrom} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-600">{opportunity.urlFrom}</a>
            </TableCell>
            <TableCell>{opportunity.anchorContext}</TableCell>
            <TableCell>{opportunity.lastUpdated}</TableCell>
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
