# Laith's Picks

Curated subset of the 136 design-systems and 54 skills, with rationale per pick. The bridge skill in `personal-plugins/skills/frontend-design/references/open-design-bridge.md` reads this file first when a brief doesn't pin a system; the picker disperses across this short list rather than the full corpus.

## How to use

When a brief doesn't name a design system:

1. Read this file.
2. Reach for a pick from the **first-reach** column that fits the brief's tone.
3. If three of the last five renders used the same pick, reach for an alternate.
4. Run `node --import tsx scripts/lint-artifact-cli.ts <output.html>` before declaring done.

When a brief is exploratory or the prior pick produced nothing surprising, intentionally roll from the **stretch** column.

## Design systems — first reach (8)

| System | Why |
|--------|-----|
| `editorial` | Magazine-style hierarchy with serifs that earn their place. Best for memos, briefs, six-pagers, and longform reports. The default when prose carries the page. |
| `warm-editorial` | Editorial with a softer chroma (cream paper, terracotta accents). Use when a memo would feel cold in pure black-on-white. |
| `swiss` *(via `mono`)* | Grid-strict, neo-grotesk, no decorative noise. For data-heavy pages, dashboards that should feel inevitable, and anything that could collapse into a chart-on-a-page. |
| `linear-app` | Confident dark-mode product surface — restrained accents, real typographic hierarchy, no glow. The bar for SaaS-product UI. |
| `notion` | Light, content-first, generous whitespace. For docs, internal tools, and onboarding surfaces where users are reading more than clicking. |
| `clickhouse` | Technical-product credibility — code-first, monospace-forward, dense without crowding. For developer surfaces and infra products. |
| `sentry` | Engineering-product polish: dark-mode that isn't dark-mode-purple. Use when `linear-app` feels too consumer. |
| `kraken` | Bold, brutalist-adjacent, high contrast. Use when the page needs to feel like a statement rather than a service. |

## Design systems — stretch (8)

| System | Why |
|--------|-----|
| `theverge` | Editorial-publication chrome. Use when a launch page should feel reported, not announced. |
| `xiaohongshu` | Pastel + native-CJK type stack. The opposite of every Y Combinator-shaped landing page. Variety solvent. |
| `spacious` | Apple-adjacent, oversized hero, lots of breathing room. Use sparingly — earns its drama once per project. |
| `paper` | Print-paper warmth, real serifs. For story-driven pages where the medium is the message. |
| `cosmic` | Editorial sci-fi. Use when the brief actually has a thesis, not just an announcement. |
| `dithered` | Constrained palette + algorithmic pattern. Antidote to gradient-mush. |
| `neobrutalism` | Hard borders, blocky, unapologetic. Best for tools that target builders and don't need to seduce buyers. |
| `claymorphism` | Soft 3D buttons, candy palette. Reach for it deliberately when the brief calls for play (kids' product, onboarding, gamified surface) — not because the default theme picker happened to land here. |

## Anti-picks (do not reach for these by default)

| System | Why we avoid as default |
|--------|-------------------------|
| `glassmorphism` | The trope. Frosted blur over a purple gradient is the textbook AI tell. Only reach for it when the brief explicitly asks. |
| `gradient` | "Gradient" as the design language is a confession that no design language was chosen. |
| `cosmic` *as a default* | Listed in stretch on purpose — easy to over-use because it photographs well in screenshots. Watch the rotation log. |
| `colorful` / `vibrant` | Synonyms for "I haven't picked a palette." Override with a real system. |

## Skills — first reach (8)

| Skill | When |
|-------|------|
| `web-prototype` | Default for "build me a page" without a more specific shape. |
| `saas-landing` | Marketing landing for a SaaS product. Has the strongest opinion about hero/explainer/CTA rhythm. |
| `pricing-page` | Tabular pricing with a thesis. Avoid the three-card grid trap. |
| `magazine-poster` | When the brief is a single-screen statement, not a flow. |
| `dashboard` | Real charts + tabular layouts. Pair with `clickhouse` or `mono` design systems. |
| `pm-spec` | Internal product-spec page. Pair with `notion`. |
| `meeting-notes` | Meeting recap as an artifact, not a wall of bullets. |
| `weekly-update` | Status post in artifact form — pair with `editorial` or `warm-editorial`. |

## Skills — stretch (8)

| Skill | When |
|-------|------|
| `magazine-poster` | Full-bleed editorial single-pager. Reach when the message needs to be big. |
| `social-carousel` | Multi-card narrative for social. |
| `motion-frames` | When the brief deserves animation, not just typography. |
| `digital-eguide` | Long-form download artifact — explainer or playbook. |
| `wireframe-sketch` | Intentionally low-fidelity. Use when the discussion is structure, not pixels. |
| `mobile-onboarding` | Mobile-first onboarding flow. |
| `replit-deck` | Slidev-adjacent deck with a developer-conference voice. |
| `image-poster` | Single static image artifact (event poster, milestone announcement). |

## Anti-picks (skill-level)

| Skill | Why we avoid as default |
|-------|-------------------------|
| `hatch-pet` | Demo-only — community pet-companion sample, not a real artifact shape. |
| `gamified-app` | Tempting because of the screenshots; rarely fits a real brief. |
| `dating-web` | Specific-vertical demo. |

## Variety rules of thumb

- If two of the last five renders used the same design system, reach for an alternate from the same row (first-reach or stretch).
- If three of the last five renders used the same skill, the brief is probably miscast — re-read it.
- A brief that doesn't name a system or a skill is a chance to roll from stretch on purpose.

## Maintenance

Edit this file freely. Pinning a new pick is a 5-minute task. The expectation is that this list churns — every couple of weeks, swap out the system that didn't earn its keep.

Anti-slop addendum lives at `craft/anti-ai-slop-laith.md`. Sync ritual lives at `scripts/sync-upstream.sh`.
