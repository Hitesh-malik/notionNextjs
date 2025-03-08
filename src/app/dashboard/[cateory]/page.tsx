'use client';
import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
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
  slug?: string;
  category?: string;
  // Add any other properties that might be present in your Notion items
}

export default function Page() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');

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
  const [pageBlocks, setPageBlocks] = useState<any[] | null>(null);

  // State for page content loading status
  const [pageLoading, setPageLoading] = useState<boolean>(false);

  // State for page content errors
  const [pageError, setPageError] = useState<string | null>(null);

  // Update activeNavItem when pathname changes
  useEffect(() => {
    setActiveNavItem(getInitialActiveItem());
  }, [pathname]);

  // Check for slug in URL params on first load
  useEffect(() => {
    if (slug) {
      fetchPageBySlug(slug);
    }
  }, [slug]);

  // Handler for updating active nav item
  const handleNavItemChange = (itemTitle: string): void => {
    setActiveNavItem(itemTitle);
    console.log("Active navigation item changed to:", itemTitle);
  };

  // Fetch page by slug
  async function fetchPageBySlug(slug: string) {
    setPageLoading(true);
    setPageError(null);
    
    try {
      console.log(`Fetching page by slug: ${slug}`);
      const response = await fetch(`/api/notion?slug=${slug}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching page by slug: ${response.statusText}`);
      }
      
      const pageData = await response.json();
      console.log('Fetched page by slug:', pageData);
      
      // Create a NotionItem from the fetched page data
      const pageItem: NotionItem = {
        id: pageData.id,
        title: extractTitleFromPage(pageData),
        url: pageData.url
      };
      
      setClickedItem(pageItem);
      
      // Now fetch the page blocks
      await fetchPageBlocks(pageData.id);
      
    } catch (err) {
      console.error('Failed to fetch page by slug:', err);
      if (err instanceof Error) {
        setPageError(err.message);
      } else {
        setPageError(String(err));
      }
    } finally {
      setPageLoading(false);
    }
  }

  // Extract title from a Notion page object
  function extractTitleFromPage(page: any): string {
    // Try to find the title property
    for (const [key, value] of Object.entries(page.properties || {})) {
      if ((value as any).type === 'title') {
        const titleValue = (value as any).title;
        if (titleValue && titleValue.length > 0) {
          return titleValue[0].plain_text || 'Untitled';
        }
      }
    }
    
    // Fallbacks if no title property is found
    return page.properties?.Title?.title?.[0]?.plain_text ||
           page.properties?.Name?.title?.[0]?.plain_text ||
           'Untitled';
  }

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

  // Fetch page blocks when clickedItem changes
  useEffect(() => {
    if (clickedItem?.id) {
      fetchPageBlocks(clickedItem.id);
    }
  }, [clickedItem?.id]);

  // Function to fetch page blocks
  async function fetchPageBlocks(pageId: string) {
    if (!pageId) return;

    setPageLoading(true);
    setPageError(null);
    setPageBlocks(null);

    try {
      console.log(`Fetching blocks for Notion page ID: ${pageId}`);

      const response = await fetch(`/api/notion?pageId=${pageId}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching page blocks: ${response.statusText}`);
      }
      
      const blocksData = await response.json();
      console.log('Fetched page blocks:', blocksData);
      
      // Check if we need to create a compatible format for NotionRenderer
      // The react-notion-x library expects a specific recordMap format
      if (Array.isArray(blocksData)) {
        // Store the blocks directly - we'll use our custom renderer
        setPageBlocks(blocksData);
      } else if (typeof blocksData === 'object' && blocksData !== null) {
        // If it's already in recordMap format, use it directly
        if ('block' in blocksData) {
          setPageBlocks(blocksData);
        } else {
          // Otherwise, we need to convert to our custom format
          setPageBlocks(blocksData);
        }
      } else {
        throw new Error("Received invalid data format from API");
      }
    } catch (err) {
      console.error('Failed to fetch page blocks:', err);
      if (err instanceof Error) {
        setPageError(err.message);
      } else {
        setPageError(String(err));
      }
    } finally {
      setPageLoading(false);
    }
  }

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

  // NotionRenderer only accepts recordMap format, not direct blocks
  const getNotionRendererProps = () => {
    return {
      recordMap: pageBlocks as unknown as ExtendedRecordMap,
      fullPage: false,
      darkMode: false
    };
  };

  // Render Notion content based on the format of blocks
  const renderNotionContent = () => {
    if (!pageBlocks) return null;
    
    try {
      // Check if we have the new block-based format or the old recordMap format
      if (Array.isArray(pageBlocks)) {
        // Use a custom renderer for block-based content
        return (
          <div className="notion-content">
            {renderBlockContent(pageBlocks)}
          </div>
        );
      } else {
        // If we have a recordMap in the right format, use NotionRenderer
        // Otherwise, throw an error to fall back to our custom renderer
        if (typeof pageBlocks === 'object' && pageBlocks !== null && 'block' in pageBlocks) {
          return (
            <NotionRenderer
              recordMap={pageBlocks as unknown as ExtendedRecordMap}
              fullPage={false}
              darkMode={false}
              // Uncomment if you have components for these block types
              // components={{
              //   code: Code,
              //   collection: Collection,
              //   equation: Equation
              // }}
            />
          );
        } else {
          throw new Error("Incompatible data format for NotionRenderer");
        }
      }
    } catch (err) {
      console.error("Error rendering Notion content:", err);
      
      // Fallback to custom renderer if NotionRenderer fails
      if (Array.isArray(pageBlocks)) {
        return (
          <div className="notion-content">
            {renderBlockContent(pageBlocks)}
          </div>
        );
      } else {
        return <p className="text-red-500">Error rendering content. Unsupported Notion block format.</p>;
      }
    }
  };

  // Basic renderer for Notion blocks
  const renderBlockContent = (blocks: any[]) => {
    return blocks.map((block, index) => {
      const { type, id } = block;
      
      switch (type) {
        case 'paragraph':
          return (
            <p key={id || index} className="my-2">
              {block.paragraph?.rich_text?.map((text: any, i: number) => (
                <span key={i} className={text.annotations?.bold ? 'font-bold' : ''}>
                  {text.plain_text}
                </span>
              )) || ''}
            </p>
          );
        case 'heading_1':
          return (
            <h1 key={id || index} className="text-3xl font-bold my-4">
              {block.heading_1?.rich_text?.map((text: any, i: number) => (
                <span key={i}>{text.plain_text}</span>
              )) || ''}
            </h1>
          );
        case 'heading_2':
          return (
            <h2 key={id || index} className="text-2xl font-bold my-3">
              {block.heading_2?.rich_text?.map((text: any, i: number) => (
                <span key={i}>{text.plain_text}</span>
              )) || ''}
            </h2>
          );
        case 'heading_3':
          return (
            <h3 key={id || index} className="text-xl font-bold my-2">
              {block.heading_3?.rich_text?.map((text: any, i: number) => (
                <span key={i}>{text.plain_text}</span>
              )) || ''}
            </h3>
          );
        case 'bulleted_list_item':
          return (
            <ul key={id || index} className="list-disc ml-5 my-2">
              <li>
                {block.bulleted_list_item?.rich_text?.map((text: any, i: number) => (
                  <span key={i}>{text.plain_text}</span>
                )) || ''}
              </li>
            </ul>
          );
        case 'numbered_list_item':
          return (
            <ol key={id || index} className="list-decimal ml-5 my-2">
              <li>
                {block.numbered_list_item?.rich_text?.map((text: any, i: number) => (
                  <span key={i}>{text.plain_text}</span>
                )) || ''}
              </li>
            </ol>
          );
        case 'code':
          return (
            <pre key={id || index} className="bg-gray-100 p-4 rounded my-4 overflow-x-auto">
              <code>
                {block.code?.rich_text?.map((text: any, i: number) => (
                  <span key={i}>{text.plain_text}</span>
                )) || ''}
              </code>
            </pre>
          );
        case 'image':
          const imageUrl = block.image?.file?.url || block.image?.external?.url;
          return imageUrl ? (
            <div key={id || index} className="my-4">
              <img 
                src={imageUrl} 
                alt={block.image?.caption || "Notion image"} 
                className="max-w-full h-auto rounded" 
              />
              {block.image?.caption && (
                <p className="text-center text-sm text-gray-500 mt-1">
                  {block.image.caption}
                </p>
              )}
            </div>
          ) : null;
        case 'divider':
          return <hr key={id || index} className="my-4 border-t border-gray-200" />;
        default:
          return (
            <div key={id || index} className="text-gray-500 my-2">
              Unsupported block type: {type}
            </div>
          );
      }
    });
  };

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
                  {pageBlocks ? (
                    renderNotionContent()
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