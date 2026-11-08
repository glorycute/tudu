import { CalendarCheck, CalendarDays, Inbox, Search, Settings, Tag, type LucideIcon } from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon; mobile: boolean };

export const NAV_ITEMS: NavItem[] = [
  { href: "/today", label: "Today", icon: CalendarCheck, mobile: true },
  { href: "/inbox", label: "Inbox", icon: Inbox, mobile: true },
  { href: "/calendar", label: "Calendar", icon: CalendarDays, mobile: true },
  { href: "/categories", label: "Categories", icon: Tag, mobile: true },
  { href: "/search", label: "Search", icon: Search, mobile: true },
  { href: "/settings", label: "Settings", icon: Settings, mobile: false },
];
