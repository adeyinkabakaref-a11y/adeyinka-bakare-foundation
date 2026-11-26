export interface AdminNavigationItem {
  label: string;
  href?: string;
  icon: string;
  group?: string;
  badge?: string;
  children?: AdminNavigationItem[];
}

export const adminNavigation: AdminNavigationItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: "dashboard",
    group: "Main",
  },
  {
    label: "Members",
    href: "/admin/members",
    icon: "users",
    group: "People",
  },
  {
    label: "Volunteers",
    href: "/admin/volunteers",
    icon: "user-plus",
    group: "People",
  },
  {
    label: "Beneficiaries",
    href: "/admin/beneficiaries",
    icon: "graduation-cap",
    group: "People",
  },
  {
    label: "Executives",
    href: "/admin/executives",
    icon: "award",
    group: "People",
  },
  {
    label: "Programmes",
    href: "/admin/programmes",
    icon: "book",
    group: "Content",
  },
  {
    label: "Testimonials",
    href: "/admin/testimonials",
    icon: "message-square",
    group: "Content",
  },
  {
    label: "Events",
    href: "/admin/events",
    icon: "calendar",
    group: "Content",
  },
  {
    label: "News",
    href: "/admin/news",
    icon: "newspaper",
    group: "Content",
  },
  {
    label: "Media",
    href: "/admin/media",
    icon: "image",
    group: "Content",
  },
  {
    label: "Content",
    href: "/admin/contents",
    icon: "file-text",
    group: "Content",
  },
  {
    label: "Management",
    icon: "briefcase",
    group: "Management",
    children: [
      {
        label: "Meetings",
        href: "/admin/meetings",
        icon: "calendar-check",
        badge: "new",
      },
      {
        label: "Proposals",
        href: "/admin/proposals",
        icon: "lightbulb",
        badge: "new",
      },
      {
        label: "Records",
        href: "/admin/records",
        icon: "folder",
        badge: "new",
      },
      {
        label: "Handovers",
        href: "/admin/handovers",
        icon: "arrow-right-left",
        badge: "new",
      },
    ],
  },
  {
    label: "Footer",
    href: "/admin/footer",
    icon: "layout",
    group: "Site",
  },
  {
    label: "Social Links",
    href: "/admin/social-links",
    icon: "share-2",
    group: "Site",
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: "settings",
    group: "Account",
  },
  {
    label: "Notifications",
    href: "/admin/notifications",
    icon: "bell",
    group: "Account",
  },
  {
    label: "Admins",
    href: "/admin/admins",
    icon: "shield",
    group: "Account",
  },
  {
    label: "Security",
    href: "/admin/security",
    icon: "lock",
    group: "Account",
  },
];
