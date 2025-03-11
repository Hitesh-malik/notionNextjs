'use client';

import { useState } from 'react';
import { NotionRenderer } from 'react-notion-x';
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import type { ExtendedRecordMap } from 'notion-types';

// Import required styles in your main component
import 'react-notion-x/src/styles.css';

interface NotionContentRendererProps {
  recordMap: ExtendedRecordMap | null;
  pageBlocks: any[] | null;
  darkMode: boolean;
}

export function NotionContentRenderer({ recordMap, pageBlocks, darkMode }: NotionContentRendererProps) {
  const [copiedBlockId, setCopiedBlockId] = useState<string | null>(null);

  // Custom renderer for Notion blocks
  const renderBlockContent = (blocks: any[]) => {
    return blocks.map((block, index) => {
      const { type, id } = block;

      switch (type) {
        case 'paragraph':
          return (
            <p key={id || index} className="my-2">
              {block.paragraph?.rich_text?.map((text: any, i: number) => (
                <span key={i} className={text.annotations?.bold ? 'font-bold' : ''}>
                  {text.plain_text}
                </span>
              )) || ''}
            </p>
          );
        case 'heading_1':
          return (
            <h1 id={id || `heading-${index}`} key={id || index} className="text-3xl font-bold my-4 pt-6 scroll-mt-20">
              {block.heading_1?.rich_text?.map((text: any, i: number) => (
                <span key={i}>{text.plain_text}</span>
              )) || ''}
            </h1>
          );
        case 'heading_2':
          return (
            <h2 id={id || `heading-${index}`} key={id || index} className="text-2xl font-bold my-3 pt-5 scroll-mt-20">
              {block.heading_2?.rich_text?.map((text: any, i: number) => (
                <span key={i}>{text.plain_text}</span>
              )) || ''}
            </h2>
          );
        case 'heading_3':
          return (
            <h3 id={id || `heading-${index}`} key={id || index} className="text-xl font-bold my-2 pt-4 scroll-mt-20">
              {block.heading_3?.rich_text?.map((text: any, i: number) => (
                <span key={i}>{text.plain_text}</span>
              )) || ''}
            </h3>
          );
        case 'bulleted_list_item':
          return (
            <ul key={id || index} className="list-disc ml-5 my-2">
              <li>
                {block.bulleted_list_item?.rich_text?.map((text: any, i: number) => (
                  <span key={i}>{text.plain_text}</span>
                )) || ''}
              </li>
            </ul>
          );
        case 'numbered_list_item':
          return (
            <ol key={id || index} className="list-decimal ml-5 my-2">
              <li>
                {block.numbered_list_item?.rich_text?.map((text: any, i: number) => (
                  <span key={i}>{text.plain_text}</span>
                )) || ''}
              </li>
            </ol>
          );
        case 'code':
          const code = block.code?.rich_text?.map((text: any) => text.plain_text).join('') || '';
          return (
            <div key={id || index} className="relative group">
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded my-4 overflow-x-auto">
                <code>{code}</code>
              </pre>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(code);
                  setCopiedBlockId(id);
                  setTimeout(() => setCopiedBlockId(null), 2000);
                }}
                className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
              >
                {copiedBlockId === id ?
                  <Check className="h-4 w-4 text-green-500" /> :
                  <Copy className="h-4 w-4" />
                }
              </Button>
            </div>
          );
        case 'image':
          const imageUrl = block.image?.file?.url || block.image?.external?.url;
          return imageUrl ? (
            <div key={id || index} className="my-4">
              <img
                src={imageUrl}
                alt={block.image?.caption || "Notion image"}
                className="max-w-full h-auto rounded"
              />
              {block.image?.caption && (
                <p className="text-center text-sm text-gray-500 mt-1">
                  {block.image.caption}
                </p>
              )}
            </div>
          ) : null;
        case 'divider':
          return <hr key={id || index} className="my-4 border-t border-gray-200 dark:border-gray-700" />;
        default:
          return (
            <div key={id || index} className="text-gray-500 my-2">
              Unsupported block type: {type}
            </div>
          );
      }
    });
  };

  if (recordMap) {
    return (
      <div className="notion-renderer-wrapper rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <NotionRenderer
          recordMap={recordMap}
          fullPage={false}
          darkMode={darkMode}
          mapPageUrl={(pageId) => `/docs?id=${pageId}`}
        />
      </div>
    );
  }

  if (pageBlocks && pageBlocks.length > 0) {
    return (
      <div className="custom-notion-content prose dark:prose-invert max-w-none prose-img:rounded prose-headings:scroll-mt-20">
        {renderBlockContent(pageBlocks)}
      </div>
    );
  }

  return null;
}