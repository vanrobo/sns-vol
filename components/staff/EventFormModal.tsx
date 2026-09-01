"use client";

import { X } from "lucide-react";
import type { Event } from "@/types";
import type { EventInput } from "@/lib/data/admin";
import VenuePicker from "@/components/staff/VenuePicker";
import SkillPicker from "@/components/ui/SkillPicker";
import CenterPicker from "@/components/ui/CenterPicker";

type EventFormModalProps = {
  open: boolean;
  editing: Event | null;
  form: EventInput;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (form: EventInput) => void;
};

export default function EventFormModal({
  open,
  editing,
  form,
  onClose,
  onSubmit,
  onChange,
}: EventFormModalProps) {
  if (!open) return null;

  const venueFieldKey = editing?.id ?? "new-event";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center sticky top-0 bg-[var(--surface)] z-10">
          <h2 className="text-xl font-bold">
            {editing ? "Edit Event" : "Publish New Event"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <X />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold mb-2">Event Title</label>
              <input
                required
                type="text"
                value={form.title}
                onChange={(e) => onChange({ ...form, title: e.target.value })}
                className="w-full border p-3 rounded-xl dark:bg-gray-800 border-[var(--border)] outline-emerald-600"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Start Date</label>
              <input
                required
                type="date"
                value={form.date}
                onChange={(e) => onChange({ ...form, date: e.target.value })}
                className="w-full border p-3 rounded-xl dark:bg-gray-800 border-[var(--border)] outline-emerald-600"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Start Time</label>
              <input
                type="time"
                value={form.time_start ?? ""}
                onChange={(e) =>
                  onChange({ ...form, time_start: e.target.value || null })
                }
                className="w-full border p-3 rounded-xl dark:bg-gray-800 border-[var(--border)] outline-emerald-600"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">End Time</label>
              <input
                type="time"
                value={form.time_end ?? ""}
                onChange={(e) =>
                  onChange({ ...form, time_end: e.target.value || null })
                }
                className="w-full border p-3 rounded-xl dark:bg-gray-800 border-[var(--border)] outline-emerald-600"
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-3">
              <input
                id="is-recurring"
                type="checkbox"
                checked={form.is_recurring ?? false}
                onChange={(e) =>
                  onChange({
                    ...form,
                    is_recurring: e.target.checked,
                    end_date: e.target.checked ? form.end_date : null,
                  })
                }
                className="w-4 h-4 accent-emerald-600"
              />
              <label htmlFor="is-recurring" className="text-sm font-bold">
                Recurring weekly event (shows on calendar until end date)
              </label>
            </div>
            {form.is_recurring && (
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2">End Date</label>
                <input
                  type="date"
                  value={form.end_date ?? ""}
                  min={form.date}
                  onChange={(e) =>
                    onChange({ ...form, end_date: e.target.value || null })
                  }
                  className="w-full border p-3 rounded-xl dark:bg-gray-800 border-[var(--border)] outline-emerald-600"
                />
              </div>
            )}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold mb-2">Venue</label>
              <VenuePicker
                fieldKey={venueFieldKey}
                value={form.venue}
                onChange={(venue) => onChange({ ...form, venue })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Concern Center</label>
              <CenterPicker
                value={form.region ?? ""}
                onChange={(region) => onChange({ ...form, region })}
                placeholder="Select concern center"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Category</label>
              <select
                value={form.category}
                onChange={(e) => onChange({ ...form, category: e.target.value })}
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
                Organizer phone (shown on event)
              </label>
              <input
                type="tel"
                value={form.coordinator_phone}
                onChange={(e) =>
                  onChange({ ...form, coordinator_phone: e.target.value })
                }
                placeholder="Auto-filled from your profile if set"
                className="w-full border p-3 rounded-xl dark:bg-gray-800 border-[var(--border)] outline-emerald-600"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold mb-2">Description</label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) =>
                  onChange({ ...form, description: e.target.value })
                }
                className="w-full border p-3 rounded-xl dark:bg-gray-800 border-[var(--border)] outline-emerald-600"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold mb-2">
                Required Skills
              </label>
              <SkillPicker
                selected={form.required_skills}
                onChange={(required_skills) =>
                  onChange({ ...form, required_skills })
                }
              />
            </div>
          </div>

          <div className="pt-6 border-t border-[var(--border)] flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg"
            >
              {editing ? "Save Changes" : "Publish Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export const emptyEventForm: EventInput = {
  title: "",
  date: "",
  venue: "",
  description: "",
  criteria: "Student",
  required_skills: [],
  category: "Community",
  coordinator_phone: "",
  region: "",
  end_date: null,
  time_start: null,
  time_end: null,
  is_recurring: false,
};

export function createEventForm(staffPhone?: string): EventInput {
  return {
    ...emptyEventForm,
    coordinator_phone: staffPhone?.trim() ?? "",
  };
}

export function eventToForm(event: Event): EventInput {
  return {
    title: event.title,
    date: event.date,
    venue: event.venue,
    description: event.description,
    criteria: event.criteria,
    required_skills: event.required_skills,
    category: event.category,
    coordinator_phone: event.coordinator_phone,
    region: event.region ?? "",
    end_date: event.end_date ?? null,
    time_start: event.time_start ?? null,
    time_end: event.time_end ?? null,
    is_recurring: event.is_recurring ?? false,
  };
}
