'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { NotionItem } from '@/types/notion';
import type { ExtendedRecordMap } from 'notion-types';

// Create context with appropriate methods
interface NotionContextType {
  notionData: NotionItem[];
  isLoading: boolean;
  error: string | null;
  clickedItem: NotionItem | null;
  pageBlocks: any[] | null;
  recordMap: ExtendedRecordMap | null;
  pageLoading: boolean;
  pageError: string | null;
  fetchNotionData: (contentType: string) => Promise<void>;
  fetchPageBlocks: (pageId: string) => Promise<void>;
  fetchPageBySlug: (slug: string) => Promise<void>;
  setClickedItem: (item: NotionItem | null) => void;
}

// Create a default context value
const defaultContextValue: NotionContextType = {
  notionData: [],
  isLoading: false,
  error: null,
  clickedItem: null,
  pageBlocks: null,
  recordMap: null,
  pageLoading: false,
  pageError: null,
  fetchNotionData: async () => {},
  fetchPageBlocks: async () => {},
  fetchPageBySlug: async () => {},
  setClickedItem: () => {},
};

const NotionContext = createContext<NotionContextType>(defaultContextValue);

// Provider component
export function NotionProvider({ children }: { children: ReactNode }) {
  // State for Notion data
  const [notionData, setNotionData] = useState<NotionItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for selected item and its content
  const [clickedItem, setClickedItem] = useState<NotionItem | null>(null);
  const [pageBlocks, setPageBlocks] = useState<any[] | null>(null);
  const [recordMap, setRecordMap] = useState<ExtendedRecordMap | null>(null);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [pageError, setPageError] = useState<string | null>(null);

  // Extract title from a Notion page object
  const extractTitleFromPage = (page: any): string => {
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
  };

  // Fetch Notion data based on content type
  const fetchNotionData = useCallback(async (contentType: string) => {
    // Reset states
    setIsLoading(true);
    setError(null);

    try {
      // Map navigation item names to API content types
      const apiContentType = contentType.toLowerCase() === 'blog' ? 'blog' : 'document';

      console.log(`Fetching ${apiContentType} data from Notion...`);

      // Make the API request with the appropriate content type
      const response = await fetch(`/api/notion?type=${apiContentType}&format=simple`);

      if (!response.ok) {
        throw new Error(`Error fetching ${apiContentType} data: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Fetched Notion ${apiContentType} data:`, data);
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
  }, []);

  // Fetch page blocks by ID
  const fetchPageBlocks = useCallback(async (pageId: string) => {
    if (!pageId) {
      console.warn("No pageId provided to fetchPageBlocks");
      return;
    }

    console.log("Starting fetchPageBlocks for page:", pageId);
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
      console.log('Fetched page blocks successfully!', blocksData ? 'Data received' : 'No data');

      // Check if the response format is compatible with NotionRenderer
      if (typeof blocksData === 'object' && blocksData !== null && 'block' in blocksData) {
        // If it's in recordMap format, use it with NotionRenderer
        console.log('Setting recordMap format data');
        setRecordMap(blocksData as ExtendedRecordMap);
      } else if (Array.isArray(blocksData)) {
        // If it's an array of blocks, use it with the custom renderer
        console.log(`Setting array of blocks: ${blocksData.length} blocks`);
        setPageBlocks(blocksData);
      } else {
        // If it's not in a recognized format, show an error
        console.error("Unknown data format from API", blocksData);
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
  }, []);

  // Fetch page by slug
  const fetchPageBySlug = useCallback(async (slug: string) => {
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

      // Update state with the fetched item
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
  }, [fetchPageBlocks]);

  // Combine all state and methods
  const contextValue: NotionContextType = {
    notionData,
    isLoading,
    error,
    clickedItem,
    pageBlocks,
    recordMap,
    pageLoading,
    pageError,
    fetchNotionData,
    fetchPageBlocks,
    fetchPageBySlug,
    setClickedItem,
  };

  return (
    <NotionContext.Provider value={contextValue}>
      {children}
    </NotionContext.Provider>
  );
}

// Custom hook for using the Notion context
export const useNotionContext = () => useContext(NotionContext);