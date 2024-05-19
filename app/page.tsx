"use client";

import {authorizeWebflow} from "@/lib/auth";
import {KeyRound} from 'lucide-react';
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";

const HomePage = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <Card className="w-full max-w-md mx-auto shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center mb-4 text-white">
            InfinitePay Blog Hyperlink Analyzer Tool
          </CardTitle>
          <CardDescription className="text-center mb-4 text-gray-400">
            Authorize with Webflow to start analyzing your blog content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <Button onClick={authorizeWebflow} className="bg-blue-500 text-white hover:bg-blue-600">
              <KeyRound className="mr-2 h-4 w-4" /> Authorize with Webflow
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    );
};

export default HomePage;
