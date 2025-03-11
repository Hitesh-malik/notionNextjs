'use client';

import { useEffect } from 'react';
import { useNotionContext } from '@/context/NotionContext';
import { NotionItem } from '@/types/notion';

// Custom hook to connect navigation with Notion data
export function useNotion(activeNavItem: string, slug?: string | null) {
  const { 
    fetchNotionData, 
    fetchPageBySlug,
    clickedItem,
    fetchPageBlocks,
    setClickedItem,
    ...rest
  } = useNotionContext();

  // Fetch data when activeNavItem changes
  useEffect(() => {
    if (activeNavItem) {
      console.log("Active nav item changed, fetching data:", activeNavItem);
      fetchNotionData(activeNavItem);
    }
  }, [activeNavItem, fetchNotionData]);

  // Check for slug on first load
  useEffect(() => {
    if (slug) {
      console.log("Slug found, fetching page:", slug);
      fetchPageBySlug(slug);
    }
  }, [slug, fetchPageBySlug]);

  // Fetch page blocks when clickedItem changes
  useEffect(() => {
    if (clickedItem?.id) {
      console.log("Clicked item changed, fetching blocks for:", clickedItem.title, clickedItem.id);
      fetchPageBlocks(clickedItem.id);
    }
  }, [clickedItem?.id, fetchPageBlocks]);

  // Handle item click from sidebar
  const handleItemClick = (item: NotionItem) => {
    console.log("Item clicked in useNotion hook:", item.title);
    setClickedItem(item);
    // fetchPageBlocks will be triggered by the above useEffect
  };

  return {
    ...rest,
    clickedItem,
    handleItemClick,
    setClickedItem,
    fetchPageBlocks,
  };
}