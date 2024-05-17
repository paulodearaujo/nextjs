"use client";

import {authorizeWebflow} from '@/lib/auth';

const HomePage = () => {
    return (
        <main className="p-4">
      <header>
        <h1 className="text-2xl font-bold text-center mb-4">InfinitePay Blog Hyperlink Analyzer Tool</h1>
      </header>
      <section className="mb-8 text-center">
        <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={authorizeWebflow}
        >
          Authorize with Webflow
        </button>
      </section>
    </main>
    );
};

export default HomePage;
