import type { Profile } from "@/types";

export type OnboardingStep = {
  id: string;
  label: string;
  done: boolean;
  current?: boolean;
  href?: string;
};

export function getProfileCompletion(profile: Profile | null): {
  percent: number;
  steps: OnboardingStep[];
} {
  if (!profile) {
    return { percent: 0, steps: [] };
  }

  const hasPhone = (profile.phone?.replace(/\D/g, "") ?? "").length >= 10;
  const hasAvatar = Boolean(profile.avatar_url);
  const hasSkills = (profile.skills?.length ?? 0) > 0;
  const hasAddress = Boolean(profile.address?.trim());

  const checks = [hasPhone, hasAvatar, hasSkills, hasAddress];
  const percent = Math.round(
    (checks.filter(Boolean).length / checks.length) * 100,
  );

  const steps: OnboardingStep[] = [
    {
      id: "account",
      label: "Account created",
      done: true,
    },
    {
      id: "phone",
      label: "Add phone number",
      done: hasPhone,
      current: !hasPhone,
      href: "/profile?onboarding=1",
    },
    {
      id: "photo",
      label: "Upload profile photo",
      done: hasAvatar,
      current: hasPhone && !hasAvatar,
      href: "/profile?onboarding=1",
    },
    {
      id: "skills",
      label: "Pick your skills",
      done: hasSkills,
      current: hasPhone && hasAvatar && !hasSkills,
      href: "/profile?onboarding=1",
    },
    {
      id: "review",
      label: "Admin review & I-Card",
      done: profile.status === "active",
      current: profile.status === "pending" && percent >= 75,
    },
    {
      id: "volunteer",
      label: "Browse events & volunteer",
      done: profile.status === "active",
    },
  ];

  return { percent, steps };
}

export function onboardingRedirect(status: string, role: string): string {
  if (role === "admin") return "/admin";
  if (role === "organiser") return "/";
  if (status === "pending") return "/profile?onboarding=1";
  return "/";
}
