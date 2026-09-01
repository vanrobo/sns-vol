"use server";

import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/auth/guards";
import {
  extractVerifyTokenFromScan,
  parseVerifyToken,
} from "@/lib/qr/verify-token";
import type { Event } from "@/types";

export type ScanAttendanceResult = {
  volunteerName: string;
  volunteerId: string;
  alreadyMarked: boolean;
};

export async function getStaffScanEvents(): Promise<Event[]> {
  const staff = await requireStaff();
  const supabase = await createClient();

  let query = supabase
    .from("events")
    .select("*")
    .eq("status", "active")
    .order("date", { ascending: false });

  if (staff.role === "organiser") {
    query = query.eq("created_by", staff.id);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((event) => ({
    ...event,
    required_skills: event.required_skills ?? [],
  })) as Event[];
}

export async function recordAttendanceFromScan(
  eventId: string,
  scannedValue: string,
): Promise<ScanAttendanceResult> {
  const staff = await requireStaff();
  const supabase = await createClient();

  const token = extractVerifyTokenFromScan(scannedValue);
  if (!token) {
    throw new Error("Invalid QR code. Scan a volunteer I-Card.");
  }

  const payload = parseVerifyToken(token);
  if (!payload) {
    throw new Error("This I-Card QR is expired or invalid.");
  }

  if (payload.status !== "active") {
    throw new Error(`${payload.name} is not an active volunteer.`);
  }

  const { data: volunteer, error: volunteerError } = await supabase
    .from("profiles")
    .select("id, name, volunteer_id, status")
    .eq("volunteer_id", payload.volunteer_id)
    .maybeSingle();

  if (volunteerError) throw volunteerError;
  if (!volunteer || volunteer.status !== "active") {
    throw new Error("Volunteer not found or not active.");
  }

  let eventQuery = supabase.from("events").select("id, created_by").eq("id", eventId);
  if (staff.role === "organiser") {
    eventQuery = eventQuery.eq("created_by", staff.id);
  }

  const { data: event, error: eventError } = await eventQuery.maybeSingle();
  if (eventError) throw eventError;
  if (!event) {
    throw new Error("You cannot record attendance for this event.");
  }

  const { data: application, error: appError } = await supabase
    .from("applications")
    .select("status")
    .eq("user_id", volunteer.id)
    .eq("event_id", eventId)
    .maybeSingle();

  if (appError) throw appError;
  if (application?.status !== "approved") {
    throw new Error(
      `${volunteer.name} is not approved for this event. Approve their request first.`,
    );
  }

  const { data: existing, error: existingError } = await supabase
    .from("attendance")
    .select("id")
    .eq("user_id", volunteer.id)
    .eq("event_id", eventId)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) {
    return {
      volunteerName: volunteer.name,
      volunteerId: volunteer.volunteer_id ?? payload.volunteer_id,
      alreadyMarked: true,
    };
  }

  const { error: insertError } = await supabase.from("attendance").insert({
    user_id: volunteer.id,
    event_id: eventId,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return {
        volunteerName: volunteer.name,
        volunteerId: volunteer.volunteer_id ?? payload.volunteer_id,
        alreadyMarked: true,
      };
    }
    throw insertError;
  }

  return {
    volunteerName: volunteer.name,
    volunteerId: volunteer.volunteer_id ?? payload.volunteer_id,
    alreadyMarked: false,
  };
}
