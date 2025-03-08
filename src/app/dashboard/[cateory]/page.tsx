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

// Import react-notion-x and related dependencies
import { NotionRenderer } from 'react-notion-x';
import type { ExtendedRecordMap } from 'notion-types';
// Import required styles
import 'react-notion-x/src/styles.css';
// Uncomment these if you need additional styling features
// import 'prismjs/themes/prism-tomorrow.css'; // For code syntax highlighting
// import 'katex/dist/katex.min.css'; // For math equations

// Define types for the Notion data
interface NotionItem {
  id: string;
  title: string;
  url?: string;
  // Add any other properties that might be present in your Notion items
}

export default function Page() {
  const pathname = usePathname();

  // Extract the last segment from the URL path
  const getInitialActiveItem = (): string => {
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
  const [notionData, setNotionData] = useState<NotionItem[]>([]);

  // State for loading status
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // State for errors
  const [error, setError] = useState<string | null>(null);

  // Sidebar menu clicked item
  const [clickedItem, setClickedItem] = useState<NotionItem | null>(null);

  // State to store the fetched page content
  const [pageContent, setPageContent] = useState<ExtendedRecordMap | null>(null);

  // State for page content loading status
  const [pageLoading, setPageLoading] = useState<boolean>(false);

  // State for page content errors
  const [pageError, setPageError] = useState<string | null>(null);

  // Update activeNavItem when pathname changes
  useEffect(() => {
    setActiveNavItem(getInitialActiveItem());
  }, [pathname]);

  // Handler for updating active nav item
  const handleNavItemChange = (itemTitle: string): void => {
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

  // Fetch page content when clickedItem changes
  useEffect(() => {
    async function fetchPageContent() {
      if (!clickedItem) return;

      setPageLoading(true);
      setPageError(null);
      setPageContent(null);

      try {
        // Extract page ID from the URL
        // First try to use the id directly, then extract from URL if needed
        const notionPageId = clickedItem.id ||
          (clickedItem.url ?
            extractPageIdFromUrl(clickedItem.url) :
            null);

        if (!notionPageId) {
          throw new Error("Could not determine Notion page ID");
        }

        console.log(`Fetching content for Notion page ID: ${notionPageId}`);

        // Use the notion-client library to fetch the page content directly
        // This returns data in the format that react-notion-x expects
        const recordMap = await fetch(`/api/notion?pageId=${notionPageId}`);
        const pageData = await recordMap.json();

        console.log('Fetched page content:', pageData);
        setPageContent(pageData);
      } catch (err) {
        console.error('Failed to fetch page content:', err);
        if (err instanceof Error) {
          setPageError(err.message);
        } else {
          setPageError(String(err));
        }
      } finally {
        setPageLoading(false);
      }
    }
    fetchPageContent();
  }, [clickedItem]);

  // Extract page ID from Notion URL
  function extractPageIdFromUrl(url: string): string {
    // Extract the last part of the URL which typically contains the page ID
    const urlParts = url.split('/');
    const lastPart = urlParts[urlParts.length - 1];

    // If the last part contains a hyphen, extract the ID part after the last hyphen
    if (lastPart.includes('-')) {
      const parts = lastPart.split('-');
      return parts[parts.length - 1];
    }

    // If no hyphen, return the last part as is
    return lastPart;
  }

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
      <div className="flex flex-1 overflow-hidden">
        {/* App Sidebar (Nav) wrapped in provider but outside the inset */}
        <SidebarProvider>
          <div className="w-64 border-r bg-muted/20 h-[calc(100vh-64px)] overflow-y-auto hidden md:block">
            <AppSidebar
              className="mt-20"
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
                      {clickedItem ? clickedItem.title : (activeNavItem === "Blog" ? "Blog Posts" : "Data Fetching")}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>

            {/* Main Page Content */}
            <div className="flex-1 p-4 overflow-y-auto">
              {pageLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : pageError ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  <p>Error loading content: {pageError}</p>
                </div>
              ) : clickedItem ? (
                <div className="notion-container max-w-4xl mx-auto py-6">
                  {pageContent ? (
                    <NotionRenderer
                      recordMap={pageContent as ExtendedRecordMap}
                      fullPage={false}
                      darkMode={false}
                    // Uncomment if you have components for these block types
                    // components={{
                    //   code: Code,
                    //   collection: Collection,
                    //   equation: Equation
                    // }}
                    />
                  ) : (
                    <p className="text-muted-foreground">No content available for this item.</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>Select an item from the sidebar to view its content.</p>
                </div>
              )}
            </div>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
}