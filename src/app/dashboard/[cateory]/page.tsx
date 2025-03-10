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
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Sun, Moon, Copy, Check } from "lucide-react";

// Only import the core NotionRenderer
import { NotionRenderer } from 'react-notion-x';
import type { ExtendedRecordMap } from 'notion-types';

// Import required styles
import 'react-notion-x/src/styles.css';

// Custom CSS for better scrolling
const customStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
    margin: 4px 0;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border-radius: 20px;
    border: transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(155, 155, 155, 0.7);
  }
  
  .dark .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(100, 100, 100, 0.5);
  }
  
  .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(100, 100, 100, 0.7);
  }
  
  /* Ensure scrollbar is always visible */
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
  }
  
  .dark .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(100, 100, 100, 0.5) transparent;
  }
`;

// Define types for the Notion data
interface NotionItem {
  id: string;
  title: string;
  url?: string;
  slug?: string;
  category?: string;
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
  const [notionData, setNotionData] = useState<NotionItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [clickedItem, setClickedItem] = useState<NotionItem | null>(null);
  const [pageBlocks, setPageBlocks] = useState<any[] | null>(null);
  const [recordMap, setRecordMap] = useState<ExtendedRecordMap | null>(null);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [copiedBlockId, setCopiedBlockId] = useState<string | null>(null);

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

  // Set up dark mode based on system preference initially
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
  }, []);

  // Update body class when dark mode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

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
    setRecordMap(null);

    try {
      console.log(`Fetching blocks for Notion page ID: ${pageId}`);

      const response = await fetch(`/api/notion?pageId=${pageId}`);

      if (!response.ok) {
        throw new Error(`Error fetching page blocks: ${response.statusText}`);
      }

      const blocksData = await response.json();
      console.log('Fetched page blocks:', blocksData);

      // Check if the response format is compatible with NotionRenderer
      if (typeof blocksData === 'object' && blocksData !== null && 'block' in blocksData) {
        // If it's in recordMap format, use it with NotionRenderer
        setRecordMap(blocksData as ExtendedRecordMap);
      } else if (Array.isArray(blocksData)) {
        // If it's an array of blocks, use it with the custom renderer
        setPageBlocks(blocksData);
      } else {
        // If it's not in a recognized format, show an error
        setPageError("Unknown data format from API.");
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

  // Custom renderer for Notion blocks
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
          const code = block.code?.rich_text?.map((text: any) => text.plain_text).join('') || '';
          return (
            <div key={id || index} className="relative group">
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded my-4 overflow-x-auto">
                <code>{code}</code>
              </pre>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(code);
                  setCopiedBlockId(id);
                  setTimeout(() => setCopiedBlockId(null), 2000);
                }}
                className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
              >
                {copiedBlockId === id ?
                  <Check className="h-4 w-4 text-green-500" /> :
                  <Copy className="h-4 w-4" />
                }
              </Button>
            </div>
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
          return <hr key={id || index} className="my-4 border-t border-gray-200 dark:border-gray-700" />;
        default:
          return (
            <div key={id || index} className="text-gray-500 my-2">
              Unsupported block type: {type}
            </div>
          );
      }
    });
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'dark' : ''}`}>
      {/* Add custom scroll styles */}
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />

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
            {/* Secondary Header with Breadcrumb and dark mode toggle */}
            <header className="flex h-16 items-center justify-between gap-2 border-b px-4 bg-background sticky top-0 z-40">
              <div className="flex items-center gap-2">
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
              </div>

              {/* Dark mode toggle */}
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                <Switch
                  checked={darkMode}
                  onCheckedChange={toggleDarkMode}
                  aria-label="Toggle dark mode"
                />
                <Moon className="h-4 w-4" />
              </div>
            </header>

            {/* Main Page Content - FIXED SCROLLING */}
            <main className="flex-1 h-[calc(100vh-128px)] bg-background dark:bg-gray-900 transition-colors duration-200 relative">
              <div className="absolute inset-0 overflow-y-auto overflow-x-hidden custom-scrollbar pb-8">
                <div className="px-4 py-6 pb-40 max-w-4xl mx-auto"> {/* Significantly increased bottom padding */}
                  {pageLoading ? (
                    <div className="flex items-center justify-center h-[60vh]">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : pageError ? (
                    <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded my-4">
                      <p>Error loading content: {pageError}</p>
                    </div>
                  ) : clickedItem ? (
                    <div className="notion-container mb-24"> {/* Increased bottom margin */}
                      {recordMap ? (
                        <div className="notion-renderer-wrapper rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                          <NotionRenderer
                            recordMap={recordMap}
                            fullPage={false}
                            darkMode={darkMode}
                            mapPageUrl={(pageId) => `/docs?id=${pageId}`}
                          />
                        </div>
                      ) : pageBlocks && pageBlocks.length > 0 ? (
                        <div className="custom-notion-content prose dark:prose-invert max-w-none prose-img:rounded prose-headings:scroll-mt-20">
                          {renderBlockContent(pageBlocks)}
                        </div>
                      ) : (
                        /* Show Documentation Coming Soon for the specific selected item */
                        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                          <div className="w-full max-w-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
                            <div className="flex justify-center mb-6">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                              </svg>
                              <div className="absolute ml-16 mt-1">
                                <div className="bg-yellow-400 text-yellow-900 rounded-full h-8 w-8 flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                            <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-200 mb-3">
                              {clickedItem.title} Documentation Coming Soon
                            </h2>
                            <p className="text-blue-700 dark:text-blue-300 mb-6">
                              Our team is currently working on adding comprehensive documentation for this {activeNavItem.toLowerCase() === "blog" ? "blog post" : "section"}.
                            </p>
                            <div className="flex flex-col gap-4">
                              <div className="flex items-center gap-3 text-blue-800 dark:text-blue-200">
                                <div className="bg-blue-100 dark:bg-blue-900/40 rounded-full p-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                </div>
                                <span className="text-sm">Tutorials and guides</span>
                              </div>
                              <div className="flex items-center gap-3 text-blue-800 dark:text-blue-200">
                                <div className="bg-blue-100 dark:bg-blue-900/40 rounded-full p-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                  </svg>
                                </div>
                                <span className="text-sm">Code examples and snippets</span>
                              </div>
                              <div className="flex items-center gap-3 text-blue-800 dark:text-blue-200">
                                <div className="bg-blue-100 dark:bg-blue-900/40 rounded-full p-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                                <span className="text-sm">FAQs and troubleshooting</span>
                              </div>
                            </div>
                            <div className="mt-8 pt-6 border-t border-blue-200 dark:border-blue-800 text-sm text-blue-600 dark:text-blue-400">
                              Please check back soon or browse other available {activeNavItem.toLowerCase()} in the sidebar.
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                      <div className="w-full max-w-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
                        <div className="flex justify-center mb-6">
                          {activeNavItem.toLowerCase() === "blog" ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                              <line x1="16" y1="13" x2="8" y2="13"></line>
                              <line x1="16" y1="17" x2="8" y2="17"></line>
                              <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                          )}
                          <div className="absolute ml-16 mt-1">
                            <div className="bg-yellow-400 text-yellow-900 rounded-full h-8 w-8 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-200 mb-3">
                          {activeNavItem === "Blog" ? "Blog Post" : "Documentation"} Coming Soon
                        </h2>
                        <p className="text-blue-700 dark:text-blue-300 mb-6">
                          Our team is currently working on adding comprehensive {activeNavItem.toLowerCase() === "blog" ? "content" : "documentation"} for this section.
                        </p>
                        <div className="flex flex-col gap-4">
                          {activeNavItem.toLowerCase() === "blog" ? (
                            <>
                              <div className="flex items-center gap-3 text-blue-800 dark:text-blue-200">
                                <div className="bg-blue-100 dark:bg-blue-900/40 rounded-full p-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </div>
                                <span className="text-sm">Articles and insights</span>
                              </div>
                              <div className="flex items-center gap-3 text-blue-800 dark:text-blue-200">
                                <div className="bg-blue-100 dark:bg-blue-900/40 rounded-full p-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                  </svg>
                                </div>
                                <span className="text-sm">Case studies and tutorials</span>
                              </div>
                              <div className="flex items-center gap-3 text-blue-800 dark:text-blue-200">
                                <div className="bg-blue-100 dark:bg-blue-900/40 rounded-full p-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <span className="text-sm">Video content and demos</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-3 text-blue-800 dark:text-blue-200">
                                <div className="bg-blue-100 dark:bg-blue-900/40 rounded-full p-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                </div>
                                <span className="text-sm">Tutorials and guides</span>
                              </div>
                              <div className="flex items-center gap-3 text-blue-800 dark:text-blue-200">
                                <div className="bg-blue-100 dark:bg-blue-900/40 rounded-full p-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                  </svg>
                                </div>
                                <span className="text-sm">Code examples and snippets</span>
                              </div>
                              <div className="flex items-center gap-3 text-blue-800 dark:text-blue-200">
                                <div className="bg-blue-100 dark:bg-blue-900/40 rounded-full p-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                                <span className="text-sm">FAQs and troubleshooting</span>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="mt-8 pt-6 border-t border-blue-200 dark:border-blue-800 text-sm text-blue-600 dark:text-blue-400 pb-6">
                          Please check back soon or browse other available {activeNavItem.toLowerCase()} in the sidebar.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </main>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
}