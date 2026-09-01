"use client";

import { useState, useEffect, useCallback, startTransition } from "react";
import toast from "react-hot-toast";
import { Plus, Calendar, ClipboardList, Trophy } from "lucide-react";
import type { ApplicationStatus, Event } from "@/types";
import {
  createEvent,
  updateEvent,
  closeEvent,
  reopenEvent,
  duplicateEvent,
  deleteEvent,
  cancelEventOccurrence,
  updateApplicationStatus,
  type EventInput,
} from "@/lib/data/admin";
import { getOrganiserData } from "@/lib/data/organiser";
import { signOutAction } from "@/lib/actions/auth";
import StaffShell from "@/components/staff/StaffShell";
import StaffWelcome from "@/components/staff/StaffWelcome";
import { getMyRole } from "@/lib/data/profiles";
import { readOrganiserCache, writeOrganiserCache } from "@/lib/organiser-cache";
import { haptic } from "@/lib/haptics";
import EventFormModal, {
  createEventForm,
  emptyEventForm,
  eventToForm,
} from "@/components/staff/EventFormModal";
import EventsTable from "@/components/staff/EventsTable";
import EventAttendanceModal from "@/components/staff/EventAttendanceModal";
import CancelOccurrenceModal from "@/components/staff/CancelOccurrenceModal";
import ApplicationsTable from "@/components/staff/ApplicationsTable";
import { TableSkeleton } from "@/components/ui/Skeleton";
import AwardRecommendationPanel from "@/components/staff/AwardRecommendationPanel";
import type { OrganiserData } from "@/lib/data/organiser";

export default function OrganiserDashboard() {
  const cachedOrganiser = readOrganiserCache();
  const [data, setData] = useState<OrganiserData>(
    () =>
      cachedOrganiser ?? {
        events: [],
        applications: [],
        users: [],
      },
  );
  const [loading, setLoading] = useState(!cachedOrganiser);
  const [activeTab, setActiveTab] = useState("events");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventForm, setEventForm] = useState<EventInput>(emptyEventForm);
  const [staffPhone, setStaffPhone] = useState("");
  const [eventsPage, setEventsPage] = useState(1);
  const [appsPage, setAppsPage] = useState(1);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [staffName, setStaffName] = useState("Organiser");
  const [attendanceEvent, setAttendanceEvent] = useState<Event | null>(null);
  const [cancelEvent, setCancelEvent] = useState<Event | null>(null);

  const fetchData = useCallback(async (opts?: { silent?: boolean }) => {
    try {
      const result = await getOrganiserData();
      setData(result);
      writeOrganiserCache(result);
    } catch {
      if (!opts?.silent) toast.error("Failed to load organiser data.");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshOrganiser = useCallback(async () => {
    haptic("light");
    await fetchData({ silent: true });
    haptic("success");
  }, [fetchData]);

  useEffect(() => {
    fetchData();
    getMyRole().then((s) => {
      if (s?.name) setStaffName(s.name);
      if (s?.phone) setStaffPhone(s.phone);
    });
  }, [fetchData]);

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
        haptic("success");
        toast.success("Event updated!");
      } else {
        await createEvent(eventForm);
        haptic("success");
        toast.success("Event published!");
      }
      setIsModalOpen(false);
      fetchData();
    } catch {
      toast.error("Failed to save event.");
    }
  };

  const handleCloseEvent = async (eventId: string) => {
    setActioningId(eventId);
    try {
      await closeEvent(eventId);
      haptic("warning");
      toast.success("Event closed.");
      fetchData();
    } catch {
      toast.error("Failed to close event.");
    } finally {
      setActioningId(null);
    }
  };

  const handleReopenEvent = async (eventId: string) => {
    setActioningId(eventId);
    try {
      await reopenEvent(eventId);
      haptic("success");
      toast.success("Event reopened.");
      fetchData();
    } catch {
      toast.error("Failed to reopen event.");
    } finally {
      setActioningId(null);
    }
  };

  const handleDuplicateEvent = async (event: Event) => {
    setActioningId(event.id);
    try {
      await duplicateEvent(event.id);
      haptic("success");
      toast.success("Event duplicated!");
      fetchData();
    } catch {
      toast.error("Failed to duplicate event.");
    } finally {
      setActioningId(null);
    }
  };

  const handleCancelOccurrence = async (eventId: string, date: string) => {
    setActioningId(eventId);
    try {
      await cancelEventOccurrence(eventId, date);
      haptic("warning");
      toast.success("Occurrence cancelled.");
      fetchData();
    } catch {
      toast.error("Failed to cancel occurrence.");
    } finally {
      setActioningId(null);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    setActioningId(eventId);
    try {
      await deleteEvent(eventId);
      haptic("warning");
      toast.success("Event deleted.");
      fetchData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete event.";
      toast.error(msg);
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
            ? "Revoke approval for this volunteer?"
            : "Re-open this request for review?",
        )
      ) {
        return;
      }
    }

    setActioningId(`${userId}-${eventId}`);
    try {
      await updateApplicationStatus(userId, eventId, status);
      haptic(status === "approved" ? "success" : "warning");
      toast.success(`Request marked as ${status}`);
      fetchData();
    } catch {
      toast.error("Failed to update request.");
    } finally {
      setActioningId(null);
    }
  };

  const tabs = [
    { key: "events", label: "Events", icon: Calendar },
    { key: "applications", label: "Request", icon: ClipboardList },
    { key: "recommend", label: "Recommend", icon: Trophy },
  ];

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-4">
        <TableSkeleton rows={5} />
      </div>
    );
  }

  return (
    <>
      <StaffShell
        title="Organiser"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tab) => {
          haptic("selection");
          startTransition(() => setActiveTab(tab));
        }}
        onRefresh={refreshOrganiser}
        onSignOut={() => signOutAction()}
      >
        <div className="mb-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-800 p-4 flex items-center justify-between gap-3 text-white shadow-md">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">
              Organiser
            </p>
            <p className="font-bold text-sm">Organize events</p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="shrink-0 bg-white text-emerald-800 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={14} /> New event
          </button>
        </div>

        {activeTab === "events" && (
          <div className="space-y-4">
            <StaffWelcome
              name={staffName}
              subtitle="Create and manage your events. You only see events you published."
            />
            <div className="flex justify-between items-center gap-3">
              <h2 className="text-lg font-bold">Your events</h2>
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

        {activeTab === "applications" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Requests</h2>
            <ApplicationsTable
              applications={data.applications}
              page={appsPage}
              onPageChange={setAppsPage}
              actioningId={actioningId}
              onAction={handleApplicationAction}
            />
          </div>
        )}

        {activeTab === "recommend" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Award recommendation</h2>
            <AwardRecommendationPanel />
          </div>
        )}
      </StaffShell>

      <EventFormModal
        open={isModalOpen}
        editing={editingEvent}
        form={eventForm}
        onClose={() => setIsModalOpen(false)}
        onSubmit={submitEvent}
        onChange={setEventForm}
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
    </>
  );
}
