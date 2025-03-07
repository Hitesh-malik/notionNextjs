'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Book, LogIn, Menu, Sunset, Trees, UserPlus, X, Zap } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
}

interface Navbar1Props {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  menu?: MenuItem[];
  mobileExtraLinks?: {
    name: string;
    url: string;
  }[];
  auth?: {
    login: {
      text: string;
      url: string;
    };
    signup: {
      text: string;
      url: string;
    };
  };
  activeItem?: string;
  onActiveChange?: (item: string) => void;
}

const Navbar1 = ({
  logo = {
    url: "https://telusko.com/",
    src: "/logo.png",
    alt: "logo",
    title: "",
  },
  menu = [
    { title: "Home", url: "https://telusko.com/" },
    {
      title: "careers",
      url: "https://telusko.com/CarrerPage/CarrerPage.html",
    },
    {
      title: "Docs",
      url: "#",
    },
    {
      title: "Blog",
      url: "#",
    },
  ],
  auth = {
    login: { text: "Log in", url: "#" },
    signup: { text: "Sign up", url: "#" },
  },
  activeItem,
  onActiveChange,
}: Navbar1Props) => {
  const router = useRouter();
  
  // Local state for active item if not controlled from parent
  const [localActiveItem, setLocalActiveItem] = useState<string>(activeItem || '');

  // Handle both local and parent state
  const handleItemClick = (itemTitle: string) => {
    setLocalActiveItem(itemTitle);
    
    // Handle navigation to dashboard pages for Docs and Blog
    if (itemTitle === "Docs") {
      router.push("/dashboard/docs");
    } else if (itemTitle === "Blog") {
      router.push("/dashboard/blogs");
    }
    
    // Ensure the method is available in the parent component
    if (onActiveChange) {
      onActiveChange(itemTitle);
    }
  };

  // Update local state if prop changes
  useEffect(() => {
    if (activeItem !== undefined && activeItem !== localActiveItem) {
      setLocalActiveItem(activeItem);
    }
  }, [activeItem]);

  // Determine if an item is active
  const isItemActive = (itemTitle: string) => {
    return localActiveItem === itemTitle;
  };

  return (
    <section className="pt-4 pb-2">
      <div className="container w-full max-w-full">
        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center justify-between w-full">
          {/* Left: Logo Section - 20% width */}
          <div className="w-1/5 flex justify-start pl-3 md:pl-8">
            <a href={logo.url} className="flex items-center gap-2">
              <img src={logo.src} className="h-8 md:h-10 lg:h-12 w-auto object-contain" alt={logo.alt} />
            </a>
          </div>
          {/* Center: Navigation Section */}
          <div className="w-3/5 flex justify-center">
            <NavigationMenu>
              <NavigationMenuList className="px-1 md:px-4 py-1 md:py-2 text-xs md:text-base font-medium text-gray-700 hover:text-gray-900 relative group">
                {menu.map((item) => renderMenuItem(item, isItemActive(item.title), handleItemClick))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          {/* Right: Authentication Section - 20% width */}
          <div className="w-1/5 flex justify-center gap-1 md:gap-3">
            <Button asChild variant="outline" size="sm">
              <a href={auth.login.url}>{auth.login.text}</a>
            </Button>
            <Button asChild size="sm">
              <a href={auth.signup.url}>{auth.signup.text}</a>
            </Button>
          </div>
        </nav>
        {/* Mobile Menu */}
        <div className="block md:hidden">
          <div className="flex items-center justify-between p-4">
            <a href={logo.url} className="flex items-center gap-2">
              <img src={logo.src} className="h-10 w-auto object-contain" alt={logo.alt} />
              <span className="text-lg font-semibold">{logo.title}</span>
            </a>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="hover:bg-gray-100 transition-colors">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader className="mb-0 pb-0">
                  <div className="flex justify-between items-center">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <SheetClose className="p-3 rounded-full hover:bg-gray-100 transition-colors ml-auto">
                      <X className="h-6 w-6" />
                    </SheetClose>
                  </div>
                </SheetHeader>
                <div className="flex flex-col gap-6 p-4">
                  <div className="space-y-3">
                    {menu.map((item) => renderMobileMenuItem(item, isItemActive(item.title), handleItemClick))}
                  </div>
                  <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-gray-200">
                    <Button asChild variant="outline" className="hover:bg-gray-50 transition-colors">
                      <a href={auth.login.url} className="flex items-center justify-center">
                        <LogIn className="mr-2 h-4 w-4" />
                        {auth.login.text}
                      </a>
                    </Button>
                    <Button asChild className="hover:opacity-90 transition-colors">
                      <a href={auth.signup.url} className="flex items-center justify-center">
                        <UserPlus className="mr-2 h-4 w-4" />
                        {auth.signup.text}
                      </a>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </section>
  );
};

// Updated menu item renderer with active state
const renderMenuItem = (item: MenuItem, isActive: boolean, onItemClick: (title: string) => void) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title} className={`text-muted-foreground ${isActive ? 'text-blue-600' : ''}`}>
        <NavigationMenuTrigger className={isActive ? 'bg-blue-50 text-blue-600' : ''}>
          {item.title}
        </NavigationMenuTrigger>
        <NavigationMenuContent>
          {item.items.map((subItem) => (
            <NavigationMenuLink asChild key={subItem.title} className="w-80">
              <SubMenuLink
                item={subItem}
                isActive={false}
                onClick={() => onItemClick(subItem.title)}
              />
            </NavigationMenuLink>
          ))}
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <a
      key={item.title}
      className={`group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-base md:text-lg font-medium ${isActive
          ? 'text-blue-600 after:w-full'
          : 'text-gray-700 after:w-0'
        } transition-colors hover:bg-muted hover:text-blue-600 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-blue-600 after:transition-all after:duration-300 after:ease-in-out hover:after:w-full mx-2`}
      href={item.url}
      onClick={(e) => {
        // Always prevent default for items that should use Next.js routing
        if (item.title === "Docs" || item.title === "Blog" || item.url === '#') {
          e.preventDefault();
        }
        onItemClick(item.title);
      }}
    >
      {item.title}
    </a>
  );
};

