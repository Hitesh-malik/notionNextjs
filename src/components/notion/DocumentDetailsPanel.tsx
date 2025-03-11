'use client';

import { NotionItem } from "@/types/notion";
import { Bookmark, MessageSquare } from "lucide-react";
import { useNotionContext } from "@/context/NotionContext";
import { useState, useEffect, useCallback } from "react";

interface DocumentDetailsPanelProps {
  clickedItem: NotionItem | null;
}

interface TocItem {
  id: string;
  text: string;
  level: number; // 1 for H1, 2 for H2
  active?: boolean;
}

export function DocumentDetailsPanel({ clickedItem }: DocumentDetailsPanelProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { pageBlocks } = useNotionContext();

  // Extract TOC items from pageBlocks (only H1 and H2)
  const extractTocItems = useCallback(() => {
    if (!pageBlocks) return [];
    
    // Only extract H1 and H2 headings
    return pageBlocks
      .filter(block => 
        block.type === 'heading_1' || 
        block.type === 'heading_2'
      )
      .map((block, index) => {
        let text = '';
        let level = 1;
        
        if (block.heading_1) {
          text = block.heading_1.rich_text?.[0]?.plain_text || '';
          level = 1;
        } else if (block.heading_2) {
          text = block.heading_2.rich_text?.[0]?.plain_text || '';
          level = 2;
        }
        
        // Add an ID for the heading if not present
        const id = block.id || `heading-${index}`;
        
        return { id, text, level };
      })
      .filter(item => item.text); // Only include items with text
  }, [pageBlocks]);

  // Update TOC items when blocks change
  useEffect(() => {
    if (!clickedItem) return;
    
    setLoading(true);
    try {
      const items = extractTocItems();
      setTocItems(items);
      
      // Set the first item as active by default if available
      if (items.length > 0 && !activeId) {
        setActiveId(items[0].id);
      }
    } catch (error) {
      console.error('Error extracting TOC:', error);
    } finally {
      setLoading(false);
    }
  }, [clickedItem, pageBlocks, extractTocItems, activeId]);

  // Set up intersection observer to highlight active section
  useEffect(() => {
    if (typeof window === 'undefined' || !tocItems.length) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-100px 0px -80% 0px',
        threshold: 0
      }
    );
    
    // Observe all heading elements
    tocItems.forEach(item => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });
    
    return () => {
      // Cleanup observer
      tocItems.forEach(item => {
        const element = document.getElementById(item.id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [tocItems]);

  // Handle click on TOC item
  const handleTocItemClick = (id: string) => {
    setActiveId(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!clickedItem) return null;

  return (
    <aside className="w-64 border-l border-border bg-card details-panel">
      <div className="p-4">
        <h3 className="text-base font-semibold mb-6 border-b pb-2 text-foreground/90">On this page</h3>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Table of Contents */}
            <nav className="space-y-4">
              {tocItems.length > 0 ? (
                <div className="space-y-2">
                  {tocItems.map((item) => {
                    const isActive = activeId === item.id;
                    
                    // Style based on heading level and active state
                    let linkStyle = 'block transition-colors duration-150 hover:text-primary';
                    
                    // Base styling by level
                    if (item.level === 1) {
                      linkStyle += ' font-medium text-foreground/90 text-base';
                    } else if (item.level === 2) {
                      linkStyle += ' pl-3 text-foreground/80 text-sm';
                    }
                    
                    // Active state styling
                    if (isActive) {
                      linkStyle += ' text-primary font-medium';
                    }
                    
                    return (
                      <a 
                        key={item.id} 
                        href={`#${item.id}`}
                        className={linkStyle}
                        onClick={(e) => {
                          e.preventDefault();
                          handleTocItemClick(item.id);
                        }}
                      >
                        {item.text}
                        {isActive && (
                          <span className="absolute left-0 w-0.5 bg-primary h-5 rounded-r-sm" style={{ top: '50%', transform: 'translateY(-50%)' }}></span>
                        )}
                      </a>
                    );
                  })}
                </div>
              ) : (
                /* Fallback TOC if no headings found */
                <div className="text-foreground/70 italic text-sm">
                  No table of contents available
                </div>
              )}
            </nav>
            
            {/* Actions at bottom */}
            <div className="pt-4 mt-4 border-t border-border/60 flex flex-col space-y-3">
              <button className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
                <Bookmark className="h-4 w-4" />
                <span>Bookmark this page</span>
              </button>
              
              <button className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
                <MessageSquare className="h-4 w-4" />
                <span>Leave feedback</span>
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Styled scrollbar for the panel */}
      <style jsx global>{`
        /* Panel scrollbar */
        .details-panel {
          scrollbar-width: thin;
          scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
        }
        
        .details-panel::-webkit-scrollbar {
          width: 6px;
        }
        
        .details-panel::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .details-panel::-webkit-scrollbar-thumb {
          background-color: rgba(155, 155, 155, 0.4);
          border-radius: 3px;
        }
        
        .dark .details-panel::-webkit-scrollbar-thumb {
          background-color: rgba(100, 100, 100, 0.4);
        }
        
        .details-panel::-webkit-scrollbar-thumb:hover {
          background-color: rgba(155, 155, 155, 0.7);
        }
        
        .dark .details-panel::-webkit-scrollbar-thumb:hover {
          background-color: rgba(100, 100, 100, 0.7);
        }
      `}</style>
    </aside>
  );
}