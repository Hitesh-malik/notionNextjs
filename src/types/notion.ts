// Type definitions for Notion data
import type { ExtendedRecordMap } from 'notion-types';

// Main Notion item type
export interface NotionItem {
  id: string;
  title: string;
  url?: string;
  slug?: string;
  category?: string;
  createdTime?: string;
  lastEditedTime?: string;
  createdBy?: string;
  icon?: string | null;
  isActive?: boolean;
}

// State for Notion data context
export interface NotionState {
  notionData: NotionItem[];
  isLoading: boolean;
  error: string | null;
  clickedItem: NotionItem | null;
  pageBlocks: any[] | null;
  recordMap: ExtendedRecordMap | null;
  pageLoading: boolean;
  pageError: string | null;
}