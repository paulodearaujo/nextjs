"use client";

import {useCallback, useEffect, useState} from 'react';
import {getAllBackups, getBackupData, getLastBackupDate, saveBackupToSupabase} from '@/lib/supabase';
import {fetchWebflowData} from '@/lib/webflow';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from '@/components/ui/button'; // Corrigir o caminho do import
import type {WebflowResponse} from '@/types';

const SettingsPage = () => {
    const [lastBackupDate, setLastBackupDate] = useState<Date | null>(null);
    const [backups, setBackups] = useState<{ id: number; created_at: Date }[]>([]);
    const [backupData, setBackupData] = useState<WebflowResponse | null>(null);
    const [isBackingUp, setIsBackingUp] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    const fetchLastBackupDate = useCallback(async () => {
        try {
            const date = await getLastBackupDate();
            setLastBackupDate(date);
        } catch (error) {
            console.error('Error fetching last backup date:', error);
            setErrorMessage('Failed to fetch the last backup date.');
        }
    }, []);

    const fetchAllBackups = useCallback(async () => {
        try {
            const backups = await getAllBackups();
            setBackups(backups);
        } catch (error) {
            console.error('Error fetching backups:', error);
            setErrorMessage('Failed to fetch backups.');
        }
    }, []);

    const handleBackup = useCallback(async () => {
        setIsBackingUp(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const accessToken = localStorage.getItem('webflow_access_token');
            if (!accessToken) {
                throw new Error('Missing access token');
            }
            const data = await fetchWebflowData(accessToken);
            await saveBackupToSupabase(data);
            setSuccessMessage('Backup completed successfully.');
            await fetchLastBackupDate();
            await fetchAllBackups();
        } catch (error) {
            console.error('Error during backup:', error);
            setErrorMessage('Failed to complete the backup.');
        } finally {
            setIsBackingUp(false);
        }
    }, [fetchLastBackupDate, fetchAllBackups]);

    const handleViewBackup = useCallback(async (id: number) => {
        try {
            const data = await getBackupData(id);
            setBackupData(data);
        } catch (error) {
            console.error('Error fetching backup data:', error);
            setErrorMessage('Failed to fetch backup data.');
        }
    }, []);

    useEffect(() => {
        fetchLastBackupDate().catch(console.error);
        fetchAllBackups().catch(console.error);
    }, [fetchLastBackupDate, fetchAllBackups]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <Card className="w-full max-w-4xl mx-auto shadow-lg rounded-lg bg-gray-800 text-white">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center mb-4">Settings</CardTitle>
                    <CardDescription className="text-center mb-4">Manage your application settings and data backups.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4 mb-4">
                        <div className="text-center">
                            <p>Last Backup Date: {lastBackupDate ? lastBackupDate.toString() : 'No backups yet.'}</p>
                        </div>
                        <Button onClick={handleBackup} className="bg-gray-700 text-white hover:bg-gray-600" disabled={isBackingUp}>
                            {isBackingUp ? 'Backing up...' : 'Backup Data'}
                        </Button>
                        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                        {successMessage && <p className="text-green-500">{successMessage}</p>}
                        <div className="mt-4">
                            <h2 className="text-xl font-bold text-center mb-2">All Backups</h2>
                            <ul className="list-disc list-inside">
                                {backups.map((backup) => (
                                    <li key={backup.id}>
                                        <span>Backup ID: {backup.id}, Date: {backup.created_at.toString()}</span>
                                        <Button onClick={() => handleViewBackup(backup.id)} className="ml-4">View</Button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {backupData && (
                            <div className="mt-4 p-4 bg-gray-700 rounded">
                                <h2 className="text-xl font-bold mb-2">Backup Data</h2>
                                <pre className="whitespace-pre-wrap">{JSON.stringify(backupData, null, 2)}</pre>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SettingsPage;
