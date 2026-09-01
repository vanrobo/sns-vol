"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  Plus,
  Calendar,
  Users,
  AlertCircle,
  Trophy,
  LayoutDashboard,
  ClipboardList,
} from "lucide-react";
import type { AdminData, ApplicationStatus, Event, UserRole } from "@/types";
import { titleCaseStatus } from "@/types";
import {
  getAdminData,
  createEvent,
  updateEvent,
  closeEvent,
  reopenEvent,
  deleteEvent,
  updateApplicationStatus,
  approveICard,
  resolveGrievance,
  updateUserRole,
  updateUserBatch,
  duplicateEvent,
  cancelEventOccurrence,
  bulkApproveICards,
  bulkUpdateUserBatch,
  broadcastNotification,
  deactivateVolunteer,
  reactivateVolunteer,
  type EventInput,
} from "@/lib/data/admin";
import EventAttendanceModal from "@/components/staff/EventAttendanceModal";
import CancelOccurrenceModal from "@/components/staff/CancelOccurrenceModal";
import { signOutAction } from "@/lib/actions/auth";
import StaffShell from "@/components/staff/StaffShell";
import EventFormModal, {
  createEventForm,
  emptyEventForm,
  eventToForm,
} from "@/components/staff/EventFormModal";
import EventsTable from "@/components/staff/EventsTable";
import ApplicationsTable from "@/components/staff/ApplicationsTable";
import Pagination, { paginate } from "@/components/staff/Pagination";
import { TableSkeleton } from "@/components/ui/Skeleton";
import AwardsPanel from "@/components/staff/AwardsPanel";
import StaffWelcome from "@/components/staff/StaffWelcome";
import AdminOverview from "@/components/staff/AdminOverview";
import AdminActionsPanel from "@/components/staff/AdminActionsPanel";
import VolunteerBulkActions from "@/components/staff/VolunteerBulkActions";
import VolunteerDetailModal from "@/components/staff/VolunteerDetailModal";
import NotificationBroadcastPanel from "@/components/staff/NotificationBroadcastPanel";
import { getMyRole } from "@/lib/data/profiles";
import { readAdminCache, writeAdminCache } from "@/lib/admin-cache";
import { useAdminActiveTab, useAdminPeopleFilter } from "@/hooks/useAdminTabState";
import type { Profile } from "@/types";
import { Phone, MapPin, Search, CheckSquare, Square, Loader2 } from "lucide-react";

const VOL_PAGE_SIZE = 10;
const GRIEV_PAGE_SIZE = 8;

