import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import {TooltipProvider} from "@/components/ui/tooltip";
import {WebflowDataProvider} from "@/context/WebflowDataContext";
import type {ReactNode} from "react";
import ClientOnly from "@/components/ClientOnly";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "InfinitePay Blog Hyperlink Analyzer Tool",
    description: "Analyze and discover hyperlink opportunities in blog content.",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: ReactNode;
}) {
    return (
        <html lang="en">
      <body className={`${inter.className} flex min-h-screen flex-col bg-gray-900 text-gray-100`}>
        <TooltipProvider>
          <WebflowDataProvider>
            <ClientOnly>
              <Header />
            </ClientOnly>
            <main className="flex-grow flex flex-col p-4">{children}</main>
          </WebflowDataProvider>
        </TooltipProvider>
      </body>
    </html>
    );
}
