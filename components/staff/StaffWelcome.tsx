type Props = { name: string; subtitle: string };

export default function StaffWelcome({ name, subtitle }: Props) {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-black tracking-tight">
        Welcome, {name.split(" ")[0]}
      </h1>
      <p className="text-xs text-[var(--text-muted)] font-medium">{subtitle}</p>
    </div>
  );
}
