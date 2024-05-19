"use client";

import {usePathname} from "next/navigation";
import Header from "@/components/Header";

const ClientLayout = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const showHeader = !pathname.includes("authorize");

    return (
        <div className="flex flex-col min-h-screen">
      {showHeader && <Header />}
            <main className="flex-grow flex flex-col p-4">{children}</main>
    </div>
    );
};

export default ClientLayout;
