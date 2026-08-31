export type VenueSuggestion = {
  id: string;
  label: string;
};

type PhotonFeature = {
  properties: {
    name?: string;
    street?: string;
    housenumber?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
};

/** Delhi — biases free OSM search toward NCR / India venues */
const SEARCH_BIAS_LAT = 28.6139;
const SEARCH_BIAS_LON = 77.209;

function formatPhotonLabel(props: PhotonFeature["properties"]): string {
  const streetLine = [props.housenumber, props.street]
    .filter(Boolean)
    .join(" ")
    .trim();

  const parts = [
    props.name?.trim(),
    streetLine || undefined,
    props.city?.trim(),
    props.state?.trim(),
    props.postcode?.trim(),
    props.country?.trim(),
  ].filter(Boolean) as string[];

  return [...new Set(parts)].join(", ");
}

export async function searchVenues(query: string): Promise<VenueSuggestion[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", q);
  url.searchParams.set("limit", "8");
  url.searchParams.set("lat", String(SEARCH_BIAS_LAT));
  url.searchParams.set("lon", String(SEARCH_BIAS_LON));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Venue search failed");

  const data = (await res.json()) as { features?: PhotonFeature[] };
  const seen = new Set<string>();

  return (data.features ?? [])
    .map((feature, index) => {
      const label = formatPhotonLabel(feature.properties);
      if (!label || seen.has(label)) return null;
      seen.add(label);
      return { id: `${index}-${label}`, label };
    })
    .filter(Boolean) as VenueSuggestion[];
}

export function googleMapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function openStreetMapSearchUrl(query: string): string {
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(query)}`;
}
