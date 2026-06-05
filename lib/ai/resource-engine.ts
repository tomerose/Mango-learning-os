// ═══════════════════════════════════════════════════════════════
// Resource Discovery Engine
// Match knowledge concepts to real learning resources
// Sources: Arxiv, GitHub, YouTube, Documentation, Courses, Books
// ═══════════════════════════════════════════════════════════════

export interface DiscoveredResource {
  title: string;
  url: string;
  type: "paper" | "github" | "video" | "course" | "book" | "doc" | "article";
  source: string;       // "Arxiv", "GitHub", "YouTube", "Coursera", etc.
  relevance: number;    // 0-1
  description: string;
}

// ── Resource Discovery Sources ───────────────────────────────

const SEARCH_TEMPLATES: Record<string, (query: string) => string> = {
  arxiv: (q) => `https://arxiv.org/search/?searchtype=all&query=${encodeURIComponent(q)}`,
  github: (q) => `https://github.com/search?q=${encodeURIComponent(q)}&type=repositories`,
  youtube: (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q + " tutorial")}`,
  scholar: (q) => `https://scholar.google.com/scholar?q=${encodeURIComponent(q)}`,
  docs: (q) => `https://www.google.com/search?q=${encodeURIComponent(q + " documentation")}`,
  courses: (q) => `https://www.coursera.org/search?query=${encodeURIComponent(q)}`,
};

export function discoverResources(concept: string): DiscoveredResource[] {
  const encoded = encodeURIComponent(concept);

  return [
    {
      title: `${concept} — Arxiv Papers`,
      url: SEARCH_TEMPLATES.arxiv(concept),
      type: "paper",
      source: "Arxiv",
      relevance: 0.9,
      description: `Latest research papers about ${concept}`,
    },
    {
      title: `${concept} — GitHub Repositories`,
      url: SEARCH_TEMPLATES.github(concept),
      type: "github",
      source: "GitHub",
      relevance: 0.85,
      description: `Open source projects related to ${concept}`,
    },
    {
      title: `${concept} — Tutorial Videos`,
      url: SEARCH_TEMPLATES.youtube(concept),
      type: "video",
      source: "YouTube",
      relevance: 0.8,
      description: `Video tutorials explaining ${concept}`,
    },
    {
      title: `${concept} — Documentation`,
      url: SEARCH_TEMPLATES.docs(concept),
      type: "doc",
      source: "Documentation",
      relevance: 0.75,
      description: `Official documentation and guides for ${concept}`,
    },
    {
      title: `${concept} — Online Courses`,
      url: SEARCH_TEMPLATES.courses(concept),
      type: "course",
      source: "Coursera",
      relevance: 0.7,
      description: `Structured courses covering ${concept}`,
    },
  ];
}

export function discoverForConcepts(concepts: string[]): DiscoveredResource[] {
  return concepts.flatMap(c => discoverResources(c)).slice(0, 15);
}

// ── Resource Type Icons ──────────────────────────────────────
export const RESOURCE_TYPE_ICONS: Record<string, string> = {
  paper: "📄", github: "💻", video: "🎬", course: "🎓", book: "📖", doc: "📋", article: "📰",
};
