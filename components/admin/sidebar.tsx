"use client";

import Link from "next/link";
import { useAccount } from "@/components/admin/account-provider";
import { requirementForPath } from "@/lib/auth/permissions";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  GraduationCap,
  Award,
  BookOpen,
  MessageSquare,
  Calendar,
  Newspaper,
  Image as ImageIcon,
  FileText,
  BarChart3,
  Layout,
  Share2,
  Settings,
  Bell,
  Shield,
  Lock,
  Mail,
  LogOut,
  Briefcase,
  CalendarCheck,
  Lightbulb,
  Folder,
  ArrowRightLeft,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { adminNavigation as configNavigation, type AdminNavigationItem } from "@/config/admin-navigation";

export interface NavItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  group?: string;
  badge?: string;
  children?: NavItem[];
}

const iconMap: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  users: Users,
  "user-plus": UserPlus,
  "graduation-cap": GraduationCap,
  award: Award,
  book: BookOpen,
  "message-square": MessageSquare,
  calendar: Calendar,
  newspaper: Newspaper,
  image: ImageIcon,
  "file-text": FileText,
  "bar-chart-3": BarChart3,
  layout: Layout,
  "share-2": Share2,
  settings: Settings,
  bell: Bell,
  shield: Shield,
  lock: Lock,
  mail: Mail,
  briefcase: Briefcase,
  "calendar-check": CalendarCheck,
  lightbulb: Lightbulb,
  folder: Folder,
  "arrow-right-left": ArrowRightLeft,
};

function getIcon(name: string): LucideIcon {
  return iconMap[name] || LayoutDashboard;
}

// Convert config navigation to sidebar format with icons
const adminNavigation: NavItem[] = configNavigation.map((item) => {
  if (item.children) {
    return {
      label: item.label,
      icon: getIcon(item.icon),
      group: item.group,
      children: item.children.map((child) => ({
        label: child.label,
        href: child.href,
        icon: getIcon(child.icon),
        badge: child.badge,
      })),
    };
  }
  return {
    label: item.label,
    href: item.href,
    icon: getIcon(item.icon),
    group: item.group,
    badge: item.badge,
  };
});

export { adminNavigation };

const navGroups = Array.from(new Set(adminNavigation.map((item) => item.group).filter(Boolean)));

interface SidebarProps {
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onLogout?: () => void;
  collapsed?: boolean;
}

