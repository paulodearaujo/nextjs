"use client";

import {authorizeWebflow} from '@/lib/auth';
import {Mail} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";

const HomePage = () => {
    return (
        <main className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-md mx-auto shadow-lg rounded-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center mb-4">
                        InfinitePay Blog Hyperlink Analyzer Tool
                    </CardTitle>
                    <CardDescription className="text-center mb-4">
                        Authorize with Webflow to start analyzing your blog content.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center">
                        <Button onClick={authorizeWebflow} className="bg-blue-500 text-white hover:bg-blue-600">
                            <Mail className="mr-2 h-4 w-4" /> Authorize with Webflow
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
};

export default HomePage;
