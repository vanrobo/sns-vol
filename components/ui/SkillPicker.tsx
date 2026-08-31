"use client";

import { ChevronDown, X } from "lucide-react";
import { SKILL_DB } from "@/lib/skills";

type SkillPickerProps = {
  selected: string[];
  onChange: (skills: string[]) => void;
};

export default function SkillPicker({ selected, onChange }: SkillPickerProps) {
  const available = SKILL_DB.filter((skill) => !selected.includes(skill));

  return (
    <div className="space-y-3">
      {selected.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selected.map((skill) => (
            <div
              key={skill}
              className="px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 border border-[var(--border)] bg-gray-50 dark:bg-[#1C1C1E]"
            >
              <span>{skill}</span>
              <button
                type="button"
                aria-label={`Remove ${skill}`}
                onClick={() =>
                  onChange(selected.filter((item) => item !== skill))
                }
                className="text-slate-500 hover:text-red-500"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-500 font-medium">No skills selected.</p>
      )}

      {available.length > 0 && (
        <div className="relative">
          <select
            value=""
            onChange={(e) => {
              const skill = e.target.value;
              if (skill && !selected.includes(skill)) {
                onChange([...selected, skill]);
              }
            }}
            className="w-full bg-slate-50 dark:bg-[#1C1C1E] border border-[var(--border)] rounded-lg p-3 pr-10 text-sm outline-none appearance-none font-bold"
          >
            <option value="">+ Add a skill...</option>
            {available.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
          />
        </div>
      )}
    </div>
  );
}
