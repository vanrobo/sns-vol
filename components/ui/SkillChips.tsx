type SkillChipsProps = {
  criteria?: string;
  skills?: string[];
};

export default function SkillChips({ criteria, skills = [] }: SkillChipsProps) {
  const chips = [
    ...(criteria?.trim() ? [criteria.trim()] : []),
    ...skills.filter(Boolean),
  ];

  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map((chip) => (
        <span
          key={chip}
          className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-[var(--brand)] border border-emerald-500/20"
        >
          {chip}
        </span>
      ))}
    </div>
  );
}
