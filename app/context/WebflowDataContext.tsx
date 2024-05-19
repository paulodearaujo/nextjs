"use client";

import {createContext, type ReactNode, useCallback, useContext, useEffect, useState} from 'react';
import {fetchWebflowData} from '@/lib/webflow';
import {authorizeWebflow} from '@/lib/auth';
import type {WebflowItem} from '@/types';

interface WebflowDataContextProps {
    webflowData: WebflowItem[];
    fetchWebflowItems: () => Promise<void>;
}

const WebflowDataContext = createContext<WebflowDataContextProps | undefined>(undefined);

export const WebflowDataProvider = ({ children }: { children: ReactNode }) => {
    const [webflowData, setWebflowData] = useState<WebflowItem[]>([]);

    const fetchWebflowItems = useCallback(async () => {
        try {
            const accessToken = localStorage.getItem('webflow_access_token');
            if (!accessToken) {
                console.log('No access token found, redirecting to authorize...');
                authorizeWebflow();
                return;
            }

            const data = await fetchWebflowData(accessToken);
            setWebflowData(data.items);
            console.log('Fetched webflow items:', data.items);
        } catch (error) {
            console.error('Error fetching Webflow items:', error);
        }
    }, []);

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        const accessToken = query.get('access_token');

        if (accessToken) {
            localStorage.setItem('webflow_access_token', accessToken);
        }

        fetchWebflowItems().catch(error => {
            console.error('Error in useEffect while fetching Webflow items:', error);
        });
    }, [fetchWebflowItems]); // Add fetchWebflowItems to the dependency array

    return (
        <WebflowDataContext.Provider value={{ webflowData, fetchWebflowItems }}>
            {children}
        </WebflowDataContext.Provider>
    );
};

export const useWebflowData = () => {
    const context = useContext(WebflowDataContext);
    if (!context) {
        throw new Error('useWebflowData must be used within a WebflowDataProvider');
    }
    return context;
};
