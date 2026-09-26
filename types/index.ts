export type UserRole =
  | "volunteer"
  | "organiser"
  | "admin"
  | "coordinator"
  | "mentor";
export type ProfileStatus = "pending" | "active" | "inactive";
export type EventStatus = "active" | "closed";
export type ApplicationStatus = "pending" | "approved" | "declined";
export type GrievanceStatus = "open" | "resolved";
export type NotificationType = "event" | "grievance" | "application" | "icard" | "award";

export interface Profile {
  id: string;
  name: string;
  college: string;
  phone: string;
  address: string;
  skills: string[];
  role: UserRole;
  volunteer_id: string | null;
  valid_until: string | null;
  status: ProfileStatus;
  avatar_url: string | null;
  email_notifs: boolean;
  public_profile: boolean;
  batch: string | null;
  /** Centre assignment for coordinator / mentor */
  centre?: string | null;
  delete_requested_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

/** Center Management domain types (sns-vol unified DB) */
export type CenterStudent = {
  id: string;
  name: string;
  class: string | null;
  school: string | null;
  center: string;
  photo_link: string | null;
  sex: string | null;
  status: string;
  guardian: string | null;
  contact: string | null;
  address: string | null;
  observations: string | null;
  created_at?: string;
};

export type CenterMentor = {
  id: string;
  profile_id: string | null;
  name: string;
  phone: string | null;
  center: string;
  email: string | null;
  status: string;
  paid: boolean;
  notes: string | null;
};

export type CenterMentorPunch = {
  id: string;
  mentor_id: string;
  on_date: string;
  punch_in: string | null;
  punch_out: string | null;
  source: "coordinator" | "self";
  approval_status: "pending" | "approved" | "rejected";
  notes: string | null;
};

export type GuestVisit = {
  id: string;
  full_name: string;
  phone: string | null;
  center: string;
  guest_type: string;
  visit_date: string;
  visit_time: string | null;
  comments: string | null;
  photo_link: string | null;
  qr_token: string | null;
};

export type CenterDocument = {
  id: string;
  title: string;
  url: string;
  center: string | null;
  priority: string;
  status: string;
  archived: boolean;
};

export type CenterCourse = {
  id: string;
  title: string;
  syllabus: string | null;
  mentor_id: string | null;
  center: string | null;
  start_date: string | null;
  end_date: string | null;
};

export type WordsmithEntry = {
  id: string;
  word: string;
  meaning: string;
  class_label: string | null;
  center: string | null;
  teach_by: string | null;
  exam_by: string | null;
};

export interface Event {
  id: string;
  slug: string;
  title: string;
  date: string;
  venue: string;
  description: string;
  criteria: string;
  status: EventStatus;
  required_skills: string[];
  category: string;
  coordinator_phone: string;
  region?: string | null;
  color?: string | null;
  end_date?: string | null;
  time_start?: string | null;
  time_end?: string | null;
  is_recurring?: boolean;
  cancelled_dates?: string[];
  has_applied?: boolean;
  application_status?: ApplicationStatus | null;
  has_attended?: boolean;
  rating?: number | null;
  created_at?: string;
}

export interface Grievance {
  id: string;
  user_id: string;
  category: string;
  description: string;
  status: GrievanceStatus;
  admin_notes?: string | null;
  created_at: string;
  user_name?: string;
}

export interface Application {
  id: string;
  user_id: string;
  event_id: string;
  status: ApplicationStatus;
  user_name: string;
  event_title: string;
  user_skills: string[];
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: NotificationType;
  read_at: string | null;
  created_at: string;
}

export type PublicationKind = "magazine" | "newsletter";

export interface SnsPublication {
  id: string;
  title: string;
  description: string;
  pdf_url: string;
  kind: PublicationKind;
  category: string;
  published_on: string;
  sort_order: number;
  created_by?: string | null;
  created_at?: string;
}

export interface AdminData {
  events: Event[];
  users: Profile[];
  grievances: Grievance[];
  applications: Application[];
}

export interface Award {
  id: string;
  title: string;
  description: string;
  event_id: string | null;
  icon?: string;
  color?: string;
  created_at?: string;
}

export interface UserAward {
  id: string;
  user_id: string;
  award_id: string;
  awarded_at: string;
  title: string;
  description: string;
  icon?: string;
  color?: string;
}

/** Display helpers for title-cased UI labels */
export function titleCaseStatus(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}
