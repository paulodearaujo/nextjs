"use client";

import {useCallback, useEffect, useState} from 'react';
import type {Link, WebflowItem} from '@/types';
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
    const [isSearching, setIsSearching] = useState<boolean>(false);

    const validateAndNormalizeUrl = useCallback((url: string) => {
        if (!url.trim()) {
            throw new Error('Please provide a valid URL.');
        }

        if (!validateUrl(url)) {
            throw new Error('Invalid URL provided.');
        }

        const urlVariations = getUrlVariations(url);
        if (urlVariations.length === 0) {
            throw new Error('URL normalization failed.');
        }

        return urlVariations;
    }, []);

    const identifyExistingHyperlinks = useCallback(async () => {
        try {
            const urlVariations = validateAndNormalizeUrl(targetUrl);
            console.log('Variações da URL:', urlVariations);

            const links = webflowData.flatMap((item: WebflowItem) => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(item.fieldData['post-body'], 'text/html');
                const anchors = Array.from(doc.querySelectorAll('a[href]')) as HTMLAnchorElement[];
                return anchors
                    .filter(link => {
                        const normalizedHref = normalizeUrl(link.href);
                        return urlVariations.some(variation => normalizedHref === variation);
                    })
                    .map(link => {
                        const textContent = link.textContent || '';
                        const matchIndex = textContent.toLowerCase().indexOf(link.href.toLowerCase());
                        let contextBefore = '';
                        let contextAfter = '';
                        let anchorText = textContent;

                        if (matchIndex >= 0) {
                            let contextStart = Math.max(0, matchIndex - 30);
                            let contextEnd = Math.min(textContent.length, matchIndex + link.href.length + 30);

                            // Ajustar para não truncar palavras no início
                            while (contextStart > 0 && !/\s/.test(textContent[contextStart - 1])) {
                                contextStart--;
                            }

                            // Ajustar para não truncar palavras no fim
                            while (contextEnd < textContent.length && !/\s/.test(textContent[contextEnd])) {
                                contextEnd++;
                            }

                            contextBefore = textContent.substring(contextStart, matchIndex).replace(/\n/g, ' ').trim();
                            contextAfter = textContent.substring(matchIndex + link.href.length, contextEnd).replace(/\n/g, ' ').trim();
                            anchorText = textContent.substring(matchIndex, matchIndex + link.href.length);
                        }

                        return {
                            urlFrom: `${BASE_URL}${item.fieldData.slug}`,
                            anchor: anchorText,
                            completeUrl: link.href,
                            urlTo: link.href,
                            lastUpdated: item.lastUpdated,
                            anchorContext: {
                                before: contextBefore,
                                anchor: anchorText,
                                after: contextAfter,
                            }
                        };
                    });
            });

            console.log('Links identificados:', links);

            if (!links.length) {
                setErrorMessage('No links found matching the URL.');
                console.log('Erro: Nenhum link encontrado que corresponda à URL.');
            } else {
                setExistingLinks(links as Link[]);
                console.log('Estado atualizado: existingLinks', links);
            }
        } catch (error) {
            console.error('Erro na função identifyExistingHyperlinks:', error);
            setErrorMessage((error as Error).message);
        } finally {
            setIsSearching(false);
        }
    }, [targetUrl, validateAndNormalizeUrl, webflowData]);

    useEffect(() => {
        if (isSearching) {
            identifyExistingHyperlinks();
        }
    }, [isSearching, identifyExistingHyperlinks]);

    const initiateSearch = () => {
        setExistingLinks([]);
        setErrorMessage('');
        setIsSearching(true);
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
                        <Button onClick={initiateSearch} className="bg-gray-700 text-white hover:bg-gray-600">
                            {isSearching ? 'Searching...' : 'Identify hyperlinks'}
                        </Button>
                        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                    </div>
                    {existingLinks.length > 0 && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>From URL</TableHead>
                                    <TableHead>To URL</TableHead>
                                    <TableHead>Context</TableHead>
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
                                        <TableCell>
                                            <span>...{link.anchorContext.before} </span>
                                            <strong>{link.anchorContext.anchor}</strong>
                                            <span> {link.anchorContext.after}...</span>
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

export default IdentifyHyperlinksPage;
