import "server-only";
import { Client } from "@notionhq/client";
import {
  BlockObjectResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { cache } from "react";

// Initialize the Notion client
export const notionClient = new Client({
  auth: process.env.NOTION_API_KEY || "",
});

// Cache the database queries for better performance
export const getDocuments = cache(() => {
  if (!process.env.NOTION_DOCUMENT_DATABASE_ID) {
    throw new Error("Missing NOTION_DOCUMENT_DATABASE_ID environment variable");
  }
  
  return notionClient.databases.query({
    database_id: process.env.NOTION_DOCUMENT_DATABASE_ID,
  });
});

export const getBlogPosts = cache(() => {
  if (!process.env.NOTION_BLOG_DATABASE_ID) {
    throw new Error("Missing NOTION_BLOG_DATABASE_ID environment variable");
  }
  
  return notionClient.databases.query({
    database_id: process.env.NOTION_BLOG_DATABASE_ID,
  });
});

export const getPageBlocks = cache(async (pageId: string) => {
  // Recursive function to get all blocks including nested ones
  async function getAllBlocks(blockId: string): Promise<BlockObjectResponse[]> {
    let allBlocks: BlockObjectResponse[] = [];
    let hasMore = true;
    let startCursor: string | undefined = undefined;
    
    // Paginate through all blocks at the current level
    while (hasMore) {
      const response = await notionClient.blocks.children.list({ 
        block_id: blockId,
        start_cursor: startCursor,
        page_size: 100 // Maximum allowed by Notion API
      });
      
      const blocks = response.results as BlockObjectResponse[];
      allBlocks = [...allBlocks, ...blocks];
      
      // Check if there are more blocks to fetch
      hasMore = response.has_more;
      startCursor = response.next_cursor || undefined;
    }
    
    // Get children for blocks that can have them
    const blocksWithChildren = await Promise.all(
      allBlocks.map(async (block) => {
        // Check if block has children and is not an unsupported type
        const hasChildren = block.has_children;
        
        if (hasChildren) {
          const children = await getAllBlocks(block.id);
          // Add children to the block
          // Need to cast to any to add a non-standard property
          (block as any).children = children;
        }
        
        return block;
      })
    );
    
    return blocksWithChildren;
  }
  
  console.log(`Fetching all blocks for page: ${pageId}`);
  return getAllBlocks(pageId);
});

// Helper function to simplify Notion document data
export const simplifyNotionDocuments = (notionResponse: any[]) => {
  // Map through the array of documents and extract only the essential information
  return notionResponse.map(document => {
    // Get the title from the "Documents filed" property (or any title property)
    const titleProperty = document.properties["Documents filed"] ||
      document.properties["Title"] ||
      document.properties["Name"] ||
      findTitleProperty(document.properties);

    const title = titleProperty?.title?.[0]?.plain_text || "Untitled";

    // Get the document category/type from the "Select" property if it exists
    const category = document.properties.Select?.select?.name || "uncategorized";

    // Get the creator's name
    const createdBy = document.properties["Created by"]?.created_by?.name ||
      document.created_by?.name ||
      "Unknown";

    // Return a simplified object with only the most important info
    return {
      id: document.id,
      title,
      category,
      createdBy,
      createdTime: document.created_time,
      lastEditedTime: document.last_edited_time,
      url: document.url,
      icon: document.icon?.type === "external" ? document.icon.external.url : null,
    };
  });
};

// Helper function to find a title property in a Notion page
function findTitleProperty(properties: Record<string, any>) {
  // Look for any property that has type "title"
  return Object.values(properties).find(prop => prop.type === "title");
}