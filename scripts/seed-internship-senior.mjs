/**
 * Seed senior (+ one junior) internship demo rows into work SNS Project.
 * Idempotent upserts. Run: node scripts/seed-internship-senior.mjs
 */
import { workClient } from "./_env-keys.mjs";

const BATCH_ID = "a0000001-0000-4000-8000-000000000001";
const JUNIOR_BATCH_ID = "a0000001-0000-4000-8000-000000000002";

const INTERNS = [
  {
    id: "a0000001-0000-4000-8000-000000000011",
    name: "Ananya Sharma",
    school: "DPS RK Puram",
    phone: "9991100001",
    preferred_module: "development",
    allotted_module: "development",
    centre: "Sector 6",
    status: "active",
    fees_paid: true,
    centre_visited: true,
    google_review_done: false,
    mentor_signed_off: false,
    lead_signed_off: false,
    certified: false,
    notes: "mentorKey=m1",
  },
  {
    id: "a0000001-0000-4000-8000-000000000012",
    name: "Rohan Mehta",
    school: "Modern School",
    phone: "9991100002",
    preferred_module: "economics",
    allotted_module: "economics",
    centre: "Sector 6",
    status: "active",
    fees_paid: true,
    centre_visited: true,
    google_review_done: false,
    mentor_signed_off: false,
    lead_signed_off: false,
    certified: false,
    notes: "mentorKey=m1",
  },
  {
    id: "a0000001-0000-4000-8000-000000000013",
    name: "Ishita Kapoor",
    school: "Sanskriti",
    phone: "9991100003",
    preferred_module: "video_editing",
    allotted_module: null,
    centre: "Sector 6",
    status: "applied",
    fees_paid: false,
    centre_visited: false,
    google_review_done: false,
    mentor_signed_off: false,
    lead_signed_off: false,
    certified: false,
    notes: "Awaiting module allotment",
  },
  {
    id: "a0000001-0000-4000-8000-000000000014",
    name: "Kabir Singh",
    school: "Springdales",
    phone: "9991100004",
    preferred_module: "teaching",
    allotted_module: "teaching",
    centre: "Sector 15",
    status: "active",
    fees_paid: true,
    centre_visited: false,
    google_review_done: false,
    mentor_signed_off: false,
    lead_signed_off: false,
    certified: false,
    notes: "mentorKey=m2",
  },
  {
    id: "a0000001-0000-4000-8000-000000000015",
    name: "Meera Nair",
    school: "Mother's International",
    phone: "9991100005",
    preferred_module: "outreach",
    allotted_module: "outreach",
    centre: "Sector 15",
    status: "active",
    fees_paid: true,
    centre_visited: true,
    google_review_done: true,
    mentor_signed_off: false,
    lead_signed_off: false,
    certified: false,
    notes: "mentorKey=m2",
  },
  {
    id: "a0000001-0000-4000-8000-000000000016",
    name: "Arjun Das",
    school: "Bal Bharati",
    phone: "9991100006",
    preferred_module: "development",
    allotted_module: "development",
    centre: "Sector 6",
    status: "completed",
    fees_paid: true,
    centre_visited: true,
    google_review_done: true,
    mentor_signed_off: true,
    lead_signed_off: true,
    certified: false,
    notes: "mentorKey=m3|Ready for Ritika cert",
  },
  {
    id: "a0000001-0000-4000-8000-000000000017",
    name: "Sara Ali",
    school: "Tagore International",
    phone: "9991100007",
    preferred_module: "economics",
    allotted_module: null,
    centre: "Sector 6",
    status: "applied",
    fees_paid: true,
    centre_visited: false,
    google_review_done: false,
    mentor_signed_off: false,
    lead_signed_off: false,
    certified: false,
    notes: "",
  },
];

const JUNIOR_INTERNS = [
  {
    id: "a0000001-0000-4000-8000-000000000021",
    name: "Priya Verma",
    school: "DPS Dwarka",
    phone: "9881100001",
    preferred_module: null,
    allotted_module: null,
    centre: "Sector 6",
    status: "active",
    fees_paid: true,
    centre_visited: true,
    google_review_done: false,
    mentor_signed_off: false,
    lead_signed_off: false,
    certified: false,
    notes: "Junior orientation batch A",
  },
  {
    id: "a0000001-0000-4000-8000-000000000022",
    name: "Dev Patel",
    school: "Bal Bhavan",
    phone: "9881100002",
    preferred_module: null,
    allotted_module: null,
    centre: "Sector 19",
    status: "active",
    fees_paid: true,
    centre_visited: false,
    google_review_done: false,
    mentor_signed_off: false,
    lead_signed_off: false,
    certified: false,
    notes: "Junior orientation batch A",
  },
];

async function upsert(table, rows) {
  const { url, key } = workClient();
  const r = await fetch(`${url}/rest/v1/${table}?on_conflict=id`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(rows),
  });
  if (!r.ok) throw new Error(`${table}: ${r.status} ${await r.text()}`);
  console.log(`${table}: ${rows.length}`);
}

await upsert("internship_batches", [
  {
    id: BATCH_ID,
    wing: "senior",
    title: "Senior Internship — April 2026",
    start_date: "2026-04-01",
    end_date: "2026-04-20",
    centre: "Sector 6",
  },
  {
    id: JUNIOR_BATCH_ID,
    wing: "junior",
    title: "Junior Orientation — May 2026",
    start_date: "2026-05-05",
    end_date: "2026-05-09",
    centre: "Multi-centre",
  },
]);

await upsert(
  "internship_interns",
  [
    ...INTERNS.map((i) => ({ ...i, batch_id: BATCH_ID })),
    ...JUNIOR_INTERNS.map((i) => ({ ...i, batch_id: JUNIOR_BATCH_ID })),
  ],
);

const attendance = [
  {
    id: "a0000001-0000-4000-8000-000000000031",
    intern_id: INTERNS[0].id,
    on_date: "2026-04-02",
    mark: "present",
  },
  {
    id: "a0000001-0000-4000-8000-000000000032",
    intern_id: INTERNS[1].id,
    on_date: "2026-04-02",
    mark: "present",
  },
  {
    id: "a0000001-0000-4000-8000-000000000033",
    intern_id: INTERNS[0].id,
    on_date: "2026-04-03",
    mark: "leave",
  },
];

await upsert("internship_attendance", attendance);

await upsert("internship_feedback", [
  {
    id: "a0000001-0000-4000-8000-000000000041",
    intern_id: INTERNS[0].id,
    body: "Good first day. Understands development brief.",
    submitted_work: true,
  },
]);

console.log("Internship seed done.");
console.log("DEMO_INTERN_ID=", INTERNS[0].id);
