'use client';
import { useState, useEffect } from "react";
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
  // // State to track active navigation item
  // const [activeNavItem, setActiveNavItem] = useState<string>("Docs");

  // // State to store the fetched data
  // // If notionData is an array of specific objects, you should define that type
  // const [notionData, setNotionData] = useState<any[]>([]);
  // // For better type safety, consider using a specific interface like:
  // // const [notionData, setNotionData] = useState<NotionItem[]>([]);

  // // State for loading status
  // const [isLoading, setIsLoading] = useState<boolean>(false);

  // // State for errors
  // // This should allow for both null and string
  // const [error, setError] = useState<string | null>(null);

  // // Handler for updating active nav item
  // const handleNavItemChange = (itemTitle: string) => {
  //   setActiveNavItem(itemTitle);
  //   console.log("Active navigation item changed to:", itemTitle);
  // };

  // // Fetch data from Notion API based on active navigation item
  // useEffect(() => {
  //   async function fetchNotionData() {
  //     // Reset states
  //     setIsLoading(true);
  //     setError(null);

  //     try {
  //       // Determine the content type based on active navigation item
  //       let contentType = 'document'; // Default to document

  //       // Map navigation item names to API content types
  //       if (activeNavItem.toLowerCase() === 'blog') {
  //         contentType = 'blog';
  //       } else if (activeNavItem.toLowerCase() === 'docs') {
  //         contentType = 'document';
  //       }

  //       console.log(`Fetching ${contentType} data from Notion...`);

  //       // Make the API request with the appropriate content type
  //       const response = await fetch(`/api/notion?type=${contentType}&format=simple`);

  //       if (!response.ok) {
  //         throw new Error(`Error fetching ${contentType} data: ${response.statusText}`);
  //       }

  //       const data = await response.json();
  //       console.log(`Fetched Notion ${contentType} data:`, data);
  //       setNotionData(data);
  //     } catch (err) {
  //       console.error('Failed to fetch Notion data:', err);
  //       if (err instanceof Error) {
  //         setError(err.message);
  //       } else {
  //         setError(String(err));
  //       }
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   }

  //   // Only fetch if we have a valid navigation item
  //   if (activeNavItem) {
  //     fetchNotionData();
  //   }
  // }, [activeNavItem]); // Re-fetch when activeNavItem changes

  // return (
  //   <div className="flex flex-col h-screen">
  //     {/* Fixed Top Navigation Bar with active state management */}
  //     <div className="sticky top-0 z-50 border-b bg-background">
  //       <Navbar1
  //         activeItem={activeNavItem}
  //         onActiveChange={handleNavItemChange}
  //       />
  //     </div>

  //     {/* Content Area with Left Sidebar */}
  //     <div className="flex flex-1 overflow-hidden ">
  //       {/* App Sidebar (Nav) wrapped in provider but outside the inset */}
  //       <SidebarProvider>
  //         <div className="w-64 border-r bg-muted/20 h-[calc(100vh-64px)] overflow-y-auto hidden md:block">
  //           <AppSidebar className="mt-[5.2em]" />
  //         </div>

  //         {/* Main Content Area */}
  //         <div className="flex-1 flex flex-col overflow-hidden">
  //           {/* Secondary Header with Breadcrumb */}
  //           <header className="flex h-16 items-center gap-2 border-b px-4 bg-background sticky top-0 z-40">
  //             <SidebarTrigger className="md:hidden -ml-1" />
  //             <Breadcrumb>
  //               <BreadcrumbList>
  //                 <BreadcrumbItem className="hidden md:block">
  //                   <BreadcrumbLink href="#">
  //                     Building Your Application
  //                   </BreadcrumbLink>
  //                 </BreadcrumbItem>
  //                 <BreadcrumbSeparator className="hidden md:block" />
  //                 <BreadcrumbItem>
  //                   <BreadcrumbPage>
  //                     {activeNavItem === "Blog" ? "Blog Posts" : "Data Fetching"}
  //                   </BreadcrumbPage>
  //                 </BreadcrumbItem>
  //               </BreadcrumbList>
  //             </Breadcrumb>
  //           </header>

  //           {/* Main Page Content */}
  //           <div className="flex-1 p-4 overflow-y-auto">
  //             {/* Debug info - remove in production */}
  //             <div className="mb-4 text-sm text-gray-500">
  //               Active Nav: {activeNavItem} |
  //               Items: {notionData.length} |
  //               Status: {isLoading ? 'Loading...' : error ? 'Error' : 'Ready'}
  //             </div>

  //             <div className="min-h-[40vh] flex-1 rounded-xl bg-muted/50 mt-4" />
  //           </div>
  //         </div>
  //       </SidebarProvider>
  //     </div>
  //   </div>
  // );
  return <></>
}