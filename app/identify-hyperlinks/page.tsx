"use client";

import {useState} from 'react';
import type {Link, WebflowItem} from '@/types';
import {filterByDateRange, getUrlVariations, normalizeUrl, validateUrl} from '@/lib/utils';
import {useWebflowData} from '@/context/WebflowDataContext';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {DateRangePicker} from '@/components/ui/date-picker-range';
import type {DateRange} from 'react-day-picker';

const BASE_URL = 'https://www.infinitepay.io/blog/';

const IdentifyHyperlinksPage = () => {
    const { webflowData } = useWebflowData();
    const [targetUrl, setTargetUrl] = useState<string>('');
    const [existingLinks, setExistingLinks] = useState<Link[]>([]);
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const identifyExistingHyperlinks = () => {
        try {
            if (!targetUrl.trim()) {
                setErrorMessage('Please provide a valid URL.');
                return;
            }

            if (!validateUrl(targetUrl)) {
                setErrorMessage('Invalid URL provided.');
                return;
            }

            const urlVariations = getUrlVariations(targetUrl);
            if (urlVariations.length === 0) {
                setErrorMessage('URL normalization failed.');
                return;
            }

            const links = webflowData.flatMap((item: WebflowItem) => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(item.fieldData['post-body'], 'text/html');
                const anchors = Array.from(doc.querySelectorAll('a[href]')) as HTMLAnchorElement[];
                return anchors
                    .filter(link => urlVariations.includes(normalizeUrl(link.href) || ''))
                    .map(link => ({
                        urlFrom: `${BASE_URL}${item.fieldData.slug}`,
                        anchor: link.textContent || '',
                        completeUrl: link.href,
                        urlTo: link.href,
                        lastUpdated: item.lastUpdated,
                    }));
            });

            if (dateRange?.from && dateRange?.to) {
                setExistingLinks(filterByDateRange(links, { from: dateRange.from, to: dateRange.to }, "lastUpdated"));
            } else {
                setExistingLinks(links);
            }

            if (!links.length) {
                setErrorMessage('No links found matching the URL.');
            } else {
                setErrorMessage('');
            }
        } catch (error) {
            console.error('Error in identifyExistingHyperlinks:', error);
            setErrorMessage((error as Error).message);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <Card className="w-full max-w-4xl mx-auto shadow-lg rounded-lg bg-gray-800 text-white">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center mb-4">Identify Existing Hyperlinks</CardTitle>
                    <CardDescription className="text-center mb-4">Enter a target URL to identify existing hyperlinks in blog content.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4 mb-4">
                        <Input value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} placeholder="Enter target URL to identify" type="text" className="p-2 border border-gray-700 rounded bg-gray-800 text-white" />
                        <DateRangePicker range={dateRange} setRange={setDateRange} />
                        <Button onClick={identifyExistingHyperlinks} className="bg-gray-700 text-white hover:bg-gray-600">Identify hyperlinks</Button>
                        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                    </div>
                    {existingLinks.length > 0 && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>From URL</TableHead>
                                    <TableHead>To URL</TableHead>
                                    <TableHead>Anchor</TableHead>
                                    <TableHead>Last Updated</TableHead>
                                </TableRow>
                            </TableHeader>
<TableBody>
    {existingLinks.map((link) => (
        <TableRow key={link.completeUrl}>
            <TableCell>
                <a href={link.urlFrom} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-600">{link.urlFrom}</a>
            </TableCell>
            <TableCell>
                <a href={link.urlTo} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-600">{link.urlTo}</a>
            </TableCell>
            <TableCell>{link.anchor}</TableCell>
            <TableCell>{link.lastUpdated}</TableCell>
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

export default IdentifyHyperlinksPage;
