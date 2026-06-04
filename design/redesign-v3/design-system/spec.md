# LearningOS Design System v3 — Complete Specification

## Philosophy
Apple-level simplicity. Linear-level precision. Notion-level clarity. Airbnb-level UX. Luxury Minimalism for education.

## Color Palette
| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| background | #FCFCFD | #1A1B23 | Page background |
| card | #FFFFFF | #1F2029 | Card surfaces |
| foreground | #1E293B | #F8FAFC | Primary text |
| primary | #4F46E5 | #818CF8 | CTAs, links, active states |
| muted | #F1F5F9 | #272831 | Secondary backgrounds |
| muted-fg | #64748B | #94A3B8 | Secondary text |
| border | #E2E8F0 | #2E3039 | Dividers, input borders |
| success | #16A34A | #4ADE80 | Positive states |
| warning | #D97706 | #FBBF24 | Caution states |
| destructive | #DC2626 | #F87171 | Error, delete |

## Typography Scale (1.25 modular scale)
| Level | Size | Weight | Letter | Line | Usage |
|-------|------|--------|--------|------|-------|
| Display | 32px | 700 | -2% | 1.1 | Hero titles |
| H1 | 24px | 700 | -1.5% | 1.2 | Page titles |
| H2 | 19px | 600 | -1% | 1.25 | Section headers |
| H3 | 16px | 600 | 0 | 1.3 | Card titles |
| Body | 15px | 400 | 0 | 1.55 | Paragraphs |
| Small | 13px | 400 | 0 | 1.5 | Secondary text |
| Caption | 11px | 500 | +2% | 1.4 | Labels, badges |
| Mono | 13px | 400 | 0 | 1.6 | Code, data |

## Spacing System (4px base, 8px rhythm)
| Token | px | Usage |
|-------|-----|-------|
| 0.5 | 4px | Tight icon gaps |
| 1 | 8px | Card padding, inline gaps |
| 1.5 | 12px | Compact section gap |
| 2 | 16px | Standard section gap |
| 3 | 24px | Page section gap |
| 4 | 32px | Major section separator |
| 6 | 48px | Hero spacing |

## Border Radius
| Element | Value |
|---------|-------|
| Button, Input | 12px |
| Card | 16px |
| Modal, Sheet | 20px |
| Pill, Badge, Tag | 9999px |
| Avatar | 9999px |

## Shadows (y-offset blur spread color)
| Level | Light | Dark |
|-------|-------|------|
| 0 | none | none |
| 1 | 0 1px 2px rgba(0,0,0,.04) | 0 1px 2px rgba(0,0,0,.25) |
| 2 | 0 1px 3px rgba(0,0,0,.06), 0 4px 12px rgba(0,0,0,.04) | 0 1px 3px rgba(0,0,0,.35), 0 4px 12px rgba(0,0,0,.25) |
| 3 | 0 2px 8px rgba(0,0,0,.08), 0 8px 24px rgba(0,0,0,.06) | 0 2px 8px rgba(0,0,0,.45), 0 8px 24px rgba(0,0,0,.35) |

## Animation
| Name | Duration | Easing | Usage |
|------|----------|--------|-------|
| Micro | 150ms | ease | Hover, focus, toggle |
| Standard | 250ms | ease | Route change, card expand |
| Expressive | 400ms | cubic-bezier(.25,.1,.25,1) | Page transition, modal |
| Spring | 500ms | cubic-bezier(.175,.885,.32,1.275) | Scale feedback, drag |

## Icons
- **Library**: Lucide React v0.511
- **Sizing**: 16px (inline), 20px (UI), 24px (feature)
- **Stroke**: 1.5px (default), 2px (active/selected)
- **Never**: emojis as icons, custom SVG without viewBox

## Component Patterns

### Card
- Surface: `surface-card` class
- Radius: 16px (var(--radius-card))
- Padding: 16px (spacing-2)
- Gap between cards: 12px mobile, 16px desktop
- Header: heading-h3 + optional caption
- Actions: bottom-right, 12px button, transition-micro

### Button
- Primary: bg-primary, text-white, shadow-sm, hover:shadow-md + brightness(1.05)
- Secondary: bg-secondary, hover:bg-secondary/80
- Ghost: transparent, hover:bg-muted
- Size: sm(32px), md(40px), lg(48px)
- Radius: 12px (var(--radius-button))

### Input
- Height: 40px (h-10)
- Radius: 12px
- Border: 1px solid border
- Focus: ring-2 ring-primary/20 border-primary
- Placeholder: muted-foreground/50

### Navigation
- Desktop sidebar: 256px, surface-card, border-right
- Mobile: floating surface-glass header pill + surface-glass bottom nav

### Tab Bar
- Background: muted/40
- Active tab: bg-background shadow-sm
- Inactive: transparent, text-muted-foreground
- Radius: 12px container, 10px tabs
- Height: 40px

## Responsive Breakpoints
| Name | Width | Target |
|------|-------|--------|
| Mobile | <768px | Phone |
| Tablet | 768-1023px | iPad |
| Desktop | >=1024px | Laptop+ |
