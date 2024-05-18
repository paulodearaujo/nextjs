import {type ClassValue, clsx} from 'clsx';
import {twMerge} from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const validateUrl = (url: string) => {
  try {
    new URL(url);
  } catch (error) {
    throw new Error('Invalid URL');
  }
};

export const normalizeUrl = (url: string) => {
  const normalizedUrl = new URL(url);
  return normalizedUrl.origin + normalizedUrl.pathname;
};