export function Sidebar({ isMobile = false, isOpen = false, onClose, onLogout, collapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const [tooltip, setTooltip] = useState<{ label: string; x: number; y: number } | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const width = collapsed && !isMobile ? "w-20" : "w-64";
  const showLabels = !collapsed || isMobile;

  const { account, can: canDo } = useAccount();
  // Hide sections this role cannot open. Wait for the profile so nothing flashes.
  const visible = (href: string) => {
    if (!account) return false;
    const needs = requirementForPath(href);
    return needs ? canDo(needs.resource, needs.action) : true;
  };

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  return (
    <>
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-[100] bg-ink/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Admin navigation"
        className={`
          ${width}
          ${isMobile ? "fixed left-0 top-0 z-[101] h-dvh" : "sticky top-0 h-screen"}
          flex flex-col border-r border-white/10 bg-ink transition-all duration-200 ease-out
          ${isMobile ? (isOpen ? "translate-x-0" : "-translate-x-full") : ""}
          md:translate-x-0
        `}
      >
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-4">
          <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gold-300 shadow-sm ring-1 ring-white/10">
            <Image
              src="/brand/logo.png"
              alt="ABF Logo"
              width={36}
              height={36}
              className="size-full object-cover"
            />
          </div>
          {showLabels && (
            <div className="min-w-0">
              <div className="text-[13px] font-bold tracking-widest text-white">ABF</div>
              <div className="text-[11px] font-medium leading-none text-gold-300/90">Admin console</div>
            </div>
          )}
        </div>

        <nav className="flex flex-1 flex-col gap-4 overflow-y-auto px-3 pb-3 pt-3 scrollbar-hide">
          {navGroups.map((group) => {
            const items = adminNavigation.filter((i) => i.group === group && (!i.href || visible(i.href!)));
            if (!items.length) return null;
            return (
              <div key={group} className="flex flex-col gap-1">
                {showLabels && (
                  <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-white/50">
                    {group}
                  </div>
                )}
                {items.map((item) => {
                  const active = item.href ? isActive(item.href) : false;
                  const Icon = item.icon;
                  const hasChildren = item.children && item.children.length > 0;
                  const expanded = expandedItems.has(item.label);

                  if (hasChildren) {
                    return (
                      <div key={item.label}>
                        <button
                          onClick={() => toggleExpanded(item.label)}
                          className={`
                            group relative flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors duration-150
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300
                            ${
                              active
                                ? "bg-gold-300/15 text-gold-300"
                                : "text-white/75 hover:bg-white/10 hover:text-white"
                            }
                            ${!showLabels ? "justify-center" : "justify-start"}
                          `}
                        >
                          {active && (
                            <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gold-300" />
                          )}
                          <Icon className="size-5 shrink-0 transition-transform duration-150 group-hover:scale-110" />
                          {showLabels && (
                            <>
                              <span className="flex-1 whitespace-nowrap">{item.label}</span>
                              {expanded ? (
                                <ChevronDown className="size-4 shrink-0" />
                              ) : (
                                <ChevronRight className="size-4 shrink-0" />
                              )}
                            </>
                          )}
                        </button>
                        {expanded && (
                          <div className="ml-4 flex flex-col gap-1 pl-2 border-l border-white/10">
                            {item.children?.filter((child) => child.href).map((child) => {
                              const childActive = isActive(child.href!);
                              const ChildIcon = child.icon;
                              const childVisible = visible(child.href!);
                              if (!childVisible) return null;
                              return (
                                <Link
                                  key={child.href}
                                  href={child.href!}
                                  onClick={isMobile ? onClose : undefined}
                                  aria-current={childActive ? "page" : undefined}
                                  className={`
                                    group relative flex min-h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors duration-150
                                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300
                                    ${
                                      childActive
                                        ? "bg-gold-300/15 text-gold-300"
                                        : "text-white/60 hover:bg-white/10 hover:text-white"
                                    }
                                  `}
                                >
                                  {childActive && (
                                    <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r-full bg-gold-300" />
                                  )}
                                  <ChildIcon className="size-4 shrink-0" />
                                  {showLabels && (
                                    <>
                                      <span className="flex-1 whitespace-nowrap">{child.label}</span>
                                      {child.badge && (
                                        <span className="ml-2 rounded-full bg-gold-500 px-2 py-0.5 text-[10px] font-bold text-white">
                                          {child.badge}
                                        </span>
                                      )}
                                    </>
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href!}
                      onClick={isMobile ? onClose : undefined}
                      aria-current={active ? "page" : undefined}
                      aria-label={!showLabels ? item.label : undefined}
                      onMouseEnter={(e) => {
                        if (!showLabels && !isMobile) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltip({
                            label: item.label,
                            x: rect.right + 8,
                            y: rect.top + rect.height / 2 - 12,
                          });
                        }
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      className={`
                        group relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors duration-150
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300
                        ${
                          active
                            ? "bg-gold-300/15 text-gold-300"
                            : "text-white/75 hover:bg-white/10 hover:text-white"
                        }
                        ${!showLabels ? "justify-center" : "justify-start"}
                      `}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gold-300" />
                      )}
                      <Icon className="size-5 shrink-0 transition-transform duration-150 group-hover:scale-110" />
                      {showLabels && (
                        <>
                          <span className="flex-1 whitespace-nowrap">{item.label}</span>
                          {item.badge && (
                            <span className="ml-2 rounded-full bg-gold-500 px-2 py-0.5 text-[10px] font-bold text-white">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="p-3">
          <button
            onClick={onLogout}
            aria-label="Sign out"
            className="flex min-h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-destructive/40 bg-destructive/15 px-3.5 text-sm font-bold text-white transition-colors hover:bg-destructive/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
          >
            <LogOut className="size-[18px]" />
            {showLabels && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {tooltip && !isMobile && (
        <div
          className="pointer-events-none fixed z-[102] rounded bg-ink px-2 py-1 text-xs text-white shadow-lg ring-1 ring-white/10"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.label}
        </div>
      )}
    </>
  );
}
