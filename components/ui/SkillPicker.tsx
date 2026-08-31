"use client";

import { Plus, X } from "lucide-react";
import { SKILL_CATEGORIES, SKILL_DB } from "@/lib/skills";

type SkillPickerProps = {
  selected: string[];
  onChange: (skills: string[]) => void;
};

export default function SkillPicker({ selected, onChange }: SkillPickerProps) {
  const available = SKILL_DB.filter((skill) => !selected.includes(skill));
  const availableByCategory = Object.entries(SKILL_CATEGORIES)
    .map(([category, skills]) => ({
      category,
      skills: skills.filter((skill) => available.includes(skill)),
    }))
    .filter((group) => group.skills.length > 0);

  const addSkill = (skill: string) => {
    if (!selected.includes(skill)) onChange([...selected, skill]);
  };

  const removeSkill = (skill: string) => {
    onChange(selected.filter((item) => item !== skill));
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
          Selected ({selected.length})
        </p>
        {selected.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selected.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => removeSkill(skill)}
                className="group px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-[var(--brand)]/30 bg-emerald-50 dark:bg-emerald-950/30 text-[var(--brand)] shadow-sm transition-all hover:border-red-400/50 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600"
              >
                <span>{skill}</span>
                <X
                  size={12}
                  className="opacity-60 group-hover:opacity-100 shrink-0"
                />
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 font-medium py-1">
            Tap a skill below to add it.
          </p>
        )}
      </div>

      {available.length > 0 && (
        <div className="space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Add skill
          </p>
          {availableByCategory.map(({ category, skills }) => (
            <div key={category}>
              <p className="text-[10px] font-semibold text-[var(--text-muted)] mb-2">
                {category}
              </p>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => addSkill(skill)}
                    className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 border border-dashed border-[var(--border)] bg-slate-50 dark:bg-[#18181B] text-slate-600 dark:text-slate-300 hover:border-[var(--brand)]/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-[var(--brand)] transition-all active:scale-95"
                  >
                    <Plus size={12} className="shrink-0 opacity-70" />
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
