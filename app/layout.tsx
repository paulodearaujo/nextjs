import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import {TooltipProvider} from "@/components/ui/tooltip";
import {WebflowDataProvider} from "@/context/WebflowDataContext";
import ClientLayout from "./ClientLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "InfinitePay Blog Hyperlink Analyzer Tool",
    description: "Analyze and discover hyperlink opportunities in blog content",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
      <body className={`${inter.className} flex min-h-screen flex-col bg-gray-900 text-gray-100`}>
        <TooltipProvider>
          <WebflowDataProvider>
            <ClientLayout>{children}</ClientLayout>
          </WebflowDataProvider>
        </TooltipProvider>
      </body>
    </html>
    );
}
