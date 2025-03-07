// app-sidebar.tsx
'use client';

import React from "react";
import { HTMLAttributes } from "react";
import Link from "next/link";

// Define the props interface for AppSidebar
interface AppSidebarProps extends HTMLAttributes<HTMLDivElement> {
  notionData: any[];
  isLoading: boolean;
  activeNavItem: string;
  setClickedItem?: (item: any) => void;
}

export function AppSidebar({
  className,
  notionData,
  isLoading,
  activeNavItem,
  setClickedItem,
  ...props
}: AppSidebarProps) {
  // Track the selected item within the sidebar
  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(null);

  // Handle item click
  const handleItemClick = (item: any) => {
    // Update the selected item in the sidebar
    setSelectedItemId(item.id || item.title);
    
    // Pass the complete item data back to the parent component
    if (setClickedItem) {
      setClickedItem(item);
    }
  };

  return (
    <div className={`${className} bg-background h-full`} {...props}>
      {isLoading ? (
        <div className="px-4 py-2 text-muted-foreground animate-pulse">
          Loading content...
        </div>
      ) : (
        <nav className="flex flex-col">
          {notionData && notionData.length > 0 ? (
            notionData.map((item, index) => {
              // Check if this item is active in the nav
              const isActive = item.title === activeNavItem;
              
              // Check if this item is currently selected
              const isSelected = selectedItemId === (item.id || item.title);
              
              // Check if item has a "new" flag
              const isNew = item.isNew || item.title?.toLowerCase().includes('new');
              
              return (
                <div key={index}>
                  <Link 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      handleItemClick(item);
                    }}
                    className={`
                      group relative px-3 py-2.5 transition-all duration-300 ease-in-out flex items-center
                      text-base hover:bg-gray-100/20 hover:pl-4 hover:border-l-2 hover:border-primary
                      ${isActive ? 'bg-primary/10 text-primary font-medium' : ''}
                      ${isSelected ? 'bg-gray-100/30 border-l-2 border-primary pl-4' : 'text-foreground/80 hover:text-foreground'}
                    `}
                  >
                    {/* Bullet point */}
                    <div className={`h-1.5 w-1.5 rounded-full mr-2.5 transition-all duration-300 group-hover:scale-125 group-hover:h-2 group-hover:w-2 
                      ${isActive ? 'bg-primary' : ''} 
                      ${isSelected ? 'bg-primary h-2 w-2' : 'bg-gray-400 group-hover:bg-primary/70'}`}
                    ></div>
                    
                    <div className="flex items-center justify-between w-full">
                      <span className={`${isActive || isSelected ? 'text-primary' : ''}`}>
                        {item.title || 'Untitled'}
                      </span>
                      
                      <div className="flex items-center">
                        {/* Add 'New' badge if item is new */}
                        {isNew && (
                          <span className="ml-2 text-xs font-medium px-1.5 py-0.5 rounded-md bg-orange-500 text-white">
                            New
                          </span>
                        )}
                        
                        {/* Add arrow for items with children */}
                        {item.hasChildren && (
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            className="ml-2"
                          >
                            <path d="m9 18 6-6-6-6"/>
                          </svg>
                        )}
                      </div>
                    </div>
                  </Link>
                  {/* Separator line with animation */}
                  <div className="h-px bg-gray-200/10 w-full group-hover:bg-primary/20 transition-colors duration-300"></div>
                </div>
              );
            })
          ) : (
            <div className="px-3 py-2 text-muted-foreground">
              No content available
            </div>
          )}
        </nav>
      )}
    </div>
  );
}