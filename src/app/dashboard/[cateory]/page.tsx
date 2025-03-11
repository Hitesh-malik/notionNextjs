'use client';

import { NotionProvider } from "@/context/NotionContext";
import { AppSidebar } from "@/components/app-sidebar";
import { Navbar1 } from "@/components/Navbar1";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { PageBreadcrumb } from "@/components/dashboard/PageBreadcrumb";
import { MainContent } from "@/components/layout/MainContent";
import { useNavigation } from "@/hooks/useNavigation";
import { useTheme } from "@/hooks/useTheme";
import { useNotionContext } from "@/context/NotionContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useEffect } from "react";

export default function Page() {
  // Use custom hooks for navigation and theme
  const { activeNavItem, setActiveNavItem, slug } = useNavigation();
  const { mode, isDark } = useTheme();

  // For debugging - only runs on client side
  useEffect(() => {
    console.log("Theme mode:", mode);
    console.log("Dark mode applied:", isDark);
    console.log("Dark class present:", document.documentElement.classList.contains('dark'));
  }, [mode, isDark]);

  return (
    <NotionProvider>
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
            <div className="w-64 border-r bg-sidebar h-[calc(100vh-64px)] overflow-y-auto hidden md:block">
              <AppSidebar
                className="mt-20"
                activeNavItem={activeNavItem}
              />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Secondary Header with Breadcrumb and theme toggle */}
              <header className="flex h-16 items-center justify-between gap-2 border-b px-4 bg-card sticky top-0 z-40">
                <PageBreadcrumbWrapper activeNavItem={activeNavItem} />
                <ThemeToggle initialMode={mode} />
              </header>

              {/* Main Page Content - Remove window access here */}
              <MainContent 
                activeNavItem={activeNavItem}
                darkMode={isDark}
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