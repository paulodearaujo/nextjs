"use client";

import {useState} from 'react';
import type {Link} from '@/types';
import {getUrlVariations, normalizeUrl, validateUrl} from '@/lib/utils';
import {useWebflowData} from '@/context/WebflowDataContext';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";

const BASE_URL = 'https://www.infinitepay.io/blog/';

const IdentifyHyperlinksPage = () => {
    const { webflowData } = useWebflowData();
    const [targetUrl, setTargetUrl] = useState<string>('');
    const [existingLinks, setExistingLinks] = useState<Link[]>([]);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [searchPerformed, setSearchPerformed] = useState<boolean>(false);

    const identifyExistingHyperlinks = () => {
        setExistingLinks([]);
        setErrorMessage('');
        setSearchPerformed(false);

        try {
            if (!targetUrl.trim()) {
                setErrorMessage('Please provide a valid URL.');
                setSearchPerformed(true);
                return;
            }

            if (!validateUrl(targetUrl)) {
                setErrorMessage('Invalid URL provided.');
                setSearchPerformed(true);
                return;
            }

            const urlVariations = getUrlVariations(targetUrl);
            if (urlVariations.length === 0) {
                setErrorMessage('URL normalization failed.');
                setSearchPerformed(true);
                return;
            }

            console.log('URL variations:', urlVariations);

            const links: Link[] = [];

            for (const item of webflowData) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(item.fieldData['post-body'], 'text/html');
                const anchors = Array.from(doc.querySelectorAll('a[href]')) as HTMLAnchorElement[];

                for (const link of anchors) {
                    const normalizedLink = normalizeUrl(link.href);
                    if (normalizedLink && urlVariations.includes(normalizedLink)) {
                        links.push({
                            urlFrom: `${BASE_URL}${item.fieldData.slug}`,
                            anchor: link.textContent || '',
                            completeUrl: link.href,
                            urlTo: link.href,
                            lastUpdated: item.lastUpdated
                        });
                    }
                }
            }

            console.log('Identified links:', links);

            if (!links.length) {
                setErrorMessage('No links found matching the URL.');
            } else {
                setExistingLinks(links);
            }
        } catch (error) {
            console.error('Error in identifyExistingHyperlinks:', error);
            setErrorMessage((error as Error).message);
        }

        setSearchPerformed(true);
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
                        <Input
                            value={targetUrl}
                            onChange={(e) => setTargetUrl(e.target.value)}
                            placeholder="Enter target URL"
                            type="text"
                            className="p-2 border border-gray-700 rounded bg-gray-800 text-white"
                        />
                        <Button onClick={identifyExistingHyperlinks} className="bg-gray-700 text-white hover:bg-gray-600">
                            Identify hyperlinks
                        </Button>
                        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                    </div>
                    {searchPerformed && existingLinks.length > 0 && (
                        <div className="overflow-x-auto">
                            <Table className="min-w-full">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-1/3">From URL</TableHead>
                                        <TableHead className="w-1/3">To URL</TableHead>
                                        <TableHead className="w-1/3">Anchor</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {existingLinks.map((link) => (
                                        <TableRow key={link.completeUrl}>
                                            <TableCell className="break-words">
                                                <a href={link.urlFrom} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-600">
                                                    {link.urlFrom}
                                                </a>
                                            </TableCell>
                                            <TableCell className="break-words">
                                                <a href={link.urlTo} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-600">
                                                    {link.urlTo}
                                                </a>
                                            </TableCell>
                                            <TableCell className="break-words">{link.anchor}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                    {searchPerformed && existingLinks.length === 0 && !errorMessage && (
                        <p className="text-center text-gray-400">No links found for the provided URL.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default IdentifyHyperlinksPage;
