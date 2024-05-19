"use client";

import {useState} from 'react';
import type {Link, WebflowItem} from '@/types';
import {normalizeUrl, validateUrl} from '@/lib/utils';
import {useWebflowData} from '@/context/WebflowDataContext';

const BASE_URL = 'https://www.infinitepay.io/blog/'; // Substitua pelo URL base real de sua aplicação

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
        <main className="p-4">
            <header>
                <h1 className="text-2xl font-bold text-center mb-4">Identify Existing Hyperlinks</h1>
            </header>
            <section className="mb-8">
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
        </main>
    );
};

export default IdentifyHyperlinksPage;
