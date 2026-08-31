"use client";

import { useState, useEffect, useCallback, startTransition } from "react";
import toast from "react-hot-toast";
import {
  Plus,
  Calendar,
  Users,
  AlertCircle,
  Award,
  Trophy,
} from "lucide-react";
import type { AdminData, ApplicationStatus, Event, UserRole } from "@/types";
import { titleCaseStatus } from "@/types";
import {
  getAdminData,
  createEvent,
  updateEvent,
  closeEvent,
  updateApplicationStatus,
  approveICard,
  resolveGrievance,
  updateUserRole,
  updateUserBatch,
  type EventInput,
} from "@/lib/data/admin";
import { signOutAction } from "@/lib/actions/auth";
import StaffShell from "@/components/staff/StaffShell";
import EventFormModal, {
  emptyEventForm,
} from "@/components/staff/EventFormModal";
import EventsTable from "@/components/staff/EventsTable";
import ApplicationsTable from "@/components/staff/ApplicationsTable";
import Pagination, { paginate } from "@/components/staff/Pagination";
import { TableSkeleton } from "@/components/ui/Skeleton";
import AwardsPanel from "@/components/staff/AwardsPanel";
import { APP_NAME } from "@/lib/brand";

const VOL_PAGE_SIZE = 10;
const GRIEV_PAGE_SIZE = 8;

