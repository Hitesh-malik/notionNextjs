'use client';

import { ReactNode } from "react";
import { NotionContentRenderer } from "@/components/notion/NotionContentRenderer";
import { PlaceholderContent } from "@/components/notion/PlaceholderContent";
import { ErrorDisplay } from "@/components/notion/ErrorDisplay";
import { LoadingSpinner } from "@/components/dashboard/LoadingSpinner";
import { DocumentDetailsPanel } from "@/components/notion/DocumentDetailsPanel";
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
    <>
      {/* Main Content Area - This should be scrollable */}
      <div className="w-full overflow-auto main-content">
        <div className={`px-4 py-6 pb-40 mx-auto ${clickedItem ? 'lg:pr-64' : ''}`} style={{ maxWidth: '860px' }}>
          {pageLoading ? (
            <LoadingSpinner className="h-[60vh]" size="lg" />
          ) : pageError ? (
            <ErrorDisplay message={pageError} />
          ) : clickedItem ? (
            <div className="notion-container mb-24">
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
          
          {/* Debug info in development */}
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
      </div>
      
      {/* Right Side Details Panel - Fixed position */}
      {clickedItem && <DocumentDetailsPanel clickedItem={clickedItem} />}
      
      {/* Custom scrollbar styles */}
      <style jsx global>{`
        /* Main content scrollbar */
        .main-content {
          height: calc(100vh - 128px);
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
        }
        
        .main-content::-webkit-scrollbar {
          width: 6px;
        }
        
        .main-content::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .main-content::-webkit-scrollbar-thumb {
          background-color: rgba(155, 155, 155, 0.4);
          border-radius: 3px;
        }
        
        .dark .main-content::-webkit-scrollbar-thumb {
          background-color: rgba(100, 100, 100, 0.4);
        }
        
        .main-content::-webkit-scrollbar-thumb:hover {
          background-color: rgba(155, 155, 155, 0.7);
        }
        
        .dark .main-content::-webkit-scrollbar-thumb:hover {
          background-color: rgba(100, 100, 100, 0.7);
        }
      `}</style>
    </>
  );
}