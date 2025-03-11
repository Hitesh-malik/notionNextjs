'use client';

import { NotionItem } from "@/types/notion";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface PageBreadcrumbProps {
  activeNavItem: string;
  clickedItem: NotionItem | null;
}

export function PageBreadcrumb({ activeNavItem, clickedItem }: PageBreadcrumbProps) {
  return (
    <div className="flex items-center gap-2">
      <SidebarTrigger className="md:hidden -ml-1" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="#">
              {activeNavItem === "Blog" ? "Blog" : "Docs"}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {clickedItem ? clickedItem.title : (activeNavItem === "Blog" ? "Blog Posts" : "Data Fetching")}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}