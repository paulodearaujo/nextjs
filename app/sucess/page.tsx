"use client";

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';

const SuccessPage = () => {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        const token = query.get('access_token');
        if (token) {
            setAccessToken(token);
            localStorage.setItem('webflow_access_token', token);
        }
    }, []);

    return (
        <main className="p-4">
      <header>
        <h1 className="text-2xl font-bold text-center mb-4">Authorization Successful</h1>
      </header>
      <section>
        {accessToken ? (
            <div className="text-center">
            <p className="mb-4">Your authorization was successful!</p>
            <p className="mb-4">Access Token: {accessToken}</p>
            <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={() => router.push('/hyperlinks')}
            >
              Go to Hyperlinks Analysis
            </button>
          </div>
        ) : (
            <p className="text-center text-red-500">No access token found.</p>
        )}
      </section>
    </main>
    );
};

export default SuccessPage;
