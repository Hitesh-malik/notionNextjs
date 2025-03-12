'use client';

import { ReactNode, useEffect, useState } from "react";
import { NotionContentRenderer } from "@/components/notion/NotionContentRenderer";
import { PlaceholderContent } from "@/components/notion/PlaceholderContent";
import { ErrorDisplay } from "@/components/notion/ErrorDisplay";
import { LoadingSpinner } from "@/components/dashboard/LoadingSpinner";
import { DocumentDetailsPanel } from "@/components/notion/DocumentDetailsPanel";
import { useNotionContext } from "@/context/NotionContext";
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  const [isDetailsPanelVisible, setIsDetailsPanelVisible] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setWindowWidth(newWidth);
      
      // Automatically hide details panel if width is less than 120px
      if (newWidth <= 120) {
        setIsDetailsPanelVisible(false);
      } else {
        setIsDetailsPanelVisible(true);
      }
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Initial check
    handleResize();

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleDetailsPanel = () => {
    setIsDetailsPanelVisible(!isDetailsPanelVisible);
  };

  return (
    <>
      {/* Main Content Area - This should be scrollable */}
      <div className="w-full overflow-auto main-content">
        <div className={`px-4 py-6 pb-40 mx-auto ${clickedItem && isDetailsPanelVisible ? 'lg:pr-64' : ''}`} style={{ maxWidth: '860px' }}>
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
      
      {/* Right Side Details Panel - Fixed position with responsive behavior */}
      {clickedItem && windowWidth > 120 && (
        <>
          <button 
            onClick={toggleDetailsPanel}
            className={`fixed right-2 top-1/2 transform -translate-y-1/2 
                       bg-gray-200 dark:bg-gray-700 p-2 rounded-full z-50 shadow-md 
                       ${isDetailsPanelVisible ? '' : 'bg-opacity-50'}`}
          >
            {isDetailsPanelVisible ? <ChevronRight /> : <ChevronLeft />}
          </button>

          <div className={`details-panel bg-white dark:bg-gray-900 border-l transition-all duration-300 ease-in-out
            ${isDetailsPanelVisible ? 'translate-x-0' : 'translate-x-full'}`}>
            <DocumentDetailsPanel clickedItem={clickedItem} />
          </div>
        </>
      )}
      
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

        /* Details panel */
        .details-panel {
          width: 256px;
          position: fixed;
          right: 0;
          top: 128px;
          bottom: 0;
          z-index: 20;
          overflow-y: auto;
        }
      `}</style>
    </>
  );
}