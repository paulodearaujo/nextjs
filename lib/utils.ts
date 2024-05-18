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
