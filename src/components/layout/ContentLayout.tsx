'use client';

import { ReactNode } from "react";
import { NotionContentRenderer } from "@/components/notion/NotionContentRenderer";
import { PlaceholderContent } from "@/components/notion/PlaceholderContent";
import { ErrorDisplay } from "@/components/notion/ErrorDisplay";
import { LoadingSpinner } from "@/components/dashboard/LoadingSpinner";
import { useNotionContext } from "@/context/NotionContext";

interface ContentLayoutProps {
  children?: ReactNode;
  activeNavItem: string;
  darkMode: boolean;
}

export function ContentLayout({ children, activeNavItem, darkMode }: ContentLayoutProps) {
  const { 
    clickedItem, 
    pageBlocks, 
    recordMap,
    pageLoading,
    pageError
  } = useNotionContext();

  return (
    <div className="px-4 py-6 pb-40 max-w-4xl mx-auto"> {/* Increased bottom padding */}
      {pageLoading ? (
        <LoadingSpinner className="h-[60vh]" size="lg" />
      ) : pageError ? (
        <ErrorDisplay message={pageError} />
      ) : clickedItem ? (
        <div className="notion-container mb-24"> {/* Increased bottom margin */}
          {/* Render content if available */}
          {(recordMap || (pageBlocks && pageBlocks.length > 0)) ? (
            <NotionContentRenderer 
              recordMap={recordMap} 
              pageBlocks={pageBlocks}
              darkMode={darkMode}
            />
          ) : (
            <PlaceholderContent 
              activeNavItem={activeNavItem} 
              clickedItem={clickedItem} 
            />
          )}
        </div>
      ) : (
        /* Show general placeholder content */
        <PlaceholderContent activeNavItem={activeNavItem} />
      )}
      
      {/* For debugging - can be removed in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-md text-xs">
          <details>
            <summary className="cursor-pointer font-medium">Debug Info</summary>
            <div className="mt-2">
              <p>Clicked Item: {clickedItem ? clickedItem.title : 'None'}</p>
              <p>Page Blocks: {pageBlocks ? `${pageBlocks.length} blocks` : 'None'}</p>
              <p>Record Map: {recordMap ? 'Available' : 'None'}</p>
              <p>Loading: {pageLoading ? 'Yes' : 'No'}</p>
              <p>Error: {pageError || 'None'}</p>
            </div>
          </details>
        </div>
      )}
      
      {/* Additional content if provided */}
      {children}
    </div>
  );
}