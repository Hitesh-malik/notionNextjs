import { Client } from "@notionhq/client";
import { NextResponse } from 'next/server';

// Initialize the Notion client with better error handling
const notion = new Client({
  auth: process.env.NOTION_API_KEY || ''
});

// API GET handler for App Router
export async function GET(request) {
  try {
    // Parse the URL to get query parameters
    const url = new URL(request.url);
    const pageId = url.searchParams.get('pageId');
    const type = url.searchParams.get('type');
    const format = url.searchParams.get('format'); // Add format parameter

    console.log("API request received:", { pageId, type, format });

    // Check for required environment variables
    if (!process.env.NOTION_API_KEY) {
      console.error("Missing NOTION_API_KEY environment variable");
      return NextResponse.json({
        error: "Server configuration error: Missing API key"
      }, { status: 500 });
    }

    if (pageId) {
      console.log(`Fetching page content for pageId: ${pageId}`);
      const pageData = await getPageContent(pageId);
      return NextResponse.json(pageData);
    } else {
      // Explicitly check for the type parameter
      if (!type) {
        return NextResponse.json({
          error: "Missing required parameter: type (should be 'document' or 'blog')"
        }, { status: 400 });
      }

      // Check for appropriate database IDs based on type
      if (type === 'blog' && !process.env.NOTION_BLOG_DATABASE_ID) {
        console.error("Missing NOTION_BLOG_DATABASE_ID environment variable");
        return NextResponse.json({
          error: "Server configuration error: Missing blog database ID"
        }, { status: 500 });
      }

      if (type === 'document' && !process.env.NOTION_DOCUMENT_DATABASE_ID) {
        console.error("Missing NOTION_DOCUMENT_DATABASE_ID environment variable");
        return NextResponse.json({
          error: "Server configuration error: Missing document database ID"
        }, { status: 500 });
      }

      console.log(`Fetching content list of type: ${type}`);
      let contentItems;

      // Get content based on the requested type
      if (type === 'blog') {
        contentItems = await getBlogPosts();
      } else if (type === 'document') {
        contentItems = await getDocuments();
      } else {
        return NextResponse.json({
          error: `Invalid type parameter: ${type}. Supported values are 'document' or 'blog'`
        }, { status: 400 });
      }

      // Simplify the response if format=simple is specified
      if (format === 'simple') {
        contentItems = simplifyNotionDocuments(contentItems);
      }

      return NextResponse.json(contentItems);
    }
  } catch (error) {
    console.error("Error in Notion API handler:", error);
    // Return more helpful error message
    return NextResponse.json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

// Function to get page content with better error logging
async function getPageContent(pageId) {
  try {
    console.log(`Making Notion API call for blocks.children.list with block_id: ${pageId}`);
    const blocks = await notion.blocks.children.list({ block_id: pageId });
    console.log(`Successfully fetched ${blocks.results.length} blocks`);
    return blocks.results;
  } catch (error) {
    console.error(`Error fetching page content for pageId ${pageId}:`, error);
    throw new Error(`Failed to retrieve page content: ${error.message}`);
  }
}

// Function to get all documents from database with better error handling
async function getDocuments() {
  try {
    const databaseId = process.env.NOTION_DOCUMENT_DATABASE_ID;
    console.log(`Making Notion API call for databases.query with database_id: ${databaseId}`);

    const response = await notion.databases.query({
      database_id: databaseId
      // Filter removed as requested
    });

    console.log(`Successfully fetched ${response.results.length} documents`);
    return response.results;
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw new Error(`Failed to retrieve documents: ${error.message}`);
  }
}

// Function to get all blog posts from database with better error handling
async function getBlogPosts() {
  try {
    const databaseId = process.env.NOTION_BLOG_DATABASE_ID;
    console.log(`Making Notion API call for databases.query with database_id: ${databaseId}`);

    const response = await notion.databases.query({
      database_id: databaseId
      // Filter and sorts removed as requested
    });

    console.log(`Successfully fetched ${response.results.length} blog posts`);
    return response.results;
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    throw new Error(`Failed to retrieve blog posts: ${error.message}`);
  }
}

// Function to simplify Notion document data
function simplifyNotionDocuments(notionResponse) {
  // Map through the array of documents and extract only the essential information
  return notionResponse.map(document => {
    // Get the title from the "Documents filed" property (or any title property)
    const titleProperty = document.properties["Documents  filed"] ||
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
}

// Helper function to find a title property in a Notion page
function findTitleProperty(properties) {
  // Look for any property that has type "title"
  return Object.values(properties).find(prop => prop.type === "title");
}