/** Senior / junior internship domain types (DB wiring later). */

export type InternshipWing = "junior" | "senior";

/** Senior-wing personas (demo until auth roles land). */
export type SeniorPersona =
  | "ritika"
  | "rashmi"
  | "mentor"
  | "coordinator"
  | "intern";

export type SeniorInternStatus =
  | "applied"
  | "allotted"
  | "active"
  | "completed"
  | "awaiting_certificate"
  | "certified";

export type AttendanceMark = "present" | "absent" | "leave" | "unmarked";

export type SeniorModuleId =
  | "development"
  | "economics"
  | "video_editing"
  | "teaching"
  | "outreach";

export type SeniorModule = {
  id: SeniorModuleId;
  title: string;
};

export type SeniorMentor = {
  id: string;
  name: string;
  phone: string;
};

export type SeniorIntern = {
  id: string;
  name: string;
  school: string;
  phone: string;
  preferredModule: SeniorModuleId | null;
  allottedModule: SeniorModuleId | null;
  mentorId: string | null;
  centre: string;
  status: SeniorInternStatus;
  feesPaid: boolean;
  centreVisited: boolean;
  googleReviewDone: boolean;
  mentorSignedOff: boolean;
  rashmiSignedOff: boolean;
  ritikaCertified: boolean;
  notes: string;
};

export type SeniorAttendanceRow = {
  internId: string;
  date: string;
  mark: AttendanceMark;
  by: "rashmi" | "mentor";
};

export type SeniorFeedbackLog = {
  id: string;
  internId: string;
  mentorId: string;
  at: string;
  body: string;
  submittedWork: boolean;
};

export type SeniorBatch = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  centre: string;
};
