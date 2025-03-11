'use client';

import { ReactNode, useEffect, useState } from "react";
import { ContentLayout } from "./ContentLayout";
import { useNotionContext } from "@/context/NotionContext";

// Custom CSS for proper layout
const customStyles = `
  /* Fixed position for details panel */
  .details-panel {
    position: fixed;
    right: 0;
    top: 128px; /* Height of navbar + second header */
    bottom: 0;
    width: 256px;
    z-index: 10;
    overflow-y: auto;
  }
  
  /* Main content */
  .main-content-wrapper {
    position: relative;
    height: calc(100vh - 128px);
    display: flex;
    background-color: var(--background);
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
    <div className="main-content-wrapper">
      {/* Add global styles */}
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      
      {mounted ? (
        <ContentLayout 
          activeNavItem={activeNavItem}
          darkMode={darkMode}
        >
          {children}
        </ContentLayout>
      ) : (
        <div className="flex items-center justify-center w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}