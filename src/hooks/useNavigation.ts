'use client';

import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function useNavigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');

  // Extract the last segment from the URL path
  const getInitialActiveItem = (): string => {
    // Default to "Docs" if no path segment matches
    let activeItem = "Docs";

    // Get the last part of the URL
    const segments = pathname.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];

    if (lastSegment) {
      // Map URL segments to your navigation items
      if (lastSegment.toLowerCase() === 'blogs') {
        activeItem = "Blog";
      } else if (lastSegment.toLowerCase() === 'docs') {
        activeItem = "Docs";
      }
    }

    return activeItem;
  };

  // Initialize state with the value from URL
  const [activeNavItem, setActiveNavItem] = useState<string>(getInitialActiveItem());

  // Update activeNavItem when pathname changes
  useEffect(() => {
    setActiveNavItem(getInitialActiveItem());
  }, [pathname]);

  // Handler for updating active nav item
  const handleNavItemChange = (itemTitle: string): void => {
    setActiveNavItem(itemTitle);
    console.log("Active navigation item changed to:", itemTitle);
  };

  return {
    activeNavItem,
    setActiveNavItem: handleNavItemChange,
    slug
  };
}