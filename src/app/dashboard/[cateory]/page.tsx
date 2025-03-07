'use client';
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { Navbar1 } from "@/components/Navbar1";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function Page() {
  const pathname = usePathname();

  // Extract the last segment from the URL path
  const getInitialActiveItem = () => {
    // Default to "Docs" if no path segment matches
    let activeItem = "Docs";

    // Get the last part of the URL
    const segments = pathname.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];

    if (lastSegment) {
      // Map URL segments to your navigation items
      if (lastSegment.toLowerCase() === 'blogs') {
        activeItem = "Blog";
      } else if (lastSegment.toLowerCase() === 'docs') {
        activeItem = "Docs";
      }
    }

    return activeItem;
  };

  // Initialize state with the value from URL
  const [activeNavItem, setActiveNavItem] = useState<string>(getInitialActiveItem());

  // State to store the fetched data
  const [notionData, setNotionData] = useState<any[]>([]);

  // State for loading status
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // State for errors
  const [error, setError] = useState<string | null>(null);

  //sidebar menu clicked item
  const [clickedItem, setClickedItem] = useState<string | null>(null);
  console.log("clickedItem", clickedItem);

  // Update activeNavItem when pathname changes
  useEffect(() => {
    setActiveNavItem(getInitialActiveItem());
  }, [pathname]);

  // Handler for updating active nav item
  const handleNavItemChange = (itemTitle: string) => {
    setActiveNavItem(itemTitle);
    console.log("Active navigation item changed to:", itemTitle);
  };

  // Fetch data from Notion API based on active navigation item
  useEffect(() => {
    async function fetchNotionData() {
      // Reset states
      setIsLoading(true);
      setError(null);

      try {
        // Determine the content type based on active navigation item
        let contentType = 'document'; // Default to document

        // Map navigation item names to API content types
        if (activeNavItem.toLowerCase() === 'blog') {
          contentType = 'blog';
        } else if (activeNavItem.toLowerCase() === 'docs') {
          contentType = 'document';
        } else {
          setIsLoading(false);
          return;
        }

        console.log(`Fetching ${contentType} data from Notion...`);

        // Make the API request with the appropriate content type
        const response = await fetch(`/api/notion?type=${contentType}&format=simple`);

        if (!response.ok) {
          throw new Error(`Error fetching ${contentType} data: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`Fetched Notion ${contentType} data:`, data);
        setNotionData(data);
      } catch (err) {
        console.error('Failed to fetch Notion data:', err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(String(err));
        }
      } finally {
        setIsLoading(false);
      }
    }

    // Only fetch if we have a valid navigation item
    if (activeNavItem) {
      fetchNotionData();
    }
  }, [activeNavItem]); // Re-fetch when activeNavItem changes

  return (
    <div className="flex flex-col h-screen">
      {/* Fixed Top Navigation Bar with active state management */}
      <div className="sticky top-0 z-50 border-b bg-background">
        <Navbar1
          activeItem={activeNavItem}
          onActiveChange={handleNavItemChange}
        />
      </div>

      {/* Content Area with Left Sidebar */}
      <div className="flex flex-1 overflow-hidden ">
        {/* App Sidebar (Nav) wrapped in provider but outside the inset */}
        <SidebarProvider>
          <div className="w-64 border-r bg-muted/20 h-[calc(100vh-64px)] overflow-y-auto hidden md:block">
            <AppSidebar
              // className="mt-[1em]" 
              setClickedItem={setClickedItem}
              notionData={notionData}
              isLoading={isLoading}
              activeNavItem={activeNavItem}
            />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Secondary Header with Breadcrumb */}
            <header className="flex h-16 items-center gap-2 border-b px-4 bg-background sticky top-0 z-40">
              <SidebarTrigger className="md:hidden -ml-1" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">
                      {activeNavItem === "Blog" ? "Blog" : "Docs"}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      {activeNavItem === "Blog" ? "Blog Posts" : "Data Fetching"}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>

            {/* Main Page Content */}
            <div className="flex-1 p-4 overflow-y-auto">
              {/* Debug info - remove in production */}
              {/* <div className="mb-4 text-sm text-gray-500">
                Active Nav: {activeNavItem} |
                Items: {notionData.length} |
                Status: {isLoading ? 'Loading...' : error ? 'Error' : 'Ready'} |
                Path: {pathname}
              </div> */}

              <div className="min-h-[40vh] flex-1 rounded-xl bg-muted/50 mt-4" />
            </div>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
}