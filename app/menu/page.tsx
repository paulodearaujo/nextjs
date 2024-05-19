"use client";

import Link from "next/link";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

const MenuPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <Card className="w-full max-w-md mx-auto shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center mb-4 text-white">
            InfinitePay Blog Hyperlink Analyzer Tool
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
                                <Link href={{ pathname: '/identify-hyperlinks' }}
 className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-center">
              Identify Existing Hyperlinks
            </Link>
                                <Link href={{ pathname:'/discover-opportunities' }}
 className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-center">
              Discover Hyperlink Opportunities
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
    );
};

export default MenuPage;
