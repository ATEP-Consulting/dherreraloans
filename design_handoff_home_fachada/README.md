# Handoff: DherreraLoans — Home "Fachada" (design 4a)

## Overview
Home page for **DherreraLoans** — the personal brand of David Herrera, mortgage loan originator (NMLS #1459301) in Miami, FL. Goal: convert visitors (mostly arriving from Instagram on mobile) into leads via the **Get a Quote** questionnaire, with **Apply Online** (external my1003app link) as secondary CTA. Site is fully bilingual EN/ES. This home defines the visual system for the whole site (program pages, quote questionnaire, calculator, about, contact, legal).

## About the Design Files
The files in this bundle are **design references created in HTML** — static prototypes showing the intended look, not production code to copy directly. The task is to **recreate this design in the target codebase** (e.g. Astro/Next/plain HTML+CSS — whatever the project uses; if none exists yet, pick a lightweight static-first framework: there is a contractual Lighthouse > 95 commitment in all 4 categories, so avoid heavy JS). The reference files use inline styles for portability; implement with proper CSS (custom properties + classes).

- `home-desktop.html` — desktop reference, fixed 1440px artboard
- `home-mobile.html` — mobile reference, fixed 390px artboard. **Mobile-first: this is the primary version**, not an adaptation.

## Fidelity
**High-fidelity.** Colors, type, spacing and copy are final-intent (copy pending client validation — YMYL content must be approved before publishing). Recreate pixel-perfectly, then make it responsive between the two reference widths (breakpoint suggestion: ~980px).

## Screens / Views

### Home (only screen in this handoff)

**1. Top strip** — 1px bottom border over hero photo. 11px Instrument Sans 500, letter-spacing .22em, rgba(247,245,240,.75). Left: "DAVID HERRERA — MORTGAGE LOAN ORIGINATOR"; right: "NMLS #1459301 · MIAMI, FLORIDA". Mobile: omitted (header only).

**2. Header (transparent, over hero photo)** — logo `assets/logo-light.png` (h 56px desktop / 44px mobile); nav 13.5px Instrument Sans 500 in off-white: Loan Options · Calculator · About · Contact; right: language toggle "EN — ES" (active EN solid #F7F5F0, inactive 70% opacity), "Apply Online" (underlined text link, **secondary CTA**, external link to my1003app), "GET A QUOTE" (**primary CTA**: #F7F5F0 bg, #10314A text, 12.5px/600/ls .14em, padding 14×26, **no border-radius**). Mobile: logo + EN—ES + hamburger.

**3. Hero** — height 820px desktop / 680px mobile. Full-bleed background photo (Florida house; currently an Unsplash placeholder — replace with licensed final photo). Overlay gradient for AA contrast: desktop `linear-gradient(72deg, rgba(9,26,40,.88) 0%, .62 38%, .18 70%, .30 100%)`; mobile vertical `(180deg, .72 → .30 34% → .55 62% → .90 100%)`. Content bottom-left, max-width 860px: eyebrow (12px, ls .24em, #9BC4DF) → H1 Spectral 300, 72px/1.06 desktop, 40px/1.1 mobile, #F7F5F0: "Buying a home in Florida, *without the guesswork.*" (italic em) → paragraph 17px/1.65 rgba(247,245,240,.85) → CTAs: GET A QUOTE (18×36 padding) + WhatsApp outlined button (1px rgba(247,245,240,.55) border, icon + "WhatsApp — same-day reply"). WhatsApp opens wa.me deep link with prefilled message; do NOT add a floating green bubble.

**4. Cities strip** — centered, border-bottom 1px #1E2124: "Working with buyers across Florida" (15px Spectral italic #4A5158) + "— MIAMI · FORT LAUDERDALE · ORLANDO · TAMPA · NAPLES" (12px Instrument Sans, ls .18em, #6B7076).

**5. Loan programs (index)** — padding 72px; 2 cols: 280px label col ("INDEX — SECTION I" microlabel 11.5px ls .26em #6B7076; "Loan programs" Spectral 300 38px; helper text) + rows list. Each row (border-bottom 1px #D9D4C8, padding 21px 0): number "No. 1" (13px #B9B2A4, 56px col) · name (Spectral 400 25px #1E2124) · dotted leader (1px dotted #B9B2A4, flex:1) · key stat (14px 500 #10314A). Rows link to program pages: FHA 3.5% down · Conventional 3% down · VA $0 down · First-Time Homebuyer FL assistance · Refinance Rate · cash-out. Hover: name → #17618F, cursor pointer.

**6. About band ("A person, not a portal")** — bg #EFEBE2, 1px #1E2124 top/bottom borders, grid 400px + text, padding 64×72. Photo plate: white bg, 1px #1E2124 border, photo `assets/david.png` (object-fit contain, h 400px; low-res placeholder — final photo pending from client), caption bar under photo (1px top border, 12px italic #6B7076): "David Herrera — your loan originator, start to closing." Text: microlabel + H2 Spectral 300 36px + body 16px/1.7 #4A5158 + CTAs (navy GET A QUOTE + @dherrera_loans link → Instagram).

**7. CTA band** — bg #10314A, padding 84×72. H2 Spectral 300 44px #F7F5F0: "Know your number *before* you fall in love with the house." + GET A QUOTE (inverted: #F7F5F0 bg / #10314A text).

**8. Footer (compliance — same dignity as the rest)** — paper bg, 1px #1E2124 top border. 4 cols: brand (logo.png h 58 + address block 13px/1.7 #6B7076) · EXPLORE links · LEGAL links (Privacy Policy, Accessibility Statement, **NMLS Consumer Access** → https://www.nmlsconsumeraccess.org, external) · Equal Housing Opportunity mark (use the official EHO logo asset in production; the reference uses a stroke house glyph). Below: full legal disclaimer paragraph (11px/1.65 #9AA0A6, justified) and bottom row © / "English — Español".

## Interactions & Behavior
- **CTA hierarchy**: Get a Quote (primary, internal → /quote questionnaire) must always dominate; Apply Online (secondary, external `https://aimsmtg.my1003app.com/1459301/register`, `rel="noopener"`) is a text link or outlined button, never equal weight.
- Language toggle EN/ES: routes to mirrored localized pages (`/` ↔ `/es/`), persists choice. All copy in this mock is EN; ES versions to be written.
- Hover states: buttons darken slightly (e.g. filter brightness(.94)); text links get underline or color shift #17618F → #10314A. Focus states: 2px visible outline (#2287C6) — WCAG AA required, Lighthouse accessibility > 95 is contractual.
- Header over hero: static in mock. If made sticky, switch to solid #10314A bg with dark logo swap once scrolled past hero.
- Animations: none required. Keep JS near-zero (performance budget).
- Images: serve responsive (`srcset`), compressed (webp/avif), hero preloaded with `fetchpriority="high"`.

## State Management
Static page — no state beyond language selection and mobile nav open/close. Lead flows (questionnaire, contact) live on other pages: Google Sheets first, then Pipedrive, then emails (see project proposal); not part of this screen.

## Design Tokens
Colors:
- Paper (page bg): `#F7F5F0` · Panel sand: `#EFEBE2`
- Ink (text/borders): `#1E2124` · Body text: `#4A5158` · Muted: `#6B7076` · Faint: `#9AA0A6` · Leader dots/hairlines: `#D9D4C8`, `#B9B2A4`
- Navy (primary/accent, from logo, darkened for AA): `#10314A` · Link azure: `#17618F` · Light azure (on navy): `#9BC4DF`, `#7FAECD` · Logo azure (detail only, fails AA on white for small text): `#2287C6`
- Hero scrim base: `rgba(9,26,40,…)`

Typography:
- Display: **Spectral** 300 (italic for emphasis). H1 72/1.06 (desktop) · 40/1.1 (mobile); H2 44, 38, 36; index names 25.
- UI/body: **Instrument Sans** 400/500/600. Body 16–17px/1.65–1.7; microlabels 11–12px, letter-spacing .2–.26em, uppercase; buttons 13px/600/ls .14em uppercase.
- Minimum text size 12.5px (legal fine print 11px only in footer disclaimers).

Spacing: section padding 72px desktop / 20px mobile gutters; vertical rhythm in multiples of 8. Border radius: **0 everywhere** (square, print-like). Shadows: none (borders instead).

## Assets
- `assets/logo.png` — client logo, white bg removed, trimmed (dark version, for light backgrounds)
- `assets/logo-light.png` — generated light variant (ivory + azure) for dark/photo backgrounds
- `assets/david.png` — TEMPORARY low-res photo of David; client will provide high-res
- Hero photo — Unsplash placeholder (`photo-1600585154340-be6161a56a0c`, credit R ARCHITECTURE); replace with licensed/owned Florida photo before launch
- Equal Housing Opportunity official logo — source from HUD assets for production

## Files
- `home-desktop.html` — 1440px desktop reference
- `home-mobile.html` — 390px mobile reference (primary)
- `assets/` — logo, logo-light, david photo
