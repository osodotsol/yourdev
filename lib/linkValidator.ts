import { ResourceItem } from "@/types/blueprint";

const TRUSTED_DOMAINS = [
  "nextjs.org",
  "tailwindcss.com",
  "react.dev",
  "reactnative.dev",
  "cheerio.js.org",
  "sqlite.org",
  "developer.chrome.com",
  "developer.mozilla.org",
  "github.com",
  "devpost.com",
  "nodejs.org",
  "expressjs.com",
  "expo.dev",
  "vitejs.dev",
  "typescriptlang.org",
  "playwright.dev",
  "prisma.io",
];

const FALLBACK_DOCS: Record<string, { title: string; url: string }> = {
  extension: {
    title: "Chrome Extension Developer Documentation",
    url: "https://developer.chrome.com/docs/extensions/mv3/",
  },
  react: {
    title: "React Official Documentation",
    url: "https://react.dev",
  },
  next: {
    title: "Next.js App Router Documentation",
    url: "https://nextjs.org/docs",
  },
  typescript: {
    title: "TypeScript Handbook Reference",
    url: "https://www.typescriptlang.org/docs/",
  },
  tailwind: {
    title: "Tailwind CSS Layout & Utility Docs",
    url: "https://tailwindcss.com/docs",
  },
  general: {
    title: "MDN Web Technologies Documentation",
    url: "https://developer.mozilla.org/en-US/docs/Web",
  },
};

/**
 * Checks if a URL is structurally valid and points to a safe protocol.
 */
export function isValidUrl(urlString: string): boolean {
  if (!urlString || typeof urlString !== "string") return false;
  try {
    const parsed = new URL(urlString);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Checks if the URL hostname belongs to a known trusted documentation domain.
 */
export function isTrustedDocDomain(urlString: string): boolean {
  if (!isValidUrl(urlString)) return false;
  try {
    const { hostname } = new URL(urlString);
    return TRUSTED_DOMAINS.some(
      (d) => hostname === d || hostname.endsWith(`.${d}`)
    );
  } catch {
    return false;
  }
}

/**
 * Validates and cleans an array of resources, replacing hallucinated or invalid
 * URLs with verified official equivalents.
 */
export function sanitizeResources(
  resources: Array<{ type?: string; title: string; url: string }>
): ResourceItem[] {
  if (!Array.isArray(resources) || resources.length === 0) {
    return [
      {
        type: "Official Docs",
        title: FALLBACK_DOCS.next.title,
        url: FALLBACK_DOCS.next.url,
      },
      {
        type: "Styling Reference",
        title: FALLBACK_DOCS.tailwind.title,
        url: FALLBACK_DOCS.tailwind.url,
      },
      {
        type: "Web Standards",
        title: FALLBACK_DOCS.general.title,
        url: FALLBACK_DOCS.general.url,
      },
    ];
  }

  const sanitized: ResourceItem[] = [];

  for (const item of resources) {
    if (!item || !item.title) continue;

    let targetUrl = (item.url || "").trim();
    const type = item.type || "Official Docs";

    if (!isValidUrl(targetUrl)) {
      // Find a safe fallback based on keywords in title
      const lowerTitle = item.title.toLowerCase();
      if (lowerTitle.includes("chrome") || lowerTitle.includes("extension")) {
        targetUrl = FALLBACK_DOCS.extension.url;
      } else if (lowerTitle.includes("tailwind") || lowerTitle.includes("css")) {
        targetUrl = FALLBACK_DOCS.tailwind.url;
      } else if (lowerTitle.includes("react")) {
        targetUrl = FALLBACK_DOCS.react.url;
      } else if (lowerTitle.includes("typescript")) {
        targetUrl = FALLBACK_DOCS.typescript.url;
      } else {
        targetUrl = FALLBACK_DOCS.general.url;
      }
    }

    sanitized.push({
      type,
      title: item.title.trim(),
      url: targetUrl,
    });
  }

  return sanitized.slice(0, 5);
}
