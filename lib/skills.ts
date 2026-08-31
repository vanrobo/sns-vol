export const SKILL_DB = [
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
] as const;

export type SkillName = (typeof SKILL_DB)[number];
