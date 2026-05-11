# Anti-slop addendum (Laith)

Supplements `craft/anti-ai-slop.md` with patterns that are project-specific and pickier than the upstream rule sheet. The upstream file owns the seven cardinal sins; this file owns the soft tells we're personally tired of.

## Visual

### body-weight-under-400
Body text below 18pt at font-weight 300 (Light) or 200 (ExtraLight) reads as "AI tried to look elegant." Default to 400 (Regular) for any text under 18pt. Editorial / print-grade contexts may use 300 when the body color is high-contrast (`#1a1a1a` on white). Never 200 for body text — ExtraLight is display-only at 18pt+.

### hover-lift-no-depth
A `transform: translateY(-2px)` on hover with no shadow change is a tell. Either commit to depth (shadow + lift) or commit to flat (no lift, just color shift). Halfway is uncanny.

### generic-three-card-grid
The default pricing/features grid: three cards, equal width, identical structure, one-line headline, two-line body, button. If the page has a three-card grid, the next thing to ask is "could two of these be a single richer block?" Variant rule: if three cards each have a Lucide icon, demote them to text — Lucide-icon-pile is the giveaway.

### stock-illustration-source
`undraw.co` and `storyset.com` URLs in `<img src>` are the visual equivalent of "delve." If the brief calls for illustration, draw it (Stable Diffusion, hand sketch, geometric SVG) — don't reach for the public stock pile.

### dark-mode-purple-glassmorphism
Any two of {dark canvas, purple/indigo accent ≥ #6...stuff, frosted-blur backdrop-filter, gradient text on a hero} firing together is the cardinal AI-product-page sin. The rule fires on the combination — none of the three alone is automatic slop.

### gradient-text-headline
`background-clip: text` + multi-stop gradient in a hero `<h1>`. This rendered well in 2022. It is the visual cliche of the LLM era. Solid color or a single accent fill instead.

### centered-everything
A page where every section is `text-align: center` and `align-items: center` is a refuge from layout. Pick a left-aligned editorial axis or a grid axis; center deliberately, not as a default.

## Layout

### hero-features-pricing-faq-cta
The default landing-page skeleton. Hero → 3-card features → pricing table → FAQ accordion → "Ready to get started?" CTA. If the page has all five blocks in this order, the brief was filed away and a template was filled in. Either drop a block or reorder.

### bento-grid-13
Bento grid with 13 cells of varied sizes is a 2024 trope. Use a real grid (12-column, 6-column, or asymmetric editorial) unless the content actually fits a bento.

## Copy

The copy rules below are the prose-check Tier 1 regex bank, ported. Run `node --import tsx scripts/lint-artifact-cli.ts <file>` to surface them on rendered output.

### slop-vocab
"load-bearing", "delve", "tapestry", "pivotal", "in the realm of", "navigate the landscape", "leverage", "robust", "seamless", "cutting-edge", "nuanced", "underscores the importance", "it's worth noting that". Use one if you must; using three in the same paragraph is a tell.

### flipped-contrastive
"Not just X — it's Y." "Not merely X but Y." "More than X, it's Y." The cadence of the LLM era. One per page max.

### em-dash-density
More than 1 em-dash per 100 words of body copy is a tell. We've already used five this week.

### fake-energy-signoff
"Let's build something amazing." "The future is bright." "Ready to revolutionize your workflow?" If the closing CTA reads like a podcast outro, rewrite.

### dramatic-reveal
"Here's the thing:" "What's wild is:" "And that's just the beginning." If a section opens with a meta-tease about its own content, cut the tease.

### bro-podcast-opener
"Real quick —" "Hot take —" "Look —" used as a paragraph opener. Used to be a podcast tell; now it's an LLM tell.

## Composition

### no-real-content
A page where every block is generic ("powerful features", "trusted by industry leaders", "flexible pricing for every team") is the symptom that the brief was thin. Either ground the page in a real product detail or admit it's a wireframe.

### invented-metrics
"500+ enterprise customers", "99.99% uptime", "5x faster than the leading competitor" without a citation is a slop-vocab cousin. Either cite or omit.

### lorem-ipsum
Lorem ipsum still in the artifact at delivery time is a P0 fail. The lint rule already catches this; don't ship around it.

## Application

Run order:

1. Tier 1 regex on the rendered HTML — `lint-artifact-cli.ts`.
2. (Optional, opt-in) Tier 2 LLM critic — `LAITH_SLOP_PRO=1 od lint <file>` shells to `prose_check_pro.py` for the dual-judge (Nova 2 Lite + Haiku 4.5) on extracted copy.
3. Visual eyeball pass — open the HTML, scan for the visual rules above. The composite rules (`dark-mode-purple-glassmorphism`) need a human read because they fire on combinations.

Composite scoring follows prose-check Tier 2: `0.40 × deterministic + 0.50 × dual-judge consensus + 0.10 × paraphrase probe`. Score >55 means rewrite; 25–55 means revise; <25 ships.
