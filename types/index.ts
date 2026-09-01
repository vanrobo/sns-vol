export type UserRole = "volunteer" | "organiser" | "admin";
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
  delete_requested_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

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
