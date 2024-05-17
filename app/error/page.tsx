"use client";

import {useEffect, useState} from 'react';

const ErrorPage = () => {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        const error = query.get('error');
        if (error) {
            setErrorMessage(error);
        }
    }, []);

    return (
        <main className="p-4">
      <header>
        <h1 className="text-2xl font-bold text-center mb-4">Error</h1>
      </header>
      <section className="text-center">
        {errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
        ) : (
            <p>Unknown error occurred.</p>
        )}
      </section>
    </main>
    );
};

export default ErrorPage;
