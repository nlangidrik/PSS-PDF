"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { APP_NAME, LOGO_PATH, ORG_NAME } from "@/lib/brand";
import { withBasePath } from "@/lib/base-path";
import { useState, useEffect, useCallback } from "react";
import { Menu, X, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export type NavItem = {
  title: string;
  href: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

interface SidebarContentProps {
  pathname: string;
  navGroups: NavGroup[];
  isAdmin?: boolean;
  onLinkClick?: () => void;
  collapsed?: boolean;
}

function SidebarContent({ pathname, navGroups, isAdmin = false, onLinkClick, collapsed }: SidebarContentProps) {
  return (
    <>
      <div className={`flex flex-col items-center py-4 border-b border-blue-800 dark:border-slate-700 ${collapsed ? "px-2" : "px-4 md:px-6"}`}>
        <Link href="/logout" className="focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-lg p-1">
          <Image src={withBasePath(LOGO_PATH)} alt={APP_NAME} width={60} height={60} className={collapsed ? "w-10 h-10" : "w-12 h-12 md:w-16 md:h-16"} priority />
        </Link>
        {!collapsed && (
          <span className="mt-2 font-bold text-sm md:text-lg text-center text-white dark:text-slate-100">{APP_NAME}</span>
        )}
      </div>
      <nav className="flex-1 mt-4 px-2">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            {!collapsed && group.label && (
              <div className="px-3 py-2 text-xs font-semibold text-blue-200 dark:text-slate-400 uppercase tracking-wider">
                {group.label}
              </div>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onLinkClick}
                    title={collapsed ? item.title : undefined}
                    className={`flex items-center gap-3 transition-all duration-200 rounded-lg text-sm font-medium ${
                      collapsed ? "px-3 py-3 justify-center" : "px-3 md:px-6 py-3"
                    } ${
                      (pathname === item.href || (item.href === "/admin" && pathname === "/admin"))
                        ? "bg-blue-800 dark:bg-slate-800 text-white dark:text-slate-100 shadow-lg"
                        : "text-blue-100 dark:text-slate-300 hover:bg-blue-800/50 dark:hover:bg-slate-800/70 hover:text-white dark:hover:text-slate-100"
                    }`}
                  >
                    <span className="truncate">{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="mt-6 px-2">
          <Link
            href="/logout"
            className={`block text-center w-full bg-blue-800 dark:bg-slate-800 hover:bg-blue-700 dark:hover:bg-slate-700 text-white dark:text-slate-200 font-semibold rounded-lg transition-colors duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              collapsed ? "px-3 py-3" : "px-4 md:px-6 py-3"
            }`}
          >
            {collapsed ? "⏻" : "Log Out"}
          </Link>
        </div>
      </nav>
      {isAdmin ? (
        <div className={`py-3 text-xs text-blue-200 dark:text-slate-400 border-t border-blue-800 dark:border-slate-700 ${collapsed ? "px-2 text-center" : "px-3"}`}>
          {collapsed ? "ADMIN" : "Admin Panel"}
        </div>
      ) : (
        !collapsed && (
          <div className="px-3 py-3 text-xs text-center text-blue-200 dark:text-slate-400 border-t border-blue-800 dark:border-slate-700">
            <p>{ORG_NAME}</p>
          </div>
        )
      )}
    </>
  );
}

interface SidebarProps {
  navGroups: NavGroup[];
  isAdmin?: boolean;
}

const SIDEBAR_STATE_KEY = "pss-sidebar-collapsed";

export function Sidebar({ navGroups, isAdmin = false }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_STATE_KEY) === "true";
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync sidebar collapsed state from localStorage for hydration safety
      if (stored) setCollapsed(true);
    } catch { /* ignore */ }
  }, []);

  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem(SIDEBAR_STATE_KEY, String(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleMobileMenu}
          className="bg-blue-900 dark:bg-slate-800 text-white dark:text-slate-200 border-blue-700 dark:border-slate-600 hover:bg-blue-800 dark:hover:bg-slate-700 focus:ring-2 focus:ring-blue-400 shadow-lg"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`md:hidden fixed top-0 left-0 h-full bg-blue-900 dark:bg-slate-900 text-white dark:text-slate-100 z-50 transform transition-all duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } w-72 max-w-[85vw] shadow-2xl`}>
        <div className="flex justify-end p-4 border-b border-blue-800 dark:border-slate-700">
          <button
            onClick={closeMobileMenu}
            className="p-2 rounded-lg hover:bg-blue-800 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>
        <SidebarContent pathname={pathname} navGroups={navGroups} isAdmin={isAdmin} onLinkClick={closeMobileMenu} />
      </aside>

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex bg-blue-900 dark:bg-slate-900 text-white dark:text-slate-100 min-h-screen flex-col shadow-lg transition-all duration-300 ease-in-out ${collapsed ? "w-16" : "w-64"}`}>
        {/* Collapse/expand toggle */}
        <button
          onClick={toggleCollapse}
          className="flex items-center justify-center h-10 mx-2 mt-2 rounded-lg text-blue-300 dark:text-slate-400 hover:bg-blue-800 dark:hover:bg-slate-800 hover:text-white dark:hover:text-slate-200 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
        <SidebarContent pathname={pathname} navGroups={navGroups} isAdmin={isAdmin} collapsed={collapsed} />
      </aside>
    </>
  );
}
