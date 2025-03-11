'use client';

import * as React from "react";
import { useState, useEffect } from "react";
import { useNotionContext } from "@/context/NotionContext";
import { NotionItem } from "@/types/notion";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

// Define interfaces for the component's internal data structure
interface SidebarGroup {
  title: string;
  url: string;
  items: NotionItem[];
}

interface SidebarData {
  navMain: SidebarGroup[];
}

interface AppSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  activeNavItem: string;
}

export function AppSidebar({ 
  activeNavItem,
  ...props 
}: AppSidebarProps) {
  // Get Notion data from context
  const { notionData, isLoading, setClickedItem, fetchPageBlocks } = useNotionContext();
  
  // State for the sidebar data structure
  const [sidebarData, setSidebarData] = useState<SidebarData>({
    navMain: []
  });

  // Function to format Notion data for sidebar display
  const formatNotionDataForSidebar = (data: NotionItem[]): SidebarGroup[] => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];

    // Create a single group with all items
    return [{
      title: activeNavItem || "Documentation",
      url: "#",
      items: data.map(item => ({
        ...item,
        title: item.title || 'Untitled',
        url: item.url || '#',
        isActive: false,
      }))
    }];
  };

  // Update sidebar data when notionData changes
  useEffect(() => {
    if (notionData && Array.isArray(notionData) && notionData.length > 0) {
      // Transform Notion data into sidebar structure
      const notionNavItems = formatNotionDataForSidebar(notionData);
      
      // Only update if we have valid data
      if (notionNavItems.length > 0) {
        setSidebarData(prevData => ({
          ...prevData,
          navMain: notionNavItems
        }));
      }
    }
  }, [notionData, activeNavItem]);

  // Handle item click - Direct approach to ensure it works
  const handleItemClick = (item: NotionItem): void => {
    console.log("Sidebar item clicked:", item.title, item.id);
    
    // Update the sidebar data to mark the clicked item as active
    setSidebarData(prevData => {
      const updatedNavMain = prevData.navMain.map(group => {
        const updatedItems = group.items.map(menuItem => ({
          ...menuItem,
          isActive: menuItem.id === item.id // Set isActive based on item ID match
        }));
        return { ...group, items: updatedItems };
      });
      return { ...prevData, navMain: updatedNavMain };
    });
    
    // Set clicked item in context
    setClickedItem(item);
    
    // Directly fetch page blocks - belt and suspenders approach
    if (item && item.id) {
      fetchPageBlocks(item.id);
    }
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader className="p-4 border-b">
        <h2 className="text-lg font-semibold tracking-tight mb-2">{activeNavItem || "Documentation"}</h2>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </SidebarHeader>
      
      <SidebarContent className="pt-2">
        {isLoading ? (
          <div className="p-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          sidebarData.navMain.map((item) => (
            <SidebarGroup key={item.title}>
              <SidebarGroupLabel className="px-3 py-2 text-base font-medium text-foreground/80">
                {item.title}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {item.items.map((menuItem) => (
                    <SidebarMenuItem key={menuItem.id} className={menuItem.isActive ? 'sidebar-item-active' : 'sidebar-item-hover'}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={menuItem.isActive}
                        className={`
                          px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md
                          ${menuItem.isActive 
                            ? 'bg-primary/10 text-primary font-semibold border-l-2 border-primary pl-[10px]' 
                            : 'hover:bg-accent/50 hover:text-foreground hover:font-medium'
                          }
                        `}
                      >
                        <a 
                          href="#"
                          className={`flex items-center w-full ${menuItem.isActive ? 'text-primary' : 'text-foreground/80'}`}
                          onClick={(e) => {
                            e.preventDefault(); // Prevent navigation
                            handleItemClick(menuItem);
                          }}
                        >
                          {menuItem.title}
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))
        )}
      </SidebarContent>
      <SidebarRail />
      <style jsx global>{`
        /* Custom styles for sidebar items */
        .sidebar-item-active {
          position: relative;
        }

        .sidebar-item-active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 3px;
          background-color: var(--primary);
          border-radius: 0 2px 2px 0;
        }

        /* Custom hover effect with subtle scale */
        .sidebar-item-hover {
          transition: transform 0.15s ease, background-color 0.2s ease;
        }
        
        .sidebar-item-hover:hover {
          transform: translateX(2px);
          background-color: var(--accent);
        }
      `}</style>
    </Sidebar>
  );
}