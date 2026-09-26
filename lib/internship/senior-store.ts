"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type {
  AttendanceMark,
  SeniorAttendanceRow,
  SeniorFeedbackLog,
  SeniorIntern,
  SeniorModuleId,
  SeniorPersona,
} from "./types";
import {
  INITIAL_ATTENDANCE,
  INITIAL_FEEDBACK,
  INITIAL_SENIOR_INTERNS,
} from "./senior-demo";
import {
  insertFeedbackRow,
  loadSeniorWingState,
  patchInternFlags,
  upsertAttendanceRow,
} from "./db";

const PERSONA_KEY = "sns-senior-persona-v1";

type SeniorState = {
  interns: SeniorIntern[];
  attendance: SeniorAttendanceRow[];
  feedback: SeniorFeedbackLog[];
  source: "db" | "local";
};

function defaultState(): SeniorState {
  return {
    interns: structuredClone(INITIAL_SENIOR_INTERNS),
    attendance: structuredClone(INITIAL_ATTENDANCE),
    feedback: structuredClone(INITIAL_FEEDBACK),
    source: "local",
  };
}

let cache: SeniorState = defaultState();
let hydrateStarted = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function setCache(next: SeniorState) {
  cache = next;
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): SeniorState {
  return cache;
}

function getServerSnapshot(): SeniorState {
  return defaultState();
}

export function useSeniorState() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useSeniorHydration() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (hydrateStarted) {
      setReady(true);
      return;
    }
    hydrateStarted = true;
    (async () => {
      try {
        const remote = await loadSeniorWingState();
        if (remote && remote.interns.length > 0) {
          setCache({
            interns: remote.interns,
            attendance: remote.attendance,
            feedback: remote.feedback,
            source: "db",
          });
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load internship DB");
      } finally {
        setReady(true);
      }
    })();
  }, []);

  return { ready, error, source: cache.source };
}

export function readSeniorPersona(): SeniorPersona {
  if (typeof window === "undefined") return "rashmi";
  try {
    const v = localStorage.getItem(PERSONA_KEY) as SeniorPersona | null;
    return v ?? "rashmi";
  } catch {
    return "rashmi";
  }
}

export function setSeniorPersona(persona: SeniorPersona) {
  localStorage.setItem(PERSONA_KEY, persona);
  personaListeners.forEach((l) => l());
}

const personaListeners = new Set<() => void>();

function subscribePersona(cb: () => void) {
  personaListeners.add(cb);
  return () => personaListeners.delete(cb);
}

export function useSeniorPersona(): SeniorPersona {
  return useSyncExternalStore(
    subscribePersona,
    readSeniorPersona,
    () => "rashmi" as SeniorPersona,
  );
}

export function useSeniorPersonaHydrated() {
  const persona = useSeniorPersona();
  const { ready } = useSeniorHydration();
  return { persona, ready };
}

async function persistPatch(
  internId: string,
  patch: Parameters<typeof patchInternFlags>[1],
) {
  if (cache.source === "db") {
    await patchInternFlags(internId, patch);
  }
}

export async function allotMentorAndModule(
  internId: string,
  mentorId: string,
  moduleId: SeniorModuleId,
) {
  const intern = cache.interns.find((i) => i.id === internId);
  const status =
    intern?.status === "applied" ? ("allotted" as const) : intern?.status;
  setCache({
    ...cache,
    interns: cache.interns.map((i) =>
      i.id === internId
        ? {
            ...i,
            mentorId,
            allottedModule: moduleId,
            status: status ?? i.status,
          }
        : i,
    ),
  });
  await persistPatch(internId, {
    mentorKey: mentorId,
    allottedModule: moduleId,
    status: status ?? intern?.status,
  });
}

export async function markAttendance(
  internId: string,
  date: string,
  mark: AttendanceMark,
  by: "rashmi" | "mentor",
) {
  const rest = cache.attendance.filter(
    (a) => !(a.internId === internId && a.date === date),
  );
  setCache({
    ...cache,
    attendance: [...rest, { internId, date, mark, by }],
  });
  if (cache.source === "db") {
    await upsertAttendanceRow(internId, date, mark);
  }
}

export async function addFeedback(
  internId: string,
  mentorId: string,
  body: string,
  submittedWork: boolean,
) {
  let id = `f-${Date.now()}`;
  let at = new Date().toISOString();
  if (cache.source === "db") {
    const row = await insertFeedbackRow(internId, body, submittedWork);
    id = row.id;
    at = row.created_at;
  }
  setCache({
    ...cache,
    feedback: [
      { id, internId, mentorId, at, body, submittedWork },
      ...cache.feedback,
    ],
  });
}

export async function setCentreVisited(internId: string, visited: boolean) {
  setCache({
    ...cache,
    interns: cache.interns.map((i) =>
      i.id === internId ? { ...i, centreVisited: visited } : i,
    ),
  });
  await persistPatch(internId, { centreVisited: visited });
}

export async function mentorSignOff(internId: string) {
  setCache({
    ...cache,
    interns: cache.interns.map((i) =>
      i.id === internId
        ? {
            ...i,
            mentorSignedOff: true,
            status: "awaiting_certificate",
          }
        : i,
    ),
  });
  await persistPatch(internId, {
    mentorSignedOff: true,
    status: "awaiting_certificate",
  });
}

export async function rashmiSignOff(internId: string) {
  setCache({
    ...cache,
    interns: cache.interns.map((i) =>
      i.id === internId ? { ...i, rashmiSignedOff: true } : i,
    ),
  });
  await persistPatch(internId, { rashmiSignedOff: true });
}

export async function ritikaCertify(internId: string) {
  const intern = cache.interns.find((i) => i.id === internId);
  if (!intern) return;
  if (!intern.feesPaid || !intern.centreVisited || !intern.googleReviewDone)
    return;
  if (!intern.mentorSignedOff || !intern.rashmiSignedOff) return;
  setCache({
    ...cache,
    interns: cache.interns.map((i) =>
      i.id === internId
        ? { ...i, ritikaCertified: true, status: "certified" }
        : i,
    ),
  });
  await persistPatch(internId, {
    ritikaCertified: true,
    status: "certified",
  });
}

export async function setFeesPaid(internId: string, paid: boolean) {
  setCache({
    ...cache,
    interns: cache.interns.map((i) =>
      i.id === internId ? { ...i, feesPaid: paid } : i,
    ),
  });
  await persistPatch(internId, { feesPaid: paid });
}

export async function setGoogleReview(internId: string, done: boolean) {
  setCache({
    ...cache,
    interns: cache.interns.map((i) =>
      i.id === internId ? { ...i, googleReviewDone: done } : i,
    ),
  });
  await persistPatch(internId, { googleReviewDone: done });
}

export function resetSeniorDemo() {
  setCache(defaultState());
}

export function useSeniorActions() {
  return {
    allotMentorAndModule: useCallback(allotMentorAndModule, []),
    markAttendance: useCallback(markAttendance, []),
    addFeedback: useCallback(addFeedback, []),
    setCentreVisited: useCallback(setCentreVisited, []),
    mentorSignOff: useCallback(mentorSignOff, []),
    rashmiSignOff: useCallback(rashmiSignOff, []),
    ritikaCertify: useCallback(ritikaCertify, []),
    setFeesPaid: useCallback(setFeesPaid, []),
    setGoogleReview: useCallback(setGoogleReview, []),
    resetSeniorDemo: useCallback(resetSeniorDemo, []),
  };
}
