import {type ClassValue, clsx} from "clsx";
import {twMerge} from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const normalizeUrl = (url: string): string | null => {
  try {
    const normalizedUrl = new URL(url);
    return normalizedUrl.origin + normalizedUrl.pathname;
  } catch (e) {
    console.warn(`Normalization failed for URL: ${url}`);
    return null;
  }
};

export const removeQueryParams = (url: string): string => {
  try {
    const urlObj = new URL(url);
    urlObj.search = '';
    urlObj.hash = '';
    return urlObj.toString();
  } catch {
    return url;
  }
};

export const getUrlVariations = (url: string): string[] => {
  const normalizedUrl = normalizeUrl(url);
  if (!normalizedUrl) return [];

  const noProtocol = normalizedUrl.replace(/^https?:\/\//, '');
  const noWww = noProtocol.replace(/^www\./, '');
  const variations = [
    normalizedUrl,
    normalizedUrl.replace(/^https:\/\//, 'http://'),
    normalizedUrl.replace(/^http:\/\//, 'https://'),
    `https://www.${noWww}`,
    `http://www.${noWww}`,
    normalizedUrl.replace(/\/$/, ''),
    `${normalizedUrl}/`,
    removeQueryParams(normalizedUrl),
    removeQueryParams(normalizedUrl.replace(/\/$/, '')),
    removeQueryParams(`${normalizedUrl}/`),
    noProtocol,
    `http://${noProtocol}`,
    `https://${noProtocol}`,
    `http://www.${noWww}`,
    `https://www.${noWww}`,
    removeQueryParams(noProtocol),
    removeQueryParams(`http://${noProtocol}`),
    removeQueryParams(`https://${noProtocol}`),
    removeQueryParams(`http://www.${noWww}`),
    removeQueryParams(`https://www.${noWww}`),
    noWww,
    removeQueryParams(noWww),
    noWww.replace(/\/$/, ''),
    removeQueryParams(noWww.replace(/\/$/, ''))
  ];

  // Remover duplicatas de variações de URL
  return Array.from(new Set(variations));
};


export function formatDate(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}