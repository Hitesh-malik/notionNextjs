'use client';

import { useEffect } from "react";
import { NotionProvider } from "@/context/NotionContext";
import { AppSidebar } from "@/components/app-sidebar";
import { Navbar1 } from "@/components/Navbar1";
import { DarkModeToggle } from "@/components/dashboard/DarkModeToggle";
import { PageBreadcrumb } from "@/components/dashboard/PageBreadcrumb";
import { MainContent } from "@/components/layout/MainContent";
import { useNavigation } from "@/hooks/useNavigation";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useNotionContext } from "@/context/NotionContext";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function Page() {
  // Use custom hooks for navigation and dark mode
  const { activeNavItem, setActiveNavItem, slug } = useNavigation();
  const { darkMode } = useDarkMode();

  // Add a debugging useEffect
  useEffect(() => {
    console.log("Page rendered with darkMode:", darkMode);
    console.log("Current document classes:", document.documentElement.classList.toString());
  }, [darkMode]);

  return (
    <NotionProvider>
      {/* Don't add the dark class here since it's managed by useDarkMode */}
      <div className="flex flex-col h-screen">
        {/* Fixed Top Navigation Bar with active state management */}
        <div className="sticky top-0 z-50 border-b bg-background">
          <Navbar1
            activeItem={activeNavItem}
            onActiveChange={setActiveNavItem}
          />
        </div>

        {/* Content Area with Left Sidebar */}
        <div className="flex flex-1 overflow-hidden">
          {/* App Sidebar (Nav) wrapped in provider but outside the inset */}
          <SidebarProvider>
            <div className="w-64 border-r bg-muted/20 h-[calc(100vh-64px)] overflow-y-auto hidden md:block">
              <AppSidebar
                className="mt-20"
                activeNavItem={activeNavItem}
              />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Secondary Header with Breadcrumb and dark mode toggle */}
              <header className="flex h-16 items-center justify-between gap-2 border-b px-4 bg-background sticky top-0 z-40">
                <PageBreadcrumbWrapper activeNavItem={activeNavItem} />
                <DarkModeToggle />
              </header>

              {/* Main Page Content */}
              <MainContent 
                activeNavItem={activeNavItem}
                darkMode={darkMode}
                slug={slug}
              />
            </div>
          </SidebarProvider>
        </div>
      </div>
    </NotionProvider>
  );
}

// Helper component for PageBreadcrumb that connects to context
function PageBreadcrumbWrapper({ activeNavItem }: { activeNavItem: string }) {
  const { clickedItem } = useNotionContext();
  return <PageBreadcrumb activeNavItem={activeNavItem} clickedItem={clickedItem} />;
}