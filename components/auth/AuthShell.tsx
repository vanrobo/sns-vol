import BrandLogo from "@/components/BrandLogo";
import { APP_NAME } from "@/lib/brand";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-emerald-50/80 via-[var(--surface-elevated)] to-[var(--surface-elevated)] dark:from-emerald-950/20 dark:via-[#0B0F17] dark:to-[#0B0F17] p-4 animate-fadeIn">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <BrandLogo size={112} showFamily={false} roundedFull />
          </div>
          <p className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--brand)] mt-1">
            {APP_NAME}
          </p>
        </div>

        <div className="bg-[var(--surface)] dark:bg-[var(--surface-elevated)] p-7 sm:p-8 rounded-2xl shadow-xl border border-[var(--border)]">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight mb-2">
            {title}
          </h1>
          <p className="text-[var(--text-muted)] mb-7 text-base leading-relaxed">
            {subtitle}
          </p>
          {children}
        </div>

        {footer && <div className="mt-6">{footer}</div>}
      </div>
    </div>
  );
}
