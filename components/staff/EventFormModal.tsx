"use client";

import { X } from "lucide-react";
import type { Event } from "@/types";
import type { EventInput } from "@/lib/data/admin";

type EventFormModalProps = {
  open: boolean;
  editing: Event | null;
  form: EventInput;
  tempSkill: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (form: EventInput) => void;
  onTempSkillChange: (value: string) => void;
  onAddSkill: (e: React.FormEvent) => void;
  onRemoveSkill: (skill: string) => void;
};

export default function EventFormModal({
  open,
  editing,
  form,
  tempSkill,
  onClose,
  onSubmit,
  onChange,
  onTempSkillChange,
  onAddSkill,
  onRemoveSkill,
}: EventFormModalProps) {
  if (!open) return null;

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
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
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
              <label className="block text-sm font-bold mb-2">Date</label>
              <input
                required
                type="date"
                value={form.date}
                onChange={(e) => onChange({ ...form, date: e.target.value })}
                className="w-full border p-3 rounded-xl dark:bg-gray-800 border-[var(--border)] outline-emerald-600"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Venue</label>
              <input
                required
                type="text"
                value={form.venue}
                onChange={(e) => onChange({ ...form, venue: e.target.value })}
                className="w-full border p-3 rounded-xl dark:bg-gray-800 border-[var(--border)] outline-emerald-600"
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
                Coordinator Phone
              </label>
              <input
                type="tel"
                value={form.coordinator_phone}
                onChange={(e) =>
                  onChange({ ...form, coordinator_phone: e.target.value })
                }
                className="w-full border p-3 rounded-xl dark:bg-gray-800 border-[var(--border)] outline-emerald-600"
              />
            </div>
            <div className="col-span-2">
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
            <div className="col-span-2">
              <label className="block text-sm font-bold mb-2">
                Required Skills
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tempSkill}
                  onChange={(e) => onTempSkillChange(e.target.value)}
                  className="flex-1 border p-3 rounded-xl dark:bg-gray-800 border-[var(--border)] outline-emerald-600"
                  placeholder="e.g. Mathematics"
                />
                <button
                  type="button"
                  onClick={onAddSkill}
                  className="bg-gray-800 text-white px-4 rounded-xl font-bold"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.required_skills.map((s) => (
                  <span
                    key={s}
                    className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1"
                  >
                    {s}
                    <X
                      size={14}
                      className="cursor-pointer"
                      onClick={() => onRemoveSkill(s)}
                    />
                  </span>
                ))}
              </div>
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

export const emptyEventForm = {
  title: "",
  date: "",
  venue: "",
  description: "",
  criteria: "Student",
  required_skills: [] as string[],
  category: "Community",
  coordinator_phone: "",
};
