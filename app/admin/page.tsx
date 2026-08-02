// app/admin/page.tsx
"use client";

import { useState, useEffect, useCallback, startTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Plus,
  X,
  Calendar,
  MapPin,
  Users,
  AlertCircle,
  Check,
  Ban,
  Award,
  LogOut,
} from "lucide-react";
import type { AdminData, ApplicationStatus } from "@/types";
import { titleCaseStatus } from "@/types";
import {
  getAdminData,
  createEvent,
  updateApplicationStatus,
  approveICard,
  resolveGrievance,
} from "@/lib/data/admin";
import { signOut } from "@/lib/data/profiles";

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<AdminData>({
    events: [],
    users: [],
    grievances: [],
    applications: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "events" | "volunteers" | "grievances" | "applications"
  >("events");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    venue: "",
    description: "",
    criteria: "Student",
    required_skills: [] as string[],
    category: "Community",
    coordinator_phone: "",
  });
  const [tempSkill, setTempSkill] = useState("");

  const [selectedGrievanceId, setSelectedGrievanceId] = useState<string | null>(
    null,
  );
  const [grievanceNotes, setGrievanceNotes] = useState("");
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [volunteerSearch, setVolunteerSearch] = useState("");

  const fetchAdminData = useCallback(async () => {
    try {
      const result = await getAdminData();
      setData(result);
    } catch (error) {
      console.error(error);
      toast.error("Failed to sync admin data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempSkill && !newEvent.required_skills.includes(tempSkill)) {
      setNewEvent({
        ...newEvent,
        required_skills: [...newEvent.required_skills, tempSkill],
      });
      setTempSkill("");
    }
  };

  const submitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEvent(newEvent);
      toast.success("Event Published!");
      setIsModalOpen(false);
      setNewEvent({
        title: "",
        date: "",
        venue: "",
        description: "",
        criteria: "Student",
        required_skills: [],
        category: "Community",
        coordinator_phone: "",
      });
      fetchAdminData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to publish event.");
    }
  };

  const handleApplicationAction = async (
    userId: string,
    eventId: string,
    status: ApplicationStatus,
  ) => {
    setActioningId(`${userId}-${eventId}`);
    try {
      await updateApplicationStatus(userId, eventId, status);
      toast.success(`Application marked as ${status}`);
      setData((prev) => ({
        ...prev,
        applications: prev.applications.map((app) =>
          app.user_id === userId && app.event_id === eventId
            ? { ...app, status }
            : app,
        ),
      }));
    } catch (error) {
      console.error(error);
      toast.error("Failed to update application.");
    } finally {
      setActioningId(null);
    }
  };

  const handleApproveICard = async (userId: string) => {
    setActioningId(userId);
    try {
      const result = await approveICard(userId);
      toast.success("Digital I-Card activated!");
      setData((prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          u.id === userId
            ? {
                ...u,
                status: "active",
                volunteer_id: result.volunteer_id,
                valid_until: result.valid_until,
              }
            : u,
        ),
      }));
    } catch (error) {
      console.error(error);
      toast.error("Failed to activate I-Card.");
    } finally {
      setActioningId(null);
    }
  };

  const handleResolveGrievance = async (grievanceId: string) => {
    if (!grievanceNotes.trim()) {
      toast.error("Please add resolution notes first.");
      return;
    }
    setActioningId(grievanceId);
    try {
      await resolveGrievance(grievanceId, grievanceNotes);
      toast.success("Grievance ticket marked resolved.");
      setData((prev) => ({
        ...prev,
        grievances: prev.grievances.map((g) =>
          g.id === grievanceId
            ? { ...g, status: "resolved", admin_notes: grievanceNotes }
            : g,
        ),
      }));
      setSelectedGrievanceId(null);
      setGrievanceNotes("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to resolve grievance.");
    } finally {
      setActioningId(null);
    }
  };

  const handleSignout = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  const filteredVolunteers = data.users.filter(
    (v) =>
      v.role === "volunteer" &&
      (v.name.toLowerCase().includes(volunteerSearch.toLowerCase()) ||
        v.college.toLowerCase().includes(volunteerSearch.toLowerCase())),
  );

  if (loading)
    return (
      <div className="p-10 text-xl font-bold text-gray-500">
        Syncing Admin Workspace...
      </div>
    );

  return (
    <div className="flex min-h-screen bg-[var(--surface-muted)]">
      <aside className="w-64 bg-emerald-900 text-white flex flex-col shadow-xl shrink-0">
        <div className="p-6 text-2xl font-bold border-b border-emerald-800 tracking-wider flex justify-between items-center">
          <span>SNS Admin</span>
          <button
            onClick={handleSignout}
            className="text-emerald-300 hover:text-white transition-colors"
            title="Sign Out"
          >
            <LogOut size={20} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {(
            [
              ["events", Calendar, "Event Management"],
              ["volunteers", Users, "Volunteer Directory"],
              ["grievances", AlertCircle, "Grievance Desk"],
              ["applications", Award, "Applications Desk"],
            ] as const
          ).map(([key, Icon, label]) => (
            <button
              key={key}
              onClick={() => startTransition(() => setActiveTab(key))}
              className={`w-full flex gap-3 p-3 rounded-lg font-medium transition-colors ${activeTab === key ? "bg-emerald-800" : "hover:bg-emerald-800/50"}`}
            >
              <Icon /> {label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-[var(--surface)] p-6 rounded-2xl shadow-sm border border-[var(--border)]">
            <h3 className="text-gray-500 font-bold uppercase tracking-wider text-xs mb-2">
              Campaigns Live
            </h3>
            <p className="text-4xl font-black text-emerald-600">
              {data.events.filter((e) => e.status === "active").length}
            </p>
          </div>
          <div className="bg-[var(--surface)] p-6 rounded-2xl shadow-sm border border-[var(--border)]">
            <h3 className="text-gray-500 font-bold uppercase tracking-wider text-xs mb-2">
              Enrolled Volunteers
            </h3>
            <p className="text-4xl font-black text-emerald-600">
              {data.users.filter((u) => u.role === "volunteer").length}
            </p>
          </div>
          <div className="bg-[var(--surface)] p-6 rounded-2xl shadow-sm border border-[var(--border)]">
            <h3 className="text-gray-500 font-bold uppercase tracking-wider text-xs mb-2">
              Active Grievances
            </h3>
            <p className="text-4xl font-black text-red-500">
              {data.grievances.filter((g) => g.status === "open").length}
            </p>
          </div>
        </div>

        {activeTab === "events" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-[var(--surface)] p-6 rounded-t-2xl border-b border-[var(--border)] shadow-sm">
              <h2 className="text-2xl font-bold">Event & Campaigns</h2>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg shadow font-bold flex items-center gap-2"
              >
                <Plus size={20} /> Publish Event
              </button>
            </div>

            <div className="bg-[var(--surface)] shadow-sm rounded-b-2xl overflow-hidden border border-[var(--border)] -mt-6">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="p-5 font-bold text-gray-600 border-b border-[var(--border)]">
                      Campaign Name
                    </th>
                    <th className="p-5 font-bold text-gray-600 border-b border-[var(--border)]">
                      Timeline / Venue
                    </th>
                    <th className="p-5 font-bold text-gray-600 border-b border-[var(--border)]">
                      Required Skills
                    </th>
                    <th className="p-5 font-bold text-gray-600 border-b border-[var(--border)]">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.events.map((evt) => (
                    <tr
                      key={evt.id}
                      className="border-b border-[var(--border)] hover:bg-gray-50/50"
                    >
                      <td className="p-5 font-bold text-lg">{evt.title}</td>
                      <td className="p-5">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Calendar size={14} /> {evt.date}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin size={14} /> {evt.venue}
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-wrap gap-1">
                          {evt.required_skills.map((skill) => (
                            <span
                              key={skill}
                              className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs px-2 py-0.5 rounded font-semibold"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-5">
                        <span
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${evt.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-800"}`}
                        >
                          {titleCaseStatus(evt.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "volunteers" && (
          <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--border)] p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold">
                Volunteer & I-Card Directory
              </h2>
              <input
                type="text"
                placeholder="Search by name or college..."
                value={volunteerSearch}
                onChange={(e) => setVolunteerSearch(e.target.value)}
                className="p-3 border rounded-xl bg-gray-50 dark:bg-gray-900 border-[var(--border)] outline-emerald-600 text-sm max-w-xs"
              />
            </div>
            <div className="overflow-hidden border border-[var(--border)] rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="p-5 font-bold text-gray-600 border-b border-[var(--border)]">
                      Volunteer Name
                    </th>
                    <th className="p-5 font-bold text-gray-600 border-b border-[var(--border)]">
                      College / Institution
                    </th>
                    <th className="p-5 font-bold text-gray-600 border-b border-[var(--border)]">
                      Assigned ID
                    </th>
                    <th className="p-5 font-bold text-gray-600 border-b border-[var(--border)]">
                      I-Card Status
                    </th>
                    <th className="p-5 font-bold text-gray-600 border-b border-[var(--border)] text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVolunteers.map((vol) => (
                    <tr
                      key={vol.id}
                      className="border-b border-[var(--border)] hover:bg-gray-50/50"
                    >
                      <td className="p-5 font-semibold">{vol.name}</td>
                      <td className="p-5 text-gray-600">{vol.college}</td>
                      <td className="p-5 font-mono text-sm">
                        {vol.volunteer_id || "Unallocated"}
                      </td>
                      <td className="p-5">
                        <span
                          className={`px-2.5 py-1 rounded text-xs font-bold ${vol.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-yellow-100 text-yellow-800"}`}
                        >
                          {titleCaseStatus(vol.status)}
                        </span>
                      </td>
                      <td className="p-5 text-right">
                        {vol.status !== "active" ? (
                          <button
                            disabled={actioningId === vol.id}
                            onClick={() => handleApproveICard(vol.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm disabled:opacity-50"
                          >
                            Approve I-Card
                          </button>
                        ) : (
                          <span className="text-xs text-emerald-600 font-bold italic">
                            Active Member
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "grievances" && (
          <div className="bg-[var(--surface)] rounded-2xl p-6 shadow-sm border border-[var(--border)] space-y-6">
            <h2 className="text-2xl font-bold">Incoming Grievance Tickets</h2>
            <div className="grid grid-cols-1 gap-4">
              {data.grievances.length === 0 && (
                <p className="text-gray-500 italic text-sm">
                  No incoming grievances logged.
                </p>
              )}
              {data.grievances.map((g) => (
                <div
                  key={g.id}
                  className="border border-[var(--border)] p-5 rounded-2xl flex flex-col gap-4 hover:border-emerald-500 transition-colors"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex gap-2 items-center flex-wrap">
                        <span className="text-xs bg-red-100 text-red-800 font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider">
                          {g.category}
                        </span>
                        {g.user_name && (
                          <span className="text-xs text-gray-500 font-semibold">
                            {g.user_name}
                          </span>
                        )}
                        <span className="text-xs text-gray-400 font-semibold">
                          {new Date(g.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium leading-relaxed">
                        {g.description}
                      </p>
                      {g.admin_notes && (
                        <div className="mt-2 bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-[var(--border)] text-xs">
                          <span className="font-bold text-emerald-600">
                            Admin Response:
                          </span>{" "}
                          {g.admin_notes}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-1 rounded text-xs font-extrabold tracking-wider ${g.status === "resolved" ? "bg-emerald-100 text-emerald-800" : "bg-yellow-100 text-yellow-800"}`}
                      >
                        {titleCaseStatus(g.status)}
                      </span>
                      {g.status === "open" && selectedGrievanceId !== g.id && (
                        <button
                          onClick={() => setSelectedGrievanceId(g.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                        >
                          Address Ticket
                        </button>
                      )}
                    </div>
                  </div>

                  {selectedGrievanceId === g.id && (
                    <div className="w-full flex flex-col gap-2 p-4 border border-[var(--border)] bg-gray-50 dark:bg-gray-900 rounded-xl">
                      <textarea
                        value={grievanceNotes}
                        onChange={(e) => setGrievanceNotes(e.target.value)}
                        placeholder="Write resolution notes here..."
                        className="w-full border p-2 text-xs rounded-lg dark:bg-gray-800 outline-emerald-600"
                        rows={2}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedGrievanceId(null)}
                          className="text-xs text-gray-500 font-medium px-2 py-1"
                        >
                          Cancel
                        </button>
                        <button
                          disabled={actioningId === g.id}
                          onClick={() => handleResolveGrievance(g.id)}
                          className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-md hover:bg-emerald-700"
                        >
                          Send Resolution
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "applications" && (
          <div className="bg-[var(--surface)] rounded-2xl p-6 shadow-sm border border-[var(--border)] space-y-6">
            <h2 className="text-2xl font-bold">Volunteer Event Applications</h2>
            <div className="overflow-hidden border border-[var(--border)] rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="p-5 font-bold text-gray-600 border-b border-[var(--border)]">
                      Volunteer Name
                    </th>
                    <th className="p-5 font-bold text-gray-600 border-b border-[var(--border)]">
                      Campaign Target
                    </th>
                    <th className="p-5 font-bold text-gray-600 border-b border-[var(--border)]">
                      Applicant Skills
                    </th>
                    <th className="p-5 font-bold text-gray-600 border-b border-[var(--border)]">
                      Application Status
                    </th>
                    <th className="p-5 font-bold text-gray-600 border-b border-[var(--border)] text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.applications.map((app) => (
                    <tr
                      key={app.id}
                      className="border-b border-[var(--border)]"
                    >
                      <td className="p-5 font-semibold">{app.user_name}</td>
                      <td className="p-5">{app.event_title}</td>
                      <td className="p-5">
                        <div className="flex flex-wrap gap-1">
                          {app.user_skills.map((s) => (
                            <span
                              key={s}
                              className="bg-gray-100 dark:bg-gray-900 text-[10px] px-2 py-0.5 rounded font-medium"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-5">
                        <span
                          className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${
                            app.status === "approved"
                              ? "bg-emerald-100 text-emerald-800"
                              : app.status === "declined"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {titleCaseStatus(app.status)}
                        </span>
                      </td>
                      <td className="p-5 text-right">
                        {app.status === "pending" ? (
                          <div className="flex justify-end gap-2">
                            <button
                              disabled={
                                actioningId === `${app.user_id}-${app.event_id}`
                              }
                              onClick={() =>
                                handleApplicationAction(
                                  app.user_id,
                                  app.event_id,
                                  "approved",
                                )
                              }
                              className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 shadow-sm"
                              aria-label="Approve Application"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              disabled={
                                actioningId === `${app.user_id}-${app.event_id}`
                              }
                              onClick={() =>
                                handleApplicationAction(
                                  app.user_id,
                                  app.event_id,
                                  "declined",
                                )
                              }
                              className="bg-red-100 dark:bg-red-950/40 text-red-600 p-2 rounded-lg hover:bg-red-200"
                              aria-label="Decline Application"
                            >
                              <Ban size={14} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium italic">
                            Processed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[var(--border)] flex justify-between items-center sticky top-0 bg-[var(--surface)] z-10">
              <h2 className="text-xl font-bold">Publish New Event</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              >
                <X />
              </button>
            </div>

            <form onSubmit={submitEvent} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-sm font-bold mb-2">
                    Event Title
                  </label>
                  <input
                    required
                    type="text"
                    value={newEvent.title}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, title: e.target.value })
                    }
                    className="w-full border p-3 rounded-xl dark:bg-gray-800 border-[var(--border)] outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Date</label>
                  <input
                    required
                    type="date"
                    value={newEvent.date}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, date: e.target.value })
                    }
                    className="w-full border p-3 rounded-xl dark:bg-gray-800 border-[var(--border)] outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Venue</label>
                  <input
                    required
                    type="text"
                    value={newEvent.venue}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, venue: e.target.value })
                    }
                    className="w-full border p-3 rounded-xl dark:bg-gray-800 border-[var(--border)] outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Category
                  </label>
                  <select
                    value={newEvent.category}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, category: e.target.value })
                    }
                    className="w-full border p-3 rounded-xl dark:bg-gray-800 border-[var(--border)] outline-emerald-600"
                  >
                    <option>Community</option>
                    <option>STEM</option>
                    <option>Education</option>
                    <option>Environment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Coordinator Phone
                  </label>
                  <input
                    type="tel"
                    value={newEvent.coordinator_phone}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        coordinator_phone: e.target.value,
                      })
                    }
                    className="w-full border p-3 rounded-xl dark:bg-gray-800 border-[var(--border)] outline-emerald-600"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold mb-2">
                    Description
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newEvent.description}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, description: e.target.value })
                    }
                    className="w-full border p-3 rounded-xl dark:bg-gray-800 border-[var(--border)] outline-emerald-600"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold mb-2">
                    Required Skills
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tempSkill}
                      onChange={(e) => setTempSkill(e.target.value)}
                      className="flex-1 border p-3 rounded-xl dark:bg-gray-800 border-[var(--border)] outline-emerald-600"
                      placeholder="e.g. Mathematics"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="bg-gray-800 text-white px-4 rounded-xl font-bold"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newEvent.required_skills.map((s) => (
                      <span
                        key={s}
                        className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1"
                      >
                        {s}{" "}
                        <X
                          size={14}
                          className="cursor-pointer"
                          onClick={() =>
                            setNewEvent({
                              ...newEvent,
                              required_skills: newEvent.required_skills.filter(
                                (skill) => skill !== s,
                              ),
                            })
                          }
                        />
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[var(--border)] flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg"
                >
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