export default function AdminDashboard() {
  const [data, setData] = useState<AdminData>({
    events: [],
    users: [],
    grievances: [],
    applications: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("events");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventForm, setEventForm] = useState<EventInput>(emptyEventForm);
  const [tempSkill, setTempSkill] = useState("");

  const [eventsPage, setEventsPage] = useState(1);
  const [appsPage, setAppsPage] = useState(1);
  const [volPage, setVolPage] = useState(1);
  const [grievPage, setGrievPage] = useState(1);

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
    } catch {
      toast.error("Failed to sync admin data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const openCreateModal = () => {
    setEditingEvent(null);
    setEventForm(emptyEventForm);
    setIsModalOpen(true);
  };

  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      date: event.date,
      venue: event.venue,
      description: event.description,
      criteria: event.criteria,
      required_skills: event.required_skills,
      category: event.category,
      coordinator_phone: event.coordinator_phone,
    });
    setIsModalOpen(true);
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempSkill && !eventForm.required_skills.includes(tempSkill)) {
      setEventForm({
        ...eventForm,
        required_skills: [...eventForm.required_skills, tempSkill],
      });
      setTempSkill("");
    }
  };

  const submitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, eventForm);
        toast.success("Event updated!");
      } else {
        await createEvent(eventForm);
        toast.success("Event published!");
      }
      setIsModalOpen(false);
      setEditingEvent(null);
      setEventForm(emptyEventForm);
      fetchAdminData();
    } catch {
      toast.error("Failed to save event.");
    }
  };

  const handleCloseEvent = async (eventId: string) => {
    setActioningId(eventId);
    try {
      await closeEvent(eventId);
      toast.success("Event closed.");
      setData((prev) => ({
        ...prev,
        events: prev.events.map((e) =>
          e.id === eventId ? { ...e, status: "closed" } : e,
        ),
      }));
    } catch {
      toast.error("Failed to close event.");
    } finally {
      setActioningId(null);
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
    } catch {
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
    } catch {
      toast.error("Failed to activate I-Card.");
    } finally {
      setActioningId(null);
    }
  };

  const handleRoleChange = async (userId: string, role: UserRole) => {
    setActioningId(userId);
    try {
      await updateUserRole(userId, role);
      toast.success(`Role updated to ${role}`);
      setData((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === userId ? { ...u, role } : u)),
      }));
    } catch {
      toast.error("Failed to update role.");
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
    } catch {
      toast.error("Failed to resolve grievance.");
    } finally {
      setActioningId(null);
    }
  };

  const filteredVolunteers = data.users.filter(
    (v) =>
      v.name.toLowerCase().includes(volunteerSearch.toLowerCase()) ||
      v.college.toLowerCase().includes(volunteerSearch.toLowerCase()),
  );
  const pagedVolunteers = paginate(filteredVolunteers, volPage, VOL_PAGE_SIZE);
  const pagedGrievances = paginate(data.grievances, grievPage, GRIEV_PAGE_SIZE);

  const tabs = [
    { key: "events", label: "Events", icon: Calendar },
    { key: "volunteers", label: "Volunteers", icon: Users },
    { key: "grievances", label: "Grievances", icon: AlertCircle },
    { key: "applications", label: "Applications", icon: Award },
    { key: "awards", label: "Awards", icon: Trophy },
  ];

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-4">
        <TableSkeleton rows={6} />
      </div>
    );
  }

  return (
    <>
      <StaffShell
        title={`${APP_NAME} Admin`}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tab) => startTransition(() => setActiveTab(tab))}
        onSignOut={() => signOutAction()}
        stats={
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[var(--surface)] p-3 rounded-xl border border-[var(--border)] text-center">
              <p className="text-[9px] font-bold uppercase text-[var(--text-muted)] mb-1">
                Live
              </p>
              <p className="text-2xl font-black text-emerald-600">
                {data.events.filter((e) => e.status === "active").length}
              </p>
            </div>
            <div className="bg-[var(--surface)] p-3 rounded-xl border border-[var(--border)] text-center">
              <p className="text-[9px] font-bold uppercase text-[var(--text-muted)] mb-1">
                Volunteers
              </p>
              <p className="text-2xl font-black text-emerald-600">
                {data.users.filter((u) => u.role === "volunteer").length}
              </p>
            </div>
            <div className="bg-[var(--surface)] p-3 rounded-xl border border-[var(--border)] text-center">
              <p className="text-[9px] font-bold uppercase text-[var(--text-muted)] mb-1">
                Grievances
              </p>
              <p className="text-2xl font-black text-red-500">
                {data.grievances.filter((g) => g.status === "open").length}
              </p>
            </div>
          </div>
        }
      >
        {activeTab === "events" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center gap-3">
              <h2 className="text-lg font-bold">Events</h2>
              <button
                type="button"
                onClick={openCreateModal}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow font-bold flex items-center gap-1.5 text-sm shrink-0"
              >
                <Plus size={16} /> New
              </button>
            </div>
            <EventsTable
              events={data.events}
              page={eventsPage}
              onPageChange={setEventsPage}
              onEdit={openEditModal}
              onClose={handleCloseEvent}
              closingId={actioningId}
            />
          </div>
        )}

        {activeTab === "volunteers" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Volunteers</h2>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Pending users must be approved before they can use the app. Set their
              role first, then tap the green approve button on their card.
            </p>
            <input
              type="text"
              placeholder="Search name or college..."
              value={volunteerSearch}
              onChange={(e) => {
                setVolunteerSearch(e.target.value);
                setVolPage(1);
              }}
              className="w-full p-3 border rounded-xl bg-[var(--surface)] border-[var(--border)] outline-emerald-600 text-sm"
            />
            <div className="space-y-3">
              {pagedVolunteers.map((vol) => (
                <div
                  key={vol.id}
                  className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 space-y-3"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-bold">{vol.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{vol.college}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${vol.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-yellow-100 text-yellow-800"}`}
                    >
                      {titleCaseStatus(vol.status)}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-[var(--text-muted)]">
                    {vol.volunteer_id || "No ID yet"}
                  </p>
                  <select
                    value={vol.role}
                    disabled={actioningId === vol.id}
                    onChange={(e) =>
                      handleRoleChange(vol.id, e.target.value as UserRole)
                    }
                    className="w-full text-xs font-bold border border-[var(--border)] rounded-lg p-2.5 bg-slate-50 dark:bg-[#18181B] outline-emerald-600"
                  >
                    <option value="volunteer">Volunteer</option>
                    <option value="organiser">Organiser</option>
                    <option value="admin">Admin</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Batch (e.g. Dwarka Sector 2)"
                    defaultValue={vol.batch ?? ""}
                    disabled={actioningId === vol.id}
                    onBlur={(e) => {
                      const next = e.target.value.trim();
                      if (next === (vol.batch ?? "")) return;
                      setActioningId(vol.id);
                      updateUserBatch(vol.id, next)
                        .then(() => {
                          toast.success("Batch updated");
                          setData((prev) => ({
                            ...prev,
                            users: prev.users.map((u) =>
                              u.id === vol.id ? { ...u, batch: next || null } : u,
                            ),
                          }));
                        })
                        .catch(() => toast.error("Failed to update batch"))
                        .finally(() => setActioningId(null));
                    }}
                    className="w-full text-xs border border-[var(--border)] rounded-lg p-2.5 bg-slate-50 dark:bg-[#18181B] outline-emerald-600"
                  />
                  {vol.status !== "active" && (
                    <button
                      disabled={actioningId === vol.id}
                      onClick={() => handleApproveICard(vol.id)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-xs font-bold disabled:opacity-50"
                    >
                      {vol.role === "volunteer"
                        ? "Approve I-Card"
                        : "Activate account"}
                    </button>
                  )}
                </div>
              ))}
            </div>
            <Pagination
              total={filteredVolunteers.length}
              pageSize={VOL_PAGE_SIZE}
              page={volPage}
              onPageChange={setVolPage}
            />
          </div>
        )}

        {activeTab === "grievances" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Grievances</h2>
            <div className="grid grid-cols-1 gap-4">
              {pagedGrievances.length === 0 && (
                <p className="text-gray-500 italic text-sm">No grievances logged.</p>
              )}
              {pagedGrievances.map((g) => (
                <div
                  key={g.id}
                  className="border border-[var(--border)] p-5 rounded-2xl space-y-4"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex gap-2 items-center flex-wrap">
                        <span className="text-xs bg-red-100 text-red-800 font-extrabold px-2.5 py-1 rounded-md uppercase">
                          {g.category}
                        </span>
                        {g.user_name && (
                          <span className="text-xs text-gray-500 font-semibold">
                            {g.user_name}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium">{g.description}</p>
                      {g.admin_notes && (
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-xl text-xs">
                          <span className="font-bold text-emerald-600">Response:</span>{" "}
                          {g.admin_notes}
                        </div>
                      )}
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-extrabold ${g.status === "resolved" ? "bg-emerald-100 text-emerald-800" : "bg-yellow-100 text-yellow-800"}`}
                    >
                      {titleCaseStatus(g.status)}
                    </span>
                  </div>
                  {g.status === "open" && selectedGrievanceId !== g.id && (
                    <button
                      onClick={() => setSelectedGrievanceId(g.id)}
                      className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                    >
                      Address Ticket
                    </button>
                  )}
                  {selectedGrievanceId === g.id && (
                    <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                      <textarea
                        value={grievanceNotes}
                        onChange={(e) => setGrievanceNotes(e.target.value)}
                        placeholder="Resolution notes..."
                        className="w-full border p-2 text-xs rounded-lg dark:bg-gray-800 outline-emerald-600"
                        rows={2}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedGrievanceId(null)}
                          className="text-xs text-gray-500 px-2"
                        >
                          Cancel
                        </button>
                        <button
                          disabled={actioningId === g.id}
                          onClick={() => handleResolveGrievance(g.id)}
                          className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-md"
                        >
                          Send Resolution
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Pagination
              total={data.grievances.length}
              pageSize={GRIEV_PAGE_SIZE}
              page={grievPage}
              onPageChange={setGrievPage}
            />
          </div>
        )}

        {activeTab === "applications" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Applications</h2>
            <ApplicationsTable
              applications={data.applications}
              page={appsPage}
              onPageChange={setAppsPage}
              actioningId={actioningId}
              onAction={handleApplicationAction}
            />
          </div>
        )}

        {activeTab === "awards" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Awards</h2>
            <AwardsPanel
              volunteers={data.users}
              events={data.events}
              canDelete
            />
          </div>
        )}
      </StaffShell>

      <EventFormModal
        open={isModalOpen}
        editing={editingEvent}
        form={eventForm}
        tempSkill={tempSkill}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(null);
        }}
        onSubmit={submitEvent}
        onChange={setEventForm}
        onTempSkillChange={setTempSkill}
        onAddSkill={handleAddSkill}
        onRemoveSkill={(skill) =>
          setEventForm({
            ...eventForm,
            required_skills: eventForm.required_skills.filter((s) => s !== skill),
          })
        }
      />
    </>
  );
}
