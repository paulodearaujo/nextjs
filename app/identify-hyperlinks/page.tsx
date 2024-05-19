"use client";

import {useState} from 'react';
import type {Link, WebflowItem} from '@/types';
import {normalizeUrl, validateUrl} from '@/lib/utils';
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

            const normalizedTargetUrl = normalizeUrl(targetUrl);
            if (!normalizedTargetUrl) {
                setErrorMessage('URL normalization failed.');
                return;
            }

            console.log('URL validated and normalized:', normalizedTargetUrl);

            const links = webflowData.flatMap((item: WebflowItem) => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(item.fieldData['post-body'], 'text/html');
                const anchors = Array.from(doc.querySelectorAll('a[href]')) as HTMLAnchorElement[];
                return anchors
                    .filter(link => normalizeUrl(link.href) === normalizedTargetUrl)
                    .map(link => ({
                        urlFrom: `${BASE_URL}${item.fieldData.slug}`,
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
            console.error('Error in identifyExistingHyperlinks:', error);
            setErrorMessage((error as Error).message);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <Card className="w-full max-w-4xl mx-auto shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center mb-4">
            Identify Existing Hyperlinks
          </CardTitle>
          <CardDescription className="text-center mb-4">
            Enter a target URL to identify existing hyperlinks in your Webflow content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-4">
            <Input
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="p-2 border border-gray-300 rounded"
                placeholder="Enter target URL"
                type="text"
            />
            <Button onClick={identifyExistingHyperlinks} className="bg-blue-500 text-white hover:bg-blue-600">
              Identify Hyperlinks
            </Button>
              {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          </div>
            {existingLinks.length > 0 && (
                <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From URL</TableHead>
                  <TableHead>Anchor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {existingLinks.map((link) => (
                    <TableRow key={link.completeUrl}>
                    <TableCell>
                      <a href={link.urlFrom} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-600">
                        {link.urlFrom}
                      </a>
                    </TableCell>
                    <TableCell>{link.anchor}</TableCell>
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