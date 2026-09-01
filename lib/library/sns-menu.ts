export const SNS_PUBLICATION_MENU_URL =
  "https://standnstride.org/publication/menu.json";

export const SNS_PUBLICATION_PROXY_URL =
  "https://standnstride.org/publication/index.php";

export type SnsMenuNode = {
  title: string;
  icon?: string;
  url?: string;
  children?: SnsMenuNode[];
  upload?: boolean;
};

export type SnsMenuPublication = {
  id: string;
  title: string;
  description: string;
  pdf_url: string;
  source_url: string;
  kind: "magazine" | "newsletter";
  category: string;
  published_on: string;
};

const MONTH_NUM: Record<string, string> = {
  january: "01",
  february: "02",
  march: "03",
  april: "04",
  may: "05",
  june: "06",
  july: "07",
  august: "08",
  september: "09",
  october: "10",
  november: "11",
  december: "12",
};

function slugify(parts: string[]) {
  return parts
    .map((part) =>
      part
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    )
    .filter(Boolean)
    .join("-");
}

export function resolvePublicationFetchUrl(sourceUrl: string): string {
  if (!sourceUrl || sourceUrl === "#") return "";

  if (sourceUrl.includes("drive.google.com")) {
    return `${SNS_PUBLICATION_PROXY_URL}?url=${encodeURIComponent(sourceUrl)}`;
  }

  const driveMatch = sourceUrl.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch) {
    const driveView = `https://drive.google.com/file/d/${driveMatch[1]}/view`;
    return `${SNS_PUBLICATION_PROXY_URL}?url=${encodeURIComponent(driveView)}`;
  }

  return sourceUrl;
}

function flattenMenu(
  nodes: SnsMenuNode[],
  path: string[] = [],
  rootKind?: "magazine" | "newsletter",
): SnsMenuPublication[] {
  const items: SnsMenuPublication[] = [];

  for (const node of nodes) {
    if (node.upload) continue;

    const currentPath = [...path, node.title];
    const section = currentPath[0]?.toLowerCase();
    const kind =
      rootKind ??
      (section === "newsletters"
        ? "newsletter"
        : section === "magazines"
          ? "magazine"
          : "magazine");

    if (node.url && node.url !== "#") {
      const fetchUrl = resolvePublicationFetchUrl(node.url);
      if (!fetchUrl) continue;

      let published_on = new Date().toISOString().slice(0, 10);
      if (kind === "newsletter") {
        const year = currentPath.find((part) => /^\d{4}$/.test(part));
        const monthKey = currentPath[currentPath.length - 1].toLowerCase();
        const month = MONTH_NUM[monthKey];
        if (year && month) published_on = `${year}-${month}-01`;
      }

      const category =
        kind === "magazine" && currentPath.length >= 2
          ? currentPath[1].toLowerCase()
          : "general";

      items.push({
        id: slugify(currentPath),
        title: node.title,
        description: currentPath.slice(1, -1).join(" · ") || currentPath[0],
        pdf_url: fetchUrl,
        source_url: node.url,
        kind,
        category,
        published_on,
      });
    }

    if (node.children?.length) {
      const childKind =
        node.title === "Magazines"
          ? "magazine"
          : node.title === "Newsletters"
            ? "newsletter"
            : rootKind;
      items.push(...flattenMenu(node.children, currentPath, childKind));
    }
  }

  return items;
}

let cached:
  | {
      at: number;
      items: SnsMenuPublication[];
    }
  | null = null;

const CACHE_MS = 5 * 60 * 1000;

export async function fetchSnsMenuPublications(): Promise<SnsMenuPublication[]> {
  if (cached && Date.now() - cached.at < CACHE_MS) {
    return cached.items;
  }

  const res = await fetch(SNS_PUBLICATION_MENU_URL, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error("Failed to load SNS publication menu");

  const menu = (await res.json()) as SnsMenuNode[];
  const items = flattenMenu(menu);
  cached = { at: Date.now(), items };
  return items;
}

export async function getSnsMenuPublicationById(
  id: string,
): Promise<SnsMenuPublication | null> {
  const items = await fetchSnsMenuPublications();
  return items.find((item) => item.id === id) ?? null;
}