export default function AdminDashboard() {
  const cachedAdmin = readAdminCache();
  const [data, setData] = useState<AdminData>(
    () =>
      cachedAdmin ?? {
        events: [],
        users: [],
        grievances: [],
        applications: [],
      },
  );
  const [loading, setLoading] = useState(!cachedAdmin);
  const [activeTab, setActiveTab] = useAdminActiveTab();
  const [volFilterRaw, setVolFilter] = useAdminPeopleFilter();
  const volFilter = volFilterRaw as "all" | "active" | "inactive" | "pending";

  const changeTab = useCallback((tab: string, peopleFilter?: string) => {
    setActiveTab(tab);
    if (peopleFilter) {
      setVolFilter(peopleFilter);
      setVolPage(1);
    }
  }, [setActiveTab, setVolFilter]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventForm, setEventForm] = useState<EventInput>(emptyEventForm);
  const [staffPhone, setStaffPhone] = useState("");

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
  const [staffName, setStaffName] = useState("Admin");
  const [detailVolunteer, setDetailVolunteer] = useState<Profile | null>(null);
  const [attendanceEvent, setAttendanceEvent] = useState<Event | null>(null);
  const [cancelEvent, setCancelEvent] = useState<Event | null>(null);
  const [selectedVolIds, setSelectedVolIds] = useState<Set<string>>(new Set());

  const fetchAdminData = useCallback(async () => {
    try {
      const result = await getAdminData();
      setData(result);
      writeAdminCache(result);
    } catch {
      toast.error("Failed to sync admin data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
    getMyRole().then((s) => {
      if (s?.name) setStaffName(s.name);
      if (s?.phone) setStaffPhone(s.phone);
    });
  }, [fetchAdminData]);

  const openCreateModal = () => {
    setEditingEvent(null);
    setEventForm(createEventForm(staffPhone));
    setIsModalOpen(true);
  };

  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setEventForm(eventToForm(event));
    setIsModalOpen(true);
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
    const app = data.applications.find(
      (a) => a.user_id === userId && a.event_id === eventId,
    );
    if (app && app.status !== status) {
      const reversing =
        (app.status === "approved" && status === "declined") ||
        (app.status === "approved" && status === "pending");
      if (
        reversing &&
        !window.confirm(
          status === "declined"
            ? "Revoke approval? They will lose check-in access for this event."
            : "Re-open this request for review?",
        )
      ) {
        return;
      }
    }

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
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to activate I-Card.";
      toast.error(msg);
    } finally {
      setActioningId(null);
    }
  };

  const handleDeactivateVolunteer = async (userId: string) => {
    if (!window.confirm("Deactivate this volunteer? They will lose app access.")) return;
    setActioningId(userId);
    try {
      await deactivateVolunteer(userId);
      toast.success("Volunteer deactivated.");
      setData((prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          u.id === userId ? { ...u, status: "inactive" } : u,
        ),
      }));
    } catch {
      toast.error("Failed to deactivate volunteer.");
    } finally {
      setActioningId(null);
    }
  };

  const handleReactivateVolunteer = async (userId: string) => {
    setActioningId(userId);
    try {
      await reactivateVolunteer(userId);
      toast.success("Volunteer reactivated.");
      setData((prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          u.id === userId ? { ...u, status: "active" } : u,
        ),
      }));
    } catch {
      toast.error("Failed to reactivate volunteer.");
    } finally {
      setActioningId(null);
    }
  };

  const handleReopenEvent = async (eventId: string) => {
    setActioningId(eventId);
    try {
      await reopenEvent(eventId);
      toast.success("Event reopened.");
      setData((prev) => ({
        ...prev,
        events: prev.events.map((e) =>
          e.id === eventId ? { ...e, status: "active" } : e,
        ),
      }));
    } catch {
      toast.error("Failed to reopen event.");
    } finally {
      setActioningId(null);
    }
  };

  const handleDuplicateEvent = async (event: Event) => {
    setActioningId(event.id);
    try {
      const copy = await duplicateEvent(event.id);
      toast.success("Event duplicated!");
      setData((prev) => ({ ...prev, events: [copy, ...prev.events] }));
    } catch {
      toast.error("Failed to duplicate event.");
    } finally {
      setActioningId(null);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    setActioningId(eventId);
    try {
      await deleteEvent(eventId);
      toast.success("Event deleted.");
      setData((prev) => ({
        ...prev,
        events: prev.events.filter((e) => e.id !== eventId),
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete event.";
      toast.error(msg);
    } finally {
      setActioningId(null);
    }
  };

  const handleCancelOccurrence = async (eventId: string, date: string) => {
    setActioningId(eventId);
    try {
      await cancelEventOccurrence(eventId, date);
      toast.success("Occurrence cancelled.");
      setData((prev) => ({
        ...prev,
        events: prev.events.map((e) =>
          e.id === eventId
            ? {
                ...e,
                cancelled_dates: [...(e.cancelled_dates ?? []), date],
              }
            : e,
        ),
      }));
    } catch {
      toast.error("Failed to cancel occurrence.");
    } finally {
      setActioningId(null);
    }
  };

  const toggleVolunteerSelect = (id: string) => {
    setSelectedVolIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearVolunteerSelection = () => setSelectedVolIds(new Set());

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

  const deletionRequests = data.users.filter((u) => u.delete_requested_at);

  const filteredVolunteers = data.users.filter((v) => {
    const q = volunteerSearch.toLowerCase();
    const matchesSearch =
      !q ||
      v.name.toLowerCase().includes(q) ||
      v.college.toLowerCase().includes(q) ||
      (v.phone ?? "").includes(q) ||
      (v.batch ?? "").toLowerCase().includes(q);
    const matchesFilter =
      volFilter === "pending"
        ? v.status === "pending"
        : v.status !== "pending" &&
          (volFilter === "all" ||
            (volFilter === "active" && v.status === "active") ||
            (volFilter === "inactive" && v.status === "inactive"));
    return matchesSearch && matchesFilter;
  });
  const pendingVolunteerCount = data.users.filter(
    (v) => v.status === "pending",
  ).length;
  const activeVolunteerCount = data.users.filter(
    (v) => v.status === "active",
  ).length;
  const inactiveVolunteerCount = data.users.filter(
    (v) => v.status === "inactive",
  ).length;
  const pagedVolunteers = paginate(filteredVolunteers, volPage, VOL_PAGE_SIZE);
  const pagedGrievances = paginate(data.grievances, grievPage, GRIEV_PAGE_SIZE);
  const uniqueBatches = [
    ...new Set(data.users.map((u) => u.batch).filter(Boolean) as string[]),
  ];

  const selectAllFilteredVolunteers = () => {
    setSelectedVolIds(new Set(filteredVolunteers.map((v) => v.id)));
  };

  const handleBulkApprove = async () => {
    const ids = [...selectedVolIds].filter((id) => {
      const u = data.users.find((v) => v.id === id);
      return u && u.status === "pending";
    });
    if (!ids.length) {
      toast.error("No pending volunteers selected.");
      return;
    }
    setActioningId("bulk-approve");
    try {
      const { succeeded, failed } = await bulkApproveICards(ids);
      if (failed > 0) {
        toast.success(
          `Approved ${succeeded} volunteer(s). ${failed} could not be approved.`,
        );
      } else {
        toast.success(`Approved ${succeeded} volunteer(s).`);
      }
      await fetchAdminData();
      clearVolunteerSelection();
    } catch {
      toast.error("Bulk approve failed.");
    } finally {
      setActioningId(null);
    }
  };

  const handleBulkBatch = async (batch: string) => {
    const ids = [...selectedVolIds];
    if (!ids.length) return;
    setActioningId("bulk-batch");
    try {
      await bulkUpdateUserBatch(ids, batch);
      toast.success(`Batch updated for ${ids.length} volunteer(s).`);
      setData((prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          ids.includes(u.id) ? { ...u, batch: batch.trim() || null } : u,
        ),
      }));
    } catch {
      toast.error("Bulk batch update failed.");
    } finally {
      setActioningId(null);
    }
  };

  const handleBulkNotify = async (title: string, body: string) => {
    const ids = [...selectedVolIds];
    if (!ids.length || !title.trim() || !body.trim()) {
      toast.error("Select volunteers and enter title + message.");
      return;
    }
    setActioningId("bulk-notify");
    try {
      const count = await broadcastNotification({
        title: title.trim(),
        body: body.trim(),
        userIds: ids,
      });
      toast.success(`In-app alert sent to ${count} volunteer(s).`);
    } catch {
      toast.error("Failed to send alerts.");
    } finally {
      setActioningId(null);
    }
  };

  const tabs = [
    { key: "overview", label: "Dashboard", icon: LayoutDashboard },
    { key: "events", label: "Events", icon: Calendar },
    { key: "volunteers", label: "People", icon: Users },
    { key: "applications", label: "Request", icon: ClipboardList },
    { key: "awards", label: "Awards", icon: Trophy },
  ];

  return (
    <>
      <StaffShell
        title="Admin"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={changeTab}
        onRefresh={fetchAdminData}
        onSignOut={() => signOutAction()}
      >
        {loading ? (
          <TableSkeleton rows={6} />
        ) : (
          <>
        {activeTab === "overview" && (
          <div className="space-y-4">
            <AdminOverview
              data={data}
              onNavigate={changeTab}
            />
            <AdminActionsPanel data={data} onNavigate={changeTab} />
            <NotificationBroadcastPanel
              users={data.users}
              batches={uniqueBatches}
            />

            <div className="space-y-3">
              <h2 className="text-lg font-bold">Grievances</h2>
              {pagedGrievances.length === 0 ? (
                <p className="text-gray-500 italic text-sm">No grievances logged.</p>
              ) : (
                <>
                {pagedGrievances.map((g) => (
                  <div
                    key={g.id}
                    className="border border-[var(--border)] p-4 rounded-xl space-y-3 bg-[var(--surface)]"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0">
                        <span className="text-xs bg-red-100 text-red-800 font-extrabold px-2 py-0.5 rounded uppercase">
                          {g.category}
                        </span>
                        {g.user_name && (
                          <p className="text-[10px] text-[var(--text-muted)] mt-1 font-semibold">
                            {g.user_name}
                          </p>
                        )}
                        <p className="text-sm font-medium mt-2">{g.description}</p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-extrabold shrink-0 ${g.status === "resolved" ? "bg-emerald-100 text-emerald-800" : "bg-yellow-100 text-yellow-800"}`}
                      >
                        {titleCaseStatus(g.status)}
                      </span>
                    </div>
                    {g.status === "resolved" && g.admin_notes && (
                      <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/20 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mb-1">
                          Admin response
                        </p>
                        <p className="text-xs text-emerald-900 dark:text-emerald-300 leading-relaxed whitespace-pre-wrap">
                          {g.admin_notes}
                        </p>
                      </div>
                    )}
                    {g.status === "open" && selectedGrievanceId !== g.id && (
                      <button
                        type="button"
                        onClick={() => setSelectedGrievanceId(g.id)}
                        className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                      >
                        Address ticket
                      </button>
                    )}
                    {selectedGrievanceId === g.id && (
                      <div className="space-y-2">
                        <textarea
                          value={grievanceNotes}
                          onChange={(e) => setGrievanceNotes(e.target.value)}
                          placeholder="Resolution notes..."
                          className="w-full border p-2 text-xs rounded-lg dark:bg-gray-800 outline-emerald-600"
                          rows={2}
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedGrievanceId(null)}
                            className="text-xs text-gray-500 px-2"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={actioningId === g.id}
                            onClick={() => handleResolveGrievance(g.id)}
                            className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-md"
                          >
                            Send resolution
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <Pagination
                  total={data.grievances.length}
                  pageSize={GRIEV_PAGE_SIZE}
                  page={grievPage}
                  onPageChange={setGrievPage}
                  floating
                />
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === "events" && (
          <div className="space-y-4">
            <StaffWelcome
              name={staffName}
              subtitle="Create, duplicate, and manage volunteer events."
            />
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
              onReopen={handleReopenEvent}
              onDuplicate={handleDuplicateEvent}
              onCancelOccurrence={setCancelEvent}
              onViewAttendance={setAttendanceEvent}
              onDelete={handleDeleteEvent}
              closingId={actioningId}
            />
          </div>
        )}

        {activeTab === "volunteers" && (
          <div className="space-y-4">
            {deletionRequests.length > 0 && (
              <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-4 space-y-2">
                <h3 className="text-sm font-bold text-red-800 dark:text-red-300">
                  {deletionRequests.length} account deletion request
                  {deletionRequests.length === 1 ? "" : "s"}
                </h3>
                <p className="text-xs text-red-700/80 dark:text-red-400/80 leading-relaxed">
                  Open the volunteer card and tap Confirm permanent deletion after
                  reviewing.
                </p>
                <div className="flex flex-wrap gap-2">
                  {deletionRequests.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setDetailVolunteer(u)}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white dark:bg-[#18181B] border border-red-200 dark:border-red-900/50"
                    >
                      {u.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <StaffWelcome
              name={staffName}
              subtitle="Search, approve sign-ups, batch, notify, and manage volunteers."
            />
            <NotificationBroadcastPanel
              users={data.users}
              batches={uniqueBatches}
            />

            <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
              <div className="p-4 border-b border-[var(--border)] space-y-3">
                <h2 className="text-lg font-bold">People</h2>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Use Pending for new sign-ups. All, Active, and Deactivated are
                  approved members only.
                </p>
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                  />
                  <input
                    type="text"
                    placeholder="Search name, center, phone, batch..."
                    value={volunteerSearch}
                    onChange={(e) => {
                      setVolunteerSearch(e.target.value);
                      setVolPage(1);
                    }}
                    className="w-full pl-9 p-3 border rounded-xl bg-slate-50 dark:bg-[#18181B] border-[var(--border)] outline-emerald-600 text-sm"
                  />
                </div>
                <div className="flex flex-wrap bg-slate-100 dark:bg-[#18181B] p-1 rounded-lg gap-1">
                  {(
                    [
                      ["pending", "Pending", pendingVolunteerCount] as const,
                      ["all", "All", activeVolunteerCount + inactiveVolunteerCount] as const,
                      ["active", "Active", activeVolunteerCount] as const,
                      ["inactive", "Deactivated", inactiveVolunteerCount] as const,
                    ] as const
                  ).map(([key, label, count]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setVolFilter(key);
                        setVolPage(1);
                      }}
                      className={`flex-1 min-w-[4.5rem] py-1.5 text-xs font-bold rounded-md transition-all ${
                        volFilter === key
                          ? key === "pending"
                            ? "bg-amber-500 text-white shadow-sm"
                            : "bg-white dark:bg-black text-[var(--brand)] shadow-sm"
                          : "text-slate-500"
                      }`}
                    >
                      <span className="inline-flex items-center justify-center gap-1">
                        {label}
                        <span className="text-[10px] opacity-80">({count})</span>
                      </span>
                    </button>
                  ))}
                </div>
                {volFilter !== "pending" && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={selectAllFilteredVolunteers}
                    className="text-[10px] font-bold px-2 py-1 rounded-lg border border-[var(--border)]"
                  >
                    Select all filtered
                  </button>
                </div>
                )}
              </div>

              <div className={`p-4 space-y-3 pb-24 ${selectedVolIds.size > 0 ? "pb-36" : ""}`}>
                {pagedVolunteers.length === 0 ? (
                  <p className="text-center text-sm text-[var(--text-muted)] py-8">
                    No volunteers match this filter.
                  </p>
                ) : (
                  pagedVolunteers.map((vol) => (
                    <div
                      key={vol.id}
                      className={`rounded-xl border p-4 space-y-3 ${
                        selectedVolIds.has(vol.id)
                          ? "border-[var(--brand)] bg-emerald-50/30 dark:bg-emerald-950/20"
                          : "border-[var(--border)] bg-slate-50/50 dark:bg-[#18181B]/50"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        {vol.status !== "pending" ? (
                          <button
                            type="button"
                            onClick={() => toggleVolunteerSelect(vol.id)}
                            className="shrink-0 p-1 text-[var(--brand)]"
                            aria-label="Select volunteer"
                          >
                            {selectedVolIds.has(vol.id) ? (
                              <CheckSquare size={18} />
                            ) : (
                              <Square size={18} className="text-[var(--text-muted)]" />
                            )}
                          </button>
                        ) : (
                          <div className="w-7 shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-bold truncate">{vol.name}</p>
                          <p className="text-xs text-[var(--text-muted)] truncate">
                            {vol.college}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold ${
                            vol.status === "active"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : vol.status === "pending"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {titleCaseStatus(vol.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <p className="flex items-center gap-1.5 text-[var(--text-muted)] truncate">
                          <Phone size={11} className="shrink-0 text-[var(--brand)]" />
                          {vol.phone || "No phone"}
                        </p>
                        <p className="flex items-center gap-1.5 text-[var(--text-muted)] truncate">
                          <MapPin size={11} className="shrink-0 text-[var(--brand)]" />
                          {vol.batch || "No batch"}
                        </p>
                      </div>

                      {vol.status !== "pending" && (
                        <p className="text-[10px] font-mono text-[var(--text-muted)]">
                          {vol.volunteer_id || "No ID yet"} · {titleCaseStatus(vol.role)}
                        </p>
                      )}

                      {vol.status === "pending" ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={actioningId === vol.id}
                            onClick={() => handleApproveICard(vol.id)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1.5"
                          >
                            {actioningId === vol.id && (
                              <Loader2 size={14} className="animate-spin" />
                            )}
                            Approve I-Card
                          </button>
                          <button
                            type="button"
                            onClick={() => setDetailVolunteer(vol)}
                            className="flex-1 border border-[var(--border)] py-2.5 rounded-lg text-xs font-bold hover:bg-[var(--surface)]"
                          >
                            Details
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={vol.role}
                              disabled={actioningId === vol.id}
                              onChange={(e) =>
                                handleRoleChange(vol.id, e.target.value as UserRole)
                              }
                              className="text-xs font-bold border border-[var(--border)] rounded-lg p-2 bg-[var(--surface)] outline-emerald-600"
                            >
                              <option value="volunteer">Volunteer</option>
                              <option value="organiser">Organiser</option>
                              <option value="admin">Admin</option>
                            </select>
                            <input
                              type="text"
                              placeholder="Batch / area"
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
                                        u.id === vol.id
                                          ? { ...u, batch: next || null }
                                          : u,
                                      ),
                                    }));
                                  })
                                  .catch(() => toast.error("Failed to update batch"))
                                  .finally(() => setActioningId(null));
                              }}
                              className="text-xs border border-[var(--border)] rounded-lg p-2 bg-[var(--surface)] outline-emerald-600"
                            />
                          </div>

                          <div className="flex gap-2">
                            {vol.status === "active" && (
                              <button
                                type="button"
                                disabled={actioningId === vol.id}
                                onClick={() => handleDeactivateVolunteer(vol.id)}
                                className="flex-1 border border-red-200 text-red-600 dark:border-red-900/50 dark:text-red-400 py-2.5 rounded-lg text-xs font-bold disabled:opacity-50"
                              >
                                Deactivate
                              </button>
                            )}
                            {vol.status === "inactive" && (
                              <button
                                type="button"
                                disabled={actioningId === vol.id}
                                onClick={() => handleReactivateVolunteer(vol.id)}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-xs font-bold disabled:opacity-50"
                              >
                                Reactivate
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setDetailVolunteer(vol)}
                              className="flex-1 border border-[var(--border)] py-2.5 rounded-lg text-xs font-bold hover:bg-[var(--surface)]"
                            >
                              Details
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>

              <Pagination
                total={filteredVolunteers.length}
                pageSize={VOL_PAGE_SIZE}
                page={volPage}
                onPageChange={setVolPage}
                floating
              />
            </div>
          </div>
        )}

        {activeTab === "applications" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Requests</h2>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed -mt-2">
              Change decisions anytime — approve, decline, revoke, or re-open for
              review. Volunteers can re-apply after a decline from Applied or Home.
            </p>
            <ApplicationsTable
              applications={data.applications}
              page={appsPage}
              onPageChange={setAppsPage}
              actioningId={actioningId}
              onAction={handleApplicationAction}
              floatingPagination
            />
          </div>
        )}

        {activeTab === "awards" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Awards</h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed -mt-2">
              Tap <strong>New</strong> to create an award type, then use{" "}
              <strong>Grant to Volunteer</strong> to assign it. Organizer phone
              on new events is prefilled from your profile — edit in Event form.
            </p>
            <AwardsPanel
              volunteers={data.users}
              events={data.events}
              canDelete
              floatingPagination
            />
          </div>
        )}
          </>
        )}
      </StaffShell>

      <VolunteerDetailModal
        volunteer={detailVolunteer}
        onClose={() => setDetailVolunteer(null)}
        onUpdated={fetchAdminData}
      />

      <EventAttendanceModal
        event={attendanceEvent}
        onClose={() => setAttendanceEvent(null)}
      />

      <CancelOccurrenceModal
        event={cancelEvent}
        onClose={() => setCancelEvent(null)}
        onConfirm={handleCancelOccurrence}
      />

      <VolunteerBulkActions
        count={selectedVolIds.size}
        actioningId={actioningId}
        onClear={clearVolunteerSelection}
        onApprove={handleBulkApprove}
        onSetBatch={handleBulkBatch}
        onSendAlert={handleBulkNotify}
      />

      <EventFormModal
        open={isModalOpen}
        editing={editingEvent}
        form={eventForm}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(null);
        }}
        onSubmit={submitEvent}
        onChange={setEventForm}
      />
    </>
  );
}
