import { SNS_CENTERS } from "@/lib/centers";
import { Building2, ChevronDown } from "lucide-react";

type CenterPickerProps = {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  /** Auth-style field with left icon */
  variant?: "default" | "auth";
};

export default function CenterPicker({
  value,
  onChange,
  required,
  placeholder = "Select concern center",
  className = "",
  variant = "default",
}: CenterPickerProps) {
  const select = (
    <select
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={
        variant === "auth"
          ? `sns-input appearance-none pr-10 ${className}`
          : `w-full bg-[var(--surface-input)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-base font-semibold outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-muted)] ${className}`
      }
    >
      <option value="">{placeholder}</option>
      {SNS_CENTERS.map((center) => (
        <option key={center} value={center}>
          {center}
        </option>
      ))}
    </select>
  );

  if (variant === "auth") {
    return (
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <Building2 size={18} />
        </span>
        {select}
        <ChevronDown
          size={18}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
      </div>
    );
  }

  return select;
}
