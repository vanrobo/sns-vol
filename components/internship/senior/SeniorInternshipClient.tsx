"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  DEMO_COORD_CENTRE,
  DEMO_INTERN_ID,
  DEMO_MENTOR_ID,
  SENIOR_BATCH,
  SENIOR_MENTORS,
  SENIOR_MODULES,
  mentorName,
  moduleTitle,
} from "@/lib/internship/senior-demo";
import type {
  AttendanceMark,
  SeniorIntern,
  SeniorModuleId,
} from "@/lib/internship/types";
import {
  useSeniorActions,
  useSeniorPersonaHydrated,
  useSeniorState,
} from "@/lib/internship/senior-store";
import PersonaSwitcher from "./PersonaSwitcher";

function statusTone(status: SeniorIntern["status"]) {
  switch (status) {
    case "certified":
      return "text-emerald-700 bg-emerald-500/10";
    case "awaiting_certificate":
    case "completed":
      return "text-amber-800 bg-amber-500/10";
    case "applied":
      return "text-slate-600 bg-slate-500/10";
    default:
      return "text-[var(--brand)] bg-[var(--brand)]/10";
  }
}

function InternRow({
  intern,
  extra,
}: {
  intern: SeniorIntern;
  extra?: React.ReactNode;
}) {
  return (
    <div className="p-3 border-b border-[var(--border)] last:border-0 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-sm">{intern.name}</p>
          <p className="text-[11px] text-[var(--text-muted)]">
            {intern.school} · {intern.centre}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
            Module: {moduleTitle(intern.allottedModule)} · Mentor:{" "}
            {mentorName(intern.mentorId)}
          </p>
        </div>
        <span
          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${statusTone(intern.status)}`}
        >
          {intern.status.replaceAll("_", " ")}
        </span>
      </div>
      {extra}
    </div>
  );
}

function CheckFlags({ intern }: { intern: SeniorIntern }) {
  return (
    <div className="flex flex-wrap gap-1.5 text-[10px]">
      <Flag ok={intern.feesPaid} label="Fees" />
      <Flag ok={intern.centreVisited} label="Centre" />
      <Flag ok={intern.googleReviewDone} label="Review" />
      <Flag ok={intern.mentorSignedOff} label="Mentor" />
      <Flag ok={intern.rashmiSignedOff} label="Rashmi" />
      <Flag ok={intern.ritikaCertified} label="Cert" />
    </div>
  );
}

function Flag({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`px-1.5 py-0.5 rounded font-semibold ${
        ok
          ? "bg-emerald-500/15 text-emerald-700"
          : "bg-slate-500/10 text-[var(--text-muted)]"
      }`}
    >
      {label}
    </span>
  );
}

function RitikaPanel() {
  const { interns } = useSeniorState();
  const { setFeesPaid, setGoogleReview, ritikaCertify } = useSeniorActions();

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      <header className="px-3 py-2 border-b border-[var(--border)]">
        <h2 className="text-sm font-black">Gate & certificates</h2>
        <p className="text-[11px] text-[var(--text-muted)]">
          Forms land here → send to Rashmi. Cert only when all checks pass.
        </p>
      </header>
      {interns.map((intern) => (
        <InternRow
          key={intern.id}
          intern={intern}
          extra={
            <div className="space-y-2">
              <CheckFlags intern={intern} />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="text-[11px] font-semibold px-2 py-1 rounded-md border border-[var(--border)]"
                  onClick={() => setFeesPaid(intern.id, !intern.feesPaid)}
                >
                  Toggle fees
                </button>
                <button
                  type="button"
                  className="text-[11px] font-semibold px-2 py-1 rounded-md border border-[var(--border)]"
                  onClick={() =>
                    setGoogleReview(intern.id, !intern.googleReviewDone)
                  }
                >
                  Toggle review
                </button>
                <button
                  type="button"
                  className="text-[11px] font-semibold px-2 py-1 rounded-md bg-[var(--brand)] text-white disabled:opacity-40"
                  disabled={
                    !intern.feesPaid ||
                    !intern.centreVisited ||
                    !intern.googleReviewDone ||
                    !intern.mentorSignedOff ||
                    !intern.rashmiSignedOff ||
                    intern.ritikaCertified
                  }
                  onClick={() => {
                    ritikaCertify(intern.id);
                    toast.success(
                      intern.ritikaCertified
                        ? "Already certified"
                        : `Certificate issued for ${intern.name}`,
                    );
                  }}
                >
                  Issue certificate
                </button>
              </div>
            </div>
          }
        />
      ))}
    </section>
  );
}

function RashmiPanel() {
  const { interns } = useSeniorState();
  const { allotMentorAndModule, rashmiSignOff } = useSeniorActions();
  const [drafts, setDrafts] = useState<
    Record<string, { mentorId: string; moduleId: SeniorModuleId }>
  >({});

  const unassigned = interns.filter((i) => !i.mentorId || !i.allottedModule);

  return (
    <div className="space-y-3">
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
        <h2 className="text-sm font-black">{SENIOR_BATCH.title}</h2>
        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
          {SENIOR_BATCH.startDate} → {SENIOR_BATCH.endDate} ·{" "}
          {SENIOR_BATCH.centre}
        </p>
        <p className="text-xs mt-2">
          Map <strong>one mentor ↔ one kid</strong> so mentors are not overloaded
          across unrelated modules.
        </p>
      </section>

      {unassigned.length > 0 && (
        <section className="rounded-xl border border-amber-500/30 bg-amber-500/5 overflow-hidden">
          <header className="px-3 py-2 border-b border-amber-500/20">
            <h2 className="text-sm font-black">Needs allotment</h2>
          </header>
          {unassigned.map((intern) => {
            const draft = drafts[intern.id] ?? {
              mentorId: SENIOR_MENTORS[0].id,
              moduleId: (intern.preferredModule ??
                "development") as SeniorModuleId,
            };
            return (
              <div
                key={intern.id}
                className="p-3 border-b border-amber-500/15 last:border-0 space-y-2"
              >
                <p className="font-semibold text-sm">{intern.name}</p>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Prefers: {moduleTitle(intern.preferredModule)}
                </p>
                <div className="flex flex-wrap gap-2">
                  <select
                    className="text-xs border border-[var(--border)] rounded-md px-2 py-1.5 bg-[var(--surface)]"
                    value={draft.moduleId}
                    onChange={(e) =>
                      setDrafts((d) => ({
                        ...d,
                        [intern.id]: {
                          ...draft,
                          moduleId: e.target.value as SeniorModuleId,
                        },
                      }))
                    }
                  >
                    {SENIOR_MODULES.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                  <select
                    className="text-xs border border-[var(--border)] rounded-md px-2 py-1.5 bg-[var(--surface)]"
                    value={draft.mentorId}
                    onChange={(e) =>
                      setDrafts((d) => ({
                        ...d,
                        [intern.id]: { ...draft, mentorId: e.target.value },
                      }))
                    }
                  >
                    {SENIOR_MENTORS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-md bg-[var(--brand)] text-white"
                    onClick={() => {
                      allotMentorAndModule(
                        intern.id,
                        draft.mentorId,
                        draft.moduleId,
                      );
                      toast.success(`Allotted ${intern.name}`);
                    }}
                  >
                    Allot 1:1
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      )}

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <header className="px-3 py-2 border-b border-[var(--border)]">
          <h2 className="text-sm font-black">Full batch</h2>
        </header>
        {interns.map((intern) => (
          <InternRow
            key={intern.id}
            intern={intern}
            extra={
              <div className="flex flex-wrap gap-2 items-center">
                <CheckFlags intern={intern} />
                {!intern.rashmiSignedOff && intern.mentorSignedOff && (
                  <button
                    type="button"
                    className="text-[11px] font-semibold px-2 py-1 rounded-md bg-[var(--brand)] text-white"
                    onClick={() => {
                      rashmiSignOff(intern.id);
                      toast.success("Rashmi signed off");
                    }}
                  >
                    Sign off
                  </button>
                )}
              </div>
            }
          />
        ))}
      </section>
    </div>
  );
}

function MentorPanel() {
  const { interns, attendance, feedback } = useSeniorState();
  const { markAttendance, addFeedback, mentorSignOff } = useSeniorActions();
  const mine = interns.filter((i) => i.mentorId === DEMO_MENTOR_ID);
  const today = "2026-04-04";
  const [note, setNote] = useState("");
  const [target, setTarget] = useState(mine[0]?.id ?? "");

  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-muted)] px-1">
        Logged in as {mentorName(DEMO_MENTOR_ID)} · {mine.length} interns
      </p>
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <header className="px-3 py-2 border-b border-[var(--border)]">
          <h2 className="text-sm font-black">Attendance · {today}</h2>
        </header>
        {mine.map((intern) => {
          const row = attendance.find(
            (a) => a.internId === intern.id && a.date === today,
          );
          return (
            <div
              key={intern.id}
              className="p-3 border-b border-[var(--border)] last:border-0 flex items-center justify-between gap-2"
            >
              <div>
                <p className="font-semibold text-sm">{intern.name}</p>
                <p className="text-[11px] text-[var(--text-muted)]">
                  {moduleTitle(intern.allottedModule)}
                </p>
              </div>
              <div className="flex gap-1">
                {(["present", "absent", "leave"] as AttendanceMark[]).map(
                  (mark) => (
                    <button
                      key={mark}
                      type="button"
                      onClick={() => {
                        markAttendance(intern.id, today, mark, "mentor");
                        toast.success(`${intern.name}: ${mark}`);
                      }}
                      className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md border ${
                        row?.mark === mark
                          ? "bg-[var(--brand)] text-white border-[var(--brand)]"
                          : "border-[var(--border)]"
                      }`}
                    >
                      {mark.slice(0, 1)}
                    </button>
                  ),
                )}
              </div>
            </div>
          );
        })}
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 space-y-2">
        <h2 className="text-sm font-black">Feedback log</h2>
        <select
          className="w-full text-xs border border-[var(--border)] rounded-md px-2 py-1.5 bg-[var(--surface)]"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
        >
          {mine.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </select>
        <textarea
          className="w-full text-sm border border-[var(--border)] rounded-md px-2 py-1.5 bg-[var(--surface)] min-h-[72px]"
          placeholder="Progress note…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button
          type="button"
          className="text-xs font-semibold px-3 py-2 rounded-md bg-[var(--brand)] text-white"
          onClick={() => {
            if (!note.trim() || !target) return;
            addFeedback(target, DEMO_MENTOR_ID, note.trim(), true);
            setNote("");
            toast.success("Log saved");
          }}
        >
          Add log
        </button>
        <div className="space-y-2 pt-1">
          {feedback
            .filter((f) => f.mentorId === DEMO_MENTOR_ID)
            .map((f) => (
              <div
                key={f.id}
                className="text-xs p-2 rounded-md bg-[var(--surface-muted)]"
              >
                <p className="font-semibold">
                  {mine.find((i) => i.id === f.internId)?.name} ·{" "}
                  {new Date(f.at).toLocaleString()}
                </p>
                <p className="text-[var(--text-muted)] mt-0.5">{f.body}</p>
              </div>
            ))}
        </div>
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <header className="px-3 py-2 border-b border-[var(--border)]">
          <h2 className="text-sm font-black">Sign off complete</h2>
        </header>
        {mine.map((intern) => (
          <div
            key={intern.id}
            className="p-3 border-b border-[var(--border)] last:border-0 flex justify-between items-center gap-2"
          >
            <p className="text-sm font-semibold">{intern.name}</p>
            <button
              type="button"
              disabled={intern.mentorSignedOff}
              className="text-[11px] font-semibold px-2 py-1 rounded-md bg-[var(--brand)] text-white disabled:opacity-40"
              onClick={() => {
                mentorSignOff(intern.id);
                toast.success("Mentor signed off");
              }}
            >
              {intern.mentorSignedOff ? "Done" : "Complete"}
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}

function CoordinatorPanel() {
  const { interns } = useSeniorState();
  const { setCentreVisited } = useSeniorActions();
  const atCentre = interns.filter((i) => i.centre === DEMO_COORD_CENTRE);

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      <header className="px-3 py-2 border-b border-[var(--border)]">
        <h2 className="text-sm font-black">Centre · {DEMO_COORD_CENTRE}</h2>
        <p className="text-[11px] text-[var(--text-muted)]">
          Tick when the intern has arrived / reported at centre.
        </p>
      </header>
      {atCentre.map((intern) => (
        <InternRow
          key={intern.id}
          intern={intern}
          extra={
            <button
              type="button"
              className={`text-[11px] font-semibold px-2 py-1 rounded-md ${
                intern.centreVisited
                  ? "bg-emerald-500/15 text-emerald-700"
                  : "bg-[var(--brand)] text-white"
              }`}
              onClick={() => {
                setCentreVisited(intern.id, !intern.centreVisited);
                toast.success(
                  intern.centreVisited ? "Marked not visited" : "Arrived",
                );
              }}
            >
              {intern.centreVisited ? "Visited ✓" : "Mark arrived"}
            </button>
          }
        />
      ))}
    </section>
  );
}

function InternPanel() {
  const { interns, attendance, feedback } = useSeniorState();
  const me = interns.find((i) => i.id === DEMO_INTERN_ID);
  const myAtt = useMemo(
    () => attendance.filter((a) => a.internId === DEMO_INTERN_ID),
    [attendance],
  );
  const myFb = useMemo(
    () => feedback.filter((f) => f.internId === DEMO_INTERN_ID),
    [feedback],
  );

  if (!me) return null;

  return (
    <div className="space-y-3">
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-1">
        <h2 className="text-lg font-black">{me.name}</h2>
        <p className="text-xs text-[var(--text-muted)]">{me.school}</p>
        <p className="text-sm mt-2">
          Module: <strong>{moduleTitle(me.allottedModule)}</strong>
        </p>
        <p className="text-sm">
          Mentor: <strong>{mentorName(me.mentorId)}</strong>
        </p>
        <p className="text-sm">
          Centre: <strong>{me.centre}</strong>
        </p>
        <CheckFlags intern={me} />
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
        <h3 className="text-sm font-black mb-2">My attendance</h3>
        {myAtt.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)]">No marks yet.</p>
        ) : (
          myAtt.map((a) => (
            <p key={a.date + a.mark} className="text-xs py-1">
              {a.date}: <strong>{a.mark}</strong> ({a.by})
            </p>
          ))
        )}
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
        <h3 className="text-sm font-black mb-2">Mentor notes</h3>
        {myFb.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)]">No logs yet.</p>
        ) : (
          myFb.map((f) => (
            <p key={f.id} className="text-xs py-1 text-[var(--text-muted)]">
              {f.body}
            </p>
          ))
        )}
      </section>
    </div>
  );
}

export default function SeniorInternshipClient() {
  const { persona, ready } = useSeniorPersonaHydrated();
  const { source } = useSeniorState();
  const { resetSeniorDemo } = useSeniorActions();

  return (
    <div className="space-y-4">
      <PersonaSwitcher />
      <p className="text-[11px] text-[var(--text-muted)]">
        Data source:{" "}
        <strong>{source === "db" ? "work Supabase" : "local demo fallback"}</strong>
      </p>

      {!ready ? (
        <p className="text-sm text-[var(--text-muted)]">Loading…</p>
      ) : persona === "ritika" ? (
        <RitikaPanel />
      ) : persona === "rashmi" ? (
        <RashmiPanel />
      ) : persona === "mentor" ? (
        <MentorPanel />
      ) : persona === "coordinator" ? (
        <CoordinatorPanel />
      ) : (
        <InternPanel />
      )}

      {source === "local" && (
        <button
          type="button"
          onClick={() => {
            resetSeniorDemo();
            toast.success("Demo data reset");
          }}
          className="w-full text-xs font-semibold py-2 rounded-lg border border-[var(--border)] text-[var(--text-muted)]"
        >
          Reset local demo data
        </button>
      )}
    </div>
  );
}
