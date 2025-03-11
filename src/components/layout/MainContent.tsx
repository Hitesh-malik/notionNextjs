'use client';

import { ReactNode, useEffect, useState } from "react";
import { ContentLayout } from "./ContentLayout";
import { useNotionContext } from "@/context/NotionContext";

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

interface MainContentProps {
  children?: ReactNode;
  activeNavItem: string;
  darkMode: boolean;
  slug?: string | null;
}

export function MainContent({ children, activeNavItem, darkMode, slug }: MainContentProps) {
  const { fetchPageBySlug, fetchNotionData } = useNotionContext();
  const [mounted, setMounted] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch data based on active nav item
  useEffect(() => {
    if (activeNavItem && mounted) {
      fetchNotionData(activeNavItem);
    }
  }, [activeNavItem, fetchNotionData, mounted]);

  // Check for slug in URL params on first load
  useEffect(() => {
    if (slug && mounted) {
      fetchPageBySlug(slug);
    }
  }, [slug, fetchPageBySlug, mounted]);

  return (
    <main className="flex-1 h-[calc(100vh-128px)] bg-background dark:bg-gray-900 transition-colors duration-200 relative">
      {/* Add custom scroll styles */}
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      
      <div className="absolute inset-0 overflow-y-auto overflow-x-hidden custom-scrollbar pb-8">
        {mounted ? (
          <ContentLayout 
            activeNavItem={activeNavItem}
            darkMode={darkMode}
          >
            {children}
          </ContentLayout>
        ) : (
          <div className="h-[60vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
    </main>
  );
}