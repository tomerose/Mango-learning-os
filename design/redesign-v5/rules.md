# LearningOS Design Inheritance System — v5

## How Inheritance Works

Every component in LearningOS inherits premium design through **4 surface classes** and **5 typography classes** defined in `app/globals.css`.

### Surface Classes (auto dark mode)
| Class | Shadow | Border | Usage |
|-------|--------|--------|-------|
| `surface-card` | Level 2 | 0.5px subtle | Default containers, cards, panels |
| `surface-glass` | Level 3 | 0.5px subtle | Floating nav, modals, headers |
| `surface-elevated` | Level 3 | 0.5px subtle | Dropdowns, tooltips, overlays |
| *(none)* | Level 0 | none | Text, inline elements |

### Typography Classes
| Class | Size | Weight | Usage |
|-------|------|--------|-------|
| `heading-xl` | 26/32px | 700 | Page titles |
| `heading-lg` | 20/24px | 600 | Section headers, card titles |
| `heading-md` | 16/18px | 600 | Sub-section titles |
| `body-text` | 14/15px | 400 | Paragraphs, descriptions |
| `caption` | 11/12px | 500 | Labels, badges, meta |

### Adding a New Page (2-minute process)

```tsx
// 1. Page file: app/(dashboard)/new-feature/page.tsx
import { NewFeatureContent } from "@/components/new-feature/new-feature-content";
export const metadata = { title: "New Feature · Mango Learning OS" };
export default function Page() { return <NewFeatureContent />; }

// 2. Component file: components/new-feature/new-feature-content.tsx
"use client";
import { PageHeader, Card, PageSection, EmptyState } from "@/components/ui/surface";

export function NewFeatureContent() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={Sparkles} title="New Feature" description="Description text" />

      <PageSection title="Section Title" description="Optional description">
        <Card className="p-4">
          <p className="body-text">Content goes here</p>
        </Card>
      </PageSection>
    </div>
  );
}
```

**What you get automatically:**
- ✅ borderless 16px-radius cards with dual-layer shadows
- ✅ Dark mode — surface colors, shadows, and borders adapt automatically
- ✅ Typography: heading-xl → page title, heading-lg → section title, body-text → content
- ✅ 8px grid spacing via flex-col gap-3/gap-6
- ✅ Responsive: mobile headings shrink, grids collapse
- ✅ 3px thin scrollbar
- ✅ SF Pro font stack with antialiasing
- ✅ Safe-area insets for notched phones

### Adding Navigation
```tsx
// lib/navigation.ts
import { NewIcon } from "lucide-react";
{ title: "New Feature", href: "/new-feature", icon: NewIcon, description: "..." }
// Desktop sidebar + mobile bottom nav auto-update
```

### Adding an API Route
```
app/api/new-feature/route.ts
→ Standard pattern: POST handler with isSupabaseConfigured() guard
→ Uses existing ai/client.ts for AI calls
→ Returns NextResponse.json(...)
```

### Override Rules (when you NEED to break the system)

1. **Custom shadow**: Add `className="surface-card shadow-lg"` — but DON'T remove surface-card
2. **Different radius**: Add `className="surface-card rounded-2xl"` — but DON'T remove surface-card
3. **No surface**: Use `className=""` — only for inline text elements
4. **Custom color**: Use `style={{ color: var(--chart-N) }}` — never hardcode hex
5. **New typography**: Add to globals.css `@theme inline` block — never inline font-size

### What You NEVER Do
- ❌ `border rounded-xl shadow-sm` on individual divs
- ❌ `text-2xl font-bold tracking-tight` — use `heading-xl`
- ❌ `text-sm text-muted-foreground` for body — use `body-text`
- ❌ Inline `backdrop-blur` or `bg-white/80` — use `surface-glass`
- ❌ Custom shadows or colors outside the palette
- ❌ Emojis as icons
- ❌ `px-6` padding — use px-4 (16px = 2×8px grid)

### Inheritance Chain
```
globals.css (:root / .dark tokens)
  → .surface-card, .surface-glass, .surface-elevated
    → components/ui/surface.tsx (Card, PageSection, PageHeader, StatCard, EmptyState)
      → components/ui/card.tsx (shadcn Card → surface-card)
        → ALL PAGES (35+ components across 12 pages)
```

**One change in globals.css updates every card in the entire app.**