// Updated mobile menu item renderer with active state
const renderMobileMenuItem = (item: MenuItem, isActive: boolean, onItemClick: (title: string) => void) => {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className="border-b-0">
        <AccordionTrigger
          className={`text-md py-0 font-semibold hover:no-underline ${isActive ? 'text-blue-600' : ''}`}
          onClick={() => onItemClick(item.title)}
        >
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="mt-2">
          {item.items.map((subItem) => (
            <SubMenuLink
              key={subItem.title}
              item={subItem}
              isActive={false}
              onClick={() => onItemClick(subItem.title)}
            />
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <a
      key={item.title}
      href={item.url}
      className={`flex items-center px-4 py-3 text-md font-semibold rounded-lg transition-all duration-200 ${isActive
          ? 'bg-blue-50 text-blue-600'
          : 'text-gray-800 hover:bg-gray-100'
        }`}
      onClick={(e) => {
        // Always prevent default for items that should use Next.js routing
        if (item.title === "Docs" || item.title === "Blog" || item.url === '#') {
          e.preventDefault();
        }
        onItemClick(item.title);
      }}
    >
      {item.title}
    </a>
  );
};

// Updated submenu link with active state
const SubMenuLink = ({
  item,
  isActive,
  onClick
}: {
  item: MenuItem;
  isActive: boolean;
  onClick: () => void;
}) => {
  return (
    <a
      className={`flex flex-row gap-4 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none ${isActive
          ? 'bg-blue-50 text-blue-600'
          : 'hover:bg-muted hover:text-accent-foreground'
        }`}
      href={item.url}
      onClick={(e) => {
        // If it's just a hash URL, prevent default navigation
        if (item.url === '#') {
          e.preventDefault();
        }
        onClick();
      }}
    >
      <div>{item.icon}</div>
      <div>
        <div className="text-sm font-semibold">{item.title}</div>
        {item.description && (
          <p className="text-sm leading-snug text-muted-foreground">
            {item.description}
          </p>
        )}
      </div>
    </a>
  );
};

export { Navbar1 };