"use client";

import { useState, useEffect, useCallback, startTransition } from "react";
import toast from "react-hot-toast";
import { Plus, Calendar, Award, Trophy } from "lucide-react";
import type { ApplicationStatus, Event } from "@/types";
import {
  createEvent,
  updateEvent,
  closeEvent,
  reopenEvent,
  duplicateEvent,
  cancelEventOccurrence,
  updateApplicationStatus,
  type EventInput,
} from "@/lib/data/admin";
import { getOrganiserData } from "@/lib/data/organiser";
import { signOutAction } from "@/lib/actions/auth";
import StaffShell from "@/components/staff/StaffShell";
import StaffWelcome from "@/components/staff/StaffWelcome";
import { APP_NAME } from "@/lib/brand";
import { getMyRole } from "@/lib/data/profiles";
import { readOrganiserCache, writeOrganiserCache } from "@/lib/organiser-cache";
import { haptic } from "@/lib/haptics";
import EventFormModal, {
  emptyEventForm,
} from "@/components/staff/EventFormModal";
import EventsTable from "@/components/staff/EventsTable";
import EventAttendanceModal from "@/components/staff/EventAttendanceModal";
import CancelOccurrenceModal from "@/components/staff/CancelOccurrenceModal";
import ApplicationsTable from "@/components/staff/ApplicationsTable";
import { TableSkeleton } from "@/components/ui/Skeleton";
import AwardsPanel from "@/components/staff/AwardsPanel";
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
  const [tempSkill, setTempSkill] = useState("");
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
    });
  }, [fetchData]);

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

  const handleApplicationAction = async (
    userId: string,
    eventId: string,
    status: ApplicationStatus,
  ) => {
    setActioningId(`${userId}-${eventId}`);
    try {
      await updateApplicationStatus(userId, eventId, status);
      haptic(status === "approved" ? "success" : "warning");
      toast.success(`Application marked as ${status}`);
      fetchData();
    } catch {
      toast.error("Failed to update application.");
    } finally {
      setActioningId(null);
    }
  };

  const tabs = [
    { key: "events", label: "Events", icon: Calendar },
    { key: "applications", label: "Applications", icon: Award },
    { key: "awards", label: "Awards", icon: Trophy },
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
        {activeTab === "events" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[var(--surface)] p-3 rounded-xl border border-[var(--border)] text-center">
                <p className="text-[9px] font-bold uppercase text-[var(--text-muted)] mb-1">
                  Active
                </p>
                <p className="text-2xl font-black text-emerald-600">
                  {data.events.filter((e) => e.status === "active").length}
                </p>
              </div>
              <div className="bg-[var(--surface)] p-3 rounded-xl border border-[var(--border)] text-center">
                <p className="text-[9px] font-bold uppercase text-[var(--text-muted)] mb-1">
                  Pending apps
                </p>
                <p className="text-2xl font-black text-amber-500">
                  {data.applications.filter((a) => a.status === "pending").length}
                </p>
              </div>
            </div>
            <StaffWelcome
              name={staffName}
              subtitle="Manage your events and review applications."
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
              closingId={actioningId}
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
            <AwardsPanel volunteers={data.users} events={data.events} />
          </div>
        )}
      </StaffShell>

      <EventFormModal
        open={isModalOpen}
        editing={editingEvent}
        form={eventForm}
        tempSkill={tempSkill}
        onClose={() => setIsModalOpen(false)}
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
