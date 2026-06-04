# LearningOS Design System

## Philosophy
Apple-level simplicity · Linear-level precision · Notion-level clarity · Airbnb-level UX · Arc-level aesthetics.

## Spacing (8px grid)
| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | icon gap, badge padding |
| sm | 8px | card padding, inline gap |
| md | 16px | section gap, component padding |
| lg | 24px | page section gap |
| xl | 32px | major section separator |
| 2xl | 48px | hero spacing |

## Typography Scale
| Level | Mobile | Desktop | Weight |
|-------|--------|---------|--------|
| H1 | 26px/-1.5% | 32px/-2% | 700 |
| H2 | 20px/-1% | 24px/-1.5% | 600 |
| H3 | 16px/0 | 18px/0 | 600 |
| Body | 14px | 15px | 400 |
| Caption | 11px | 12px | 500 |
| Label | 10px/uppercase | 11px/uppercase | 600 |

## Border Radius
| Token | Value | Usage |
|-------|-------|-------|
| card | 20px | Cards, panels |
| button | 14px | Buttons, inputs |
| pill | 9999px | Badges, tags |
| modal | 24px | Dialogs, sheets |

## Color Palette (from globals.css tokens)
- Primary: Indigo (#4f46e5 family)
- Surface: card → white/zinc-900
- Muted: secondary/muted for backgrounds
- Semantic: success (green), warning (amber), destructive (red), info (blue)

## Shadows (Light)
- Level 0: none (text, icons)
- Level 1: 0 1px 2px rgba(0,0,0,0.04) — subtle lift
- Level 2: 0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04) — cards
- Level 3: 0 2px 8px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06) — modals, floating nav

## Shadows (Dark)
- Level 0: none
- Level 1: 0 1px 2px rgba(0,0,0,0.2)
- Level 2: 0 1px 3px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)
- Level 3: 0 2px 8px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3)

## Animation
- Fast: 150ms ease — micro (hover, focus)
- Normal: 250ms ease — transitions
- Slow: 400ms cubic-bezier(0.25,0.1,0.25,1) — page transitions
- Spring: 500ms cubic-bezier(0.175,0.885,0.32,1.275) — scale feedback

## Component Patterns
- **Cards**: borderless, shadow-l2, rounded-card (20px), bg-card
- **Buttons**: rounded-button (14px), 8-16px padding, 150ms hover
- **Inputs**: rounded-button, 1px border, focus: ring-2 ring-primary/20
- **Navigation**: glass surface, shadow-l3, rounded-card

## Do Not
- Use emojis as icons
- Mix border-radius values on same component
- Use gradients except for hero/cta accent
- Use text below 10px
- Animate width/height (use transform)
- Use random colors outside the palette
