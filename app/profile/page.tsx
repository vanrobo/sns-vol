// app/profile/page.tsx
"use client";
import MobileLayout from "@/components/MobileLayout";
import { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { readProfileCache, writeProfileCache } from "@/lib/profile-cache";
import { haptic } from "@/lib/haptics";
import { compressAvatarFile } from "@/lib/compress-image";
import { useUnsavedChangesOptional } from "@/components/UnsavedChangesProvider";
import Link from "next/link";
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  signOut,
  requestDeleteAccount,
  cancelDeleteAccountRequest,
} from "@/lib/data/profiles";
import type { Profile } from "@/types";
import { ProfileSkeleton } from "@/components/ui/Skeleton";
import { getMyAwards } from "@/lib/data/awards";
import type { UserAward } from "@/types";
import {
  User,
  Loader2,
  Phone,
  MapPin,
  X,
  Edit2,
  Check,
  ChevronDown,
  LogOut,
  AlertTriangle,
  Settings,
  Shield,
  BookOpen,
  Camera,
  Award,
  BadgeCheck,
  CalendarDays,
} from "lucide-react";

import SkillPicker from "@/components/ui/SkillPicker";
import CenterPicker from "@/components/ui/CenterPicker";
import OnboardingBanner from "@/components/onboarding/OnboardingBanner";
import { getProfileCompletion } from "@/lib/onboarding";

function ProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const onboardingMode = searchParams.get("onboarding") === "1";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const unsavedCtx = useUnsavedChangesOptional();

  const cached = readProfileCache();
  const [baselineSnapshot, setBaselineSnapshot] = useState(
    cached?.profile
      ? JSON.stringify({
          name: cached.profile.name,
          college: cached.profile.college,
          phone: cached.profile.phone ?? "",
          address: cached.profile.address ?? "",
          skills: cached.profile.skills,
          hasAvatar: false,
        })
      : "",
  );

  const [profile, setProfile] = useState<Profile | null>(
    () => cached?.profile ?? null,
  );
  const [loading, setLoading] = useState(!cached?.profile);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingAvatar, setPendingAvatar] = useState<File | null>(null);
  const [myAwards, setMyAwards] = useState<UserAward[]>(
    () => cached?.awards ?? [],
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const [onboardingPrimed, setOnboardingPrimed] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  const profileSnapshot = useMemo(() => {
    if (!profile) return "";
    return JSON.stringify({
      name: profile.name,
      college: profile.college,
      phone: profile.phone ?? "",
      address: profile.address ?? "",
      skills: profile.skills,
      hasAvatar: Boolean(pendingAvatar),
    });
  }, [profile, pendingAvatar]);

  const hasUnsavedChanges =
    Boolean(profile) &&
    baselineSnapshot !== "" &&
    profileSnapshot !== baselineSnapshot;

  const showSaveBar = hasUnsavedChanges || Boolean(pendingAvatar);

  useEffect(() => {
    unsavedCtx?.setHasUnsaved(hasUnsavedChanges);
  }, [hasUnsavedChanges, unsavedCtx]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (!onboardingMode || !profile || onboardingPrimed) return;
    const hasPhone = (profile.phone?.replace(/\D/g, "") ?? "").length >= 10;
    const hasSkills = (profile.skills?.length ?? 0) > 0;

    if (!hasPhone || !profile.address?.trim()) setIsEditingInfo(true);
    if (!hasSkills) setIsEditingSkills(true);
    setOnboardingPrimed(true);
  }, [onboardingMode, profile, onboardingPrimed]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoadError(null);
      try {
        const data = await getProfile();
        if (cancelled) return;

        if (!data) {
          setLoadError("Profile not found. Try signing out and back in.");
          return;
        }

        setProfile(data);
        setBaselineSnapshot(
          JSON.stringify({
            name: data.name,
            college: data.college,
            phone: data.phone ?? "",
            address: data.address ?? "",
            skills: data.skills,
            hasAvatar: false,
          }),
        );

        const profileCached = readProfileCache(data.id);
        if (profileCached?.userId === data.id) {
          setMyAwards(profileCached.awards);
        }

        let awards: UserAward[] = [];
        try {
          awards = await getMyAwards();
          if (!cancelled) setMyAwards(awards);
        } catch {
          /* awards are optional — don't block profile */
        }

        writeProfileCache({ userId: data.id, profile: data, awards });
      } catch {
        if (!cancelled) {
          setLoadError("Failed to load profile. Check your connection and try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const reloadProfile = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getProfile();
      if (!data) {
        setLoadError("Profile not found. Try signing out and back in.");
        setProfile(null);
        return;
      }
      setProfile(data);
      setBaselineSnapshot(
        JSON.stringify({
          name: data.name,
          college: data.college,
          phone: data.phone ?? "",
          address: data.address ?? "",
          skills: data.skills,
          hasAvatar: false,
        }),
      );
      const awards = await getMyAwards().catch(() => [] as UserAward[]);
      setMyAwards(awards);
      writeProfileCache({ userId: data.id, profile: data, awards });
    } catch {
      setLoadError("Failed to load profile. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      let avatarUrl = profile.avatar_url;
      if (pendingAvatar) {
        const formData = new FormData();
        formData.append("file", pendingAvatar);
        avatarUrl = await uploadAvatar(formData);
      }
      const updated = await updateProfile({
        name: profile.name,
        college: profile.college,
        phone: profile.phone,
        address: profile.address,
        skills: profile.skills,
        avatar_url: avatarUrl,
        public_profile: profile.public_profile,
      });
      setProfile(updated);
      setPendingAvatar(null);
      setPreviewUrl(null);
      setBaselineSnapshot(
        JSON.stringify({
          name: updated.name,
          college: updated.college,
          phone: updated.phone ?? "",
          address: updated.address ?? "",
          skills: updated.skills,
          hasAvatar: false,
        }),
      );
      writeProfileCache({ userId: updated.id, profile: updated, awards: myAwards });
      unsavedCtx?.setHasUnsaved(false);
      haptic("success");
      toast.success("Profile saved");
      setIsEditingInfo(false);
      setIsEditingSkills(false);
      if (onboardingMode && updated.status === "pending") {
        router.push("/pending");
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Could not save profile";
      toast.error(msg.includes("Body") ? "Photo too large. Try a smaller image." : msg);
    } finally {
      setSaving(false);
    }
  };

  const handlePfpChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Selfie image must be smaller than 8MB");
      return;
    }
    try {
      const compressed = await compressAvatarFile(file);
      if (compressed.size > 2 * 1024 * 1024) {
        toast.error("Could not compress photo enough. Try another image.");
        return;
      }
      setPendingAvatar(compressed);
      setPreviewUrl(URL.createObjectURL(compressed));
    } catch {
      toast.error("Could not process that photo");
    }
  };

  const handleLogout = async () => {
    if (!unsavedCtx?.confirmLeave()) return;
    await signOut();
    router.push("/login");
    router.refresh();
  };

  const handleDeleteAccount = async () => {
    if (!unsavedCtx?.confirmLeave()) return;
    if (
      !window.confirm(
        "Request account deletion? An admin will review your request.",
      )
    )
      return;
    try {
      await requestDeleteAccount();
      setProfile((prev) =>
        prev ? { ...prev, delete_requested_at: new Date().toISOString() } : prev,
      );
      toast.success("Deletion request submitted.");
    } catch {
      toast.error("Could not submit request.");
    }
  };

  const handleCancelDeleteRequest = async () => {
    if (
      !window.confirm(
        "Cancel your account deletion request? Your account will stay active.",
      )
    )
      return;
    try {
      await cancelDeleteAccountRequest();
      setProfile((prev) =>
        prev ? { ...prev, delete_requested_at: null } : prev,
      );
      toast.success("Deletion request cancelled.");
    } catch {
      toast.error("Could not cancel request.");
    }
  };

  if (loading)
    return (
      <MobileLayout>
        <ProfileSkeleton />
      </MobileLayout>
    );

  if (!profile) {
    return (
      <MobileLayout>
        <div className="p-5 pb-28 flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
          <AlertTriangle size={32} className="text-amber-500" />
          <p className="text-sm text-[var(--text-muted)] max-w-xs leading-relaxed">
            {loadError ?? "Could not load your profile."}
          </p>
          <div className="flex flex-col gap-2 w-full max-w-xs">
            <button
              type="button"
              onClick={() => reloadProfile()}
              className="w-full bg-[var(--brand)] text-white font-bold py-3 rounded-xl text-sm"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => signOut().then(() => router.push("/login"))}
              className="w-full text-sm font-bold text-red-500"
            >
              Sign out
            </button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  const displayAvatar = previewUrl || profile.avatar_url;
  const { percent: onboardingPercent, steps: onboardingSteps } =
    getProfileCompletion(profile);
  const showOnboardingBanner =
    onboardingMode && profile.status === "pending" && onboardingPercent < 100;

  return (
    <MobileLayout>
      <div className={`p-5 space-y-6 ${showSaveBar ? "pb-36" : "pb-28"}`}>
        {showOnboardingBanner && (
          <OnboardingBanner
            percent={onboardingPercent}
            steps={onboardingSteps}
            sticky
          />
        )}
        <div className="flex flex-col items-center pt-4 relative">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-20 h-20 bg-slate-100 dark:bg-[#121212] rounded-full flex items-center justify-center text-slate-400 mb-4 border border-[var(--border)] shadow-sm relative overflow-hidden group cursor-pointer"
          >
            {displayAvatar ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={displayAvatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={32} />
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={18} className="text-white" />
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePfpChange}
            accept="image/*"
            capture="user"
            className="hidden"
          />

          <h2 className="text-xl font-bold tracking-tight text-[var(--text)]">
            {profile.name}
          </h2>
          <p className="text-[var(--text-muted)] text-sm font-semibold mt-1">
            {profile.college}
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-3 text-[var(--brand)] text-xs font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/20 px-4 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-900/50"
          >
            Setup a Selfie
          </button>
        </div>

        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm">
          <div className="p-5 border-b border-[var(--border)] flex justify-between items-center">
            <h3 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider">
              Personal Details
            </h3>
            <button
              onClick={() => setIsEditingInfo(!isEditingInfo)}
              className="p-1.5 bg-slate-50 dark:bg-[#1C1C1E] rounded-lg border border-[var(--border)] text-slate-500 hover:text-[var(--text)] transition-colors"
            >
              {isEditingInfo ? <Check size={16} /> : <Edit2 size={16} />}
            </button>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-4 py-1">
              <User size={16} className="text-slate-400 shrink-0" />
              <div className="flex-1 border-b border-[var(--border)] pb-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Full Name
                </p>
                {isEditingInfo ? (
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    className="w-full bg-[var(--surface-input)] border-none rounded-md px-2.5 py-1.5 outline-none text-sm font-semibold"
                  />
                ) : (
                  <p className="text-[15px] font-semibold">{profile.name}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 py-1">
              <BookOpen size={16} className="text-slate-400 shrink-0" />
              <div className="flex-1 border-b border-[var(--border)] pb-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Concern Center
                </p>
                {isEditingInfo ? (
                  <CenterPicker
                    variant="inline"
                    value={profile.college}
                    onChange={(college) => setProfile({ ...profile, college })}
                  />
                ) : (
                  <p className="text-[15px] font-semibold">
                    {profile.college || "Not selected"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 py-1">
              <Phone size={16} className="text-slate-400 shrink-0" />
              <div className="flex-1 border-b border-[var(--border)] pb-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Phone
                </p>
                {isEditingInfo ? (
                  <input
                    type="tel"
                    value={profile.phone || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    className="w-full bg-[var(--surface-input)] border-none rounded-md px-2.5 py-1.5 outline-none text-sm font-semibold"
                  />
                ) : (
                  <p className="text-[15px] font-semibold">
                    {profile.phone || "Not provided"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-4 py-1">
              <MapPin size={16} className="text-slate-400 mt-1 shrink-0" />
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Address
                </p>
                {isEditingInfo ? (
                  <textarea
                    value={profile.address || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, address: e.target.value })
                    }
                    rows={2}
                    className="w-full bg-[var(--surface-input)] border-none rounded-md px-2.5 py-1.5 outline-none text-sm font-semibold resize-none"
                  />
                ) : (
                  <p className="text-[15px] font-semibold">
                    {profile.address || "Not provided"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm">
          <div className="p-5 border-b border-[var(--border)] flex justify-between items-center">
            <h3 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider">
              Skills
            </h3>
            <button
              onClick={() => setIsEditingSkills(!isEditingSkills)}
              className="p-1.5 bg-slate-50 dark:bg-[#1C1C1E] rounded-lg border border-[var(--border)] text-slate-500"
            >
              {isEditingSkills ? <Check size={16} /> : <Edit2 size={16} />}
            </button>
          </div>
          <div className="p-5 space-y-4">
            {isEditingSkills ? (
              <SkillPicker
                selected={profile.skills}
                onChange={(skills) => setProfile({ ...profile, skills })}
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.skills.length === 0 ? (
                  <p className="text-xs text-slate-500 font-medium">
                    No skills added yet.
                  </p>
                ) : (
                  profile.skills.map((skill) => (
                    <div
                      key={skill}
                      className="px-3 py-1.5 rounded-full text-xs font-bold border border-[var(--border)] bg-gray-50 dark:bg-[#1C1C1E]"
                    >
                      {skill}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {(isEditingInfo || isEditingSkills || pendingAvatar) && (
          <p className="text-[11px] text-center text-[var(--text-muted)] font-medium -mt-2">
            Tap Save when you&apos;re done editing
          </p>
        )}

        <div className="grid grid-cols-1 gap-2">
          <Link
            href="/i-card"
            onClick={(e) => unsavedCtx?.guardNavigation(e, "/i-card")}
            className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-gray-900 transition-colors"
          >
            <div className="flex items-center gap-3">
              <BadgeCheck size={18} className="text-[var(--brand)]" />
              <div>
                <span className="font-semibold text-sm block">Digital I-Card</span>
                <p className="text-[10px] text-[var(--text-muted)]">
                  View QR and volunteer ID
                </p>
              </div>
            </div>
            <ChevronDown size={14} className="-rotate-90 text-slate-400" />
          </Link>

          {(profile.role === "organiser" || profile.role === "admin") && (
            <Link
              href={profile.role === "admin" ? "/admin" : "/organiser"}
              onClick={(e) =>
                unsavedCtx?.guardNavigation(
                  e,
                  profile.role === "admin" ? "/admin" : "/organiser",
                )
              }
              className="bg-emerald-600 rounded-xl border border-emerald-700 shadow-sm p-4 flex items-center justify-between text-white hover:bg-emerald-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <CalendarDays size={18} />
                <div>
                  <span className="font-semibold text-sm block">
                    {profile.role === "admin" ? "Admin portal" : "Organize events"}
                  </span>
                  <p className="text-[10px] text-white/80">
                    {profile.role === "admin"
                      ? "Manage volunteers, events & awards"
                      : "Create and manage your events"}
                  </p>
                </div>
              </div>
              <ChevronDown size={14} className="-rotate-90 text-white/80" />
            </Link>
          )}
        </div>

        <div
          id="awards"
          className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm p-5 space-y-3"
        >
          <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
            <Award size={16} className="text-amber-500" /> My Awards
          </h3>
          {myAwards.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              No awards yet. Keep volunteering and your coordinator may recognize
              you here.
            </p>
          ) : (
            <div className="space-y-2">
              {myAwards.map((a) => (
                <div
                  key={a.id}
                  className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40"
                >
                  <p className="font-bold text-sm">{a.title}</p>
                  {a.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{a.description}</p>
                  )}
                  <p className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold mt-1">
                    {new Date(a.awarded_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm divide-y divide-[var(--border)]">
          <div className="p-4 px-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Shield size={16} className="text-slate-400 shrink-0" />
              <div className="min-w-0">
                <span className="font-semibold text-sm block">Public profile</span>
                <p className="text-[10px] text-[var(--text-muted)] leading-snug">
                  Let other volunteers see your name and skills
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={profile.public_profile}
                onChange={async () => {
                  const prev = profile.public_profile;
                  const next = !prev;
                  setProfile({ ...profile, public_profile: next });
                  try {
                    await updateProfile({ public_profile: next });
                  } catch {
                    setProfile({ ...profile, public_profile: prev });
                    toast.error("Could not update preference");
                  }
                }}
              />
              <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--brand)]" />
            </label>
          </div>
        </div>

        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm divide-y divide-[var(--border)]">
          {profile.delete_requested_at && (
            <div className="p-4 px-5 space-y-3 bg-red-50 dark:bg-red-950/20">
              <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                Account deletion requested on{" "}
                {new Date(profile.delete_requested_at).toLocaleDateString()}
              </p>
              <p className="text-xs text-red-600/80 dark:text-red-400/80 leading-relaxed">
                An admin may confirm permanent deletion. You can cancel this
                request anytime before that.
              </p>
              <button
                type="button"
                onClick={handleCancelDeleteRequest}
                className="w-full py-2.5 rounded-lg border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors"
              >
                Cancel deletion request
              </button>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`w-full p-4 px-5 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-gray-900 transition-colors ${profile.delete_requested_at ? "rounded-b-xl" : "rounded-t-xl"}`}
          >
            <LogOut size={16} className="text-gray-400" />
            <span className="font-semibold text-sm">Sign Out</span>
          </button>
          {!profile.delete_requested_at && (
            <button
              onClick={handleDeleteAccount}
              className="w-full p-4 px-5 flex items-center gap-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors rounded-b-xl"
            >
              <AlertTriangle size={16} />
              <span className="font-semibold text-sm">Request to Delete</span>
            </button>
          )}
        </div>
      </div>

      {portalReady &&
        showSaveBar &&
        createPortal(
          <div className="fixed inset-x-0 bottom-[4.25rem] z-[60] flex justify-center px-5 pb-safe pointer-events-none">
            <div className="w-full max-w-md pointer-events-auto">
              <div className="rounded-xl bg-white/95 dark:bg-[#121212]/95 backdrop-blur-md border border-[var(--border)] p-2 shadow-2xl shadow-black/10">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !hasUnsavedChanges}
                  className={`w-full bg-[var(--brand)] hover:bg-[var(--brand-hover)] disabled:opacity-45 disabled:cursor-not-allowed text-white font-bold text-sm py-3.5 rounded-lg flex justify-center items-center gap-2 ${unsavedCtx?.shaking ? "animate-shake" : ""}`}
                >
                  {saving ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      <Check size={16} /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </MobileLayout>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <MobileLayout>
          <ProfileSkeleton />
        </MobileLayout>
      }
    >
      <ProfilePageContent />
    </Suspense>
  );
}
