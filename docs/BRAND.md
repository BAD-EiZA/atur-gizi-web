# Atur Gizi — brand kit ringkas

## Palette (CSS HSL)

| Token | HSL | Use |
|---|---|---|
| primary | `158 64% 36%` | CTA, active, progress |
| secondary | `155 35% 94%` | chips, active nav wash |
| background | `150 30% 98%` | page wash |
| foreground | `222 47% 11%` | body |
| muted-foreground | `215 16% 40%` | helper |

Dark surfaces: `slate-900` / `slate-950` for privacy blocks.

## Type

- Family: Geist (`--font-geist-sans`)
- Display: `.display-h1` / `.display-h2` in `globals.css`
- Never Inter

## Radius & shadow

- Radius base: `1rem` (2xl cards)
- Shadows: `--shadow-sm|md|lg|glow`

## Logo

- Mark: `/logo.svg`, `/logo-mark.svg`
- Wordmark: text “Atur Gizi” next to mark (`Logo` component)
- Clear space: ≥ 0.5× mark height

## Photography

| Asset | Path |
|---|---|
| Hero | `/brand/hero-plate.jpg` |
| Inline pill | `/brand/inline-food.jpg` |
| Gallery | `/brand/gallery-bowl.jpg`, `gallery-activity.jpg`, `gallery-insight.svg` |
| Demo scan | `/illustrations/food.jpg` |

Filters: mild `contrast` + reduced `saturate` so stock doesn’t look raw.

## Do / don’t

- Do: white text on primary emerald; draft badges on AI output
- Don’t: medical claims, SECTION 01 labels, raw JSON as primary UI, picsum in production
