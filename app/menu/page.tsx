"use client";

import Link from 'next/link';
import {useWebflowData} from '@/context/WebflowDataContext';

const MenuPage = () => {
    // Não usamos webflowData nesta página, então removemos a desestruturação
    useWebflowData();

    return (
        <main className="p-4">
            <header>
                <h1 className="text-2xl font-bold text-center mb-4">InfinitePay Blog Hyperlink Analyzer Tool</h1>
            </header>
            <section className="mb-8">
                <h2 className="text-xl font-semibold">Choose an Option</h2>
                <div className="flex flex-col gap-2 my-2">
                    <Link href={{ pathname: '/identify-hyperlinks' }}>
                        <a href="/identify-hyperlinks" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-center">
                            Identify Existing Hyperlinks
                        </a>
                    </Link>
                    <Link href={{ pathname:'/discover-opportunities' }}>
                        <a href="/discover-opportunities" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-center">
                            Discover Hyperlink Opportunities
                        </a>
                    </Link>
                </div>
            </section>
        </main>
    );
};

export default MenuPage;
