/** SNS Family concern centers — used for volunteers and event filtering. */
export const SNS_CENTERS = [
  "SNS Dwarka -1",
  "SNS Dwarka -2",
  "SNS Dwarka -6",
  "SNS Dwarka -7",
  "SNS Dwarka -19",
  "Gurgaon-Basai",
  "Head office",
] as const;

export type SnsCenter = (typeof SNS_CENTERS)[number];

export function matchesCenter(
  eventRegion: string | null | undefined,
  center: string,
): boolean {
  if (!eventRegion || !center || center === "all") return false;
  return eventRegion.trim().toLowerCase() === center.trim().toLowerCase();
}

export function isSnsCenter(value: string): value is SnsCenter {
  return SNS_CENTERS.some(
    (c) => c.toLowerCase() === value.trim().toLowerCase(),
  );
}
