export type QuickLink = {
  id: string;
  label: string;
  href: string;
  description?: string;
};

/** Editable quick links shown below the volunteer dashboard. */
export const QUICK_LINKS: QuickLink[] = [
  {
    id: "website",
    label: "Stand N Stride",
    href: "https://standnstride.org/",
    description: "Official foundation website",
  },
];
