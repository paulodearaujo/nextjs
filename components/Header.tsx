"use client";

import {Home, LineChart, Link as LinkIcon, Settings} from "lucide-react";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import Link from "next/link";
import {usePathname} from "next/navigation";

const Header = () => {
  const pathname = usePathname();
  const isLoggedIn = pathname !== "/";

  if (!isLoggedIn) {
    return null;
  }
  return (
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-gray-800 sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link href={{ pathname:'/menu' }} className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base">
          <Home className="h-4 w-4 transition-all group-hover:scale-110" />
          <span className="sr-only">Menu</span>
        </Link>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={{ pathname: '/identify-hyperlinks' }} className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8">
              <LinkIcon className="h-5 w-5" />
              <span className="sr-only">Identify hperlinks</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Identify hyperlinks</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={{ pathname:'/discover-opportunities' }} className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8">
              <LineChart className="h-5 w-5" />
              <span className="sr-only">Discover opportunities</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Discover opportunities</TooltipContent>
        </Tooltip>
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={{ pathname:'/settings' }} className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Settings</TooltipContent>
        </Tooltip>
      </nav>
    </aside>
  );
};

export default Header;
