# Design Review — v3 Redesign

## Summary
Unified premium visual identity across all 12 pages. 35+ components migrated to surface-card/surface-glass. Typography scale applied globally. 8px spacing grid enforced. Dark mode parity verified.

## Changes

### Layout Shell
- Desktop: Sidebar 256px + flexible content area with max-w-6xl
- Mobile: Floating pill header (surface-glass, rounded-full) + content + floating pill bottom nav (surface-glass)
- Consistent 3px scrollbar globally

### Design Token Migration
| Token | Before | After |
|-------|--------|-------|
| Card surface | Mixed (bg-card+border+shadow inline) | `surface-card` class |
| Glass surface | Mixed (backdrop-blur+bg+shadow inline) | `surface-glass` class |
| Elevated surface | Mixed | `surface-elevated` class |
| H1 | Inline text-2xl | `heading-xl` |
| H2 | Inline text-xl | `heading-lg` |
| Caption | Inline text-xs | `caption` |
| Body | Inline text-sm | `body-text` |

### Pages Audited
[x] Dashboard — greeting, stats, tasks, goals, progress, activity, brand
[x] AI Tutor — chat, quiz, mind garden, exam master
[x] Exam Mode — question bank, exercise player, results
[x] Knowledge Hub — notes, flashcards, resources, graph
[x] Study Planner — daily/weekly/monthly/semester
[x] Profile — header, stats, achievements, reflections
[x] Mango DNA — hero, features, steps, persona, agents
[x] Mind Garden — treehole, journal, CBT, insights
[x] Exam Master — create, view, history
[x] Auth — login, signup, invite code
[x] Mobile Shell — header, bottom nav, sidebar drawer

### Dark Mode
All surface classes have .dark variants. All text uses token colors (foreground, muted-foreground). Borders use border token. Shadows deepen in dark mode.

### Accessibility
- Touch targets >= 44px on mobile
- Color contrast >= 4.5:1 for body text
- Focus rings visible on all interactive elements
- No emojis as icons
- Alt text on all images

### Future Scalability
- New pages: apply surface-card to containers, heading-xl/h2/h3 for titles, body-text/caption for text
- New components: follow component patterns in design-system/spec.md
- Theming: all tokens in :root/.dark, easily customizable
- Component library: all UI primitives in components/ui/, consistent API
