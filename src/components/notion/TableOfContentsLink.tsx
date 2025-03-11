'use client';

import { useState, useEffect } from 'react';

interface TableOfContentsLinkProps {
  id: string;
  text: string;
  level: number;
}

export function TableOfContentsLink({ id, text, level }: TableOfContentsLinkProps) {
  const [isActive, setIsActive] = useState(false);

  // Handle scroll position to highlight active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsActive(entry.isIntersecting);
      },
      {
        rootMargin: '-100px 0px -70% 0px', // Adjust margins to determine when a section is "active"
        threshold: 0
      }
    );

    // Find the heading element by ID
    const element = document.getElementById(id);
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [id]);

  // Determine style based on level and active state
  let className = 'block transition-colors hover:text-primary ';
  
  // Add padding based on heading level
  if (level === 1) {
    className += 'font-medium';
  } else if (level === 2) {
    className += 'pl-2 text-muted-foreground';
  } else {
    className += 'pl-4 text-muted-foreground';
  }
  
  // Add active styling
  if (isActive) {
    className += ' text-primary font-medium';
  }

  // Handle click to scroll to the section
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a 
      href={`#${id}`}
      className={className}
      onClick={handleClick}
    >
      {text}
    </a>
  );
}