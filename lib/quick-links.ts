export type QuickLink = {
  id: string;
  label: string;
  href: string;
  description?: string;
  /** Opens in a new tab when true (default for external URLs). */
  external?: boolean;
};

/** Editable quick links shown below the volunteer dashboard. */
export const QUICK_LINKS: QuickLink[] = [
  {
    id: "magazine",
    label: "SNS Magazine",
    href: "/library",
    description: "Magazines & monthly newsletters",
    external: false,
  },
  {
    id: "publications",
    label: "Publications",
    href: "https://standnstride.org/publication/",
    description: "SNS articles and updates",
    external: true,
  },
  {
    id: "website",
    label: "Stand N Stride",
    href: "https://standnstride.org/",
    description: "Official foundation website",
    external: true,
  },
];
