import type {
  SeniorAttendanceRow,
  SeniorBatch,
  SeniorFeedbackLog,
  SeniorIntern,
  SeniorMentor,
  SeniorModule,
  SeniorPersona,
} from "./types";

export const SENIOR_PERSONAS: {
  id: SeniorPersona;
  label: string;
  blurb: string;
}[] = [
  {
    id: "ritika",
    label: "Ritika (gate / certs)",
    blurb: "Forms in → route to Rashmi. Final certificate after checks.",
  },
  {
    id: "rashmi",
    label: "Rashmi (senior lead)",
    blurb: "Modules, 1:1 mentor map, batch oversight.",
  },
  {
    id: "mentor",
    label: "Mentor",
    blurb: "My interns: attendance, feedback, sign-off.",
  },
  {
    id: "coordinator",
    label: "Centre coordinator",
    blurb: "Who arrived at my centre; light oversight.",
  },
  {
    id: "intern",
    label: "Intern (kid)",
    blurb: "My module, attendance, profile.",
  },
];

export const SENIOR_MODULES: SeniorModule[] = [
  { id: "development", title: "Development" },
  { id: "economics", title: "Economics" },
  { id: "video_editing", title: "Video editing" },
  { id: "teaching", title: "Teaching" },
  { id: "outreach", title: "Outreach" },
];

export const SENIOR_BATCH: SeniorBatch = {
  id: "batch-sr-2026-04",
  title: "Senior Internship — April 2026",
  startDate: "2026-04-01",
  endDate: "2026-04-20",
  centre: "Sector 6",
};

export const SENIOR_MENTORS: SeniorMentor[] = [
  { id: "m1", name: "Asha Mentor", phone: "9810000001" },
  { id: "m2", name: "Vikram Mentor", phone: "9810000002" },
  { id: "m3", name: "Neha Mentor", phone: "9810000003" },
];

/** Demo logged-in mentor / intern when those personas are selected. */
export const DEMO_MENTOR_ID = "m1";
/** Seeded UUID for Ananya Sharma (see scripts/seed-internship-senior.mjs). */
export const DEMO_INTERN_ID = "a0000001-0000-4000-8000-000000000011";
export const DEMO_COORD_CENTRE = "Sector 6";

export const INITIAL_SENIOR_INTERNS: SeniorIntern[] = [
  {
    id: "i1",
    name: "Ananya Sharma",
    school: "DPS RK Puram",
    phone: "9991100001",
    preferredModule: "development",
    allottedModule: "development",
    mentorId: "m1",
    centre: "Sector 6",
    status: "active",
    feesPaid: true,
    centreVisited: true,
    googleReviewDone: false,
    mentorSignedOff: false,
    rashmiSignedOff: false,
    ritikaCertified: false,
    notes: "",
  },
  {
    id: "i2",
    name: "Rohan Mehta",
    school: "Modern School",
    phone: "9991100002",
    preferredModule: "economics",
    allottedModule: "economics",
    mentorId: "m1",
    centre: "Sector 6",
    status: "active",
    feesPaid: true,
    centreVisited: true,
    googleReviewDone: false,
    mentorSignedOff: false,
    rashmiSignedOff: false,
    ritikaCertified: false,
    notes: "",
  },
  {
    id: "i3",
    name: "Ishita Kapoor",
    school: "Sanskriti",
    phone: "9991100003",
    preferredModule: "video_editing",
    allottedModule: null,
    mentorId: null,
    centre: "Sector 6",
    status: "applied",
    feesPaid: false,
    centreVisited: false,
    googleReviewDone: false,
    mentorSignedOff: false,
    rashmiSignedOff: false,
    ritikaCertified: false,
    notes: "Awaiting module allotment",
  },
  {
    id: "i4",
    name: "Kabir Singh",
    school: "Springdales",
    phone: "9991100004",
    preferredModule: "teaching",
    allottedModule: "teaching",
    mentorId: "m2",
    centre: "Sector 15",
    status: "active",
    feesPaid: true,
    centreVisited: false,
    googleReviewDone: false,
    mentorSignedOff: false,
    rashmiSignedOff: false,
    ritikaCertified: false,
    notes: "",
  },
  {
    id: "i5",
    name: "Meera Nair",
    school: "Mother's International",
    phone: "9991100005",
    preferredModule: "outreach",
    allottedModule: "outreach",
    mentorId: "m2",
    centre: "Sector 15",
    status: "active",
    feesPaid: true,
    centreVisited: true,
    googleReviewDone: true,
    mentorSignedOff: false,
    rashmiSignedOff: false,
    ritikaCertified: false,
    notes: "",
  },
  {
    id: "i6",
    name: "Arjun Das",
    school: "Bal Bharati",
    phone: "9991100006",
    preferredModule: "development",
    allottedModule: "development",
    mentorId: "m3",
    centre: "Sector 6",
    status: "completed",
    feesPaid: true,
    centreVisited: true,
    googleReviewDone: true,
    mentorSignedOff: true,
    rashmiSignedOff: true,
    ritikaCertified: false,
    notes: "Ready for Ritika cert",
  },
  {
    id: "i7",
    name: "Sara Ali",
    school: "Tagore International",
    phone: "9991100007",
    preferredModule: "economics",
    allottedModule: null,
    mentorId: null,
    centre: "Sector 6",
    status: "applied",
    feesPaid: true,
    centreVisited: false,
    googleReviewDone: false,
    mentorSignedOff: false,
    rashmiSignedOff: false,
    ritikaCertified: false,
    notes: "",
  },
];

export const INITIAL_ATTENDANCE: SeniorAttendanceRow[] = [
  {
    internId: "i1",
    date: "2026-04-02",
    mark: "present",
    by: "mentor",
  },
  {
    internId: "i2",
    date: "2026-04-02",
    mark: "present",
    by: "mentor",
  },
  {
    internId: "i1",
    date: "2026-04-03",
    mark: "leave",
    by: "mentor",
  },
];

export const INITIAL_FEEDBACK: SeniorFeedbackLog[] = [
  {
    id: "f1",
    internId: "i1",
    mentorId: "m1",
    at: "2026-04-02T16:00:00",
    body: "Good first day. Understands development brief.",
    submittedWork: true,
  },
];

export function moduleTitle(id: string | null): string {
  if (!id) return "—";
  return SENIOR_MODULES.find((m) => m.id === id)?.title ?? id;
}

export function mentorName(id: string | null): string {
  if (!id) return "Unassigned";
  return SENIOR_MENTORS.find((m) => m.id === id)?.name ?? id;
}
