'use client';

import {useState} from 'react';
import {Link, Opportunity} from '@/types';
import {fetchWebflowData} from '@/lib/api';

const normalizeUrl = (url: string): string => {
  const normalized = new URL(url);
  normalized.hostname = normalized.hostname.replace('www.', '');
  normalized.protocol = 'https:';
  normalized.pathname = normalized.pathname.replace(/\/$/, ''); // Remove trailing slash
  return normalized.toString();
};

const validateUrl = (input: string): void => {
  if (!/^https?:\/\/\S+$/.test(input)) {
    throw new Error(`Invalid URL: ${input}`);
  }
};

const HomePage = () => {
  const [targetUrl, setTargetUrl] = useState<string>('');
  const [existingLinks, setExistingLinks] = useState<Link[]>([]);
  const [anchorPotentials, setAnchorPotentials] = useState<string>('');
  const [hyperlinkOpportunities, setHyperlinkOpportunities] = useState<Opportunity[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const clearResults = () => {
    setExistingLinks([]);
    setHyperlinkOpportunities([]);
    setErrorMessage('');
  };

  const identifyExistingHyperlinks = async () => {
    try {
      validateUrl(targetUrl);
      const normalizedTargetUrl = normalizeUrl(targetUrl);

      const data = await fetchWebflowData();

      const links = data.items.flatMap((item: any) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(item.fieldData['post-body'], 'text/html');
        const links = Array.from(doc.querySelectorAll('a[href]')) as HTMLAnchorElement[];
        return links
            .filter(link => normalizeUrl(link.href) === normalizedTargetUrl)
            .map(link => ({
              urlFrom: item.fieldData['slug'],
              anchor: link.textContent || '',
              completeUrl: link.href,
            }));
      });

      if (!links.length) setErrorMessage('No links found matching the URL.');
      setExistingLinks(links);
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

      const data = await fetchWebflowData();

      const opportunities: Opportunity[] = data.items.reduce((acc: Opportunity[], item: any) => {
        if (usedUrls.has(normalizeUrl(item.Address))) return acc;
        const parser = new DOMParser();
        const doc = parser.parseFromString(item['Content 1'], 'text/html');
        doc.querySelectorAll('a, h1, h2, h3').forEach(el => el.remove());
        const text = doc.body.textContent || '';

        anchors.forEach(anchor => {
          const regex = new RegExp(`\\b${anchor}\\b`, 'gi');
          if (regex.test(text.toLowerCase())) {
            const match = regex.exec(text.toLowerCase());
            if (match) {
              const contextStart = Math.max(0, match.index - 30);
              const contextEnd = Math.min(text.length, match.index + 30);
              acc.push({
                urlFrom: item.Address,
                anchorContext: text.substring(contextStart, contextEnd).replace(/\n/g, ' ').trim(),
                completeUrl: item.Address,
              });
              usedUrls.add(normalizeUrl(item.Address));
            }
          }
        });

        return acc;
      }, []);

      if (!opportunities.length) setErrorMessage('No hyperlink opportunities found.');
      setHyperlinkOpportunities(opportunities);
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
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={identifyExistingHyperlinks}
          >
            Identify Hyperlinks
          </button>
          <button
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
              {existingLinks.map((link, index) => (
                  <tr key={index}>
                  <td className="p-2 border-b">
                    <a href={link.urlFrom} target="_blank" className="text-blue-500 hover:text-blue-600">
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
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={discoverHyperlinkOpportunities}
          >
            Discover Opportunities
          </button>
          <button
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
              {hyperlinkOpportunities.map((opportunity, index) => (
                  <tr key={index}>
                  <td className="p-2 border-b">
                    <a href={opportunity.urlFrom} target="_blank" className="text-blue-500 hover:text-blue-600">
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

export default HomePage;
