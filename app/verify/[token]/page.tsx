import { parseVerifyToken } from "@/lib/qr/verify-token";
import { APP_NAME } from "@/lib/brand";
import { ShieldCheck, ShieldX, BadgeCheck } from "lucide-react";
import { titleCaseStatus } from "@/types";

type Props = { params: Promise<{ token: string }> };

export default async function VerifyPage({ params }: Props) {
  const { token } = await params;
  const payload = parseVerifyToken(token);

  return (
    <div className="min-h-screen bg-[var(--surface-muted)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-xl overflow-hidden">
        {payload ? (
          <>
            <div className="bg-emerald-600 p-6 text-white flex items-center gap-3">
              <ShieldCheck size={32} />
              <div>
                <h1 className="text-xl font-bold">Verified Volunteer</h1>
                <p className="text-emerald-100 text-sm">{APP_NAME} Digital ID Check</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <BadgeCheck className="text-emerald-600" size={28} />
                <div>
                  <p className="text-lg font-bold">{payload.name}</p>
                  <p className="text-sm text-gray-500 font-mono">
                    {payload.volunteer_id}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-50 dark:bg-[#18181B] p-3 rounded-lg border border-[var(--border)]">
                  <p className="text-[10px] font-bold uppercase text-gray-500 mb-1">
                    Status
                  </p>
                  <p className="font-bold text-emerald-600">
                    {titleCaseStatus(payload.status)}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-[#18181B] p-3 rounded-lg border border-[var(--border)]">
                  <p className="text-[10px] font-bold uppercase text-gray-500 mb-1">
                    Valid Until
                  </p>
                  <p className="font-bold">{payload.valid_until || "N/A"}</p>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 text-center">
                This verification link expires within 24 hours of generation.
              </p>
            </div>
          </>
        ) : (
          <div className="p-8 text-center space-y-4">
            <ShieldX className="mx-auto text-red-500" size={48} />
            <h1 className="text-xl font-bold">Verification Failed</h1>
            <p className="text-sm text-gray-500">
              This QR code is invalid or has expired. Ask the volunteer to refresh
              their I-Card and scan again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
