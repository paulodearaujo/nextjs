import {createClient} from '@supabase/supabase-js';
import type {WebflowResponse} from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const saveBackupToSupabase = async (data: WebflowResponse): Promise<void> => {
    const { error } = await supabase.from('webflow_backups').insert([
        {
            data: JSON.stringify(data),
            created_at: new Date(),
        },
    ]);

    if (error) {
        throw new Error(`Failed to save backup to Supabase: ${error.message}`);
    }
};

export const getLastBackupDate = async (): Promise<Date | null> => {
    const { data, error } = await supabase
        .from('webflow_backups')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        console.error(`Failed to fetch last backup date: ${error.message}`);
        return null;
    }

    return data ? new Date(data.created_at) : null;
};

export const getAllBackups = async (): Promise<{ id: number; created_at: Date }[]> => {
    const { data, error } = await supabase
        .from('webflow_backups')
        .select('id, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        console.error(`Failed to fetch backups: ${error.message}`);
        throw new Error(`Failed to fetch backups: ${error.message}`);
    }

    return data.map(item => ({
        id: item.id,
        created_at: new Date(item.created_at)
    }));
};

export const getBackupData = async (id: number): Promise<WebflowResponse> => {
    const { data, error } = await supabase
        .from('webflow_backups')
        .select('data')
        .eq('id', id)
        .single();

    if (error) {
        console.error(`Failed to fetch backup data: ${error.message}`);
        throw new Error(`Failed to fetch backup data: ${error.message}`);
    }

    return JSON.parse(data.data);
};
