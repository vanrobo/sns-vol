import Image from "next/image";
import { APP_NAME_ACCENT, LOGO_SRC } from "@/lib/brand";

type BrandLogoProps = {
  size?: number;
  showFamily?: boolean;
  className?: string;
};

export default function BrandLogo({
  size = 40,
  showFamily = true,
  className = "",
}: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-2 min-w-0 ${className}`}>
      <Image
        src={LOGO_SRC}
        alt="SNS"
        width={size}
        height={size}
        className="rounded-lg shrink-0 object-contain"
        priority
      />
      {showFamily && (
        <span className="text-lg font-black tracking-tight text-[var(--brand)] truncate">
          {APP_NAME_ACCENT}
        </span>
      )}
    </div>
  );
}
