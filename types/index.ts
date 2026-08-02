export type UserRole = "volunteer" | "admin";
export type ProfileStatus = "pending" | "active" | "inactive";
export type EventStatus = "active" | "closed";
export type ApplicationStatus = "pending" | "approved" | "declined";
export type GrievanceStatus = "open" | "resolved";
export type NotificationType = "event" | "grievance" | "application" | "icard";

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
  created_at?: string;
  updated_at?: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  venue: string;
  description: string;
  criteria: string;
  status: EventStatus;
  required_skills: string[];
  category: string;
  coordinator_phone: string;
  has_applied?: boolean;
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

export interface AdminData {
  events: Event[];
  users: Profile[];
  grievances: Grievance[];
  applications: Application[];
}

/** Display helpers for title-cased UI labels */
export function titleCaseStatus(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}
