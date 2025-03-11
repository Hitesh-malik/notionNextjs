'use client';

import { NotionItem } from "@/types/notion";

interface PlaceholderContentProps {
  activeNavItem: string;
  clickedItem?: NotionItem | null;
}

export function PlaceholderContent({ activeNavItem, clickedItem }: PlaceholderContentProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-full max-w-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
        <div className="flex justify-center mb-6">
          {clickedItem ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          ) : activeNavItem.toLowerCase() === "blog" ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          )}
          <div className="absolute ml-16 mt-1">
            <div className="bg-yellow-400 text-yellow-900 rounded-full h-8 w-8 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-200 mb-3">
          {clickedItem 
            ? `${clickedItem.title} Documentation Coming Soon`
            : `${activeNavItem === "Blog" ? "Blog Post" : "Documentation"} Coming Soon`
          }
        </h2>
        <p className="text-blue-700 dark:text-blue-300 mb-6">
          {clickedItem
            ? `Our team is currently working on adding comprehensive documentation for this ${activeNavItem.toLowerCase() === "blog" ? "blog post" : "section"}.`
            : `Our team is currently working on adding comprehensive ${activeNavItem.toLowerCase() === "blog" ? "content" : "documentation"} for this section.`
          }
        </p>
        <div className="flex flex-col gap-4">
          {activeNavItem.toLowerCase() === "blog" ? (
            <>
              <div className="flex items-center gap-3 text-blue-800 dark:text-blue-200">
                <div className="bg-blue-100 dark:bg-blue-900/40 rounded-full p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <span className="text-sm">Articles and insights</span>
              </div>
              <div className="flex items-center gap-3 text-blue-800 dark:text-blue-200">
                <div className="bg-blue-100 dark:bg-blue-900/40 rounded-full p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <span className="text-sm">Case studies and tutorials</span>
              </div>
              <div className="flex items-center gap-3 text-blue-800 dark:text-blue-200">
                <div className="bg-blue-100 dark:bg-blue-900/40 rounded-full p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-sm">Video content and demos</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 text-blue-800 dark:text-blue-200">
                <div className="bg-blue-100 dark:bg-blue-900/40 rounded-full p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-sm">Tutorials and guides</span>
              </div>
              <div className="flex items-center gap-3 text-blue-800 dark:text-blue-200">
                <div className="bg-blue-100 dark:bg-blue-900/40 rounded-full p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span className="text-sm">Code examples and snippets</span>
              </div>
              <div className="flex items-center gap-3 text-blue-800 dark:text-blue-200">
                <div className="bg-blue-100 dark:bg-blue-900/40 rounded-full p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm">FAQs and troubleshooting</span>
              </div>
            </>
          )}
        </div>
        <div className="mt-8 pt-6 border-t border-blue-200 dark:border-blue-800 text-sm text-blue-600 dark:text-blue-400">
          Please check back soon or browse other available {activeNavItem.toLowerCase()} in the sidebar.
        </div>
      </div>
    </div>
  );
}