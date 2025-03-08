import { NextResponse } from 'next/server';
import { 
  getDocuments, 
  getBlogPosts, 
  getPageBlocks,
  simplifyNotionDocuments
} from '@/lib/notion-client';

export async function GET(request: Request) {
  try {
    // Parse the URL to get query parameters
    const url = new URL(request.url);
    const pageId = url.searchParams.get('pageId');
    const type = url.searchParams.get('type');
    const format = url.searchParams.get('format');

    console.log("API request received:", { pageId, type, format });

    // Check for required environment variables
    if (!process.env.NOTION_API_KEY) {
      console.error("Missing NOTION_API_KEY environment variable");
      return NextResponse.json({
        error: "Server configuration error: Missing API key"
      }, { status: 500 });
    }

    // Handle pageId request - fetching page blocks
    if (pageId) {
      console.log(`Fetching page content for pageId: ${pageId}`);
      const pageBlocks = await getPageBlocks(pageId);
      return NextResponse.json(pageBlocks);
    } 
    
    // Handle database queries
    else {
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
        const response = await getBlogPosts();
        contentItems = response.results;
      } else if (type === 'document') {
        const response = await getDocuments();
        contentItems = response.results;
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
  } catch (error: any) {
    console.error("Error in Notion API handler:", error);
    // Return more helpful error message
    return NextResponse.json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}