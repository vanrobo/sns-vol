// app/profile/page.tsx
"use client";
import MobileLayout from "@/components/MobileLayout";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  signOut,
  deleteAccount,
} from "@/lib/data/profiles";
import type { Profile } from "@/types";
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
  Sun,
  Moon,
  AlertTriangle,
  Settings,
  Mail,
  Shield,
  BookOpen,
  Camera,
  Award,
} from "lucide-react";

const SKILL_DB = [
  "Teaching",
  "Mentoring",
  "STEM",
  "Robotics",
  "Event Management",
  "Social Change",
  "Logistics",
  "Content Writing",
  "Photography",
  "Public Speaking",
];

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { resolvedTheme, setTheme } = useTheme();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingAvatar, setPendingAvatar] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingSkills, setIsEditingSkills] = useState(false);

  useEffect(() => {
    getProfile()
      .then((data) => {
        if (data) setProfile(data);
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      let avatarUrl = profile.avatar_url;
      if (pendingAvatar) {
        avatarUrl = await uploadAvatar(pendingAvatar);
      }
      const updated = await updateProfile({
        name: profile.name,
        college: profile.college,
        phone: profile.phone,
        address: profile.address,
        skills: profile.skills,
        avatar_url: avatarUrl,
        email_notifs: profile.email_notifs,
        public_profile: profile.public_profile,
      });
      setProfile(updated);
      setPendingAvatar(null);
      setPreviewUrl(null);
      toast.success("Profile saved");
      setIsEditingInfo(false);
      setIsEditingSkills(false);
    } catch {
      toast.error("Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePfpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Selfie image must be smaller than 2MB");
      return;
    }
    setPendingAvatar(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure? This action cannot be undone.")) return;
    try {
      await deleteAccount();
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Could not delete account");
    }
  };

  if (loading)
    return (
      <MobileLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="animate-spin text-slate-400" size={32} />
        </div>
      </MobileLayout>
    );
  if (!profile) return null;

  const displayAvatar = previewUrl || profile.avatar_url;

  return (
    <MobileLayout>
      <div className="p-5 space-y-6 pb-28">
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
                  School / College
                </p>
                {isEditingInfo ? (
                  <input
                    type="text"
                    value={profile.college}
                    onChange={(e) =>
                      setProfile({ ...profile, college: e.target.value })
                    }
                    className="w-full bg-[var(--surface-input)] border-none rounded-md px-2.5 py-1.5 outline-none text-sm font-semibold"
                  />
                ) : (
                  <p className="text-[15px] font-semibold">{profile.college}</p>
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
            <div className="flex flex-wrap gap-2">
              {profile.skills.length === 0 && !isEditingSkills && (
                <p className="text-xs text-slate-500 font-medium">
                  No skills added yet.
                </p>
              )}
              {profile.skills.map((skill) => (
                <div
                  key={skill}
                  className="px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 border border-[var(--border)] bg-gray-50 dark:bg-[#1C1C1E]"
                >
                  <span>{skill}</span>
                  {isEditingSkills && (
                    <X
                      size={12}
                      className="cursor-pointer hover:text-red-500"
                      onClick={() =>
                        setProfile({
                          ...profile,
                          skills: profile.skills.filter((s) => s !== skill),
                        })
                      }
                    />
                  )}
                </div>
              ))}
            </div>
            {isEditingSkills && (
              <div className="relative mt-4">
                <select
                  onChange={(e) => {
                    if (
                      e.target.value &&
                      !profile.skills.includes(e.target.value)
                    )
                      setProfile({
                        ...profile,
                        skills: [...profile.skills, e.target.value],
                      });
                    e.target.value = "";
                  }}
                  className="w-full bg-slate-50 dark:bg-[#1C1C1E] border border-[var(--border)] rounded-lg p-3.5 pr-10 text-sm outline-none appearance-none font-bold"
                >
                  <option value="">+ Add a skill...</option>
                  {SKILL_DB.filter((s) => !profile.skills.includes(s)).map(
                    (s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ),
                  )}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                />
              </div>
            )}
          </div>
        </div>

        {(isEditingInfo || isEditingSkills || pendingAvatar) && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white font-semibold text-sm py-4 rounded-xl flex justify-center shadow-lg shadow-emerald-500/10"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              "Save Changes"
            )}
          </button>
        )}

        <div className="bg-gradient-to-br from-[var(--brand)] to-emerald-700 rounded-xl p-5 text-white shadow-md relative overflow-hidden">
          <Award
            className="absolute -right-4 -bottom-4 text-white/10"
            size={100}
          />
          <div className="relative z-10 space-y-2">
            <h4 className="font-bold text-sm">
              Review us on Google with a Selfie!
            </h4>
            <p className="text-xs text-white/90 leading-relaxed font-medium">
              Upload your verification selfie on our official Google Business
              Page reviews to support our outreach.
            </p>
            <a
              href="https://g.page/r/your-google-review-link/review"
              target="_blank"
              rel="noreferrer"
              className="inline-block bg-white text-emerald-800 font-bold py-1.5 px-4 rounded-full text-xs shadow hover:bg-slate-50 transition-colors"
            >
              Rate us on Google
            </a>
          </div>
        </div>

        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm divide-y divide-[var(--border)]">
          <div className="p-4 px-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings size={16} className="text-slate-400" />
              <span className="font-semibold text-sm">Theme Mode</span>
            </div>
            <button
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              className="p-1.5 bg-slate-100 dark:bg-[#1C1C1E] rounded-md active:scale-95 transition-transform"
            >
              {resolvedTheme === "dark" ? (
                <Sun size={14} className="text-yellow-500" />
              ) : (
                <Moon size={14} className="text-blue-500" />
              )}
            </button>
          </div>
          <div className="p-4 px-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-slate-400" />
              <span className="font-semibold text-sm">Email Alerts</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={profile.email_notifs}
                onChange={async () => {
                  const next = !profile.email_notifs;
                  setProfile({ ...profile, email_notifs: next });
                  try {
                    await updateProfile({ email_notifs: next });
                  } catch {
                    toast.error("Could not update preference");
                  }
                }}
              />
              <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--brand)]" />
            </label>
          </div>
          <div className="p-4 px-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield size={16} className="text-slate-400" />
              <span className="font-semibold text-sm">Public Profile</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={profile.public_profile}
                onChange={async () => {
                  const next = !profile.public_profile;
                  setProfile({ ...profile, public_profile: next });
                  try {
                    await updateProfile({ public_profile: next });
                  } catch {
                    toast.error("Could not update preference");
                  }
                }}
              />
              <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--brand)]" />
            </label>
          </div>
        </div>

        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm divide-y divide-[var(--border)]">
          <button
            onClick={handleLogout}
            className="w-full p-4 px-5 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-gray-900 transition-colors rounded-t-xl"
          >
            <LogOut size={16} className="text-gray-400" />
            <span className="font-semibold text-sm">Sign Out</span>
          </button>
          <button
            onClick={handleDeleteAccount}
            className="w-full p-4 px-5 flex items-center gap-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors rounded-b-xl"
          >
            <AlertTriangle size={16} />
            <span className="font-semibold text-sm">Delete Account</span>
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}
