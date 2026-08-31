/**
 * Volunteer skills for SNS Family — aligned with education, outreach,
 * events, and youth programs common in Indian NGO work (YFS, Bhumi, DEEP, etc.).
 */
export const SKILL_CATEGORIES = {
  "Education & Youth": [
    "Teaching",
    "Mentoring",
    "STEM",
    "Robotics",
    "Digital Literacy",
    "Career Guidance",
    "Life Skills",
    "Arts & Creativity",
    "Sports & Games",
    "English Communication",
    "Peer Support",
  ],
  "Events & Field": [
    "Event Management",
    "Logistics",
    "Crowd Management",
    "Registration & Check-in",
    "Community Outreach",
    "First Aid",
  ],
  "Media & Tech": [
    "Content Writing",
    "Photography",
    "Public Speaking",
    "Social Media",
    "Graphic Design",
    "Video Editing",
    "Web Development",
    "Research & Surveys",
  ],
  "Leadership & Impact": [
    "Social Change",
    "Team Leadership",
    "Volunteer Coordination",
    "Fundraising",
    "Environmental Action",
    "Disability Inclusion",
    "Translation",
  ],
} as const;

export const SKILL_DB = Object.values(SKILL_CATEGORIES).flat();

export type SkillCategory = keyof typeof SKILL_CATEGORIES;
export type SkillName = (typeof SKILL_DB)[number];

/** Skills added after the original launch list (for reference / migrations). */
export const SKILLS_ADDED_V2 = SKILL_DB.filter(
  (s) =>
    ![
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
    ].includes(s),
);
