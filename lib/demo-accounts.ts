export const DEMO_PASSWORD = "SnsDemo2026!";

export const DEMO_ACCOUNTS = [
  {
    label: "Admin",
    email: "demo-admin@sns-vol.demo",
    description: "Full admin panel: events, volunteers, grievances, applications",
    path: "/admin",
  },
  {
    label: "Organiser",
    email: "demo-organiser@sns-vol.demo",
    description: "Family member + organiser: volunteer home & event organize panel",
    path: "/",
  },
  {
    label: "Volunteer",
    email: "demo-volunteer@sns-vol.demo",
    description: "Active volunteer: browse events, I-Card, attendance",
    path: "/",
  },
] as const;
