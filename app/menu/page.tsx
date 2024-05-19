"use client";

import Link from "next/link";
import {Button} from "@/components/ui/button";

const MenuPage = () => {
    return (
        <main className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <div className="text-center space-y-4">
        <Button asChild className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600">
          <Link href={{ pathname: '/identify-hyperlinks' }}>Identify Existing Hyperlinks</Link>
        </Button>
        <Button asChild className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600">
          <Link href={{ pathname:'/discover-opportunities' }}>Discover Hyperlink Opportunities</Link>
        </Button>
      </div>
    </main>
    );
};

export default MenuPage;
