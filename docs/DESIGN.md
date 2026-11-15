---
# ─────────────────────────────────────────────────────────────
# DESIGN_TEMPLATE_WEB.md — Premium web design system template
# Version: 1.23.1
# Platform: web (marketing sites + product/SaaS websites)
# Companion: DESIGN_TEMPLATE_MOBILE.md (separate file for iOS/Android)
#
# HOW TO USE:
# 1. Copy this file to your project as `DESIGN.md`.
# 2. Fill every `<slot>` value. Greppable: `grep -n "<[^>]*>" DESIGN.md` should
#    return zero results once instantiation is complete.
# 3. Run the color-derivation step. EASIEST: use the bundled generator —
#    `tools/brand-kit` → `npm run gen -- --base "#RRGGBB"` (your brand HEX, or `oklch(L C H)`) [--neutral-hue H] [--neutral-chroma S]
#    — it derives all 12 steps × light + dark for every palette, gamut-clamped + APCA-verified, and
#    prints the `colors:` block to paste in. (Or derive by hand per `§Colors → Generating the scale`.)
# 4. Profiles and pick-one slots have safe defaults. Override only with intent.
# 5. The Markdown body below contains the rules an AI consuming this file
#    must follow. The YAML frontmatter contains the values. Both are normative.
# 6. FINAL STEP: review the result in the brand-kit viewer (`tools/brand-kit`, `npm run dev`).
#    See `§Brand Kit` at the end of this file.
# ─────────────────────────────────────────────────────────────

# ─── STATUS MARKERS — every value's state stays trackable (authoritative spec: PROJECT.md → §Status protocol) ───
# An inline comment on a value marks its state; unmarked + filled = "given" (the user's own input).
#   <slot>/<TBD> = unfilled · # draft = AI-inferred, needs approval · # default = out-of-box default,
#   not consciously chosen · # approved = signed off · # locked = approved + logged in DECISIONS.md.
# Rule: the AI never writes an inferred value without `# draft`, nor accepts a default without `# default`
# — so an unmarked filled value is, by construction, the user's. Nothing fabricated slips through unverified.

template_version: "1.23.1"
platform: "web"

# ─── Brand identity (REQUIRED inputs) ───
brand:
  name: "SlugGrub"
  description: "UCSC dining, ranked by students: what's good at each dining hall right now, this-or-that dish rankings, private photo calorie logs, and a Slug Points pace tracker."  # draft
  audience: "UCSC students on a dining meal plan who eat at the dining halls most days and want to know what's worth the walk."  # draft
  voice: "A friendly campus insider: short, warm, a little playful, numbers first. Never diet culture, never preachy, no hype."  # draft

# ─── Mode declaration ───
mode:
  primary: "light"          # draft (warm cream light theme; dark tokens generated but not the default) | light | dark | system
  rtl_support: "disabled"   # enabled | disabled (enabling activates §Internationalization rules)

# ─── Profile selections (preset bundles) ───
profiles:
  radius: "soft"              # draft (20-28px cards, pill buttons and chips, per Mobbin research) | sharp | default | soft | pill
  type_scale: "spacious"      # draft (hero numbers are set separately, 48-72px) | compact (1.125) | balanced (1.200) | spacious (1.250) | dramatic (1.333) | editorial (1.414)
  density: "comfortable"      # compact (×0.75) | comfortable (×1.0) | spacious (×1.25)
  motion: "default"           # default | subtle | default | expressive
  elevation: "flat"           # his decision 2026-11-14 (Flat + Sidestash) | flat (border-only) | default (subtle shadows) | dimensional (richer shadows)
  saturation: "default"       # muted (×0.7 chroma) | default (×1.0) | vivid (×1.3)
  warmth: "cool"              # his ask 2026-11-14: "coldish neutral colors" | cool (hue ≈ 240) | neutral (≈ 60) | warm (≈ 40)
  section_padding: "default"  # compact (~96 px) | default (~128 px) | generous (~160 px)
  chart_minimalism: "tufte"   # draft (arcs, rings, one segmented bar; no axes) | tufte (minimal) | default | carbon (full axes/gridlines)

# ─── Pick-one option slots ───
options:
  input_style: "filled"              # draft | outlined | filled | underlined
  tabs_style: "filled"               # draft (cream segmented pill, like Blank Street) | underline | filled
  icon_fill: "outline"               # outline | filled
  avatar_shape: "circle"             # circle | squircle | rounded-square
  modal_backdrop: "blur"             # scrim | blur. blur is an effects.ladder tier-2 (backdrop-filter) cost: it counts toward QA.md
                                     #   backdrop_filter_layers_max and falls back to a translucent scrim when over budget, when
                                     #   the effects.adaptive_quality governor steps down, and under prefers-reduced-transparency
  code_surface: "always-dark"        # match-page | always-dark
  onboarding_pattern: "step-by-step-modal"  # draft (4 full-screen questions: plan, points, college, usual hall) | empty-state-driven | progressive | coach-marks | step-by-step-modal | milestone-checklist
  save_model: "auto-save"            # auto-save | explicit-save
  settings_ia: "single-page"        # draft | sidebar | tabs | single-page
  container_width: "md"              # draft (phone-width column, max 448px, centered on desktop) | md (1024) | lg (1280) | xl (1440)
  heading_weight: 700                # draft (bold, tight, like Cal AI) | 600 | 700
  time_format: "hybrid"              # relative-only | absolute-only | hybrid
  number_abbreviation: "contextual"  # short | long | contextual
  product_nav_style: "none"          # draft (a floating bottom tab bar instead: Today, Rank, camera, Halls, Budget) | top-bar | sidebar | hybrid | none
  hero_variant: "split-asymmetric"   # centered | split-asymmetric | background-led
  toast_position: "top-center"       # draft | top-right | top-center | bottom-right | bottom-center
  footer_style: "minimal"            # draft | multi-column | minimal
  command_palette: "disabled"        # draft | enabled | disabled
  chart_library: "custom"           # draft (hand-built SVG arcs and bars) | recharts | visx | tremor | echarts | custom
  illustration_style: "none"        # draft (food photos carry the visuals) | vector | 3D | abstract | mixed | none

# ═══════════════════════════════════════════════════════════════
# COLORS
# ═══════════════════════════════════════════════════════════════
# Author in OKLCH. Each 12-step palette derives from a single base color
# using the algorithm in §Colors → Generating the scale.
# Steps 1–12 follow Radix semantic roles (1 = app bg, 9 = solid CTA, 12 = high-contrast text).

colors:
  # Generated 2026-11-14 by premium.md generate-palette.ts from his choices: base oklch(0.52 0.165 252) (brighter UCSC-style blue,
  # his asks), neutral hue 250 (his "coldish neutral colors"). APCA: primary step 9 white-on-CTA Lc 82, text11/step2 Lc 87.
  primary:
    base: "oklch(0.52 0.165 252)"
    1:  "oklch(0.99 0.005 252)"
    2:  "oklch(0.97 0.015 252)"
    3:  "oklch(0.95 0.025 252)"
    4:  "oklch(0.92 0.04 252)"
    5:  "oklch(0.88 0.061 252)"
    6:  "oklch(0.83 0.088 252)"
    7:  "oklch(0.75 0.124 252)"
    8:  "oklch(0.66 0.149 252)"
    9:  "oklch(0.52 0.156 252)"
    10: "oklch(0.46 0.138 252)"
    11: "oklch(0.38 0.091 252)"
    12: "oklch(0.22 0.05 252)"
    dark:
      1:  "oklch(0.17 0.012 252)"
      2:  "oklch(0.21 0.012 252)"
      3:  "oklch(0.24 0.021 252)"
      4:  "oklch(0.28 0.036 252)"
      5:  "oklch(0.32 0.053 252)"
      6:  "oklch(0.37 0.071 252)"
      7:  "oklch(0.44 0.089 252)"
      8:  "oklch(0.53 0.107 252)"
      9:  "oklch(0.62 0.119 252)"
      10: "oklch(0.68 0.113 252)"
      11: "oklch(0.79 0.065 252)"
      12: "oklch(0.93 0.035 252)"
  neutral:
    hue: 250
    1:  "oklch(0.99 0.004 250)"
    2:  "oklch(0.97 0.005 250)"
    3:  "oklch(0.95 0.005 250)"
    4:  "oklch(0.92 0.006 250)"
    5:  "oklch(0.88 0.006 250)"
    6:  "oklch(0.83 0.005 250)"
    7:  "oklch(0.75 0.005 250)"
    8:  "oklch(0.66 0.004 250)"
    9:  "oklch(0.55 0.003 250)"
    10: "oklch(0.49 0.003 250)"
    11: "oklch(0.38 0.003 250)"
    12: "oklch(0.22 0.002 250)"
    dark:
      1:  "oklch(0.17 0.003 250)"
      2:  "oklch(0.21 0.003 250)"
      3:  "oklch(0.24 0.003 250)"
      4:  "oklch(0.28 0.004 250)"
      5:  "oklch(0.32 0.004 250)"
      6:  "oklch(0.37 0.003 250)"
      7:  "oklch(0.44 0.003 250)"
      8:  "oklch(0.53 0.003 250)"
      9:  "oklch(0.62 0.003 250)"
      10: "oklch(0.68 0.003 250)"
      11: "oklch(0.79 0.002 250)"
      12: "oklch(0.93 0.002 250)"
  success:
    base: "oklch(0.55 0.13 145)"
    1:  "oklch(0.99 0.013 145)"
    2:  "oklch(0.97 0.013 145)"
    3:  "oklch(0.95 0.023 145)"
    4:  "oklch(0.92 0.039 145)"
    5:  "oklch(0.88 0.059 145)"
    6:  "oklch(0.83 0.078 145)"
    7:  "oklch(0.75 0.098 145)"
    8:  "oklch(0.66 0.117 145)"
    9:  "oklch(0.55 0.13 145)"
    10: "oklch(0.49 0.124 145)"
    11: "oklch(0.38 0.072 145)"
    12: "oklch(0.22 0.039 145)"
    dark:
      1:  "oklch(0.17 0.009 145)"
      2:  "oklch(0.21 0.009 145)"
      3:  "oklch(0.24 0.017 145)"
      4:  "oklch(0.28 0.028 145)"
      5:  "oklch(0.32 0.042 145)"
      6:  "oklch(0.37 0.056 145)"
      7:  "oklch(0.44 0.07 145)"
      8:  "oklch(0.53 0.084 145)"
      9:  "oklch(0.62 0.094 145)"
      10: "oklch(0.68 0.089 145)"
      11: "oklch(0.79 0.051 145)"
      12: "oklch(0.93 0.028 145)"
  warning:
    base: "oklch(0.72 0.15 75)"
    1:  "oklch(0.99 0.008 75)"
    2:  "oklch(0.97 0.015 75)"
    3:  "oklch(0.94 0.027 75)"
    4:  "oklch(0.91 0.045 75)"
    5:  "oklch(0.88 0.068 75)"
    6:  "oklch(0.84 0.09 75)"
    7:  "oklch(0.8 0.112 75)"
    8:  "oklch(0.76 0.135 75)"
    9:  "oklch(0.72 0.15 75)"
    10: "oklch(0.64 0.135 75)"
    11: "oklch(0.5 0.083 75)"
    12: "oklch(0.34 0.045 75)"
    dark:
      1:  "oklch(0.18 0.011 75)"
      2:  "oklch(0.22 0.011 75)"
      3:  "oklch(0.26 0.019 75)"
      4:  "oklch(0.31 0.032 75)"
      5:  "oklch(0.37 0.049 75)"
      6:  "oklch(0.44 0.065 75)"
      7:  "oklch(0.52 0.081 75)"
      8:  "oklch(0.62 0.097 75)"
      9:  "oklch(0.72 0.108 75)"
      10: "oklch(0.78 0.103 75)"
      11: "oklch(0.85 0.059 75)"
      12: "oklch(0.93 0.032 75)"
  danger:
    base: "oklch(0.55 0.20 25)"
    1:  "oklch(0.99 0.005 25)"
    2:  "oklch(0.97 0.015 25)"
    3:  "oklch(0.95 0.025 25)"
    4:  "oklch(0.92 0.041 25)"
    5:  "oklch(0.88 0.064 25)"
    6:  "oklch(0.83 0.095 25)"
    7:  "oklch(0.75 0.15 25)"
    8:  "oklch(0.66 0.18 25)"
    9:  "oklch(0.55 0.2 25)"
    10: "oklch(0.49 0.19 25)"
    11: "oklch(0.38 0.11 25)"
    12: "oklch(0.22 0.06 25)"
    dark:
      1:  "oklch(0.17 0.014 25)"
      2:  "oklch(0.21 0.014 25)"
      3:  "oklch(0.24 0.026 25)"
      4:  "oklch(0.28 0.043 25)"
      5:  "oklch(0.32 0.065 25)"
      6:  "oklch(0.37 0.086 25)"
      7:  "oklch(0.44 0.108 25)"
      8:  "oklch(0.53 0.13 25)"
      9:  "oklch(0.62 0.144 25)"
      10: "oklch(0.68 0.137 25)"
      11: "oklch(0.79 0.079 25)"
      12: "oklch(0.93 0.036 25)"
  accent:
    # UCSC-style gold, used ONLY for #1 moments and highlights (crown badge, top pick). # draft (Claude's rule)
    3:  "oklch(0.97 0.06 95)"    # gold tint background
    6:  "oklch(0.92 0.12 93)"
    9:  "oklch(0.85 0.17 90)"    # solid gold (#FDC700 family)
    11: "oklch(0.5 0.11 85)"     # gold text on tint
  college:
    # Rivalry board only, one hue per dining hall. # draft
    jrl_c9: "oklch(0.55 0.15 275)"
    cowell_stevenson: "oklch(0.7 0.14 70)"
    crown_merrill: "oklch(0.6 0.11 200)"
    porter_kresge: "oklch(0.58 0.17 345)"
    carson_oakes: "oklch(0.66 0.16 45)"
  macro:
    # Private photo log only. # draft
    protein: "oklch(0.64 0.16 25)"
    carbs: "oklch(0.74 0.15 65)"
    fat: "oklch(0.64 0.12 250)"

  surface:
    canvas: "oklch(0.948 0.004 250)"   # page background: his pick 2026-11-14, background step 7 "Gray"
    subtle: "oklch(0.916 0.005 250)"   # segmented-control track, active tab capsule (canvas minus 0.032)
    raised: "oklch(0.985 0.002 250)"   # flat cards, flat buttons, pills # draft: card fill step 4, his pick still open (Card fill menu on /brand)
    overlay: "oklch(1 0 0)"            # sheets and popovers
    raise_gradient: "linear-gradient(180deg, oklch(0.993 0.002 250) 0%, oklch(0.963 0.004 250) 100%)"   # Sidestash finish, ONLY on the bottom nav bar and top bar round buttons, and as inset light/shade of the same strength on the camera blob (his decisions 2026-11-14)

  # Border role tokens
  border:
    subtle: "oklch(0 0 0 / 0.07)"  # list dividers, always a 0.5px hairline (his ask "normal hairlines")
    default: "oklch(0 0 0 / 0.07)" # flat elements carry NO border; inputs only
    strong: "{colors.primary.8}"   # focus ring
    highlight: "oklch(1 0 0)"      # the Sidestash white 0.5px hairline (nav bar, top bar buttons; camera blob at 40% white)
    # Dark-mode role override, optional. Every role ref above already switches with its palette's
    # `dark:` ramp. When a role must point at a DIFFERENT step in dark mode (usually to meet APCA),
    # give its group a `dark:` map, the same shape as a palette's `dark:`, listing only those roles.
    # Any role group can carry one (surface, border, text, semantic). The token export writes it into
    # [data-theme="dark"] as the same var (here --border-subtle). See §Colors → Dark mode.
    # dark:
    #   subtle: "{colors.neutral.7}"   # e.g. step 6 measured too faint on the dark canvas

  # Text role tokens
  text:
    primary: "oklch(0.18 0.015 255)"   # ink
    secondary: "oklch(0.42 0.012 255)"
    tertiary: "oklch(0.6 0.01 255)"     # labels and meta; sentence case, never all caps (his rule)
    disabled: "{colors.neutral.8}"
    inverse: "{colors.neutral.1}"
    link: "{colors.primary.11}"

  # Semantic role tokens (use these in components, not the step refs directly)
  semantic:
    success-bg: "{colors.success.3}"
    success-border: "{colors.success.7}"
    success-solid: "{colors.success.9}"
    success-text: "{colors.success.11}"
    warning-bg: "{colors.warning.3}"
    warning-border: "{colors.warning.7}"
    warning-solid: "{colors.warning.9}"
    warning-text: "{colors.warning.11}"
    danger-bg: "{colors.danger.3}"
    danger-border: "{colors.danger.7}"
    danger-solid: "{colors.danger.9}"
    danger-text: "{colors.danger.11}"

  # Shadow tint — used by elevation tokens at low alpha
  shadow_tint: "{colors.neutral.12}"

  # Browser UI integration
  theme_color_meta: "{colors.surface.canvas}"   # <meta name="theme-color"> matches page background
  css_color_scheme: "{mode.primary}"            # set `color-scheme: light|dark` on <html> for native scrollbar contrast

# ═══════════════════════════════════════════════════════════════
# TYPOGRAPHY (research §D)
# ═══════════════════════════════════════════════════════════════

typography:
  families:
    display: "Manrope"  # his call 2026-11-14: "lets try manrope as defauly" (trial; system SF Pro was his earlier ask); bold, tight tracking
    body: "Manrope"  # his call 2026-11-14 (trial); tabular figures for numbers
    mono: "Geist Mono"  # draft

  # ── Fallback stacks ────────────────────────────────────────────
  # Each custom font resolves to "<family>, <matching fallback>" in generated CSS.
  # The fallback renders instantly while the custom font loads — and if the
  # custom font fails entirely (CDN outage, blocked, slow connection), the
  # site still looks coherent.
  fallbacks:
    sans: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    serif: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif"
    mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace"

  # Assign a fallback category to each family. Override only if your custom
  # font is a different category than the default assignment.
  fallback_assignments:
    display: "sans"   # "sans" | "serif" — set to "serif" if display is a serif face
    body: "sans"      # usually matches display
    mono: "mono"      # always "mono"

  # ── Font loading strategy ──────────────────────────────────────
  # Minimizes CLS (Cumulative Layout Shift — a Core Web Vital).
  loading:
    font_display: "swap"
    # ^ Show fallback immediately; swap to custom when loaded.
    #   Alternatives: "optional" (skip custom if not cached after 100ms — best for body),
    #   "block" (block render up to 3s — avoid; hurts LCP).
    preload_strategy: "Preload ONLY critical above-the-fold weights — typically body 400 + display 600. Each <link rel='preload'> adds a connection; preloading every weight is an anti-pattern."
    metric_overrides: "On @font-face, add ascent-override + descent-override + line-gap-override + size-adjust matched to the assigned fallback stack. This makes the fallback render at exactly the custom font's metrics so swapping causes ZERO layout shift. Generate values via fontsource.org (each font has them) or Font Style Matcher (https://meowni.ca/font-style-matcher)."
    subset: "When self-hosting, subset to the Latin glyphs you actually use. Default: latin + latin-ext for ~80% of Western brands. Cyrillic/Greek/CJK add 200-500KB each — load only if your audience needs them (declare via unicode-range on @font-face)."

  # 8 semantic roles. Sizes shown for ratio=1.200 (balanced profile).
  # Use clamp() for fluid sizing across viewport widths.
  # Re-derive sizes if a different type_scale profile is chosen.
  roles:
    display-2xl:
      size: "clamp(2.5rem, 1.5rem + 4vw, 4rem)"    # 40 → 64 px
      weight: "{options.heading_weight}"             # 600 by default
      line_height: 1.05
      letter_spacing: "-0.03em"
      font_family: "{typography.families.display}"
    display-xl:
      size: "clamp(2rem, 1.25rem + 3vw, 3rem)"     # 32 → 48 px
      weight: "{options.heading_weight}"
      line_height: 1.1
      letter_spacing: "-0.025em"
      font_family: "{typography.families.display}"
    display-lg:
      size: "clamp(1.75rem, 1.25rem + 1.5vw, 2.25rem)"  # 28 → 36 px
      weight: "{options.heading_weight}"
      line_height: 1.1
      letter_spacing: "-0.02em"
      font_family: "{typography.families.display}"
    heading-md:
      size: "1.5rem"   # 24 px
      weight: "{options.heading_weight}"
      line_height: 1.2
      letter_spacing: "-0.015em"
      font_family: "{typography.families.display}"
    heading-sm:
      size: "1.25rem"  # 20 px
      weight: "{options.heading_weight}"
      line_height: 1.25
      letter_spacing: "-0.01em"
      font_family: "{typography.families.display}"
    body-lg:
      size: "1.125rem" # 18 px
      weight: 400
      line_height: 1.55
      letter_spacing: "0"
      font_family: "{typography.families.body}"
    body-md:
      size: "1rem"     # 16 px — base
      weight: 400
      line_height: 1.5
      letter_spacing: "0"
      font_family: "{typography.families.body}"
    body-sm:
      size: "0.8125rem" # 13 px
      weight: 400
      line_height: 1.4
      letter_spacing: "0.005em"
      font_family: "{typography.families.body}"
    label-sm:
      size: "0.875rem" # 14 px
      weight: 500
      line_height: 1.0
      letter_spacing: "0"
      font_family: "{typography.families.body}"
    overline:
      size: "0.75rem"  # 12 px
      weight: 600
      line_height: 1.0
      letter_spacing: "0.08em"
      text_transform: "uppercase"
      font_family: "{typography.families.body}"

  # HTML → role default mapping. Override per context as needed.
  html_mapping:
    marketing:
      h1: "display-2xl"
      h2: "display-lg"
      h3: "heading-md"
      h4: "heading-sm"
      p: "body-md"
      lead_p: "body-lg"
    product:
      h1: "display-lg"
      h2: "heading-md"
      h3: "heading-sm"
      h4: "label-sm"
      p: "body-md"
      lead_p: "body-md"
    universal:
      label: "label-sm"
      caption: "body-sm"
      kbd: "body-sm"
      code: "body-sm"   # rendered in mono

  # Font feature settings applied per role
  font_features:
    body: "'kern' 1, 'liga' 1, 'ss01' 1"
    tabular: "'tnum' 1, 'lnum' 1"
    display: "'ss02' 1, 'calt' 1"

  measure_max_ch: 65  # max-width for body text containers

  # Premium published craft details (industry-standard typographic conventions)
  craft:
    quotes: "typographic"          # use “ ” (curly), never " " (straight)
    ellipsis: "…"                  # use the ellipsis character, never three periods
    units_use_nbsp: true           # "10 MB" / "⌘ K" use non-breaking space (`&nbsp;`)
    rag_target: "balanced"         # avoid widows/orphans in headlines and body
    optical_alignment_tolerance_px: 1  # adjust ±1 px when perception beats geometry

# ═══════════════════════════════════════════════════════════════
# SPACING — 4 px base, 18-step scale. Hardcoded. (research §E)
# ═══════════════════════════════════════════════════════════════

spacing:
  base: 4
  unit: "px"
  scale:
    "0":   0
    "0.5": 2
    "1":   4
    "1.5": 6
    "2":   8
    "3":   12
    "4":   16
    "5":   20
    "6":   24
    "8":   32
    "10":  40
    "12":  48
    "16":  64
    "20":  80
    "24":  96
    "32":  128
    "40":  160
    "48":  192

  # Density multiplier (applied to between-component spacing only)
  density_multipliers:
    compact: 0.75
    comfortable: 1.0
    spacious: 1.25

  # Common role conventions
  roles:
    text_to_icon_inline: "{spacing.scale.2}"
    label_to_input: "{spacing.scale.2}"
    input_to_helper: "{spacing.scale.1.5}"
    within_card_compact: "{spacing.scale.6}"
    within_card_default: "{spacing.scale.8}"
    between_cards_default: "{spacing.scale.4}"
    container_padding_mobile: "{spacing.scale.4}"
    container_padding_desktop: "{spacing.scale.6}"

# ═══════════════════════════════════════════════════════════════
# SHAPES (RADIUS) (research §G)
# ═══════════════════════════════════════════════════════════════

radius:
  scale:
    none: 0
    sm:   8
    md:   12
    lg:   18     # flat cards
    xl:   22
    "2xl": 28
    full: 9999
  # Per-component assignments resolved by profile.
  # Default profile assignments shown:
  components:
    button: "{radius.scale.full}"   # pill buttons everywhere; icon buttons are circles
    input:  "{radius.scale.md}"     # sharp→sm, soft→md, pill→md
    card:   "{radius.scale.lg}"     # 18px; inner photos follow concentric corners (outer radius minus inset)
    modal:  "{radius.scale.xl}"     # sharp→lg, soft→2xl, pill→2xl
    badge:  "{radius.scale.sm}"     # sharp→sm, soft→md, pill→full
    chip:   "{radius.scale.full}"
    avatar: "{radius.scale.full}"   # overridden by options.avatar_shape
    tooltip: "{radius.scale.md}"
    code_inline: "{radius.scale.sm}"
    code_block: "{radius.scale.lg}"

# ═══════════════════════════════════════════════════════════════
# ELEVATION & DEPTH (research §H)
# ═══════════════════════════════════════════════════════════════

elevation:
  # Layered shadow specs (light mode). Each level = key + ambient.
  # Tint via {colors.shadow_tint} (= colors.neutral.12 by default).
  # Profile applies multiplier: flat = use border instead, dimensional = +1 opacity step.
  scale:
    "0": "none"
    "1": "0 1px 2px oklch(0.22 0.01 255 / 0.08)"   # Sidestash chip shadow (top bar round buttons)
    "2": "0 1px 2px oklch(0.22 0.01 255 / 0.08), 0 10px 28px -6px oklch(0.22 0.01 255 / 0.14)"   # floating: bottom nav bar
    "3": "0 4px 8px 0 oklch(from {colors.shadow_tint} l c h / 0.06), 0 8px 16px 0 oklch(from {colors.shadow_tint} l c h / 0.10)"
    "4": "0 8px 16px 0 oklch(from {colors.shadow_tint} l c h / 0.08), 0 16px 32px 0 oklch(from {colors.shadow_tint} l c h / 0.12)"
    "5": "0 16px 32px 0 oklch(from {colors.shadow_tint} l c h / 0.10), 0 32px 64px 0 oklch(from {colors.shadow_tint} l c h / 0.16)"

  # Per-component default assignments
  components:
    card: "{elevation.scale.0}"   # flat cards: no shadow (his decision 2026-11-14)
    dropdown: "{elevation.scale.2}"
    popover: "{elevation.scale.2}"
    tooltip: "{elevation.scale.3}"
    modal: "{elevation.scale.4}"
    sheet: "{elevation.scale.4}"
    fullscreen: "{elevation.scale.5}"

# ─── SURFACE SEPARATION (how cards / panels / popovers stand apart from the canvas) ───
# `profiles.elevation` picks the preset (flat → border, default → subtle shadow, dimensional → richer
# shadow); the knobs below are the granular override. All premium-bounded — see body §Surface separation.
surface_separation:
  strategy: "surface-tone"    # his decision 2026-11-14: flat elements separate by tone only; only the nav bar, top bar buttons and camera get the Sidestash finish | shadow | border | surface-tone | shadow+border — the ONE primary strategy (never all three)
  shadow_strength: "default"  # subtle (×0.7 alpha) | default (×1.0) | strong (×1.4) — multiplies each elevation layer's opacity
  shadow_size: "default"      # tight (×0.85 blur+offset) | default (×1.0) | airy (×1.2) — multiplies shadow blur + offset
  border_width: 0.5           # his ask: "normal hairlines" (one device pixel on retina) | 1 | 1.5 | 2 (px) — stroke thickness when the strategy uses a border (system ceiling = 2px)
  hover: "none"               # flat: hover lightens the fill slightly instead of lifting | lift (raise one elevation level) | border (darken to border.strong) | none
                              #   applied only under @media (hover: hover) and (pointer: fine); touch gets :active (§Input modality)

# ─── Z-INDEX ───

z_index:
  base: 0
  dropdown: 1000
  sticky: 1100
  fixed: 1200
  overlay: 1300
  modal: 1400
  popover: 1500
  tooltip: 1600

# ═══════════════════════════════════════════════════════════════
# MOTION (research §I)
# ═══════════════════════════════════════════════════════════════

motion:
  duration:
    instant: "100ms"
    fast: "150ms"
    base: "200ms"
    slow: "300ms"
    deliberate: "500ms"

  easing:
    standard: "cubic-bezier(0.22, 1, 0.36, 1)"   # the one easing for presses and fades # draft
    emphasized: "cubic-bezier(0.2, 0, 0, 1)"
    decelerate: "cubic-bezier(0, 0, 0, 1)"
    accelerate: "cubic-bezier(0.3, 0, 1, 1)"

  spring:
    # THE spring. One value for every slide, settle, pop, rotation, gooey move and button release (his asks 2026-11-14: "subtle
    # spring ... consistently translated for each", then "make the overall consistent spring and goo effect subtler").
    # Damping ratio ~0.81, ~1.3% overshoot: settles with a hint of life, no visible bounce.
    default: { stiffness: 300, damping: 28, mass: 1 }
    # The same spring sampled for CSS, so CSS-only presses release on the identical curve (duration 620ms):
    css_linear: "linear(0, 0.042, 0.138, 0.262, 0.393, 0.518, 0.627, 0.723, 0.802, 0.863, 0.911, 0.947, 0.973, 0.990, 1.001, 1.008, 1.012, 1.013, 1.013, 1.011, 1.010, 1.008, 1.007, 1.005, 1.004, 1.003, 1.002, 1.001, 1)"
    css_duration: "500ms"

  goo:
    # THE goo (liquid-gooey). One setting for every liquid surface: sliding selections (tab capsule, segmented pill), the food
    # button menu, slider thumbs. Subtle: a short bridge, a small stretch. (his ask: "subtle goo consistently translated for each")
    blur: 5
    contrast: 18
    follow: "observe"   # the liquid follows its element exactly. NEVER effect="move" (its trailing second spring stacks on THE
                        # spring and made the slider and tab pills feel gooier and bouncier than the food button; fixed 2026-11-14
                        # after his report: "the main button and the slider feel like they have different goo and spring")
    rule: "one spring drives every goo surface (motion.spring.default); goo shows only where shapes split, merge or bridge"
    transition: "{motion.spring.default}"
    where: ["tab bar active capsule", "segmented control pill", "food button split menu", "slider thumbs"]
    never: ["cards", "text", "photos", "anything that does not move or merge"]

  state_change:
    # THE default for any state change (his ask: "when states change i really want the default to be blur + fade in/out/morph"):
    # outgoing blurs out, fades and shrinks a little; incoming blurs in from the same; scale and rotation ride the spring.
    # his asks 2026-11-14: "i dont like this coming in animation anywhere, can you make it a cheap smooth blur/fade in/out".
    # Blur + fade only, out and in; no scale, no slide. Small items (icons, numbers, labels) 4px; blocks (lists, results, steps) 2px,
    # out 100ms then in 160ms. The food icon keeps its 90 degree turn on the spring (his earlier ask).
    out: { opacity: 0, blur_px: 4 }
    block_out: { opacity: 0, blur_px: 2 }
    in: { opacity: 1, blur_px: 0 }
    fade: { duration: "220ms", easing: "{motion.easing.standard}" }
    rotate: "{motion.spring.default}"   # food icon only
    icon_swap_rotation_deg: 90      # e.g. food icon to X on the food button
    at_rest: "filter: none (never leave a blur(0) filter on an element)"

  press:
    # his ask 2026-11-14: "when pressing buttons just make it normal, no expand or compress or anything like that".
    # A plain iOS highlight: the pressed control dims to 60% opacity while held (120ms). No scale on press, ever.
    pressed_opacity: 0.6
    duration: "120ms"
    scale: "none"

  page_transition:
    # his rule 2026-11-14 (supersedes the 180ms crossfade from earlier the same day): "dont animate the ui coming in on page
    # selection, everything should be static". Opening a page shows it in place: no fade, no blur-in, no count-up. Motion is only
    # for changes the student makes on the screen (switch meal, pick a dish, open the food button).
    type: "none"
    entry_animations: "none (Appear and numbers render in place while a screen opens; ScreenClock in src/components/ui/motion.tsx)"

  # Profile modifiers
  profile_modifiers:
    subtle:    { duration_multiplier: 0.85, stagger_ms: 30, prefer_springs: false }
    default:   { duration_multiplier: 1.0,  stagger_ms: 50, prefer_springs: true }
    expressive: { duration_multiplier: 1.15, stagger_ms: 70, prefer_springs: true }

  # Reduced-motion replacements
  reduced_motion:
    transform_animations: "disable"
    opacity_animations: "preserve"
    parallax: "disable"
    auto_advance_carousels: "disable"
    spring_to_bezier: true

# ═══════════════════════════════════════════════════════════════
# STATES
# ═══════════════════════════════════════════════════════════════

states:
  list: ["default", "hover", "focus", "focus-visible", "active", "pressed", "disabled", "loading", "selected", "error", "success"]

  focus_ring:
    width: 2
    offset: 2
    color: "{colors.primary.8}"
    transition: "{motion.duration.fast} {motion.easing.standard}"

  transitions:
    default_to_hover: { duration: "{motion.duration.fast}", easing: "{motion.easing.standard}" }
    hover_to_default: { duration: "{motion.duration.fast}", easing: "{motion.easing.standard}" }
    to_pressed:       { duration: "{motion.duration.instant}", easing: "{motion.easing.standard}" }
    pressed_to_release: { duration: "{motion.duration.fast}", easing: "{motion.easing.decelerate}" }
    to_focus_visible: { duration: "{motion.duration.fast}", easing: "{motion.easing.standard}" }
    to_disabled:      { duration: "{motion.duration.base}", easing: "{motion.easing.standard}" }

  disabled_tokens:
    background: "{colors.neutral.3}"
    text: "{colors.neutral.8}"
    border: "{colors.neutral.6}"
    cursor: "not-allowed"
    # NEVER use opacity to derive disabled state.

  # Touch-action: prevent double-tap-zoom on all tappable elements
  touch_action: "manipulation"

  # Loading-state visibility rules (prevents flicker / micro-flash)
  loading_visibility:
    show_delay_ms: [150, 300]      # don't show spinner / skeleton if action completes < 150 ms
    minimum_visible_ms: [300, 500] # once shown, keep visible at least 300 ms to avoid flicker

  # Performance budgets (as design constraints — anything slower needs explicit loading state)
  perf:
    mutation_request_max_ms: 500   # POST/PATCH/DELETE — beyond this, design a loading state
    # Core Web Vitals (LCP, INP, CLS), frame-time p95 and long-task limits are NOT restated here.
    # QA.md owns every numeric performance budget; read them there, never copy them into this file.
    budgets: "per QA.md gates.performance and gates.performance.runtime"

# ═══════════════════════════════════════════════════════════════
# EFFECTS & PERFORMANCE (research §I.14 runtime performance; research §F.5 viewport matrix, iOS Safari)
# ═══════════════════════════════════════════════════════════════
# Every visual effect (blur, glass, shader, canvas, parallax, scroll-linked motion) is picked from
# the cost ladder, registered below, and measured before it ships (QA.md Gate B2). The numbers live
# in QA.md; this block holds the rules and the per-project registry. See body §Effects & performance.

effects:
  # Cost ladder, cheapest first. Use the cheapest tier that reaches the look at full quality; going
  # up a tier needs a written `why_not_cheaper` in the registry.
  ladder:
    "0": "CSS transform + opacity (compositor only: CSS transitions/animations, WAAPI, scroll/view timelines)"
    "1": "CSS filter, clip-path, mask-position, SVG (paint or raster cost on the frames it changes)"
    "2": "backdrop-filter (re-samples everything behind the layer on every frame anything under it moves)"
    "3": "canvas 2D (main-thread draw loop)"
    "4": "WebGL / shaders / 3D (GPU context, texture upload, shader compile)"

  blur_budget:
    # MUST, a default for every screen (his rule 2026-11-14, "this is very important make sure any blur you use is cheap and not
    # perforamnce heavy. log this as a defualt and a must"). Any new blur is checked against this before it ships.
    backdrop_filter_layers_per_edge_max: 3      # scroll edges: Magic UI banded progressive blur, cheap (2, 4, 8px); never more
    backdrop_filter_layers_per_screen_max: 6    # top edge + bottom edge
    backdrop_blur_radius_max_px: 8
    animate_blur_radius: "never"                # a backdrop blur radius never animates
    opaque_surfaces: "never carry a backdrop blur"   # an opaque nav bar or card gains nothing from it and still pays for it
    filter_blur: "only for state changes, only on small elements (icons, labels, chips), max 4px, only during the 220ms change; filter none at rest"
    launch_splash_exception: "one full-screen backdrop blur of 12px for about 1 s at a full page load only (his asks 2026-11-14: blur the app while the icon draws, then \"make the blur during loading a bit heavier\", \"per the deisgn.md\"); radius fixed, only opacity animates; removed from the DOM after; the only blur allowed past 8px"
    never_blur: ["photos", "full screens", "lists", "anything while it scrolls"]
    svg_goo_blur: "liquid-gooey only, on small moving pieces; it sleeps when idle"
    reduced_transparency: "remove every backdrop blur, keep the color fade"
    verify: "QA Gate B2 frame-time p95 on a phone before ship; if over budget, drop to the color fade first"

  limits:
    budgets: "per QA.md gates.performance and gates.performance.runtime"           # QA.md gates.performance.runtime: frame_p95_ms_max_120hz / _60hz,
                                               #   long_task_ms_max, webgl_contexts_max, backdrop_filter_layers_max
    webgl_contexts_per_effect_max: 1           # one context per effect at most; share one context across effects or cap the page total at QA.md webgl_contexts_max
    continuous_loops_per_viewport_max: 1       # at most one continuously running animation or render loop in view at once
    pause_offscreen: true                      # IntersectionObserver stops rAF, canvas, shader and video loops out of view
    pause_when_hidden: true                    # visibilitychange stops every loop while the tab is hidden

  adaptive_quality:
    default_quality: "high"         # high | medium | low. The quality set up front and measured on the QA.md gates.viewport_matrix
                                    #   devices; the page ships at this quality, never pre-degraded "just in case"
    governor: "measured"            # measured | off. Steps down ONLY on measured, sustained frame misses (frame-time p95
                                    #   over the QA.md budget across a sustained window), never on a user-agent,
                                    #   device-name, core-count or memory guess
    step_down_order:                # cheapest visual loss first
      - "cap the effect's render resolution / device-pixel ratio"
      - "merge or remove stacked blur layers"
      - "swap the tier 3-4 effect for its registered fallback"
    step_up: "never within the same page view"   # prevents oscillating quality
    respects: ["prefers-reduced-motion", "prefers-reduced-transparency", "save-data"]

  # One entry per effect in the build. SPEC.md sections reference these entries by `name`.
  # An effect without an entry, a fallback, a reduced-motion path and a measured result does not ship.
  registry:
    - id: scroll-edge-blur
      what: "iOS-style soft scroll edge: progressive blur plus a fade to the page color at the top (under the status bar) and bottom (under the tab bar) of every scrolling screen"   # his ask 2026-11-14
      tier: 2
      how: "Magic UI progressive blur, cloned cheap (his ask): 3 backdrop-filter layers per edge (2, 4, 8px), each masked to an overlapping band so blur steps up toward the edge; plus an eased fade of the content itself (mask-image on the scroller, down to ~35% opacity), so the background is never touched; behind the sticky top bar and nav bar, above content"
      fallback: "no edge (content scrolls under the chrome unblurred)"
      reduced: "prefers-reduced-transparency: no edge"
      measured: "not yet (QA Gate B2 before ship)"
    - id: gooey-liquid
      what: "liquid-gooey 0.2.2 (MIT, no deps): pieces merge and split like liquid, text and icons stay crisp"   # his ask: subtle and consistent
      tier: 1
      how: "SVG goo filter on a silhouette layer under live DOM; the food button splits into Log a plate and Ask SlugGrub. The Liquid element's own box must hold every piece wherever it travels: WebKit (every iPhone browser) clips the goo layer to that box and ignores overflow visible, so filterPadding cannot reach outside it (2026-11-15; replaces the 2026-11-14 rule of an 84px filterPadding). filterPadding is 0 everywhere; shadows on a goo surface are plain drop shadows (no spread, composited on the GPU) plus inset sheens"
      fallback: "plain spring move without goo"
      reduced: "prefers-reduced-motion: instant, no goo travel"
      measured: "not yet (QA Gate B2 before ship)"
    - id: processing-beam
      what: "a blue glow riding the edge of the plate photo (its own 24px corners) while Log reads it, camera or demo plate; fades out when the answer or an error arrives"   # his asks 2026-11-15: after libraries.dev/beam, then "put the border beam just around the image ... also make it blue themed colors" (was the whole app frame, rainbow)
      tier: 1
      color: "the app's blues only (2026-11-15, his ask): OKLCH L 0.66 C 0.17, hue sweeping 215 to 265 around the primary, two brighter beams opposite each other. The earlier rainbow color exception is withdrawn."
      how: "own build, not the border-beam package (1.4.1, MIT, ~14 KB gzip; it runs a 30 fps rAF loop and animates conic gradients and blur filters, so a screen-sized ring repaints every frame): the colors are drawn once into a 256px canvas shown at 150vmax and rotated by a CSS transform animation (3.6 s a turn, compositor only); a static SVG mask drawn once per size cuts it to a 2.5px ring plus a soft glow about 15px deep (the glow's blur is inside the mask image, never animated); opacity fade in and out (0.45 s); removed from the DOM after. src/components/screens/ProcessingBeam.tsx"
      fallback: "no beam; the status card still says what is happening"
      reduced: "prefers-reduced-motion: the same glow, still"
      measured: "2026-11-15, dev server, 393x852 @3x: Chromium and Playwright WebKit both 0 frames over 20 ms while it runs (p95 16.7 / 18 ms); on a real iPhone not yet"
    - id: thinking-orb
      what: "Ask SlugGrub's thinking orb on the action line: a 20px dotted globe in the primary blue (--p9) that turns while Gemini works, each step with its own motion (reading slow, searching steady, solving bands turning against each other, composing an undulating sash, working quick)"   # his ask 2026-11-15, cloned from his Chalk app
      tier: 0
      how: "30 dots on five latitude rings, seen from 24 degrees above; each dot only slides along its ring while its depth sets its scale and opacity, as one Web Animation per dot (transform + opacity, compositor only, no canvas, no filter, no layout). A step change sets each ring's playbackRate in place (no restart). Technique ported from Chalk's dotted orb (thinking-orbs, a canvas 2D loop), rebuilt at tier 0 instead of adding the package. src/components/ui/ThinkingOrb.tsx"
      fallback: "the action line's words alone"
      reduced: "prefers-reduced-motion: a still frame of the same globe"
      measured: "2026-11-15, dev server, 393x852, a recorded Gemini answer replayed (orb, sweep, word fades, picks, line closing): Playwright WebKit p95 18 ms, 5 of 678 frames over 20 ms; Chromium p95 16.8 ms, 1 of 676; on a real iPhone not yet"
  # Example entry (copy into the list above; values are illustrative):
  # registry:
  #   - name: "hero-water-ripple"                 # SPEC.md references the effect by this name
  #     tier: 4                                   # effects.ladder step
  #     why_not_cheaper: "refraction of the photo under the pointer cannot be faked with transform or filter"
  #     fallback: "static photo with a CSS radial highlight (tier 0-1)"
  #     reduced_motion: "static photo, no ripple; the pointer does nothing"
  #     measured_p95_ms: 6.1                      # frame-time p95 measured per QA.md Gate B2 on the devices below
  #     devices: ["120 Hz iPhone or iPad, Safari (ProMotion)"]   # each QA.md gates.performance.runtime.devices entry measured

# ═══════════════════════════════════════════════════════════════
# ICONOGRAPHY
# ═══════════════════════════════════════════════════════════════

icons:
  family: "Hugeicons (free Stroke Rounded set)"  # his call 2026-11-14: "for icons we use hugeicons" (same family as Chalk); @hugeicons/react + @hugeicons/core-free-icons
  library: "hugeicons"
  fill_style: "{options.icon_fill}"     # outline | filled
  sizes:
    xs: 12
    sm: 16
    md: 20
    lg: 24
    xl: 32
    "2xl": 48
  stroke_weight_by_text_weight:
    "400": 1.5
    "500": 1.5
    "600": 1.75
    "700": 2.0
  optical_alignment_offset_px: -1   # icons sit 1 px above cap-height baseline by default

# ═══════════════════════════════════════════════════════════════
# IMAGERY (research §L)
# ═══════════════════════════════════════════════════════════════

images:
  aspect_ratios:
    square: "1 / 1"
    portrait: "4 / 5"
    landscape: "3 / 2"
    video: "16 / 9"
    wide: "21 / 9"
    classic: "4 / 3"

  formats:
    preferred: ["avif", "webp", "jpg"]
    fallback_jpg_quality: 82
    fallback_webp_quality: 80
    fallback_avif_quality: 65

  loading:
    above_fold_eager_count: 5
    lazy_default: true
    fetchpriority_high_per_page: 1   # exactly one image gets fetchpriority="high"
    decode_before_reveal: true       # await img.decode() (or the load event) before fading an image in, so a
                                     #   reveal never shows a half-decoded or blank frame
    prefetch_queue:                  # offscreen gallery / carousel / next-section images, on EVERY device class
      enabled: true
      warm_ahead: 6                  # warm the next few images ahead of the viewport, a few at a time
      decode_on_arrival: true        # decode each one as it lands, not when it scrolls into view
      skip_on_save_data: true        # navigator.connection.saveData or prefers-reduced-data: no warm-up
      never_blocks_lcp: true         # the queue starts after the LCP image has loaded

  video:
    preload: "metadata"              # never "auto" for anything below the fold
    poster_required: true            # a poster frame, encoded like any image, so nothing flashes black
    autoplay: "muted playsinline, only while in view"   # IntersectionObserver plays and pauses it
    pause_offscreen: true
    reduced_motion: "show the poster, no autoplay; offer a play control"

  cache:
    file_names: "content-hashed or versioned"   # e.g. hero.3f9a2c.avif or hero-v2.avif
    replace_in_place: false          # never replace an asset under the same file name; a changed image gets a
                                     #   new name so every cache (browser, CDN, image optimizer) misses cleanly

  placeholders:
    above_fold: "skeleton"
    feed: "blurhash"
    avatar: "initials-svg"

  illustration_style: "{options.illustration_style}"
  photography_style: "<descriptor — e.g., 'natural light, real people, no stock-photo headsets'>"

# ═══════════════════════════════════════════════════════════════
# DENSITY & RESPONSIVE (research §F layout, breakpoints, safe areas; §M density, responsive)
# ═══════════════════════════════════════════════════════════════

density:
  mode: "{profiles.density}"
  multipliers:
    compact: 0.75
    comfortable: 1.0
    spacious: 1.25

touch_targets:
  pointer_min_px: 24       # WCAG 2.5.8 AA
  touch_min_px: 44         # WCAG 2.5.5 AAA / mobile premium
  pointer_recommended_px: 36
  spacing_between_targets_px: 12

breakpoints:
  xs: 0
  sm: 640
  md: 768
  lg: 1024
  xl: 1280
  "2xl": 1536
  "3xl": 2560   # ultra-wide / 4K — content CAPS + centers here (see §Breakpoints), never stretches
  # Width breakpoints are NOT device classes. A phone in landscape (667-932 px wide) lands in md; an
  # iPad in landscape lands in xl. Layouts that must behave per device use orientation, pointer, hover
  # and height queries on top of width, and every layout is defined for every QA.md gates.viewport_matrix class
  # (see body §Breakpoints and research §F.5).

containers:
  prose: "65ch"
  sm: 768
  md: 1024
  lg: 1280
  xl: 1440
  full: "100%"
  default: "lg"   # = 1280 px; overridden by options.container_width

grid:
  desktop:
    columns: 12
    gutter: "{spacing.scale.6}"   # 24 px
  tablet:
    columns: 8
    gutter: "{spacing.scale.5}"   # 20 px
  mobile:
    columns: 4
    gutter: "{spacing.scale.4}"   # 16 px

# Section vertical padding profile resolution, px, defined for every device class. Mapping to
# QA.md gates.viewport_matrix: mobile = phone_portrait + phone_landscape · tablet = tablet_portrait +
# tablet_landscape · desktop = laptop_short + desktop below 2xl (1536) · wide = desktop at 2xl and up
# (content still caps and centers; only the padding grows). Every value is a spacing.scale step.
section_padding:
  hero:
    compact:  { desktop: 96,  mobile: 64, tablet: 80,  wide: 128 }
    default:  { desktop: 128, mobile: 80, tablet: 96,  wide: 160 }
    generous: { desktop: 160, mobile: 96, tablet: 128, wide: 192 }
  major:
    compact:  { desktop: 80,  mobile: 48, tablet: 64,  wide: 96 }
    default:  { desktop: 96,  mobile: 64, tablet: 80,  wide: 128 }
    generous: { desktop: 128, mobile: 80, tablet: 96,  wide: 160 }
  cta:
    compact:  { desktop: 96,  mobile: 64, tablet: 80,  wide: 128 }
    default:  { desktop: 128, mobile: 80, tablet: 96,  wide: 160 }
    generous: { desktop: 160, mobile: 96, tablet: 128, wide: 192 }
  footer_top:
    compact:  { desktop: 64,  mobile: 48, tablet: 48,  wide: 80 }
    default:  { desktop: 96,  mobile: 64, tablet: 80,  wide: 128 }
    generous: { desktop: 128, mobile: 80, tablet: 96,  wide: 160 }

# ═══════════════════════════════════════════════════════════════
# ACCESSIBILITY
# ═══════════════════════════════════════════════════════════════

a11y:
  contrast:
    body_text_apca_min: 75
    fine_print_apca_min: 60
    ui_text_apca_min: 75
    non_text_apca_min: 30
    wcag_normal_text_min: "4.5:1"
    wcag_large_text_min: "3:1"
  focus_visible_required: true
  min_text_sizes:
    web_desktop: 14
    web_mobile: 16   # iOS auto-zoom guard
  preference_media_queries:
    - "prefers-color-scheme"
    - "prefers-reduced-motion"
    - "prefers-reduced-transparency"
    - "prefers-contrast"
    - "forced-colors"

# ═══════════════════════════════════════════════════════════════
# COMPONENTS (atoms + molecules)
# ═══════════════════════════════════════════════════════════════
# Each component declares: sizes, padding, radius, typography role, state styling.
# State styling references the global focus_ring + transitions defined above.

components:

  # ─── Button ───
  button:
    sizes:
      sm: { height: 32, padding_x: 12, padding_y: 6,  type: "label-sm", icon: "{icons.sizes.sm}", radius: "{radius.scale.md}", icon_gap: "{spacing.scale.2}" }
      md: { height: 40, padding_x: 16, padding_y: 10, type: "label-sm", icon: "{icons.sizes.md}", radius: "{radius.scale.md}", icon_gap: "{spacing.scale.2}" }
      lg: { height: 48, padding_x: 20, padding_y: 12, type: "body-md",  icon: "{icons.sizes.md}", radius: "{radius.scale.lg}", icon_gap: "{spacing.scale.3}" }
      xl: { height: 56, padding_x: 24, padding_y: 16, type: "body-lg",  icon: "{icons.sizes.lg}", radius: "{radius.scale.lg}", icon_gap: "{spacing.scale.3}" }
      icon_only:
        sm: { size: 32, radius: "{radius.scale.md}" }
        md: { size: 40, radius: "{radius.scale.md}" }
        lg: { size: 48, radius: "{radius.scale.lg}" }
    variants:
      primary:
        background: "{colors.primary.9}"
        text: "white"
        border: "none"
        hover_background: "{colors.primary.10}"
        pressed_background: "{colors.primary.11}"
      secondary:
        background: "{colors.neutral.3}"
        text: "{colors.text.primary}"
        border: "1px solid {colors.border.default}"
        hover_background: "{colors.neutral.4}"
        pressed_background: "{colors.neutral.5}"
      outline:
        background: "transparent"
        text: "{colors.text.primary}"
        border: "1px solid {colors.border.default}"
        hover_background: "{colors.neutral.3}"
        pressed_background: "{colors.neutral.4}"
      ghost:
        background: "transparent"
        text: "{colors.text.primary}"
        border: "none"
        hover_background: "{colors.neutral.3}"
        pressed_background: "{colors.neutral.4}"
      link:
        background: "transparent"
        text: "{colors.text.link}"
        border: "none"
        hover_text_decoration: "underline"
      destructive:
        background: "{colors.semantic.danger-solid}"
        text: "white"
        border: "none"
        hover_background: "{colors.danger.10}"
        pressed_background: "{colors.danger.11}"
    states:
      focus_visible: "{states.focus_ring}"
      disabled: "{states.disabled_tokens}"
      loading: { spinner: true, preserve_label_width: true, aria_busy: true }
    constraints:
      max_label_chars: 24
      max_primary_per_screen: 1

  # ─── Input (text/email/password/number/search) ───
  input:
    sizes:
      sm: { height: 32, padding_x: 10, padding_y: 6,  type: "body-sm", radius: "{radius.scale.md}" }
      md: { height: 40, padding_x: 12, padding_y: 10, type: "body-md", radius: "{radius.scale.md}" }
      lg: { height: 48, padding_x: 16, padding_y: 12, type: "body-md", radius: "{radius.scale.md}" }
    variants:
      outlined:
        background: "{colors.surface.canvas}"
        border: "1px solid {colors.border.default}"
        focus_border: "1px solid {colors.primary.8}"
        focus_ring: "0 0 0 2px oklch(from {colors.primary.8} l c h / 0.40)"
      filled:
        background: "{colors.surface.subtle}"
        border: "1px solid transparent"
        focus_border: "1px solid {colors.primary.8}"
        focus_ring: "0 0 0 2px oklch(from {colors.primary.8} l c h / 0.40)"
      underlined:
        background: "transparent"
        border: "none"
        border_bottom: "1px solid {colors.border.default}"
        focus_border_bottom: "2px solid {colors.primary.8}"
    states:
      hover_border: "{colors.border.strong}"
      error_border: "{colors.danger.8}"
      success_border: "{colors.success.8}"
      disabled:
        background: "{colors.neutral.2}"
        text: "{colors.text.disabled}"
        border: "{colors.border.subtle}"
    mobile_rules:
      min_font_size_px: 16   # prevents iOS auto-zoom

  textarea:
    extends: "input"
    overrides:
      min_height: 80
      padding: 12
      resize: "vertical"

  select:
    extends: "input"
    overrides:
      trailing_icon: "chevron-down"
      dropdown_menu: "{components.dropdown}"

  checkbox:
    sizes:
      sm: { box: 16, stroke: 1.5 }
      md: { box: 20, stroke: 1.5 }
    radius: "{radius.scale.sm}"
    label_gap: "{spacing.scale.2}"
    states:
      unchecked:    { background: "{colors.surface.canvas}", border: "{colors.border.default}" }
      hover:        { border: "{colors.border.strong}" }
      checked:      { background: "{colors.primary.9}", border: "{colors.primary.9}", checkmark: "white" }
      indeterminate: { background: "{colors.primary.9}", icon: "dash", icon_color: "white" }
      disabled:     { background: "{colors.neutral.3}", border: "{colors.border.subtle}", checkmark: "{colors.text.disabled}" }
      error:        { border: "{colors.danger.8}" }

  radio:
    sizes:
      sm: { outer: 16, inner: 6 }
      md: { outer: 20, inner: 8 }
    radius: "{radius.scale.full}"
    label_gap: "{spacing.scale.2}"
    states:
      unchecked: { background: "{colors.surface.canvas}", border: "{colors.border.default}" }
      checked:   { background: "{colors.primary.9}", border: "{colors.primary.9}", dot: "white" }
      disabled:  { background: "{colors.neutral.3}", border: "{colors.border.subtle}" }

  switch:
    sizes:
      sm: { track_w: 32, track_h: 18, thumb: 14 }
      md: { track_w: 44, track_h: 24, thumb: 20 }
    radius: "{radius.scale.full}"
    states:
      off:       { track: "{colors.neutral.6}", thumb_position: "start" }
      on:        { track: "{colors.primary.9}", thumb_position: "end" }
      hover_off: { track: "{colors.neutral.7}" }
      hover_on:  { track: "{colors.primary.10}" }
      disabled:  { track: "{colors.neutral.4}" }
    transition: "{states.transitions.default_to_hover}"

  slider:
    sizes:
      sm: { track_h: 4, thumb: 16 }
      md: { track_h: 6, thumb: 20 }
    track_color: "{colors.neutral.5}"
    filled_track_color: "{colors.primary.9}"
    thumb:
      background: "white"
      border: "1px solid {colors.border.default}"
      elevation: "{elevation.scale.1}"
    keyboard_step: 1
    keyboard_step_shift: 10

  badge:
    sizes:
      sm: { height: 20, padding_x: 8,  type: "body-sm", icon: "{icons.sizes.xs}" }
      md: { height: 24, padding_x: 10, type: "body-sm", icon: "{icons.sizes.sm}" }
      lg: { height: 28, padding_x: 12, type: "label-sm", icon: "{icons.sizes.sm}" }
    radius: "{radius.scale.sm}"
    variants:
      neutral:  { background: "{colors.neutral.3}", text: "{colors.text.secondary}" }
      primary:  { background: "{colors.primary.3}", text: "{colors.primary.11}" }
      success:  { background: "{colors.semantic.success-bg}", text: "{colors.semantic.success-text}" }
      warning:  { background: "{colors.semantic.warning-bg}", text: "{colors.semantic.warning-text}" }
      danger:   { background: "{colors.semantic.danger-bg}", text: "{colors.semantic.danger-text}" }
      solid_primary: { background: "{colors.primary.9}", text: "white" }

  chip:
    extends: "badge"
    overrides:
      radius: "{radius.scale.full}"
      includes_close_button: true

  avatar:
    shape: "{options.avatar_shape}"   # circle | squircle | rounded-square
    sizes: [16, 20, 24, 32, 40, 48, 56, 64, 80, 96]
    fallback:
      background_derivation: "hash_of_name"
      initials_count: 2
      initials_type: "label-sm"
      initials_weight: 600
    group_overlap_percent: 35
    group_ring_color: "{colors.surface.canvas}"

  divider:
    variants:
      hairline: { thickness: 1, color: "{colors.border.subtle}" }
      strong:   { thickness: 1, color: "{colors.border.default}" }

  tooltip:
    background: "{colors.neutral.12}"
    text: "{colors.text.inverse}"
    padding: "6px 10px"
    radius: "{radius.scale.md}"
    type: "body-sm"
    max_width: 240
    elevation: "{elevation.scale.2}"
    show_delay: "500ms"
    hide_delay: "100ms"
    position_default: "top"
    arrow: true

  label:
    type: "label-sm"
    color: "{colors.text.primary}"
    required_marker: { char: "*", color: "{colors.danger.11}", margin_left: 4 }

  helper_text:
    type: "body-sm"
    color: "{colors.text.secondary}"

  error_text:
    type: "body-sm"
    color: "{colors.danger.11}"
    leading_icon: { name: "alert-circle", size: 14 }

  skeleton:
    background: "{colors.neutral.3}"
    shimmer:
      enabled: true
      gradient: "linear-gradient(90deg, transparent, {colors.neutral.4}, transparent)"
      duration: "1.5s"
      easing: "linear"
    reduced_motion_fallback:
      shimmer: false

  # ─── Molecules ───

  card:
    padding: 32                         # space.8 default; compact density → 24
    radius: "{radius.components.card}"
    background: "{colors.surface.raised}"
    elevation: "{elevation.components.card}"
    border_or_elevation_only: "elevation"   # choose one separation strategy
    internal_gap: "{spacing.scale.4}"
    media_extends_to_edges: true
    interactive:
      hover_elevation: "{elevation.scale.2}"
      focus_visible: "{states.focus_ring}"
      cursor: "pointer"

  modal:
    backdrop: "{options.modal_backdrop}"   # scrim | blur
    backdrop_scrim: "oklch(from {colors.neutral.12} l c h / 0.50)"
    backdrop_blur: "backdrop-filter: blur(8px)"   # effects.ladder tier 2; counts toward QA.md backdrop_filter_layers_max.
                                                 #   Falls back to backdrop_scrim when over budget, when the governor
                                                 #   steps down, and under prefers-reduced-transparency. Under an open
                                                 #   modal, pause loops behind it so the blur re-samples a still page.
    container:
      background: "{colors.surface.overlay}"
      radius: "{radius.components.modal}"
      elevation: "{elevation.components.modal}"
      max_width_sm: 560
      max_width_md: 720
      max_width_lg: 960
      padding: 24
      header_height: 64
      header_title_type: "heading-md"
      header_close_icon_size: "{icons.sizes.lg}"
      footer_border_top: "1px solid {colors.border.subtle}"
      footer_action_gap: "{spacing.scale.3}"
    motion:
      enter:
        backdrop: { property: "opacity", duration: "{motion.duration.base}", easing: "{motion.easing.standard}" }
        container: { properties: ["opacity", "transform"], from: { opacity: 0, transform: "scale(0.96)" }, to: { opacity: 1, transform: "scale(1)" }, duration: "{motion.duration.slow}", easing: "{motion.easing.decelerate}" }
      exit:
        container: { properties: ["opacity", "transform"], to: { opacity: 0, transform: "scale(0.98)" }, duration: "{motion.duration.fast}", easing: "{motion.easing.accelerate}" }
    focus_trap: true
    close_on_esc: true
    close_on_backdrop_click: true   # unless declared as required

  toast:
    position: "{options.toast_position}"
    container:
      background: "{colors.surface.overlay}"
      radius: "{radius.scale.md}"
      padding: "12px 16px"
      elevation: "{elevation.scale.3}"
      width_min: 360
      width_max: 440
      mobile_width: "calc(100% - 32px)"
    leading_icon_size: "{icons.sizes.md}"
    type: "body-md"
    text_color: "{colors.text.primary}"
    auto_dismiss_ms:
      info: 5000
      success: 5000
      warning: 8000
      error: 0   # manual-dismiss only
    stack:
      direction: "vertical"
      newest_on: "top"
      gap: "{spacing.scale.2}"
    motion:
      enter: { type: "slide-fade", from_direction: "right", duration: "{motion.duration.base}" }
      exit: { type: "fade", duration: "{motion.duration.fast}" }
    pause_on_hover: true

  dropdown:
    container:
      background: "{colors.surface.overlay}"
      radius: "{radius.scale.lg}"
      elevation: "{elevation.scale.2}"
      border: "1px solid {colors.border.subtle}"
      padding: 4
      min_width: 160
      max_height: "60svh"            # svh, never bare vh (body §Viewport units & safe areas)
    item:
      height_compact: 32
      height_default: 36
      height_comfortable: 40
      padding: "8px 12px"
      type: "body-sm"
      text: "{colors.text.primary}"
      hover_background: "{colors.neutral.3}"
      active_background: "{colors.neutral.4}"
      selected_indicator: "leading-checkmark"
    section_label:
      type: "overline"
      color: "{colors.text.secondary}"
      padding: "4px 12px"
    separator:
      thickness: 1
      color: "{colors.border.subtle}"
      margin_y: 4
    motion:
      enter: { properties: ["opacity", "transform"], from: { opacity: 0, transform: "scale(0.96)" }, duration: "{motion.duration.fast}", easing: "{motion.easing.decelerate}" }
    close_on_outside_click: true

  tabs:
    style: "{options.tabs_style}"      # underline | filled
    height: 40
    padding: "12px 16px"
    type: "body-md"
    weight: 500
    text_default: "{colors.text.secondary}"
    text_hover: "{colors.text.primary}"
    text_selected: "{colors.text.primary}"
    underline_thickness: 2
    underline_color: "{colors.primary.9}"
    filled_selected_background: "{colors.surface.raised}"
    filled_unselected_background: "{colors.surface.subtle}"
    # One indicator element of fixed base width, moved with translateX and sized with scaleX
    # (transform-origin: left; inline-start in RTL). Never animate its width or left.
    indicator_motion: { properties: ["transform"], method: "translateX + scaleX", duration: "{motion.duration.base}", easing: "{motion.easing.standard}" }
    focus_visible: "{states.focus_ring}"

  accordion:
    border_top: "1px solid {colors.border.subtle}"
    border_bottom: "1px solid {colors.border.subtle}"
    collapse_adjacent_borders: true
    trigger:
      padding_y: 16
      type: "body-md"
      weight: 500
      chevron_size: "{icons.sizes.md}"
      chevron_rotate_on_open_deg: 180
    content:
      padding_bottom: 16
      type: "body-md"
    # Never animate height. Wrap the content in a grid and animate grid-template-rows 0fr -> 1fr (one
    # layout pass per frame on a contained subtree, acceptable for a single accordion item), or for long
    # or many items reveal with clip-path / a translateY of the content inside an overflow-clipped wrapper.
    motion: { properties: ["grid-template-rows", "opacity"], method: "grid 0fr->1fr (or clip-path reveal)", duration: "{motion.duration.base}", easing: "{motion.easing.standard}" }

  top_nav:
    height_desktop: 64
    height_mobile: 56
    background: "{colors.surface.canvas}"
    sticky_scroll_background: "oklch(from {colors.surface.canvas} l c h / 0.80)"
    sticky_scroll_backdrop: "backdrop-filter: blur(12px)"   # effects.ladder tier 2; counts toward QA.md backdrop_filter_layers_max
    sticky_scroll_backdrop_fallback: "oklch(from {colors.surface.canvas} l c h / 0.94)"   # near-solid surface, no blur: used when
                                                            #   over budget, when the adaptive-quality governor steps down, and
                                                            #   under prefers-reduced-transparency
    # iOS Safari: a full-width fixed/sticky bar touching the top or bottom screen edge can tint or
    # resize Safari's own toolbar and sits under it during toolbar collapse. Pad with
    # env(safe-area-inset-*) and test on a real touch device (research §F.5).
    padding_x_desktop: "{spacing.scale.6}"
    padding_x_mobile: "{spacing.scale.4}"
    logo_align: "start"
    nav_link_type: "label-sm"
    nav_link_color: "{colors.text.secondary}"
    nav_link_hover_color: "{colors.text.primary}"
    nav_link_active_color: "{colors.text.primary}"
    nav_link_active_indicator: "underline-2px"
    cta_align: "end"
    cta_gap: "{spacing.scale.3}"
    mobile_collapse: "hamburger-to-sheet"

  sidebar:
    width_default: 240
    width_collapsed: 64
    width_expanded: 280
    background: "{colors.surface.subtle}"
    border_inline_end: "1px solid {colors.border.subtle}"
    padding: "{spacing.scale.4}"
    section_gap: "{spacing.scale.6}"
    item:
      height: 36
      padding: "8px 12px"
      radius: "{radius.scale.md}"
      type: "body-sm"
      weight: 500
      default_background: "transparent"
      hover_background: "{colors.neutral.3}"
      active_background: "{colors.primary.3}"
      active_text: "{colors.primary.11}"
      active_indicator: "leading-3px-bar"
      icon_size: "{icons.sizes.md}"
      icon_gap: "{spacing.scale.3}"
    # Never animate width. The sidebar is laid out at width_default; collapsing slides it with
    # translateX (the 64 px rail stays visible) while the content column switches its inline-start
    # offset once, without animating it. Labels fade with opacity.
    collapse_motion: { properties: ["transform", "opacity"], method: "translateX of the panel + label fade", duration: "{motion.duration.base}", easing: "{motion.easing.standard}" }

  table:
    header:
      height: 40
      background: "{colors.surface.subtle}"
      type: "body-sm"
      weight: 600
      color: "{colors.text.secondary}"
      padding_x: 12
    body_row:
      height_compact: 40
      height_default: 48
      height_comfortable: 56
      padding: "12px 16px"
      type: "body-sm"
      border_bottom: "1px solid {colors.border.subtle}"
      hover_background: "{colors.neutral.2}"
      selected_background: "{colors.primary.3}"
      selected_indicator: "leading-3px-bar"
    numeric_columns: { font_features: "{typography.font_features.tabular}" }
    sticky_header_on_scroll: true

  form_group:
    layout: "stack"
    label_to_control_gap: 6
    control_to_helper_gap: 6
    required_marker: "{components.label.required_marker}"
    submission:
      enter_submits: true                # Enter submits when text input is sole / last control
      textarea_cmd_enter_submits: true   # ⌘/Ctrl+Enter submits textarea; Enter inserts newline
    validation:
      block_keystrokes: false            # allow any input; show errors as feedback
      error_placement: "adjacent_to_field"
      focus_first_error_on_submit: true
    autocomplete: "required_per_field"   # set autocomplete="email|new-password|..." attribute
    placeholder_pattern: "example_with_trailing_ellipsis"   # "name@example.com…" / "+1 (555) 000-0000…"

  pagination:
    item_size: 36
    item_gap: 8
    item_type: "body-sm"
    item_default_color: "{colors.text.secondary}"
    item_hover_background: "{colors.surface.subtle}"
    item_active_background: "{colors.primary.9}"
    item_active_text: "white"
    prev_next: "icon-button"

  breadcrumbs:
    type: "body-sm"
    color_default: "{colors.text.secondary}"
    color_current: "{colors.text.primary}"
    separator_char: "/"
    separator_color: "{colors.text.disabled}"
    separator_margin_x: 8

  banner:
    padding: "12px 16px"
    radius: "{radius.scale.md}"
    variants:
      info:    { background: "{colors.primary.3}",  text: "{colors.primary.11}",  icon_color: "{colors.primary.9}",  border: "{colors.primary.6}" }
      success: { background: "{colors.semantic.success-bg}", text: "{colors.semantic.success-text}", icon_color: "{colors.semantic.success-solid}", border: "{colors.success.6}" }
      warning: { background: "{colors.semantic.warning-bg}", text: "{colors.semantic.warning-text}", icon_color: "{colors.semantic.warning-solid}", border: "{colors.warning.6}" }
      danger:  { background: "{colors.semantic.danger-bg}",  text: "{colors.semantic.danger-text}",  icon_color: "{colors.semantic.danger-solid}",  border: "{colors.danger.6}" }
      neutral: { background: "{colors.surface.subtle}", text: "{colors.text.primary}", icon_color: "{colors.text.secondary}", border: "{colors.border.subtle}" }
    dismiss_icon: 16

  empty_state:
    container_max_width: 480
    illustration_size: [96, 160]
    title_type: "heading-sm"
    title_gap_above: "{spacing.scale.4}"
    body_type: "body-md"
    body_color: "{colors.text.secondary}"
    body_gap_above: "{spacing.scale.2}"
    cta_gap_above: "{spacing.scale.6}"
    vertical_padding: "{spacing.scale.16}"

  command_palette:
    enabled: "{options.command_palette}"
    trigger_shortcut: "cmd+k / ctrl+k"
    container:
      max_width: 560
      top_offset_vh: 15
      radius: "{radius.scale.xl}"
      elevation: "{elevation.scale.4}"
    header:
      search_input_height: 56
      search_input_border: "none"
      placeholder_type: "body-md"
    result_item:
      height: 40
      padding: "8px 12px"
      type: "body-md"
      leading_icon_size: "{icons.sizes.md}"
    section_label_type: "overline"
    keyboard_nav: true

# ═══════════════════════════════════════════════════════════════
# CODE & TECHNICAL SURFACES
# ═══════════════════════════════════════════════════════════════

code:
  inline:
    font_size_em: 0.9
    background: "{colors.surface.subtle}"
    padding: "2px 6px"
    radius: "{radius.scale.sm}"
    color: "{colors.text.primary}"
  block:
    surface: "{options.code_surface}"   # match-page | always-dark
    background_always_dark: "oklch(0.18 0.005 240)"
    background_match_page: "{colors.surface.subtle}"
    text_always_dark: "oklch(0.92 0 0)"
    text_match_page: "{colors.text.primary}"
    radius: "{radius.scale.lg}"
    border: "1px solid {colors.border.subtle}"
    padding: 24
    font: "{typography.families.mono}"
    font_size: 14
    line_height: 1.6
    tab_size: 2
    header_height: 40
    copy_button: { size: 32, position: "top-right" }
    line_numbers_default: false
    syntax_theme_light: "github-light"
    syntax_theme_dark: "github-dark"
  kbd:
    font: "{typography.families.mono}"
    font_size_em: 0.9
    padding: "2px 6px"
    background: "{colors.surface.canvas}"
    border: "1px solid {colors.border.default}"
    border_bottom_width: 2
    radius: "{radius.scale.sm}"
    color: "{colors.text.primary}"
    min_width: 18

# ═══════════════════════════════════════════════════════════════
# DATA VISUALIZATION
# ═══════════════════════════════════════════════════════════════

viz:
  library: "{options.chart_library}"
  minimalism: "{profiles.chart_minimalism}"
  palettes:
    categorical: ["<color1>", "<color2>", "<color3>", "<color4>", "<color5>", "<color6>", "<color7>", "<color8>"]
    sequential: ["<derived 9 steps>"]
    diverging: ["<derived 11 steps>"]
  axis:
    line_color: "{colors.border.subtle}"
    line_width: 1
    label_type: "body-sm"
    label_color: "{colors.text.secondary}"
    title_type: "label-sm"
    title_color: "{colors.text.primary}"
    tick_count: [4, 6]
  gridlines:
    horizontal: { color: "oklch(from {colors.border.subtle} l c h / 0.5)", style: "dashed" }
    vertical: "omit"
  tooltip:
    show_delay: "0ms"
    crosshair: { thickness: 1, color: "{colors.border.default}", style: "dashed" }
    max_width: 280
    numerals: "tabular"
  legend:
    position_default: "top-left-above"
    item_swatch_size: 12
    item_gap: 16
    item_type: "body-sm"
    hover_dim_other_series_opacity: 0.3
  enter_animation:
    duration: "{motion.duration.deliberate}"
    easing: "{motion.easing.decelerate}"

# ═══════════════════════════════════════════════════════════════
# INTERNATIONALIZATION & RTL
# ═══════════════════════════════════════════════════════════════

i18n:
  rtl_support: "{mode.rtl_support}"
  use_logical_properties: true
  target_locales: ["<en, …>"]
  script_line_height_multipliers:
    latin: 1.0
    arabic: 1.30
    hebrew: 1.20
    devanagari: 1.35
    thai: 1.35
    vietnamese: 1.20
    cjk: 1.60
  cjk_rules:
    no_italic: true
    no_underline_for_emphasis: true
    word_break: "break-word"
  rtl_mirroring:
    layout: true
    text_align: "start"
    directional_icons: true
    media_controls: false
    numerals: false
    logos: false
    code_blocks: false

# ═══════════════════════════════════════════════════════════════
# DO NOT EDIT — universal token reference
# ═══════════════════════════════════════════════════════════════

derivation:
  # Color generation curves. The bundled generator (tools/brand-kit → `npm run gen`) implements these
  # exactly; see body §Colors → Generating the scale. Step 9 = the brand L (the scale rebuilds around it).
  lightness_curve_light:       [0.99, 0.97, 0.95, 0.92, 0.88, 0.83, 0.75, 0.66, "L_brand", "L_brand-0.06", 0.38, 0.22]
  # High-lightness variant — use when base L > 0.66 (amber / yellow) so the ramp stays monotonic:
  lightness_curve_light_high:  [0.99, 0.97, 0.94, 0.91, 0.88, 0.84, 0.80, 0.76, "L_brand", 0.64, 0.50, 0.34]
  chroma_curve:                [0.10, 0.10, 0.18, 0.30, 0.45, 0.60, 0.75, 0.90, 1.00, 0.95, 0.55, 0.30]
  lightness_curve_dark:        [0.17, 0.21, 0.24, 0.28, 0.32, 0.37, 0.44, 0.53, 0.62, 0.68, 0.79, 0.93]
  lightness_curve_dark_high:   [0.18, 0.22, 0.26, 0.31, 0.37, 0.44, 0.52, 0.62, "L_brand", 0.78, 0.85, 0.93]
  saturation_multipliers:
    muted: 0.7
    default: 1.0
    vivid: 1.3
  # Neutrals: tinted toward the BRAND hue by default. `warmth` is an optional override that pushes the
  # neutral hue cooler/warmer; `neutral_chroma` sets the tint intensity. (Generator: --neutral-hue / --neutral-chroma.)
  warmth_neutral_hue:
    cool: 240
    neutral: 60
    warm: 40
  neutral_chroma_default: 0.25   # × the cream base curve; lower = closer to a clean off-white

---

# SlugGrub design system (current, 2026-11-14)

The one-screen summary. The frontmatter above holds the exact values; /brand (src/app/brand) renders all of it.
Status: values he chose are unmarked; Claude's inferences carry # draft above.

- **Look:** Flat + Sidestash (his decision). Everything is flat (solid fill, no stroke, no shadow, separated by tone) EXCEPT three
  things with the Sidestash finish (raised gradient L 0.993 to 0.963, white 0.5px hairline, chip shadow): the bottom nav bar, the
  round buttons in each screen's top bar, and the camera button (same-strength light and shade inside its gooey blob).
- **Color:** page oklch(0.948 0.004 250) (his step 7); flat fill oklch(0.985 0.002 250) (draft, his Card fill pick open); primary
  blue oklch(0.52 0.165 252), a brighter UCSC-style blue (his asks); gold only for #1 moments (draft); cool neutrals hue 250 (his ask).
- **Type:** Manrope for everything (his pick, trial); bold with tight tracking for titles and hero numbers; tabular figures;
  sentence case only, never all caps (his rule).
- **Icons:** Hugeicons free Stroke Rounded (his rule), one stroke weight, heavier on the active tab.
- **Shape:** pill buttons and chips, circle icon buttons, 18px flat cards, concentric corners, 0.5px hairlines (his ask).
- **Motion:** smooth and subtle micro-interactions everywhere they help, never gimmicky (his ask); reduced
  motion makes everything instant. Numbers no longer count up. Presses just dim (no scale); pages open static, with no entry animation of any kind (his rule).
- **Scroll edges:** Magic UI-style banded progressive blur at the top and bottom of scrolling screens, cheap: 4 layers per edge at 1, 2,
  4, 8px, plus a progressive fade of the CONTENT itself (a mask on the scroller, down to ~35% opacity at the very edge, eased; his
  asks "a bit more intense", then "dont have the blur and lighten over the background"): the background and the blue glow sit
  behind the scroller and are never faded or lightened; the top bar lives outside the scroller on the same direction (his asks).
  Behind the sticky top bar and nav bar, only on content scrolled underneath.
- **Blur is cheap, always (his MUST):** at most 4 backdrop blurs per edge and 8 per screen, radius 8px max, never animated, never on
  opaque surfaces, photos or lists; state-change blur (4px) only on small elements for 220ms and removed at rest. See effects.blur_budget.
- **Spring, goo, state change (subtle, his ask):** one spring (300/28, ~1.3% overshoot), one goo (blur 5, contrast 18, no trailing spring), and
  one state change (blur + fade out and in, no movement) everywhere. See motion.spring, motion.goo, motion.state_change.
- **Food button:** a rice bowl icon (not a camera); it splits into Log a plate and Ask SlugGrub, and the icon blur-morphs to an X with
  a 90 degree turn on the spring.
- **Sizing scale (his ask):** every tap target at least 44px. Nav bar and food button 62 · primary buttons 52 · top bar icon
  buttons 44 (20px icons) · chips 42 (small 40) · segmented buttons 38 in a 46 track · top bar tags 36 · See all 32 with a 44 tap
  area · text buttons 44 tap height. In-card icon chips are decoration, not targets (the whole card is the target).
- **Apple HIG (his ask, checked against the HIG Accessibility page):** text contrast 4.5:1 up to 17pt, 3:1 at 18pt+ or bold
  (label gray darkened to oklch 0.52, status pill text darkened); iOS text default 17pt, minimum 11pt (body 17, tab labels 11,
  Large Title 34); controls 44x44pt (sizing scale); Reduce Motion honored; color never the only signal (arrows and numbers carry
  rank changes, names carry college colors); inputs 17px. Not yet met, flagged to him: Dynamic Type text scaling to 200% and a
  dark mode (DESIGN mode.primary is light by his choice). Custom font (Manrope) and icons (Hugeicons) are allowed by the HIG.
- **Performance pass (his ask: minimal or invisible quality loss):** measured in the production build on a laptop at ~120fps
  (p95 8 to 9ms) for scroll, food button, tabs and meal switch; the only drops were large blocks blurring in, so blocks now fade
  and settle (blur stays on small things); photos load a copy sized to how big they are drawn (160 / 360 / 720px, async decode,
  lazy below the fold); scroll edges 3 layers (2, 4, 8px); the food button's goo filter covers only where droplets travel; cards
  and photos contain their own repaints. The dev server is much slower than production by design: test on the phone with the
  production build (npm run build, then npx next start -H 0.0.0.0).
- **Every phone size (his ask):** checked at 320x568 (SE 1st gen), 360x740, 375x667, 393x852, 440x956 and 852x393 landscape on
  every route, with no element past the screen edge. Segmented buttons, titles and hero numbers scale with the screen (clamp);
  under 360px wide, tab labels, chips and segmented buttons tighten; landscape keeps content clear of the notch (safe-area
  insets); the column caps at 440px and centers on anything larger. Check page: /dev/devices.html?p=/route (dev tool).
- **Mobile scrolling:** the document never scrolls (html and body pinned and clipped); only the screen's scroller scrolls; the top
  bar and nav bar refuse pan gestures. WebKit (every iOS browser) does not reliably honor overscroll-behavior on the document, so
  this is structural, not a CSS property (his report: sometimes the whole page scrolled on iPhone Safari and Chrome).
- **Nav bar selection:** tabs share the bar equally and fill its height; the goo capsule is inset 5px on every side, so it is wide and
  concentric with the outer pill (his ask, from two references).
- **In the app:** tokens live in src/app/globals.css (copied from this file; change here first), shared pieces in src/components/ui
  (Icon, Photo, Screen, TabBar with the food button, motion.tsx: Swap, Appear, CountUp, GooTrack, Seg, GooSlider), screens in
  src/components/screens. /brand stays as the reference kit.
- **Open picks on /brand:** Card fill step; blue variant (Bright is current); surface switch kept only for comparison.

# How to use this template

This file is the **single source of truth** for the visual design system of any premium website built from this template. It contains two parts:

- **YAML frontmatter (above)** — every design token, slot, and profile. Machine-readable. Any AI agent generating UI from this file must reference tokens via `{group.path}` syntax — never invent values that aren't here.
- **Markdown body (below)** — the *rules* an AI consuming this file must follow. The frontmatter says *what* the values are; the body says *how* to apply them and *what not to do*.

**Instantiation steps:**

1. Copy this file to your project as `DESIGN.md`.
2. Fill every `<slot>`. Verify with `grep -n "<[^>]*>" DESIGN.md` — zero matches means complete.
3. Run color generation: take `colors.primary.base` and produce all 12 steps (light + dark) using the algorithm in §Colors. Repeat for `colors.neutral` and any semantic palettes you've customized.
4. Profiles and pick-one slots have safe defaults. Override only when the brand explicitly demands.
5. Hand the resulting `DESIGN.md` to any AI tool generating UI code — they will produce premium, consistent output.

The companion file `DESIGN_TEMPLATE_MOBILE.md` covers iOS + Android apps. Shared brand-identity values (color, typography, voice) should match identically between web and mobile instances.

## Guided fill-in mode (v1.2+) — deterministic intake protocol

> **AI behavior rule — read carefully.**
> When the user asks ANY of the following (or close variations), STOP, do NOT summarize, do NOT give a status report, do NOT improvise your own question list. OUTPUT THE BLOCK BELOW VERBATIM with `?` markers left as-is for the user to fill:
>
> - *"help me populate this"* / *"help me fill this in"*
> - *"what do you need to know?"* / *"what do I need to tell you?"*
> - *"run the intake"* / *"give me the questions"* / *"what are the questions?"*
> - *"walk me through this"* / *"how do I fill this in?"*
> - *"what's missing in this file?"* / *"what's left to fill in?"* / *"what else needs to be done?"*
> - any close variation indicating the user wants to know what to populate
>
> If `PROJECT.md` is present in the project, use its full Interactive Population Protocol instead (which orchestrates intake across all 6 templates). The block below is the single-template fallback scoped to `DESIGN.md` alone.
>
> **Mobile companion — disambiguate scope FIRST (do not skip).** The design system may span two files: `DESIGN.md` (web) and `DESIGN_MOBILE.md` (iOS/Android). Before producing the intake, determine whether this project also ships a mobile app — check `PROJECT.md project.type` for `mobile`/`hybrid`, or whether a `DESIGN_MOBILE.md` file exists. If it does (or you can't tell), state it plainly at the top of the intake: the design system has a **web file and a mobile file**, **nearly every value is shared and you will copy it into both automatically**, and there are only a **few mobile-only choices** (the "Mobile companion" block below). Then, when filling, you MUST populate `DESIGN_MOBILE.md` too — not just `DESIGN.md`. **Never let the user believe that completing `DESIGN.md` alone finishes their design system when a mobile app is in scope.** If the project is web-only, omit the mobile items and fill `DESIGN.md` alone.
>
> **Partial-fill state — audit BEFORE producing PART 1:** Read the file in full, then walk every must-fill item. For each, classify as filled / suspected-stub / unfilled using BOTH mechanical patterns AND semantic reasoning:
> - **Mechanical (unfilled):** still wrapped in `<...>` placeholder syntax, empty string / null, just `?`, contains `TBD` / `TODO` / `FIXME` (case-insensitive), or a list below its declared minimum cardinality.
> - **Semantic (suspected stub):** value passes the mechanical checks but looks like a leftover example — known stubs like "Acme Labs", "example.com", "John Doe", "Lorem ipsum", "Your Brand"; generic placeholder language like "Insert your tagline here"; one-word filler like "product" / "app" in slots needing real content; or contextually inconsistent with other filled values.
> - **Definitively filled:** specific to this brand, contextually coherent, meets cardinality + sub-field requirements.
>
> Include unfilled items in PART 1 as-is. Include suspected stubs in PART 1 with confirmation framing (e.g., *"Currently shows 'X' — is that correct? Say 'confirmed' or correct it."*). Exclude definitively-filled items. Same PART 1 / PART 2 / PART 3 shape — just fewer questions.
>
> When in doubt, INCLUDE in PART 1 with confirmation framing rather than silently treating as filled.
>
> **No brand context provided:** Still produce the intake exactly as below — leave `?` markers. The user will provide context in their reply.

### OUTPUT THIS BLOCK VERBATIM when triggered (do not paraphrase, do not summarize, do not rewrite)

```
# Intake — your design system (DESIGN.md web + DESIGN_MOBILE.md mobile, if applicable)

This is everything you need to decide to fully populate your design system. Each item has a short plain-English hint after the em dash.

**Scope — read this first:** Your design system can live in two files — `DESIGN.md` (the website) and `DESIGN_MOBILE.md` (the iOS/Android app). **Almost everything is shared** — colors, fonts, icons, brand voice, profiles — so you answer once and I copy it into both files. There are only a **few mobile-only choices**, grouped under "Mobile companion" in PART 1. If this project is **web-only**, ignore that block and I'll fill `DESIGN.md` alone. So I scope it correctly: is this **web only**, or **web + a mobile app**?

**How to answer:**
- **All at once** — reply with answers numbered, freeform, or both. I'll figure it out.
- **One at a time** — say "let's go one at a time" and I'll walk you through each question, waiting for your answer before moving on.
- For PART 2, either accept the defaults ("looks good, accept all") or list overrides ("override saturation to vivid, switch radius to soft").

I'll fill the template as your answers come in and run final verification at the end.

## PART 1 — Must Fill (no defaults possible)

### Brand identity
1. **Brand name** — what people call your product. E.g., "Linear", "Stripe": ?
2. **One-line product description** — one sentence: what it does, for whom: ?
3. **Primary audience persona** — your main user. Give them a name + one sentence describing who they are: ?
4. **Voice descriptor** — how the brand "sounds" when it speaks. 1-2 sentences on tone, energy, formality, what to avoid. E.g., "Warm and expert. Direct, never salesy. No exclamation points.": ?

### Color foundation
5. **Brand primary color** — your main brand color. Hex (`#2D6A4F`), OKLCH, or descriptive ("warm forest green"). I'll generate the full 12-step palette + dark mode from this: ?
6. **Brand neutral hue** *(optional)* — controls whether your grays lean warm (brown-tinted) or cool (blue-tinted). Skip if unsure — auto-set by your warmth profile: ?
7. **Secondary brand color** *(optional)* — most projects skip this. Only fill if your brand has a defined accent separate from primary: ?

### Typography
8. **Display font family** — the font for headings + hero copy. Defaults: Geist Sans or Inter: ?
9. **Body font family** — the font for paragraph copy. Often the same as display: ?
10. **Mono font family** — fixed-width font for code blocks. Skip if no code surfaces. Defaults: Geist Mono or JetBrains Mono: ?

### Iconography
11. **Icon family** — which icon set to use everywhere in the UI:
    - **Lucide** *(free, default — clean and minimal; recommended for most)*
    - **Phosphor** *(free; multiple weights/variants)*
    - **Heroicons** *(free; Tailwind's official set)*
    - **Tabler** *(free; very large library)*
    - **HugeIcons** *(free Stroke-Rounded tier ~4,500 icons; 51K more on Pro — very extensive)*
    - **custom** *(your own SVG set)*
    Pick one: ?

### Imagery
12. **Photography style** — how product/marketing photos should look. Describe lighting, subject, and mood. E.g., "Natural light, real people in their workspaces, no stock-photo headsets.": ?

### Mobile companion *(only if you also ship an iOS/Android app — skip these if web-only)*
Everything above is shared with the mobile app and I copy it across automatically. These are the *extra* mobile-only decisions:
13. **Target platforms** — which app stores: iOS-only / Android-only / both: ?
14. **Platform adherence** — how strictly to follow each platform's design language: ios-strict *(SF Symbols, sheets, action sheets)* / material-strict *(FAB, Material sheets)* / cross-platform-hybrid *(balanced — recommended when shipping both platforms; if you ship only one platform, prefer that platform's strict mode)*: ?
15. **Mobile nav style** — primary navigation: tab-bar *(bottom tabs, iOS)* / navigation-bar *(bottom tabs, Material 3)* / nav-rail *(side rail, tablets)* / hybrid: ?
16. **Haptic intensity** — vibration feedback: subtle / default / expressive: ?
*(The mobile app inherits your icon, font, color, and voice choices from above — tell me only if you want something different on mobile.)*

## PART 2 — Customizable Defaults (accept or override)

All defaults are premium-grade. Skim and tell me which to change. Each option has a one-line hint.

### Profiles (preset bundles — each shifts multiple coordinated values)
- **Radius** — corner roundness everywhere: **default** ← sharp *(engineered)* / default *(balanced)* / soft *(friendly)* / pill *(fully rounded)*
- **Type scale** — size jump between text sizes: **balanced (1.200)** ← compact *(subtle hierarchy)* / balanced / spacious / dramatic / editorial *(magazine-large heros)*
- **Density** — breathing room around components: **comfortable** ← compact *(packed)* / comfortable / spacious *(airy)*
- **Motion** — how animated things feel: **default** ← subtle *(barely there)* / default *(polished)* / expressive *(playful, bouncy)*
- **Elevation** — shadow depth between layers: **default** ← flat *(no shadows)* / default *(subtle)* / dimensional *(pronounced)*
- **Card separation** — how cards / panels stand apart from the page: **shadow** ← shadow *(soft depth)* / border *(flat outline)* / surface-tone *(lighter fill)* / shadow+border *(both — soft but crisp)*
- **Shadow strength** — shadow intensity *(if cards use shadow)*: **default** ← subtle *(airy, calm)* / default / strong *(pronounced)*
- **Shadow size** — how far the shadow spreads: **default** ← tight *(crisp, close to the surface)* / default / airy *(floaty)*
- **Border width** — stroke thickness *(if cards/inputs use a border)*: **1px** ← 1 / 1.5 / 2 *(2px max — thicker reads cheap)*
- **Saturation** — color vividness: **default** ← muted *(desaturated)* / default / vivid *(punchy)*
- **Warmth** — gray temperature: **neutral** ← cool *(blue-leaning)* / neutral *(pure gray)* / warm *(brown-leaning)*
- **Section padding** — vertical space between page sections: **default** ← compact / default / generous
- **Chart minimalism** — how much "ink" charts use: **default** ← tufte *(minimal axes/gridlines)* / default / carbon *(info-dense)*

### Pick-one slots
- **Input style** — form field look: **outlined** ← outlined *(border around field)* / filled *(subtle background)* / underlined *(line below text only)*
- **Tabs** — active tab indicator: **underline** ← underline / filled *(pill background)*
- **Icon fill** — icon style: **outline** ← outline *(strokes only)* / filled *(solid shapes)*
- **Avatar shape** — user avatar shape: **circle** ← circle / squircle *(Apple-style rounded square)* / rounded-square
- **Modal backdrop** — what's behind a popup: **blur** ← scrim *(dim overlay)* / blur *(blurred page)*
- **Code block surface** — code snippet background: **always-dark** ← match-page *(follows theme)* / always-dark
- **Onboarding pattern** — how new users learn the product: **empty-state-driven** ← empty-state-driven *(helpful placeholders in empty areas)* / progressive *(features revealed as needed)* / coach-marks *(pointer arrows on first visit)* / step-by-step-modal *(guided walkthrough)* / milestone-checklist *(gamified completion list)*
- **Save model** — how edits persist: **auto-save** ← auto-save *(saves while typing)* / explicit-save *(requires Save button)*
- **Settings IA** — settings page layout: **sidebar** ← sidebar *(vertical nav)* / tabs *(horizontal)* / single-page *(scroll)*
- **Container width** — max page content width: **lg (1280px)** ← md *(1024px)* / lg *(1280px)* / xl *(1440px)*
- **Heading weight** — heading thickness: **600** ← 600 *(semibold)* / 700 *(bold)*
- **Time format** — how times display: **hybrid** ← relative *("2h ago")* / absolute *("Mar 5")* / hybrid *(relative ≤7d, absolute after)*
- **Number abbreviation** — large number format: **contextual** ← short *(1.2K)* / long *(1,200)* / contextual *(depends on space)*
- **Product nav style** — main app navigation: **sidebar** ← top-bar *(horizontal at top)* / sidebar *(vertical left)* / hybrid / none
- **Hero variant** — homepage hero layout: **split-asymmetric** ← centered / split-asymmetric *(text left, image right)* / background-led *(full-bleed image)*
- **Toast position** — where notifications appear: **top-right** ← top-right / top-center / bottom-right / bottom-center
- **Footer style** — page footer: **multi-column** ← multi-column *(link directory)* / minimal *(legal + a few links only)*
- **Command palette (⌘K)** — Linear/Raycast-style keyboard launcher: **enabled** ← enabled / disabled
- **RTL support** — right-to-left languages (Arabic, Hebrew): **disabled** ← enabled / disabled
- **Chart library** — for data viz: **recharts** ← recharts *(simple)* / visx *(low-level)* / tremor *(dashboards)* / echarts *(feature-rich)* / custom
- **Illustration style** — custom artwork look: **vector** ← vector *(flat illustrations)* / 3D / abstract / mixed / none

### Color mode + accessibility
- **Primary mode** — does the app default to: **light** ← light / dark / system *(follows OS preference)*
- **Capitalization** — button + label casing: **sentence case** *("Get started")* ← sentence case / title case *("Get Started")*

## PART 3 — When you reply

I'll:
1. Apply your answers to DESIGN.md
2. Generate the 12-step color palette via the OKLCH algorithm in §Colors → Generating the scale, applying saturation chroma multiplier and warmth hue tint
3. Verify APCA contrast: step 11 vs step 2 ≥ Lc 60; step 12 vs step 2 ≥ Lc 90. Adjust L by 0.02 increments if it fails
4. Generate dark-mode counterpart with chroma reduced 20-40% and lightness compressed (NOT inversion)
5. Derive shadow tint = neutral.12, surface roles, border roles
6. Apply HTML mapping defaults appropriate to project type
7. Run the 5-pattern verification: (a) `grep -n "<[^>]*>" DESIGN.md` for placeholders, (b) `grep -niE "\bTBD\b|\bTODO\b|\bFIXME\b" DESIGN.md` for plain-text deferrals, (c) `grep -nE ': *""\s*$|: *\?\s*$|: *null\s*$' DESIGN.md` for empty values, (d) stub scan for common surviving examples, (e) cardinality + semantic-reasoning check on each list slot
8. Report: ✅ filled count, ⚠️ remaining (with reason per item), 🤔 suspected stubs needing confirmation, 📝 user-deferred items. If anything sits in "remaining" or "suspected stubs", do NOT declare complete
9. **If a mobile app is in scope (web + mobile):** the design system is NOT complete until `DESIGN_MOBILE.md` is filled too. Copy the entire `colors:` block, `typography.families`, `icons` (family + library), `dataviz.palettes`, `images.photography_style`, and the `brand` block + Overview over **verbatim**, propagate all shared `profiles`, then fill the mobile-only slots (target platforms, platform adherence, nav style, haptics, native font fallbacks, and the native-only `ios_system.*` / `material_*` tokens). Run the same 5-pattern verification on `DESIGN_MOBILE.md` — zero unfilled slots — and confirm the two files agree on every shared value (per `PROJECT.md → §Cross-template consistency rules`). Report DESIGN_MOBILE.md's fill status separately.
10. Offer next steps (populate companion INFORMATION.md / SPEC.md, generate Tailwind config from tokens)
```

The AI MUST produce this output in full (or, if filling a partially-populated DESIGN.md, EXCLUDE already-filled items from PART 1 and only ask about gaps). Never improvise the format.

---

# AI Agent Contract

When generating any UI, code, or design artifact from this document, an AI agent **must** follow these rules. Violations produce drift; drift defeats the entire purpose of the template.

1. **Reference tokens, never raw values.** Use `var(--colors-primary-9)` or `{colors.primary.9}` — never `#3a8455` or `oklch(0.55 0.13 152)` inline in component code.
2. **Never invent values.** If a color, spacing, size, radius, or duration isn't in the token tables, round to the nearest existing token. Never interpolate.
3. **Stay within declared variants.** Components have specific variants (`button.variants.primary`, `button.variants.secondary`, etc.). Do not generate new variants on the fly.
4. **One primary CTA per screen.** Use `button.variants.primary` exactly once per visible viewport.
5. **Apply states from the token table, not from opacity.** Disabled state references `states.disabled_tokens`, not `opacity: 0.5`.
6. **Honor preference media queries.** `prefers-reduced-motion`, `prefers-color-scheme`, `prefers-contrast`, `prefers-reduced-transparency`, and `forced-colors` are mandatory branches.
7. **Animate only `transform` and `opacity` on the main render path.** Layout properties (`width`, `height`, `top`, `left`, `margin`) cause reflow; use `transform` or FLIP instead. Anything costlier is an effect and follows `§Effects & performance`.
8. **Never `transition: all`.** Always list the specific properties.
9. **Touch targets ≥ 44 px on touch contexts, ≥ 24 px on pointer contexts.** Never below.
10. **Body text inputs ≥ 16 px on mobile** to prevent iOS auto-zoom on focus.
11. **Honor the avoidance list in `§Microcopy`** — never use banned words ("seamless," "leverage," "powerful," "world-class," etc.) in generated copy.
12. **The role decides the type, not the size.** When a heading is needed, use `heading-sm` or `heading-md` even if a visually similar `body-lg` exists — the role carries weight + leading + tracking together.
13. **HTML semantics and visual roles are independent.** Choose the heading level (`<h1>`–`<h6>`) for document outline; choose the visual role (`display-2xl`, `heading-md`, etc.) for appearance.
14. **Tabular numerals are mandatory** for any column of numbers, any pricing display, and any data table.
15. **Use logical CSS properties** (`margin-inline-start`, `padding-block-end`, etc.) — never physical (`margin-left`, `padding-top`) — so layouts adapt to RTL automatically when enabled.
16. **Use typographic punctuation in all copy.** Curly quotes (`"` `"` `'` `'`), em-dash (`—`), ellipsis character (`…`) — never straight `"`, double-hyphens, or three periods.
17. **Connect units with non-breaking spaces.** `10&nbsp;MB`, `⌘&nbsp;K`, `3&nbsp;hours`. Prevents awkward line breaks between number and unit.
18. **Apply `touch-action: manipulation` to every tappable element.** Prevents 300 ms double-tap-zoom delay on mobile web.
19. **Spinner / skeleton show-delay 150–300 ms, minimum visible 300–500 ms.** Prevents flicker on fast operations.
20. **Enter submits forms** when a text input is the sole / last control. **⌘/Ctrl+Enter submits textareas**; bare Enter creates a newline in textareas.
21. **Optical alignment trumps strict geometry.** Adjust ±1 px when perception beats the math (icons that sit lower than they look; text that needs a 1-px raise to align with adjacent labels). Document the adjustment on the component.
22. **Performance is design.** Operations slower than 500 ms (POST/PATCH/DELETE) require a designed loading state. Core Web Vitals, frame-time and long-task budgets are per QA.md `gates.performance`; never restate or loosen them here.
23. **Details are the product.** Every micro-interaction, every edge-case copy, every focus ring, every loading state must be authored with the same care as the primary flow. Premium is felt in the corners, not the headlines.
24. **Always resolve `{typography.families.*}` together with its fallback stack.** When emitting CSS `font-family`, the value is `<families.X>, <fallbacks[fallback_assignments.X]>` — never the custom family alone. Apply `font-display: swap` and metric overrides (`ascent-override`, `descent-override`, `line-gap-override`, `size-adjust`) on `@font-face` so the fallback renders at the custom font's metrics and the swap causes zero CLS.
25. **Dark mode is a required deliverable, authored not inverted.** Emit both light and dark values from the `colors.*.dark.*` ramps; never ship a component that only resolves in light mode. In dark mode, raised surfaces get *lighter* (not darker), accent chroma drops 20–40%, and the page background is near-black (`L ≈ 0.18`), never `#000`. Switch via `prefers-color-scheme` or `[data-theme]`, and verify every component and state in both modes. See `§Dark mode`.
26. **Keep shared values in sync across documents.** Colors (the full palette), type families, icons, brand identity, dataviz, and profiles are shared with `DESIGN_MOBILE.md` (and `icons` is also declared in `PROJECT.md tech.web.icons`). Whenever you change one of these here — at first fill **or on any later edit** — propagate it to every sibling document in the same pass, per `PROJECT.md → §Cross-template consistency rules`. Re-run derivations the change implies (e.g. a new brand color ⇒ regenerate the whole palette, then copy the `colors:` block to DESIGN_MOBILE.md). Never leave a sibling document stale; state which ones you updated.
27. **No layout ships without its behaviour defined and checked at every QA.md `gates.viewport_matrix` class.** A design change is built for every class in the same change as the desktop version, never "desktop now, mobile later". If a class needs a different arrangement, specify it; if it does not, say so.
28. **Width breakpoints are not device classes.** A phone in landscape lands in `md` and an iPad in landscape in `xl`. Choose interaction by `(hover)` / `(pointer)` queries and layout by width plus orientation and height where needed (see `§Breakpoints`, `§Input modality`).
29. **Every effect has a registry entry, a fallback and a reduced-motion path before it is built.** Pick the cheapest `effects.ladder` tier that reaches the look at full quality, add it to `effects.registry`, decide its fallback and reduced-motion behaviour first, then build it and record the measured result (QA.md Gate B2). Scroll-linked visuals use CSS scroll/view timelines with a JS fallback, never a bare `scroll` listener.

---

# Overview

> Fill in your project's brand context here. This is the only section where prose is intentionally project-specific. Every other section's prose is universal.

**Brand:** `<brand.name>`

**Product:** `<brand.description>`

**Audience:** `<brand.audience>`

**Voice:** `<brand.voice>` — *(if the project also has an `INFORMATION.md`, that file is the canonical source for brand voice; this slot becomes a brief restatement)*

**Primary mode:** `<mode.primary>` (light / dark / system)

**Density default:** `<profiles.density>`

**Personality summary (2–3 paragraphs):** Replace this with a description of the brand's emotional positioning — what it feels like to use, what it's trying NOT to feel like, which existing products it shares DNA with and which it explicitly rejects. This is the only freeform prose in the document; everything else is structured.

---

# Web surface scope

"Web" can mean a **marketing / landing site**, a **product web-app** (behind login), or **both**. Read `PROJECT.tech.web.surfaces` (`marketing` / `product` / `both`) to know which this project has, and apply only the matching patterns — don't put a product app shell on a landing page, or a marketing hero inside the app.

- **Marketing / landing surface** → hero variants, the canonical landing composition, **top nav** (not a sidebar), multi-column footer, `section_padding`, bento grids, logo wall, scroll-triggered animation. Built with custom components against these tokens.
- **Product / web-app surface** → app shell, `options.product_nav_style` (sidebar or top), `options.command_palette`, `options.settings_ia`, `options.save_model`, code surfaces, data tables, optimistic UI. Often `shadcn/ui` per `PROJECT.tech.web.ui_primitives`.

Some `options.*` are **product-only** and don't apply to a marketing-only site — `product_nav_style`, `command_palette`, `settings_ia`, `save_model`, `code_surface`. A few are **marketing-only** — `hero_variant`, `footer_style`, `section_padding`. If the project is a single surface, ignore the other's options; if `both`, apply each surface's patterns to *its own* pages (landing page → top-nav + hero; app → product nav + app shell). The **tokens** (color, type, spacing, components) are shared across both surfaces — never fork them per surface.

---

# Colors

**Rule:** Author every color in OKLCH. Reference via tokens. Never inline raw values.

**Why OKLCH:** perceptually uniform — colors at the same lightness look equally bright regardless of hue. HSL and sRGB are not perceptually uniform, which is why HSL-based palettes have uneven steps. Browser support is universal in evergreen browsers as of 2026.

**Palette structure:** five role groups — `primary` (brand accent), `neutral` (80–95% of the surface), `success`, `warning`, `danger`. Optionally one `secondary` brand color (most projects skip this).

**The 12-step scale (Radix model):** each step has a single defined purpose. Never use a step outside its purpose.

| Step | Purpose |
| --- | --- |
| 1 | App background |
| 2 | Subtle background (alt surface) |
| 3 | UI element background (cards, panels) |
| 4 | Hovered UI element background |
| 5 | Active / pressed UI element background |
| 6 | Subtle borders / separators (non-interactive) |
| 7 | UI element border / interactive borders |
| 8 | Hovered border / focus rings |
| 9 | Solid backgrounds (primary CTA fill) |
| 10 | Hovered solid backgrounds |
| 11 | Low-contrast accessible text (APCA Lc 60+ on step 2) |
| 12 | High-contrast accessible text (APCA Lc 90+ on step 2) |

## Generating the scale

> **Canonical implementation: the generator.** Don't hand-roll the OKLCH/APCA math — run
> `tools/brand-kit` → `npm run gen -- --base "oklch(L C H)" [--neutral-hue H] [--neutral-chroma S]`.
> It produces the full `colors:` block (5 palettes × light + dark, gamut-clamped + APCA-verified) and is
> the single source of truth for these curves. The steps below document what it does.

Given the brand color at step 9 in OKLCH (`L_brand`, `C_brand`, `H_brand`):

1. Hold `H_brand` constant across all 12 steps.
2. Apply the **lightness curve** per `derivation.lightness_curve_light`:
   `[0.99, 0.97, 0.95, 0.92, 0.88, 0.83, 0.75, 0.66, L_brand, L_brand−0.06, 0.38, 0.22]`
3. Apply the **chroma curve** as a multiplier on `C_brand`: `[0.10, 0.10, 0.18, 0.30, 0.45, 0.60, 0.75, 0.90, 1.00, 0.95, 0.55, 0.30]`
4. Apply the **saturation profile multiplier** (`profiles.saturation`): muted ×0.7, default ×1.0, vivid ×1.3 — to chroma only.
5. Verify APCA: step 11 vs step 2 must clear Lc 60; step 12 vs step 2 must clear Lc 90. If either fails, lower the step's L by 0.02 increments until it passes.

For **neutrals**, the same algorithm applies with very low base chroma (≈ 0.01–0.03) and a slight hue tint per `profiles.warmth` (cool 240, neutral 60, warm 40). Pure grayscale (chroma 0) reads sterile against a warm brand.

## Dark mode

Dark mode is a **separately authored palette**, never an inversion. Three reasons inversion fails:

1. **Chroma must drop.** Saturated colors that look intentional on white look radioactive on near-black. Reduce C by 20–40% for accent colors in dark mode.
2. **Lightness compresses.** Pure black (`L = 0`) causes halation around white text. Use a near-black like `L ≈ 0.18`. White text drops to `L ≈ 0.95`, not 1.
3. **Surface direction stays the same.** Raised surfaces in dark mode get *lighter* (closer to L=0.3) than the page background (L=0.18), same as light mode where raised surfaces get *lighter* than the page. Modals in dark mode are not "darker than the page" — they're lighter. This is the opposite of what naive inversion would produce.

Use the same token names across modes; only the underlying palette differs. The browser switches automatically via `prefers-color-scheme` or via a `[data-theme]` attribute selector.

**Dark-mode tokens in this file.** Each palette carries its dark ramp in a nested `dark:` map (`colors.primary.dark.1` to `.12`). Role tokens (`surface`, `border`, `text`, `semantic`) are written once as refs to palette steps, and those refs switch with the palette, so most roles need nothing more. When a role must point at a different step in dark mode (APCA fails on the dark canvas, a border vanishes), add a `dark:` map inside that role group listing only the overridden roles, the same shape as a palette's `dark:` (`colors.border.dark.subtle: "{colors.neutral.7}"`). `npm run export` writes both kinds into the `[data-theme="dark"]` block of `tokens.css` under the same variable names as light mode (`--primary-9`, `--border-subtle`), so components never branch on the mode. Record the measured contrast next to an override, like any other derived value.

## Contrast

WCAG 2.2 AA is the floor (4.5:1 for normal text, 3:1 for large or UI). Additionally test against APCA (perceptual). Reject any pairing below:
- Body text: Lc 75 preferred, Lc 60 absolute minimum
- Fine print / small UI: Lc 60+
- Non-text UI (borders, icons): Lc 30+

When WCAG passes but APCA fails, change the color — not the standard.

## State color conventions

Hover, pressed, focus, disabled are explicit token slots — never derived at runtime via opacity:

| State | Convention |
| --- | --- |
| Default solid | Step 9 |
| Hover | Step 10 |
| Pressed | Step 11 |
| Focus ring | 2 px ring of step 8 with 2 px offset |
| Disabled | Background step 3, text step 8 (low contrast intentionally) |

## Forbidden

- Inline hex / rgb / oklch values in component code
- Color as the sole indicator of state (must pair with icon / label / pattern)
- Pure `#000000` text on `#FFFFFF` — soften both
- More than one brand accent competing for attention
- Inverting light → dark to produce dark mode (must re-author)
- Using `opacity` to derive disabled states
- Using semantic colors (`success` / `warning` / `danger`) decoratively, as accents, or for any
  non-semantic purpose. They are **reserved**: success = positive/confirmation only, warning =
  caution/attention only, danger = error/destructive only. Only `primary` + `neutral` are general-purpose.

---

# Typography

*Research: `research.md §D` (Typography).*

**Rule:** Use at most two type families. The system enforces 8 semantic type roles. The role decides size + weight + line-height + letter-spacing as a bundle; you pick the role, not the values.

## Families

Pick three: display, body, mono. Single-family for display + body is the strongest default. Mono is only required if the product renders code or tabular data.

Free defaults if no brand-specific choice: Geist Sans (display + body), Geist Mono (code), Inter (fallback). Avoid web-safe stacks (Arial, Helvetica) — they signal generic.

## Variable fonts

Prefer a variable font over multiple static weights. A variable font (~80–150 KB) replaces 4–6 static weights (~600 KB–1 MB), reduces requests, eliminates CLS, and unlocks intermediate weights for animation. When `opsz` (optical-size axis) is available, bind it to the actual rendered size.

## The 8 roles

| Role | Purpose | Default size (balanced profile, 1.200 ratio) |
| --- | --- | --- |
| `display-2xl` | Hero / landing anchor headlines | 40 → 64 px (fluid) |
| `display-xl` | Page-level headlines | 32 → 48 px (fluid) |
| `display-lg` | Section headlines | 28 → 36 px (fluid) |
| `heading-md` | Modal titles, major section headings | 24 px |
| `heading-sm` | Card titles, subsection headings | 20 px |
| `body-lg` | Lead paragraphs, marketing body | 18 px |
| `body-md` | Default product body | 16 px (base) |
| `body-sm` | Helper text, captions, dense UI | 13 px |
| `label-sm` | Form labels, button text, chip text | 14 px |
| `overline` | Eyebrow text, category labels | 12 px UPPERCASE |

## The role-decides-the-bundle rule

When you want "larger body text," pick `body-lg` — and weight (400), line-height (1.55), and tracking (0) come with it. When you want a heading, pick a `heading-*` role — and the heading character (weight 600, tighter leading, slight negative tracking) comes with it. Same size as a body role does not mean same role.

## Line-height and letter-spacing rules

Both are inverse to size:
- Display (≥ 36 px): line-height 1.0–1.1, tracking -0.02 to -0.04em
- Heading (20–32 px): line-height 1.15–1.25, tracking -0.01 to -0.015em
- Body (14–18 px): line-height 1.5–1.6, tracking 0
- Small / caps: line-height 1.0–1.4, tracking +0.005 to +0.1em

Hardcoded per role in the frontmatter — never recomputed.

## Font-category adjustments

The line-height + tracking table above is tuned for **sans-serif** display + body (the default). **Before locking the role values, classify each family** (`typography.families.{display,body,mono}`) as sans-serif / serif / monospace / slab-or-display, set `fallback_assignments.{display,body}` to match, and **re-tune the `letter_spacing` / `line_height` / `weight` of the roles that use that family** per the deltas below (relative to the sans-serif baseline above). Different categories genuinely want different metrics — leaving sans defaults on a serif heading is a visible mistake.

| Category | Tracking (letter-spacing) | Line-height | Weight / optical | Notes |
| --- | --- | --- | --- | --- |
| **Sans-serif** (grotesque / geometric / humanist — Inter, DM Sans, Geist) | Baseline (negative on display + heading) | Baseline | 400 / 500 / 600 | What the table above assumes. |
| **Serif** (old-style / transitional / modern — Fraunces, Lora, Source Serif) | **Halve the negative tracking** — serifs collide when over-tightened. Display ≈ −0.005 to −0.02em; heading ≈ −0.005 to 0; **serif body = 0 (never negative)**. | **+0.02–0.05 leading at body sizes** (serifs read better with a touch more room); display may stay 1.05–1.15. | If the face has an `opsz` (optical-size) axis — **Fraunces does** — bind it to the rendered size: high `opsz` for display, low for body. Keep high-contrast moderns ≥ 16px in body so thin strokes survive. | A serif display + sans body is the strongest premium pairing. |
| **Monospace** (code / tabular only) | **0 always**. | **1.5–1.6** — mono glyphs are wide and need vertical room. | 400 body / 500 emphasis. | Never use for headings or prose body. |
| **Slab-serif / display-decorative** (Roboto Slab, decorative faces) | Display only; 0 to slightly negative. | Tight (1.0–1.15) at display sizes. | as designed. | Reserve for hero / display roles; never body. |

**Mixing rule (the important one):** when `display` and `body` are *different* categories — e.g. **serif display + sans body** — there is no single global setting. Apply each family's adjustments to the roles that reference it via `font_family`: the serif display roles get serif tracking/leading/`opsz`, the sans body roles keep the sans baseline. Re-tune each affected role's `letter_spacing` / `line_height` in the frontmatter; do **not** leave the sans defaults on serif display roles (or vice-versa). Also match the `@font-face` metric overrides (`ascent/descent/line-gap/size-adjust`) to each real font so the fallback swap stays CLS-free.

## Weight system

Three weights per screen maximum. Available:
- 400 Regular — body
- 500 Medium — labels, buttons, emphasized body
- 600 SemiBold — headings, display (default `options.heading_weight`)
- 700 Bold — only when 600 doesn't carry enough emphasis (override `options.heading_weight`)

Light / Thin (≤ 300) are not in the system.

## HTML mapping

Visual roles are **decoupled from HTML heading levels**. The same `<h2>` can render as `display-2xl` on a marketing hero or `heading-md` in a product modal. Choose the HTML tag for document semantics (outline, accessibility); choose the visual role for appearance. Defaults are in `typography.html_mapping`.

## Measure

Body text container `max-width: 65ch`. Lines longer than 75 characters reduce reading speed; shorter than 45 increases eye saccade. Premium products enforce this.

## Tabular numerals

Mandatory for any numeric column, price display, comparison, or table. Apply `font-feature-settings: "tnum"` via the `typography.font_features.tabular` token.

## Forbidden

- Light or Thin weights in body
- More than three weights per screen
- More than two type families
- Justified body text (creates rivers)
- Body lines > 75 ch
- All caps without positive tracking
- Default web-safe font stacks
- Setting `line-height` in `px` instead of unitless

---

# Spacing & Layout

*Research: `research.md §E` (Spacing), `§F` (Layout & Grid).*

**Rule:** 4 px base. Every spacing value is a multiple of 4. The 18-step scale in `spacing.scale` is the complete vocabulary — never invent in-between values.

## The scale

Pre-filled in `spacing.scale`. Use multiplier notation: `space.4` = 16 px (4 × base).

## Inset / Stack / Inline pattern

Three patterns; choose one per use:

| Pattern | Use | Token kind |
| --- | --- | --- |
| **Inset** | Padding inside a container | Single value or asymmetric |
| **Stack** | Vertical gap between sibling elements | `gap` on a vertical flex/grid |
| **Inline** | Horizontal gap between siblings | `gap` on a horizontal flex/grid |

Never mix margin and padding to achieve spacing. Use `gap` on the parent and reserve padding for inset.

## Section padding

Resolved by `profiles.section_padding`, with a value for every device class (`mobile`, `tablet`, `desktop`, `wide`). Default profile hero: 80 mobile / 96 tablet / 128 desktop / 160 wide; major sections 64 / 80 / 96 / 128.

## Container queries first

Component-level responsive behavior uses `@container`. Page-level uses `@media`. A component dropped into a sidebar should respond to the sidebar's width, not the viewport — container queries solve this.

## Whitespace ratio rule

Whitespace surrounding a content block should be ≥ 30–40% of the block's height for premium feel. Marketing heroes commonly exceed 50%. Compact in-app surfaces drop to ~20% but never below.

## Forbidden

- Inventing in-between spacing values (e.g., 14 px when 12 and 16 exist)
- Mixing margin and padding for the same gap intent
- Fixed-pixel layouts that break user zoom
- Content touching viewport edges (use container padding)
- z-index inflation (`z-index: 9999`) — use the `z_index` token scale

---

# Shapes (Radius)

*Research: `research.md §G` (Shapes).*

**Rule:** The radius scale is `none`, `sm`, `md`, `lg`, `xl`, `2xl` plus `full` (six stepped values and the pill). Pick one radius family per project (via `profiles.radius`); never mix sharp + soft within a single composition.

**Drift note (template vs research §G.1).** The per-component defaults here are normative and differ from the "use" column of research §G.1 in three places: inputs are `md` here (§G.1: `sm`), badges `sm` (§G.1: `md`), code blocks `lg` (§G.1: `sm`). Cards (`lg`) and modals (`xl`) agree. When the two disagree, this file wins for the build; log a deliberate change in DECISIONS.md.

## Nested radius math

Inner radius = outer radius − padding. If the result is negative, clamp to 0 (the inner element is square-cornered).

## Continuous corners

On hero-scale rounded elements (and on iOS surfaces in the mobile template), prefer continuous (squircle) corners over circular-arc corners. Below ~12 px radius the difference is invisible — circular-arc is fine.

## Profile resolution

| Profile | Button | Card | Modal | Input |
| --- | --- | --- | --- | --- |
| sharp | sm (4) | md (8) | lg (12) | sm (4) |
| default | md (8) | lg (12) | xl (16) | md (8) |
| soft | lg (12) | xl (16) | 2xl (24) | md (8) |
| pill | full | xl (16) | 2xl (24) | md (8) |

## Forbidden

- Mixing radii within a single composition
- Hard-coded `border-radius` values in component code (use `radius.*` tokens)

---

# Elevation & Depth

*Research: `research.md §H` (Elevation & Depth).*

**Rule:** Six elevation levels (0–5). Every non-zero level combines at least two shadows (key + ambient). Shadow color is the darkest neutral of the palette tinted with low alpha — never pure black.

## Surface separation

How cards, panels, popovers, and sheets stand apart from the canvas. Pick **one primary strategy** per project — combining border + shadow + surface-tone all on one element is forbidden. `shadow+border` is the single sanctioned pairing (a 1px border *and* a soft shadow). Configure it all via the `surface_separation` frontmatter block.

| `strategy` | What it draws | Best for |
| --- | --- | --- |
| `shadow` | a tinted layered shadow (`elevation.*`), no border | warm / dimensional — marketing + consumer (default) |
| `border` | a 1–2px `border.subtle`, no shadow | flat / engineered, dense product UI (Linear, Vercel) |
| `surface-tone` | a lighter raised background (`surface.raised`) only | maximum minimalism; dark-first products |
| `shadow+border` | a 1px border **and** a soft shadow together | soft consumer cards that still read crisp on busy backgrounds |

**Tunable values — all premium-bounded so you can't make it look cheap:**
- **`shadow_strength`** multiplies every elevation layer's opacity: `subtle` ×0.7 (airy, calm) · `default` ×1.0 · `strong` ×1.4 (pronounced). Stay within ×0.5–×1.6 — below disappears, above muddies.
- **`shadow_size`** multiplies blur + offset: `tight` ×0.85 (crisp, close to the surface) · `default` ×1.0 · `airy` ×1.2 (floatier). Keep blur ≥ offset so the shadow stays soft, never hard-edged.
- **`border_width`** sets stroke thickness when a border is used: `1` (default, hairline-crisp) · `1.5` · `2` px. **2px is the ceiling** — thicker reads as cheap.
- **`hover`** is the card affordance on hover: `lift` (raise one elevation level) · `border` (darken to `border.strong`) · `none`.

The knobs **default from `profiles.elevation`** (`flat` → `border`; `default` → `shadow` at default strength/size; `dimensional` → `shadow` at `strong`/`airy`) — set any of them explicitly in `surface_separation` to override. **Dark mode:** shadows render poorly on near-black, so a `shadow` strategy should fall back to `surface-tone` or `shadow+border` with heavier shadow alpha (per §Dark mode and research §H.3–H.4).

## Z-index

Use the `z_index` token scale. Never invent custom values.

## Forbidden

- Single-layer `box-shadow`
- Pure black shadow color
- Borders + shadows + heavy backgrounds on the same element
- `z-index: 9999` or any number not in the token scale

---

# Motion

*Research: `research.md §I` (Motion); runtime cost in `§I.14`.*

**Rule:** Five duration tokens, four easing curves, three spring presets. Every animation uses one of these — no inline durations or custom beziers.

## The 60/30/10 distribution

- ~60% of animations use `standard` or `decelerate` easing (entries, normal transitions)
- ~30% use `accelerate` (exits)
- ~10% use `emphasized` (hero moments)

`linear` is reserved for indeterminate loaders and rotation animations — never UI transitions.

## Spring physics for gestures

For drag-to-dismiss, pull-to-refresh, sheet snapping, swipe actions, drag-and-drop, use spring physics from `motion.spring` — not bezier. Springs respond to velocity and feel "connected" to the gesture.

## Reduced motion is first-class

`prefers-reduced-motion: reduce` disables: parallax, scroll-driven transforms, auto-advancing carousels, hero entrance animations. Opacity transitions are preserved. Transform + opacity pairs become opacity only.

## Choreography invariants

- Stagger: 30–80 ms per item for sequential reveals
- Smallest moves first, largest moves last
- One focal point per beat — never animate two unrelated regions simultaneously
- Out before in — never crossfade unrelated content

## FLIP and View Transitions

For layout changes (rearranging lists, expanding cards), use the FLIP technique or the View Transitions API. Both animate via `transform` rather than animating `width`/`height` (which forces layout). The View Transitions API is the modern native standard; fall back to FLIP libraries (Framer Motion `layout`, GSAP Flip plugin) where unsupported.

## Forbidden

- `transition: all`
- Animating layout properties (`width`, `height`, `top`, `left`) on the main render path
- Re-triggering scroll animations on scroll-back
- Decorative scroll-triggered animation (it must serve explanation)
- Long durations (> 500 ms) on micro-interactions
- More than one continuous looping animation per viewport

---

# Effects & performance

*Research: `research.md §I.14` (runtime performance: effect cost ladder, frame budgets, adaptive quality) and `§F.5` (viewport matrix, iOS Safari behaviour). Every number is per QA.md `gates.performance`; this section holds the method.*

**Rule:** Effects are designed in from the start, performance-ready and at the highest quality the budget allows. Choose the **cheapest `effects.ladder` tier that reaches the look**, then spend the remaining budget on quality (resolution, sample count, smoothness), never on a costlier technique that looks the same. Every effect is registered, has its fallback and reduced-motion path decided before it is built, and ships with a measured result.

## Compositor first

Tier 0 (CSS transitions, CSS animations or WAAPI on `transform` and `opacity`) runs on the compositor and keeps the display's full refresh rate even while the main thread is busy. This matters most on iOS: Safari caps page-driven `requestAnimationFrame` and scroll-driven script updates at 60 fps by default, while scrolling itself runs at 120 Hz on ProMotion screens, so a JS-driven effect visibly trails a 120 Hz scroll. Prefer a declarative animation the browser can hand to the compositor over a script loop every time.

## Scroll-linked motion

Scroll-linked visuals (parallax, progress, reveal-on-scroll scrubbing) use CSS scroll-driven animations (`animation-timeline: scroll()` / `view()`), with a JS fallback (IntersectionObserver for triggers, a single rAF-throttled reader for scrubbing) only where timelines are unsupported. **Never drive a visual from a bare `scroll` event listener**: it fires after the scroll has already painted, so the effect always trails the content by a frame or more.

## What never to animate

Never animate `width`, `height`, `top`, `left`, `margin`, `mask-size` or `background-size`. Use `transform: scale()` on the element, or a clip (`clip-path`, `inset()`) on a promoted layer (`will-change: transform` set only while it animates). The component specs show the method: the tabs indicator uses `translateX + scaleX`, the accordion uses `grid-template-rows: 0fr → 1fr` or a clip reveal, the sidebar collapses with `translateX`.

## Blur and glass

`backdrop-filter` (tier 2) re-samples everything behind it on every frame that anything under it moves. Keep simultaneous blur layers at or below QA.md `backdrop_filter_layers_max`; **merge stacked blur layers into one pass** (one blurred backdrop behind a group, not one per child) or move the look into a single shader. Every blur surface declares a solid or translucent fallback, used when over budget, when the governor steps down, and under `prefers-reduced-transparency`.

## Canvas and WebGL

- **Textures use real mip chains.** Pre-downsample each level (or build them with a wide, high-quality downsample) instead of calling `generateMipmap` on detailed photos: its box filter aliases fine detail, which shimmers as soon as the image moves or scales.
- **A canvas stays hidden until its first frame has drawn.** Show the underlying `<img>` until then, so a canvas never covers a loaded image with black or transparent pixels.
- **One WebGL context per effect at most**; share a context across effects or cap the page total at QA.md `webgl_contexts_max`. Browsers drop the oldest context past their own limit.
- Cap the render resolution (device-pixel ratio) as the first quality lever, not the last.

## Loops: pause when unseen

At most one continuously running loop (animation, canvas or shader) per viewport. Every loop pauses when offscreen (IntersectionObserver) and when the tab is hidden (`visibilitychange`), and resumes without a jump.

## Adaptive quality

Ship at `effects.adaptive_quality.default_quality`, set up front and measured on the QA.md `gates.viewport_matrix` devices. A governor may step quality down **only on measured, sustained frame misses** against the QA.md frame-time budget, in `step_down_order`, and never steps back up in the same page view. Never degrade on a user-agent, device-name, core-count or memory guess: a guess degrades fast devices and misses slow ones.

## Fallbacks and reduced motion, decided first

Before building an effect, write its registry entry: `tier`, `why_not_cheaper` (for tier 1 and up), `fallback` and `reduced_motion`. `prefers-reduced-motion: reduce` gets a still or opacity-only version that keeps the content and meaning; `prefers-reduced-transparency` gets the solid fallback. An effect whose fallback is "nothing renders" is not finished.

## Measured, not assumed

Every registry entry records `measured_p95_ms` and the `devices` it was measured on, per QA.md Gate B2: real devices where the matrix names them, both scroll directions, the effect running at its default quality. A change made for performance keeps only if the measurement shows it helped.

## Forbidden

- An effect with no `effects.registry` entry, no fallback or no reduced-motion path
- A higher ladder tier than the look needs, without a written `why_not_cheaper`
- Scroll-linked visuals driven by a `scroll` event listener
- Animating `width` / `height` / `top` / `left` / `mask-size` instead of `transform` or a clip
- More stacked `backdrop-filter` layers than QA.md `backdrop_filter_layers_max`
- Box-filtered `generateMipmap` on detailed photographic textures
- A canvas shown before its first frame has drawn
- Loops that keep running offscreen or in a hidden tab
- Quality chosen from a user-agent or device guess instead of a measurement

---

# States

**Rule:** Every interactive component declares the 10 states in `states.list`. Focus-visible is mandatory and uses the `states.focus_ring` token. Disabled never uses opacity.

## Focus ring (universal)

2 px ring of `colors.primary.8` with 2 px offset, transitioning at `motion.duration.fast` `motion.easing.standard`. Only suppress on pointer-induced focus via `:focus:not(:focus-visible)`. Never globally.

## State transitions

See `states.transitions` for timing per transition type. Hover transitions in `fast` with `standard`. Pressed is `instant`. Release returns at `fast` with `decelerate`.

## Loading patterns

Three valid patterns; pick one per context:

| Pattern | When |
| --- | --- |
| Spinner inside button | Action-triggered, < 3 s expected |
| Skeleton screen | Initial content load |
| Progress bar | Determinate operation |

A global "page spinner" is an anti-pattern — skeletons preserve layout and feel faster.

## Forbidden

- `opacity: 0.5` for disabled
- Removing focus indicators
- Shake / pulse error animations (vestibular harm; use color + icon instead)
- A page-wide spinner as the primary loading pattern

---

# Iconography

**Rule:** One icon family per project. Six sizes. Stroke weight matches text weight. Optically align against cap-height, not line-box.

## Sizes

| Token | Size | Pairs with |
| --- | --- | --- |
| xs | 12 | overline, body-sm inline |
| sm | 16 | body-md inline (default) |
| md | 20 | body-lg, label-sm (buttons) |
| lg | 24 | heading-sm |
| xl | 32 | heading-md, feature-card |
| 2xl | 48 | hero / feature illustration |

## Stroke weight pairing

| Text weight | Icon stroke |
| --- | --- |
| 400–500 | 1.5 px |
| 600 | 1.75 px |
| 700 | 2 px |

Below 16 px, use 1.5 px regardless. Below 16 px, prefer filled over outline.

## Recommended icon families

Pick one. Mixing families on the same surface — even similar styles — reads as inconsistent.

| Family | Tier | Notes |
| --- | --- | --- |
| **Lucide** | Free | 1.5-px stroke, ~1,500+ icons, the default for most modern systems |
| **Phosphor** | Free | Six weights (thin / light / regular / bold / fill / duotone); broad coverage |
| **Heroicons** | Free | Tailwind's official; only outline + solid; small but high quality |
| **Tabler** | Free | Large catalog, 1.5-px stroke, free and open |
| **HugeIcons** | Premium | 5,100+ free / **51,000+ Pro** across 10 styles (rounded stroke / two-tone / solid / bulk / duotone / sharp / etc.). React-first, tree-shakeable. The premium choice when brand polish requires going beyond the free libraries. |
| **Custom** | Project-built | A small custom set (~30 icons) used alongside a base library for brand-differentiating icons |

## ARIA

Functional icons (sole label for a button) require `aria-label`. Decorative icons (paired with visible text) require `aria-hidden="true"`. Default to `aria-hidden` unless the icon is the only label.

## Forbidden

- Mixing icon families on the same surface
- Filled and outline icons on the same surface (pick one per `options.icon_fill`)
- Stroke weights outside the 1.5 / 1.75 / 2 set

---

# Imagery

*Research: `research.md §L` (Imagery), `§L.7` (loading).*

**Rule:** Six aspect ratios. Three image formats with explicit fallback. Every image has a placeholder. Custom illustration > stock photography.

## Format stack

AVIF first → WebP fallback → JPG safety net via `<picture>`. AVIF saves ~50% vs JPG and 20–30% vs WebP at equivalent quality.

## Loading priorities

Exactly **one image per page** uses `fetchpriority="high"` — the LCP (typically hero). Above-the-fold images load eager; below-the-fold lazy. **Never lazy-load the LCP image** — defeats Largest Contentful Paint.

## CLS prevention

Every image declares explicit `width` and `height` OR uses `aspect-ratio` CSS. Layout shift is a premium-tier failure.

## Decode before reveal

An image that fades or slides in waits for `img.decode()` (or its `load` event) before the reveal starts, so the animation never shows a half-decoded or blank frame.

## Prefetch queue for offscreen images

Galleries, carousels and the next section's images warm up ahead of the viewport on **every device class**, not only phones: a small queue fetches the next few (`images.loading.prefetch_queue.warm_ahead`), a few at a time, and decodes each on arrival. It starts after the LCP image has loaded and is skipped under Save-Data (`navigator.connection.saveData`, `prefers-reduced-data`).

## Video

`preload="metadata"`, never `auto` below the fold. A poster is required (encoded like any image) so nothing flashes black. Autoplay only as `muted playsinline`, and only while in view: an IntersectionObserver plays it on entry and pauses it offscreen. Under `prefers-reduced-motion` show the poster with a play control.

## Cache-safe file names

Asset file names are content-hashed or versioned (`hero.3f9a2c.avif`, `hero-v2.avif`). **Never replace an asset under the same file name**: browsers, CDNs and image optimizers keep serving the old bytes. A changed image gets a new name.

## Dark mode image swap

When an image looks wrong in both modes (e.g., a product screenshot with light UI), provide a separate dark-mode variant via `<picture>` with `prefers-color-scheme`. Never use `filter: invert()` on raster images.

## Forbidden

- Stock photography of people in headsets / staged office shots in primary surfaces
- Lazy-loading the LCP image
- Missing `width`/`height` on raster images
- More than one `fetchpriority="high"` per page
- Revealing an image before it has decoded
- Replacing an asset under the same file name
- Video without a poster, or autoplaying offscreen

---

# Density & Responsive

*Research: `research.md §M` (Density & Responsive), `§F` (Layout & Grid), `§F.5` (viewport matrix, device classes, iOS Safari).*

**Rule:** Three density modes. Touch-target minimums by device. Container queries over media queries for components. **Every layout and every design change is built and checked at every QA.md `gates.viewport_matrix` class alongside the desktop version, in the same change.** No view mode is deferred.

## Touch targets

| Context | Minimum | Recommended |
| --- | --- | --- |
| Mobile / touch | 44 px | 48 px |
| Pointer (mouse/trackpad) | 24 px (WCAG 2.5.8 AA) | 36–44 px |

Spacing between adjacent targets: 12 px minimum.

## Breakpoints

Mobile-first. Default styles target mobile; `min-width` media queries layer larger styles on top. See `breakpoints` table. The device range now runs from a 4″ phone to a 34″ ultrawide — handle both ends:

- **Ultra-wide / 4K (`3xl` ≥ 2560px):** content **caps and centers** — never stretches. Keep `max-width` on the page container, line length ≤ ~75ch (per §Measure). Use the extra space as wider margin/gutter, or an intentional treatment (a 2-up layout, a side rail) — never full-bleed body text or buttons spanning the whole monitor.
- **Foldables / mini-tablets (~600–720px):** sit between `sm` and `md`; verify layouts reflow sanely here (e.g. a Galaxy Z Fold unfolds from a narrow phone into this zone). Container queries (above) handle most of this automatically since components respond to their container, not the viewport.

**Width breakpoints are not device classes.** A phone in landscape (667 to 932 px wide, often under 430 px tall) lands in `md`; an iPad in landscape lands in `xl`, with touch and no hover. So: choose **interaction** by `(hover)` / `(pointer)` (`§Input modality`), and add `orientation` and `height` queries where a layout depends on them (a hero that fills a portrait phone must not overflow a 390 px tall landscape one). Every layout is defined for every QA.md `gates.viewport_matrix` class (research §F.5), and `section_padding` carries a value for each class (`mobile`, `tablet`, `desktop`, `wide`).

## Fluid scaling

Type sizes, section padding, container widths use `clamp(min, fluid, max)`. Component sizing, internal padding, radii, border widths use discrete token values.

## Viewport units & safe areas

- **Full-height sections use `svh`** (`min-height: 100svh`, the hero's `88svh`), never bare `vh`: on mobile browsers `vh` is the *largest* viewport, so the bottom of a `100vh` section sits under the browser toolbar. Use `dvh` only for an element that must track the toolbar as it moves (a full-screen overlay) and accept that it resizes during scroll.
- **Safe areas:** the viewport meta includes `viewport-fit=cover`, and every fixed or sticky element and every full-bleed edge pads with `env(safe-area-inset-top/right/bottom/left)` (the notch side insets matter in landscape). See research §F.5 for iOS Safari's toolbar behaviour around edge-touching bars.
- **Horizontal overflow:** set `overflow-x: clip` on the page wrapper (or `html`), not `overflow: hidden` on `body`. `hidden` creates a scroll container, which breaks `position: sticky`, and does not reliably stop sideways panning on iOS.
- **Scroll locks** (modal, menu, loader) block `wheel`, `touchmove` (non-passive listener) and the scroll keys (Space, Page Up/Down, arrows, Home/End) in addition to `overflow: hidden`, because iOS Safari ignores `overflow: hidden` on `body` for touch scrolling. Restore the scroll position on release.
- **Display headings never overflow a 320 px screen.** Apply `text-wrap: balance` and `overflow-wrap: break-word` to display and heading roles (`text-wrap: pretty` on body). Clamp display sizes to the container (`clamp()` with `cqi` or `vw` in the fluid term) so the **longest single word** of the real copy fits at the minimum; check it at 320 px with the real words, not placeholder text. `overflow-wrap` is the safety net, not the design.

## Input modality

- **Interaction is chosen by input, not width.** Use `@media (hover: hover) and (pointer: fine)` for hover effects and `(pointer: coarse)` for touch sizing; use `any-hover` / `any-pointer` to catch hybrids (an iPad with a trackpad, a touch-screen laptop). A 1024 px iPad is touch; a narrow desktop window has a mouse.
- **Gate every hover effect** (card `lift`, nav link hover color, image zoom, reveal-on-hover) under `(hover: hover) and (pointer: fine)`. Ungated, iOS applies `:hover` on tap and leaves it stuck.
- **Touch gets `:active`.** Every tappable element has a visible pressed state at `motion.duration.instant`; remove the default tap highlight (`-webkit-tap-highlight-color: transparent`) only when that custom `:active` state exists.
- **Nothing is hover-only.** Anything revealed on hover is also reachable by tap and by keyboard focus (`:focus-visible`).

---

# Accessibility

**Rule:** WCAG 2.2 AA is the floor. APCA is the perceptual sanity check. Six preference media queries are honored.

## Contrast targets (per `a11y.contrast`)

- Body text: APCA Lc 75+ preferred, Lc 60 minimum; WCAG 4.5:1
- Fine print: APCA Lc 60+
- UI text: APCA Lc 75+
- Non-text UI: APCA Lc 30+

## Preference media queries

All six are honored:
1. `prefers-color-scheme` — swap palettes
2. `prefers-reduced-motion` — disable transform animations, preserve opacity
3. `prefers-reduced-transparency` — replace `backdrop-filter: blur()` with solid surfaces; replace translucent overlays with solid equivalents
4. `prefers-contrast: more` — switch text from step 11 to step 12; increase border weights
5. `prefers-contrast: less` — soften shadows; reduce text contrast slightly
6. `forced-colors: active` — use `system-color` keywords (`Canvas`, `ButtonText`, `LinkText`, `Highlight`); strip backgrounds + shadows; never `display: none` content

## Required UI features

- Skip-to-content link as first focusable element
- Proper landmarks (`<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`)
- Heading hierarchy starting from `<h1>` without skipping levels
- ARIA live regions (`role="status"` polite, `role="alert"` assertive) for dynamic updates
- Brand names wrapped in `<span translate="no">`

## Forbidden

- `<div onClick>` instead of `<button>`
- Color-only meaning
- Custom interactive widgets without ARIA patterns from WAI-ARIA Authoring Practices
- Focus traps that don't restore focus on close
- Skip-to-content link missing

---

# Components

The YAML frontmatter `components.*` is the normative spec. Each component declares: sizes, variants (where applicable), padding, radius, typography role, state styling.

**Universal rules across components:**

- Components have three or four sizes (`sm` / `md` / `lg`, optionally `xl`). The `md` size is the default unless specified.
- Components inherit the focus ring, motion timings, and disabled token from the global `states` definitions.
- Components reference type roles, not raw font sizes.
- Components reference radius via `radius.components.<name>`.
- Components reference elevation via `elevation.components.<name>`.

**For each interactive component, the canonical state matrix is:**

| State | Reference |
| --- | --- |
| default | Component's base spec |
| hover | Component's `hover_*` overrides |
| pressed | Component's `pressed_*` overrides |
| focus-visible | `states.focus_ring` (universal) |
| disabled | `states.disabled_tokens` (universal) |
| loading | Component-specific spinner / skeleton |
| selected | Component-specific (tabs, menu items, list rows) |
| error / success | Component-specific (inputs, validation) |

Refer to the YAML frontmatter for exact values. Below are the component-class anatomies and any rules that don't fit the YAML.

## Button

Anatomy: `container > [leading-icon?] + label + [trailing-icon?]`. Four sizes (sm/md/lg/xl) plus icon-only variants. Six style variants (primary, secondary, outline, ghost, link, destructive). Cap label length at 24 characters. One `primary` per visible viewport.

## Input

Anatomy: `[label] + container[(leading-addon?) + (leading-icon?) + input-element + (clear-button?) + (trailing-icon?) + (trailing-addon?)] + [helper-text | error-text]`. Three sizes. Style follows `options.input_style` (outlined / filled / underlined). On mobile, font-size ≥ 16 px.

## Card

Anatomy: `container[(media?) + (header[title + subtitle?]) + body + (footer[actions?])]`. Choose one separation strategy per project (border OR elevation, not both). The `surface_separation.hover` effect (`lift` by default) applies only under `@media (hover: hover) and (pointer: fine)`; touch gets an `:active` pressed state instead (`§Input modality`). Media at the top extends to card edges (negate the padding via `margin: -padding`). Title is `heading-sm`. Footer actions right-aligned.

## Modal / Dialog

Standard sizes: sm 560 / md 720 / lg 960. Backdrop per `options.modal_backdrop`; `blur` is a tier-2 effect that counts toward QA.md `backdrop_filter_layers_max` and falls back to a translucent scrim when over budget, when the governor steps down, and under `prefers-reduced-transparency` (`§Effects & performance`). Scroll lock per `§Viewport units & safe areas`. Focus trap required. Restore focus on close. Escape closes; backdrop click closes (unless declared as required modal).

## Toast

Auto-dismiss timing per severity. Errors require manual dismiss. Pause on hover. Stack with newest on top.

## Dropdown / Menu / Popover

Use Radix Popper or Floating UI positioning. Default position below trigger; flip to above when no space. Outside-click closes. Max height 60 svh with scroll.

## Tabs

`options.tabs_style` selects underline (default premium) or filled. The indicator is one element of fixed base width that moves with `translateX` and sizes with `scaleX` (`transform-origin` at the inline start) on selection change; never animate its `width` or `left`.

## Accordion

Single-open or multi-open per instance. Chevron rotates 180° on open. Content expands with `grid-template-rows: 0fr → 1fr` plus opacity (the content sits in a single grid row with `min-height: 0`), never by animating `height`. That is one contained layout per frame, acceptable for a single item; for long content or many items opening together, reveal with `clip-path` or a `translateY` of the content inside an overflow-clipped wrapper instead.

## Top nav

64 px desktop / 56 px mobile. Sticky on scroll with `backdrop-filter: blur(12px)` and 80% opacity surface. The blur is a tier-2 effect: it counts toward QA.md `backdrop_filter_layers_max`, and falls back to the near-solid `sticky_scroll_backdrop_fallback` surface when over budget, when the governor steps down, and under `prefers-reduced-transparency`. On touch screens, a full-width fixed or sticky bar touching the top or bottom screen edge interacts with iOS Safari's toolbar (tinting, resizing, sitting under it while it collapses): pad it with `env(safe-area-inset-*)` and check it on a real device (research §F.5). Mobile collapses to hamburger trigger opening a sheet or full-screen menu.

## Sidebar

240 px default / 64 px collapsed / 280 px expanded. Collapse slides the panel with `translateX` (the 64 px rail stays in view) and fades labels with opacity; the content column changes its offset once, unanimated. Never animate the sidebar's `width`. Items use the `radius.md` pill highlight. Active item gets primary tint + 3-px leading bar (or `options.product_nav_style` variant).

## Table

40 px header, 48 px default body row (compact 40, comfortable 56). Tabular numerals mandatory on numeric columns. Sticky header on scroll. Empty state with illustration + CTA when no data.

## Form group

Vertical stack: label → control → helper / error. Required marker is a red asterisk after the label, 4 px left margin. ARIA: `aria-describedby` → helper/error ID; `aria-invalid="true"` when error.

## Empty state

Centered, max-width 480 px. Illustration top (96–160 px), title `heading-sm`, body `body-md` `secondary` color, optional CTA. Vertical padding ≥ 64 px.

## Command palette

If `options.command_palette: enabled`, the product surfaces a global ⌘K / Ctrl+K command palette. Centered overlay (max-width 560), top offset 15 vh, search-first, keyboard-driven. Sections labeled with `overline` UPPERCASE.

---

# Web Patterns

**Rule:** Marketing / product landing pages follow the canonical composition by default. Deviation requires justification.

## Canonical landing composition

1. Top navigation (sticky, transparent-to-blurred on scroll)
2. Hero (1 viewport tall desktop, `min-height: 88svh`; never bare `vh`, per `§Viewport units & safe areas`)
3. Social proof (monochrome logo wall)
4. Narrative section 1 (alternating left-text / right-image)
5. Narrative section 2 (alternates direction)
6. Bento grid (feature showcase)
7. Use-case / persona tabs
8. Testimonial(s) — single quote (premium) or limited carousel
9. Pricing (if commerce-focused)
10. FAQ (accordion)
11. Final CTA band (high-contrast surface)
12. Footer (multi-column per `options.footer_style`)

## Hero variant

Per `options.hero_variant`:
- `centered` — nav-style top, headline and CTA centered, optional media below; symmetric and assertive
- `split-asymmetric` — 6/6 or 7/5 of 12 cols, text on one side, media on the other; the dominant premium SaaS pattern — DEFAULT
- `background-led` — full-bleed media or animation, content overlaid; story-led, common for products that need to demonstrate an unfamiliar concept visually

Headline ≤ 44 characters. Subhead `body-lg` `secondary` color, max-width 480–560 px. CTA cluster: primary + secondary, gap `space.4`.

## Section padding

Per `profiles.section_padding` (mobile / tablet / desktop / wide). Default profile: hero 80 / 96 / 128 / 160; major sections 64 / 80 / 96 / 128; CTA band 80 / 96 / 128 / 160.

## Bento grids

Asymmetric cells (e.g., 6+6, 4+4+4, 8+4, 6+3+3). Use when ≥ 4 co-equal features. Collapse to single-column stack on mobile in priority order.

## Logo wall

Monochrome rendering (all logos in `neutral.11` light / `neutral.8` dark) — never original brand colors. 5–7 logos visible at once. Optional slow marquee, paused on hover.

## Scroll-triggered animation

Permitted only when it serves explanation. Patterns:
- Pin and scrub (section pins, internal content advances)
- Stagger reveal (fade + rise 8 px)
- Sticky highlight (element pins next to descriptive text)

Trigger once per element. Threshold: ~25% in viewport. Build scrubbed and pinned motion on CSS scroll/view timelines (`animation-timeline`) with a JS fallback, triggers on IntersectionObserver, never on a bare `scroll` listener; each one is an `effects.registry` entry (`§Effects & performance`).

## Forbidden in marketing

- Carousels as primary content navigation
- Auto-playing video with sound
- Animation on every element on every scroll
- More than two primary CTAs visible in the hero
- "Click here" link text — use specific action verbs

---

# Data Visualization

**Rule:** Three palette types (categorical, sequential, diverging). Tabular numerals everywhere. One legend per chart. Every chart has empty / loading / error states.

## Palettes

Per `viz.palettes`:
- Categorical: 6–8 distinct hues, OKLCH-spaced ≥ 30° apart, equal lightness ~0.55–0.70
- Sequential: 7–9 lightness steps of a single hue; floor 0.95, ceiling 0.20
- Diverging: odd count (5/7/9/11) with neutral midpoint, ends complementary

## Axes & gridlines

1 px `border.subtle` for axes. Horizontal gridlines dashed `border.subtle` at 50% alpha. Vertical gridlines omitted unless required. Tick count 4–6 per axis. Use "nice" numbers (multiples of 1, 2, 5, 10).

## Tooltips

Show on hover at 0 ms delay. Snap to nearest data point. Crosshair guide. Tabular numerals.

## Forbidden

- Pie charts when bar charts work (pies are hard to compare)
- Red ↔ green diverging without secondary cues (CVD failure)
- More than 8 categorical colors
- Wobble / pulse animations on chart elements
- Color-only series differentiation (vary lightness or pattern as well)

---

# Internationalization & RTL

**Rule:** Use CSS logical properties everywhere — never physical. When `mode.rtl_support: enabled`, the layout flips automatically.

## Logical properties

| Physical (forbidden) | Logical (required) |
| --- | --- |
| `margin-left` | `margin-inline-start` |
| `padding-top` | `padding-block-start` |
| `left: 0` | `inset-inline-start: 0` |
| `text-align: left` | `text-align: start` |
| `border-left` | `border-inline-start` |
| `width` | `inline-size` |

## What mirrors and what doesn't (RTL)

Per `i18n.rtl_mirroring`:
- Layout, text-align, directional icons → flip
- Media controls (play, fast-forward), numerals, logos, code blocks → never flip

## Locale formatting

Use `Intl.NumberFormat`, `Intl.DateTimeFormat`, `Intl.RelativeTimeFormat`, `Intl.PluralRules`, `Intl.ListFormat`. Never hardcode formats.

## Tall-script line-height

Per `i18n.script_line_height_multipliers`. Apply via `:lang(ar)` etc. selectors.

## CJK rules

No italic. No underline for emphasis (use weight or color). `word-break: break-word`. Full-width punctuation. Half-width spacing around inline Latin.

## Forbidden

- Physical CSS properties in new code
- Hardcoded date / number / currency formats
- Italic or underline emphasis in CJK
- Brand names without `translate="no"`

---

# Code & Technical Surfaces

**Rule:** Monospace family declared once. Inline code 0.9em of surrounding text. Code blocks have header + body + copy button. Per `options.code_surface`, blocks are either always-dark or match the page mode.

## Syntax highlighting

Use Shiki (modern, uses VS Code grammars), Prism, or highlight.js. Default themes per mode are pre-set; brands can override.

## Keyboard shortcuts

`<kbd>` styling per `code.kbd`. Use platform-aware modifier symbols (⌘ ⌃ ⌥ ⇧ on macOS; `Ctrl Alt Shift` on Windows/Linux). Connect with non-breaking space, never `+`.

## Forbidden

- Proportional fonts for code
- `font-weight: bold` on entire code blocks (syntax highlighting handles emphasis)
- Code blocks without a copy button
- `text-shadow` or `letter-spacing` on code

---

# Product Flow Patterns

## Authentication

Sign-up: email + password (or social row + email link). Single password field with show/hide. Inline password rules. Magic link preferred for consumer products. Errors render below the field, never as global alerts.

Sign-in: email + password. "Forgot password" link. "Don't have an account? Sign up" at bottom.

MFA: 6 individual character boxes (not a single field). Auto-advance focus. Paste fills all 6.

## Settings

Architecture per `options.settings_ia`: sidebar (desktop default), tabs (≤ 6 categories), or single-page (mobile / lightweight). Save model per `options.save_model`: auto-save (consumer default) or explicit-save (sensitive areas). Discard-on-leave warning required for explicit-save.

Dangerous actions (delete account, transfer ownership) in a "Danger zone" section with red border accent and explicit confirmation modal requiring typed string ("DELETE", project name).

## Search / command palette

Per `components.command_palette` — if enabled, ⌘K triggers a centered overlay with search input, recent / suggested / contextual results, keyboard navigation, fuzzy match (50–100 ms debounce).

## Notifications taxonomy

Five channels, each with a clear role:
1. Toast — transient confirmation
2. Banner — persistent contextual message
3. Inbox — async notifications for later review
4. Badge — numeric indicator on icon / nav item
5. Push — out-of-app notification

Action confirmation ("Saved") → toast. Status alert ("Storage almost full") → banner. Async event ("Alice commented") → inbox + badge + optional push. Never use a modal for async notification.

## Onboarding

Per `options.onboarding_pattern`. Five valid patterns; empty-state-driven is the default for premium products. Forbidden: 5+ swipeable intro slides before product use.

## Empty / Error states

Three empty variants: initial (illustration + CTA), filtered (smaller, no illustration, "reset filter"), error (retry action + optional support link).

Errors are calm and helpful — never blame the user. Provide a way back; never dead-end.

## Confirmation patterns

Destructive: modal with title (question form), body (state consequences), Cancel + Confirm (destructive variant). Catastrophic: require typed string. Destructive button on the right (matches macOS convention).

Undo: toast with "Action — Undo" button, 5–10 s window. Preferred over destructive confirmation for any reversible action.

Success: toast for low-stakes; inline checkmark for in-context (toggle, switch). Brief celebration only for milestones — never routine saves.

## Pagination

Three valid: numbered (bounded scannable lists), infinite scroll (feed-like — anti-pattern for footer-bearing pages), "Load more" button (default recommendation for most lists).

## Optimistic UI

Default for premium consumer products. Apply user action immediately, send request in background, reconcile on response. Pair with undo toast for safety.

---

# Microcopy & UX Writing

**Rule:** Four voice invariants — active, concise, human, specific. Banned-word list is mandatory. Length budgets per element are enforced.

## Voice invariants

| Principle | Application |
| --- | --- |
| Active voice | "Install the CLI" not "The CLI will be installed" |
| Concise | Cut "in order to" → "to", "make sure to" → "verify" |
| Human | Write how a thoughtful person would explain to a colleague |
| Specific | "Saved" beats "Success". "12 new comments" beats "You have notifications" |

## Capitalization

Sentence case is the default modern premium choice — easier to read, more conversational, more international-friendly. Title Case (Chicago) is the editorial-premium alternative — more formal, more authoritative, common in publication-style sites. Pick one and apply consistently across headlines, buttons, navigation, menu items.

UPPERCASE is reserved for `overline` eyebrows, badges, status indicators ("LIVE", "BETA"). Always with positive tracking (+0.05 to +0.1em).

## Button label conventions

- Verb-first ("Save changes", "Create project", "Send invite")
- Cap 24 characters (3–4 words)
- Specific over generic ("Save API Key" beats "Save")
- No periods
- Common library:

| Intent | Use | Avoid |
| --- | --- | --- |
| Confirm | "Save", "Save changes" | "OK", "Done" |
| Cancel | "Cancel" | "No", "Dismiss" |
| Destructive | "Delete", "Remove access" | "OK" |
| Marketing CTA | "Get started", "Try it free" | "Click here", "Submit" |
| Auth | "Sign in", "Sign up" | "Login", "Register" |

## Error message structure

Three-part: `[What happened] · [Why (optional)] · [How to fix]`

Examples:
- ✓ "Couldn't save your changes. The connection timed out. Try again, or check your network."
- ✗ "Error occurred."
- ✗ "Internal Server Error (500)."

Frame as forward motion: "Something went wrong — try again or contact support" beats "Your deployment failed."

## Inclusive language (mandatory)

- **Gender-neutral.** "they", "team", "people", "users" — not "guys", "manpower".
- **Non-ableist.** "outdated" not "broken"; "ignore" not "blind to"; "complex" not "crazy"; "main" not "master"; "allowlist / blocklist" not "whitelist / blacklist".
- **Non-violent metaphors in onboarding/help.** "remove" not "kill"; "stop" not "abort" (technical contexts excepted).
- **Plain words.** "use" not "utilize"; "help" not "assist"; "show" not "exhibit"; "before" not "prior to".

## Banned words (mandatory avoidance)

`seamless`, `leverage` (verb), `robust`, `powerful` (without specifics), `cutting-edge`, `revolutionary`, `game-changing`, `world-class`, `best-in-class`, `synergy`, `unlock` (verb), `empower`, `unleash`, `supercharge`, `reimagined`, `redefined`, `transformed`, "click here", "please" before every action.

## Length budgets

| Element | Cap |
| --- | --- |
| Button label | 1–4 words (≤ 24 chars) |
| Toast | 1 short sentence (≤ 60 chars) |
| Tooltip | 1 short sentence (≤ 100 chars) |
| Helper text | 1 sentence (≤ 80 chars) |
| Error message | 1–2 sentences |
| Section heading | 1–6 words |
| Page headline (product UI) | 1–8 words |
| Page headline (marketing hero) | ≤ 44 chars |
| Empty state title | ≤ 6 words |
| Empty state body | 1 sentence |

## Premium positioning structure (marketing)

The four-part arc that recurs across the best premium product marketing:

1. **Acknowledge** a status-quo problem
2. **Frame** the alternative as restoring valuable craft
3. **Prove** with concrete specifics (real numbers, real customers)
4. **Act** with a verb-first CTA

vs the SaaS-generic arc that signals genericness:
1. Abstract benefit ("unlock your team's potential")
2. Vague feature list ("powerful tools to streamline workflows")
3. No specifics, no proof
4. Generic CTA ("get started", "learn more")

## Brand names

Always capitalized as the brand spells itself ("GitHub" not "Github", "macOS" not "MacOS"). Wrap in `<span translate="no">` to prevent auto-translation.

## Numbers

Numerals for counts ("8 deployments" not "eight"). Currency: consistently 0 or 2 decimals — never mixed. Per `options.time_format` and `options.number_abbreviation`.

---

# Do's and Don'ts

A consolidated list of the most important Do / Don't rules. The full anti-pattern catalog lives in `research.md §S` (referenced; not duplicated here).

## Do
- Reference tokens via `{group.path}` for every value
- Use APCA for contrast sanity-checking in addition to WCAG
- Use logical CSS properties
- Pair color with a non-color cue for any meaning
- Author dark mode as a separate palette
- Animate only `transform` and `opacity` on the main render path
- Use `:focus-visible` for keyboard focus rings
- Honor `prefers-reduced-motion`, `prefers-color-scheme`, `forced-colors`
- Use tabular numerals for any numeric column
- Cap body line length at `65ch`
- Use sentence case (or title case — pick one, stay consistent)
- Use the role to choose typography, not the size
- Build every design change for every QA.md `gates.viewport_matrix` class alongside the desktop version
- Pick the cheapest `effects.ladder` tier that reaches the look, and register every effect
- Gate hover effects to fine pointers: `(hover: hover) and (pointer: fine)`
- Replace a changed asset under a new file name
- Use `svh` for full-height sections and `env(safe-area-inset-*)` on fixed elements

## Don't
- Inline raw hex / px / font names in component code
- Invent in-between spacing / size / radius values
- Mix sharp and rounded radii in one composition
- Use opacity to derive disabled state
- Use `transition: all`
- Use Light or Thin font weights in body
- Use more than three weights per screen
- Use more than two type families
- Use justified body text on the web
- Stack a Bold + Drop Shadow + Gradient combination
- Use stock photography of staged office scenes in primary surfaces
- Lazy-load the LCP image
- Use `z-index: 9999` or any value outside the token scale
- Use banned marketing words in copy
- Use "Click here" link text
- Use carousels as primary content navigation
- Use auto-playing video with sound
- Use pie charts when bar charts work
- Hardcode date / number / currency formats
- Skip preference media queries
- Stack more `backdrop-filter` layers than QA.md `backdrop_filter_layers_max`
- Drive scroll-linked visuals from a `scroll` event listener
- Animate `width`, `height` or `mask-size`
- Use bare `vh` for full-height sections
- Decide hover or touch behaviour from viewport width

---

# Brand Kit

**Rule:** the standard FINAL step of filling out `DESIGN.md` is to review the result in the **brand-kit
viewer** (`tools/brand-kit`). It is a static page that reads this `DESIGN.md` + `INFORMATION.md` and
renders the whole system so a human can judge harmony before any product code is written.

```bash
cd tools/brand-kit && npm install
npm run load -- --root <your project>   # or --design <path> --information <path>
npm run dev                              # review;  npm run build → static export to share
npm run export -- --root <your project> # docs→code: emit tokens.css + Tailwind v4 theme.css + DTCG tokens.json
```

**Token export (docs → code).** `npm run export` turns this file's `colors`/`typography`/`spacing`/`radius`/`elevation`/`surface_separation` into build-ready **`tokens.css`** (CSS vars, light + dark), a **Tailwind v4 `@theme`** (`theme.css`), and a **W3C DTCG `tokens.json`** — so tokens reach code without hand-transcription (the #1 drift source). Exported names are dot-safe: a scale key with a dot is written with an underscore (`spacing.scale.0.5` → `--space-0_5`, Tailwind `--spacing-0_5`, DTCG `spacing.0_5`), because a dot is invalid in a CSS custom-property name; reference it in code by that name. The export scripts need Node ≥ 22.18 and no `npm install` (only the viewer does). See `tools/brand-kit/README.md → Token export`. **A token change here re-runs the export in the same change** (commit DESIGN.md and the exported files together); QA Gate H (`check-drift.mjs`) fails when the committed export differs from a fresh export of DESIGN.md.

The kit has two sections:

- **Specimen (raw values)** — logos, all 5 color palettes (12 steps, light + dark, with live APCA
  badges), the type roles at real size/weight, the spacing / radius / elevation scales, and a sample of
  the project's icon family.
- **Composition (harmony)** — the components assembled (buttons in every variant/state, inputs, cards,
  badges, tabs, table, toast) plus a marketing composition and an app-screen mock, all driven by the
  tokens. Light/dark toggle; hover states. (No font-comparison toggle — the viewer renders the chosen
  display font.)

Icons come from the project's chosen family via `icons.library` (lucide / phosphor / heroicons / tabler /
hugeicons; `custom` → graceful fallback). Fonts load from `typography.families`.

## Token contract

The viewer relies on these token paths being present. An AI filling this template MUST keep them intact
so every project routes cleanly into the kit:

- `brand.name`, `brand.description`, `brand.voice` · `INFORMATION.md → project.tagline`, `assets.logo.*`
- `colors.{primary,neutral,success,warning,danger}.{1..12}` and `.dark.{1..12}`
- `colors.shadow_tint`; role tokens under `colors.{surface,border,text,semantic}`
- `typography.families.{display,body,mono}` and `typography.roles.*.{size,weight,line_height,letter_spacing,text_transform}`
- `spacing.scale.*` · `radius.scale.*` · `elevation.scale.*`
- `icons.family`, `icons.library`

---

# Versioning

This template is on `template_version: 1.23.1`. Per-project `DESIGN.md` instances should preserve this field; when the template evolves, projects can migrate or stay on prior versions.

# Source

This template is generated from the brand-agnostic research in `research.md` (the design dimensions in its `§A` onward, plus measured production-site analysis); section anchors next to each default point at the research behind it. The companion mobile template `DESIGN_TEMPLATE_MOBILE.md` shares brand-identity values and applies the same rules to iOS HIG + Material 3 conventions. The optional `tools/brand-kit` package provides the palette generator + the brand-kit viewer.

<!-- 2026-11-14 draft preview (all # draft until Arshawn approves the intake): the full proposed visual system is rendered at /brand
(src/app/brand/page.tsx, tokens in src/app/brand/brand.css): cream paper neutrals (--paper oklch(0.965 0.014 85)), redwood green
primary (generated 12 steps), banana-slug yellow accent (--y9 oklch(0.86 0.14 92), camera button and #1 only), semantic ok/warn/bad,
macro colors, college colors for the rivalry board only, radius 12/20/28/pill, two shadow levels, floating pill tab bar with a
detached yellow camera button, one hero number per screen. Direction "Dining Hall Editorial" from Mobbin research (Beli, Alma,
BitePal, Oura, Revolut, Monzo, Tonal, Yubo, BeReal). On approval these move into the colors/typography/radius/elevation/components
slots above and the token export replaces brand.css. -->

<!-- 2026-11-14 redevelopment (his asks): UCSC blue main and UCSC gold accent (#FDC700), cool neutrals, a modern system sans, and
"i dont want anything all caps text so no overlines or headings all caps or anything": every label, eyebrow and heading is sentence
case, never uppercase or small caps. Style references he named: Cal AI (via Trackify) and Chalk ("i like hte ui of those"): near-white
cool canvas, white cards with faint borders and soft shadows, 22 to 28px radius, bold numbers, color only where it means something,
floating white pill tab bar with a gray capsule on the active tab and a detached navy camera button. Gold is for the #1 dish and
highlights only. Preview: /brand. The draft markers above stay on anything he has not approved (radius, type scale, options). -->

<!-- 2026-11-14 kit v3: real food photos (public/brand/food, Unsplash), Hugeicons, and twelve premium patterns drawn from Mobbin
(Cal AI, Beli, Airbnb, Copilot, Partiful, Crouton, Jomo, Opal, Revolut), listed on /brand under "What makes it feel premium". All
pattern choices are # draft until he approves. -->

<!-- 2026-11-14 open choice (his: "idk if i should keep it flat or add stroke and shadows ... i just dont know the vibe"): /brand has a
Cards switch (Flat / Stroke / Stroke + shadow). Floating chrome keeps its shadow in every mode. Claude's recommendation # draft: Flat
(white cards on a slightly darker cool gray, no stroke, no shadow), shadow reserved for what floats. Maps to profiles.elevation flat
plus floating shadows. Undecided until he picks. -->

<!-- 2026-11-14 (his ask: "i really like the ui of the cards and interface and shadwos and stroke and everything of chalk. why dont we
try cloning that"): /brand defaults to a "Chalk" surface cloned from ~/Downloads/school-app/design-tokens/tokens.css: white canvas,
white raised cards, 0.75px strokes in 8% black, Chalk's two-layer elev-1/2/3 shadows, radius 16 cards and 24 big surfaces, concentric
corners. Font is open again (his: "i want to choos a differnet font but i wnat to see my optiojnks"): /brand shows ten candidates
(system SF Pro, Geist, Inter, Manrope, Plus Jakarta Sans, DM Sans, Figtree, Instrument Sans, Onest, Outfit) with a live switch.
typography.families stays as written above until he picks. -->

<!-- 2026-11-14 surface option "Sidestash" (his spec, from his own Sidestash app, Palette.swift): the page is a mid cool neutral
(not the brightest), cards and buttons are LIGHTER than the page with a subtle top-to-bottom neutral gradient (lighter on top), a
pure white 1px stroke, and Sidestash's chip shadow (ink 8%, blur 2, y 1); floating chrome adds a soft wide layer. It is the default
on /brand now, beside Chalk, Flat, Stroke and Stroke + shadow. Undecided until he picks. Font default on /brand: Manrope.
His tweak the same day: cards get a much subtler gradient (L 0.988 to 0.978); buttons, chips and the bottom tab bar keep the stronger one (0.993 to 0.963). -->

<!-- 2026-11-14 (his asks): (1) blue options on /brand, a Blue menu with Bright (default, oklch 0.52 0.165 252), iOS blue, Azure,
Cobalt, Ocean and UCSC navy, each a generated 12-step scale; buttons, the camera and the Today glow follow the active blue.
(2) iOS-style scroll edges ("a progressive gaussian blur and lighten on the top and bottom kind of like actual ios has"): five
stacked backdrop-filter layers (1, 2, 4, 8, 16px) each masked to a band of a gradient, plus a fade toward the page color, pinned at
the top (under the status bar) and bottom (under the tab bar) of every scrolling screen; hidden under prefers-reduced-transparency.
This is an effects.registry entry (tier 2, backdrop-filter) to measure under QA Gate B2 before it ships in the app. (3) Sidestash
background lighter (page L 0.955, was 0.938). Blue and surface still open until he picks. -->

<!-- 2026-11-14 motion and polish (his asks): "i want all animations to be smooth and premium and polished nad lots of micro
interactions where applciable but not doing too much or making stuff look gimmmicky or overdesigned", plus the gooey effect
"subtle and cnsistent". Draft motion system on /brand: one spring (stiffness 420, damping 36, mass 0.9) and one easing
(cubic-bezier(0.22, 1, 0.36, 1)) for everything; press feedback (buttons 0.97, icon buttons 0.9, cards 0.985, 140ms); sliding tab
capsule and segmented pill (Framer Motion layout); numbers count up once; this-or-that pick settles, the other dims, the change
slides in; gooey (liquid-gooey 0.2.2, MIT, no dependencies) used in ONE place, the camera button splitting into Log a plate and Ask
SlugGrub on the "smooth" preset; only opacity, scale and position animate; reduced motion makes everything instant. Background a
step darker (page L 0.944) and card gradient subtler (0.986 to 0.980). All strokes and dividers are 0.5px hairlines (his ask
"make the hairlines just look like normal hairlines"). -->

<!-- 2026-11-14 surface option "Flat + Sidestash" (his ask: "lets try flat but sidestach for the top buttons and the navigation
bar"), now the default on /brand: flat cards (solid fill L 0.984 on a page of L 0.944, no stroke, no shadow); round top buttons,
See all pills, segmented pills, secondary buttons and the bottom navigation bar keep the Sidestash raised gradient, white 0.5px
hairline and chip shadow. Undecided until he picks. -->

<!-- 2026-11-14 surface option "Sidestash, solid cards" (his ask: "lets try sidestash but for the cards no gradient"), now the default
on /brand: the Sidestash surface with cards on one solid fill (L 0.984) instead of a gradient, white 0.5px hairline and chip shadow
kept; buttons, pills and the nav bar keep the gradient. Undecided until he picks. -->

<!-- 2026-11-14 bug found and fixed: the Sidestash button rule's :is() list included ".seg button.on" (specificity 0,4,1), which
outranked every later card and hairline rule (0,4,0). So the two "subtler card gradient" tweaks, the solid-cards option and the 0.5px
hairlines never rendered in Sidestash mode. Fixed by raising those rules' specificity (.sg.sg). Verified in the browser by computed
style: cards solid fill with 0.5px border; top buttons and nav bar gradient with 0.5px border. Lesson for the real build: keep card
and button surface rules in separate selectors, never one shared :is() list. -->

<!-- 2026-11-14 (his asks): default stays "Sidestash, solid cards", now on the Flat option's page color (L 0.962); the plain
"Sidestash" option gets a visible card gradient back (L 0.990 to 0.972, still softer than buttons at 0.993 to 0.963). -->

<!-- 2026-11-14 (his ask: "just give me all teh steps for hte backgrond color so i can decide what i like hte most"): /brand has a
Background menu with 11 steps of the cool page color (oklch L 0.994, 0.985, 0.977, 0.970, 0.962, 0.955, 0.948, 0.944, 0.938, 0.930,
0.920; chroma 0.004, hue 250); the fill behind segmented controls and the active tab is 0.032 darker. Current default 0.962. Open
until he picks a step. -->

<!-- 2026-11-14 screenshot review of all 7 screens (his ask): fixed three render bugs: the gooey camera button had a zero-height
liquid layer (invisible), the scrolling screen's flex column squashed the Halls carousel and the Today photo card to zero height,
and the rank "or" disc sat under the animated cards. Control bar moved to the bottom of the kit page. Rule for the real build:
scrolling screens set flex-shrink 0 on their children; a Liquid group always gets an explicit size. -->

<!-- 2026-11-14 HIS DECISION (surface): "lets do flat + sidestash as defauly ... make the nav bar button and the top bar buttons and
the camera button sidestash style but everythign else is flat, like every other button and element is flat." So: the bottom
navigation bar, the round buttons in each screen's top bar, and the camera button get the Sidestash finish (raised gradient, white
0.5px hairline, chip shadow; the camera keeps its blue gooey fill with a white top sheen and hairline). Every other element (cards,
primary and secondary buttons, See all pills, segmented pills, chips, other icon buttons) is flat: solid fill, no stroke, no shadow.
Verified by computed style on /brand. Still his to pick on /brand: background step (Background menu, default 0.962) and card fill
step (Card fill menu, 8 steps from 1.000 to 0.960, default 0.985). -->

<!-- 2026-11-14 camera button fix (his screenshot, "this button looks bugged"): closed droplets' icons stacked through the main
icon, and the sheen/hairline drew an inner ring because the button is smaller than the gooey blob. Droplet icons now fade in only
when open; the top sheen and white hairline are inset layers of the Liquid shadow, so they follow the blob's real edge. Checked by
zoomed screenshot. -->

<!-- 2026-11-14 scroll edges (his spec: "the progressive blur and progressive lighten should be the same location and same gradual
intensity and BEHIND all of the sticky content like top buttons or nav bar and it should only affect the scrollable content
underneath"): one shared ramp (--ramp-top / --ramp-bottom) masks both blur layers and the page-color lighten; the top bar is
sticky (z 6) and the nav bar floats (z 8) above the edges (z 5), which sit above scrolling content (z 1); each edge ends where
content starts at rest, so nothing is blurred until it scrolls under. Verified in the browser. -->

<!-- 2026-11-14 app icon, card chevrons, launch splash (DECISIONS.md, same date). Icon: the food button (white rice bowl, stroke 1.9,
on --p9 #0069bf, glyph 56% of the tile), src/app/icon.svg + apple-icon.png. Clickable cards (.card.link) carry .card-chev at the top
right: 16px ArrowRight01Icon in ink-3, or on a white 26px chip (.on-img) over a photo. Launch splash (src/components/ui/Splash.tsx,
globals.css "Launch splash", # draft trial): 88px tile radius 20 on --paper; strokes draw via stroke-dashoffset (bowl 0-440 ms,
rice 90-530, chopsticks 300-560 and 360-600, ease 0.65 0 0.35 1); fade-out 760-1020 ms, opacity only on the full-screen layer,
4px blur on the tile alone; reduced motion: no draw, 200 ms fade after 300 ms. Once per full page load. -->

<!-- 2026-11-14 splash revised at his ask (DECISIONS.md amendment): no tile; 64px rice bowl in --p9 over the app under one fixed 8px
backdrop blur; draw timings unchanged; at 760 ms the icon fades with 4px blur and the backdrop layer fades by opacity, both 300 ms,
same curve. Blur budget exception, launch only: a 7th backdrop layer for about 1 s, radius never animated; removed from the DOM after.
Seen frozen at 600 ms in Chrome (blurred Today screen, blue bowl centered). -->

<!-- 2026-11-14 splash tuned at his ask: backdrop blur 8px -> 12px (blur_budget.launch_splash_exception), bowl 64px -> 80px. -->

<!-- 2026-11-14 Today wired to data + photo log end to end (Claude, for his review; values # draft unless quoted).
Today top bar (his ask: "can you add this text to teh chip that says teh college dining hall: Dinner · open till 8 PM"): the
.tint.blue hall chip now reads "hall · meal · hours" ("JRL/C9 · Dinner · open till 8 PM"; between meals "opens at 5 PM"), and the
separate label line above the greeting is gone. New reusable classes in globals.css: .tint.fit (chip may shrink) and .tint .clip
(one line, ellipsis): the hours end truncates before anything wraps. Checked at every devices.html size: 36px tall, one line; at
320px it truncates with a 10px gap to the notifications button. Greeting follows the campus clock (Pacific): good morning /
afternoon / evening. # draft
Today card 6, "Calories today" (PLAN.md): one row in the Rank card's pattern (.card.tight.press.link, chevron top right, 44px
paper-2 icon chip with FireIcon, title 14 bold, label 12, number 17 bold tabular at the right); sub-line "Only you see this", or
"Log a plate to start · only you see this" with no number when nothing is saved today. Sits after the Rank card. Reads this device
only. # draft
Top pick card: when a dish has no photo yet, the card drops the photo and shows the gold "#1 at your hall" tint inline, plain chevron.
Pace text color: on pace --ok, spending fast --bad, spending slow --ink-2. # draft
Photo log (LogScreen): pick phase adds the meal Seg (Breakfast, Lunch, Dinner, Late night), defaulting to the meal open now or the
last one that opened (you log after eating); new "error" phase (alert icon chip card + "Try another photo" primary); item rows show
"servings × official portion · cal", "rough guess" when Gemini is unsure, a rice bowl icon chip when the dish has no photo; servings
slider 0.25 to 4 in quarter steps (was 0.5 to 3 by halves) because label portions are small (a 1/2 cup side); a line lists food
not on the menu ("not counted"); "Fix it" became "Retake"; sliders hide once saved. All state changes use Appear and Swap. # draft -->

<!-- 2026-11-14 Halls, Budget, Onboarding and Ask wired to real data (menus code, for his review; no new colors, classes or blur;
values # draft). Halls: dish rows drop the demo star score (no ranking data per dish yet) and read "cal · portion" from the UCSC
label ("No label" when the label is missing); a dish with no generated image gets the neutral tile used in the photo log (64px
paper-2 rounded square, RiceBowl01Icon), never a wrong photo; the hall tag reads the hall's real status ("Open till 8 PM",
"Opens at 5 PM", "Closed today"); a closed hall or meal shows one plain card ("Porter/Kresge is closed today."); one label line
under the list: "Plus the salad bar, deli bar, cereal, fruit and drinks." (sauces, buns, bars and standing items are hidden, the
same way the image script skips them); a label line explains when a day's menu isn't posted and the nearest day is shown. Opens
on the usual hall from onboarding. Cafe board rows: cafe name, sub-line "location · three food items", right side "N items" (label
style) in place of the demo score. Budget: the pace pill follows the real pace (ok "On track", warn "Spending fast", neutral
"Spending slow"); a label line under the ring says "Example numbers" (no profile) or "Estimated from the N you entered Nov 14"
with a See all style link to onboarding; cards: "Per day to last" / "Days left" (quarter), "Your average a day" / "To spend this
week" (week); the chart's line runs from the quarter start to today on the real numbers; the invented hall / cafe / market rows
became one label line saying SlugGrub can't see card purchases. Until the profile is read on the phone the screen shows only its
title, so numbers appear once, in place. Onboarding: plans from MEAL_PLANS (2026-27 amounts), slider max follows the plan, the hall
follows the college until picked; the done step adds a btn-secondary "Continue with Google" (GoogleIcon, Hugeicons) above the
primary button and a label line ("Saved on this phone only." + sign-in state, Swap). Ask: a label line while waiting, an alert
card (Alert02Icon chip, like the photo log error) for errors, the answer in body text, pick cards as before plus a label line with
Gemini's reason. Onboarding and Ask moved to OnboardingScreen.tsx and AskScreen.tsx (MoreScreens re-exports them). Photo.tsx:
sized copies of generated images now resolve to /food/gen/sm and /food/gen/md (they were 404s, so every generated photo under
180px showed broken). -->
<!-- 2026-11-14 ranking screens wired to real data (Claude, rankings half; for his review, # draft). Rank, Vote and Dining services
keep their look; changes only where real data needed them. Rank: the duel label reads "<meal> at <hall>" (usual hall from the
onboarding profile, the meal that last opened); a dish with no generated image shows the neutral dish tile (.ph, paper-2, rice bowl
icon) as in the photo log; the result card shows the real Elo gain, or a save error with a Retry text button; Undo, Too tough and
Skip work for real. Leaderboard: the header says "<college> is #N this week" (or who leads, or "No votes yet this week"); hall rows
show "N pts · N dishes ranked" and an up/down chip only once a week-opening snapshot exists (no made-up "same"); the Colleges board
lists all 10 colleges by votes this week, the student's own row on --p3 as before. Vote: the decorative QR mark is now a real QR code
(src/lib/qr.ts, SVG, ink on white); the right top bar button opens the projector view (Tv01Icon); with no round live, a card says so.
A vote block without an image sits on --p9. Projector view (/vote/screen, new): the only screen outside the 440px column (a small
.projector block appended to globals.css: fixed full window, page color, two columns, one under 800px): big vote blocks, a large QR
card, the live hall leaderboard and a Next round secondary button. Dining services: the title is "What students love" (votes are
all time, not weekly); a row of chip-sm hall filters (All halls + 5) above a "From N matchups and N skips" label; empty states say
so. Photo.tsx: generated images (/food/gen/) have no sized copies, so Photo serves the original for them (it was requesting
/food/sm/gen/..., which 404s; this also fixes the photo log thumbnails). All state changes use Appear and Swap; no new blur,
colors or one-off styles beyond the projector block. # draft -->

<!-- 2026-11-14 Today on real data (TodayScreen server loader + TodayView client): hall, college, plan and points come from the
profile saved on the device (src/lib/profile.ts); the chip reads "<hall> · <meal> · <hours>" from mealNow (weekend hours, "closed
today"); when the usual hall is closed the hero shows the best dish at an open hall, tagged "#1 at <hall>"; with no profile the
Slug Points and college cards say "Add your plan" / "Pick your college" and link to onboarding (no made-up numbers); "Rank today's
food" pairs two real dishes from the hall; "Best on campus today" lists the top 4 by rating; a dish with no image shows the neutral
rice-bowl tile (paper-2, ink-3 icon). # draft -->

<!-- 2026-11-14 Today wash (his ask: "make that blue gradeitn the primary blue color, closer to it"): the top wash is --p9 at 30% fading
through 12% at 45% to clear at 240px (was 15% to clear), so it reads as the primary blue instead of a grey-blue tint. # draft values -->

<!-- 2026-11-14 Row cards (.card.tight, e.g. Rank today's food, Calories today): the chevron sits centered vertically at the right, 12px in (his ask: "for hte cards for the smaller ones make hte chevron centered vertically"); taller cards keep it at the top right. -->

<!-- 2026-11-14 Every control does something (his ask: "make all the buttons clickable and do/connect with what they should"):
Halls search (top bar) swaps the screen for a pill search field (.input, same as Ask's) and searches every hall's dishes today by
name; a result is a row card with a chevron and opens that hall and meal. "Best on campus" on Halls is real: the top 6 rated dishes
with photos, one card per dish name, gold "#1" on the first; a card opens its hall; "See all" opens the leaderboard. Today's bell
(no notifications exist) became a profile button (UserCircleIcon) that opens onboarding to edit plan, points, college and hall.
One page margin: .carousel rows scroll edge to edge but rest their first item on the 16px gutter (scroll-padding-inline). # draft -->

<!-- 2026-11-14 Today hero, trial (his words: "i might revert but i want to try like for this allergen free card ... like one of these rank cards ... how the image isnt edge to edge but rounded in this container"): .card.inset, the photo 16px radius inside 8px card padding, card radius --r-lg (24), concentric like .duel-opt; was .card.flush edge to edge. -->

<!-- 2026-11-14 Wash scrolls with the page (his ask: "make the blue wash not sticky but scroll with the page"): it stays outside the scroller (so the fade mask and edge blur never touch it) and follows scrollTop with a transform, once per frame (src/components/ui/Wash.tsx). -->

<!-- 2026-11-14 Rank "or" badge: centered vertically on the two cards (was 40%) with a 6px ring in the page color (--paper) that notches both cards like a cutout (his ask); it leaves with the blur-fade state change instead of shrinking (his rule: no expand or compress). -->

<!-- 2026-11-14 Rank notch tuned (his ask: "the gap for teh or circile is a bit too much and round the edges"): 4px gap around the "or" badge (was a 6px page-colored ring), cut into both cards with a static mask that has 5px rounded fillets where the notch meets the card edge. -->

<!-- 2026-11-14 First open and live data (Claude, for his review): with no profile on the device, Today shows a "Set up SlugGrub" row card under the greeting (.card.tight.press.link, centered chevron, 44px icon tile in --p3 with UserAdd01Icon in --p9, same pattern as Calories today and Log's camera tile) that opens /onboarding; onboarding's Skip and "See what's good tonight" return to Today with replace. No redirect, so /vote from a QR code never lands on onboarding. Log a plate uses the saved usual hall and today's real hours; "Use a demo plate" sends the generated image of a dish on that hall's menu for the meal and hides when there is none. Hall colors moved from the demo file to src/components/screens/hallColors.ts (same tokens); the demo file is gone. No new colors, classes, blur or motion. # draft -->

<!-- 2026-11-14 Budget chart (his ask: "make this graph actualy have axis and mean something ... easy to visually skim which i want to keep ... too short"): one measure, Slug Points left, over the quarter (src/components/screens/PaceChart.tsx). Y axis 0 / half / plan total, x axis quarter start / Today / quarter end, recessive grid in --paper-2, labels in ink tokens 11px. Lines: You (solid --p9 2.5px, start to today), Your pace ahead (dashed --p9 at 55%, to the quarter end or to zero), Even pace (dashed --ink-3). Legend above names all three; touch or hover shows that day's values; today's dot has a 2px card ring. 176 tall (was 64). # draft values -->

<!-- 2026-11-14 Hall status text: "open till" names when the hall closes, following meals that hand straight over (dinner into late night), not when the current meal ends (his catch: "its saturday today doenst c9 dining hall close at 10 pm not 8 pm"). -->

<!-- 2026-11-14 Hall hours checked against dining.ucsc.edu/locations-hours for all five halls (weekday, Friday and weekend schedules match src/lib/halls.ts). Between meals every hall runs continuous dining (limited entrees) 11 to 11:30 and 2 to 5, so a hall reads "open till <last close>" all day, and "light menu till <next meal>" in the gaps; before the first meal "opens at", after the last "closed for the day", closed days "closed today". -->

<!-- 2026-11-14 Side-scrolling pager, trial (his words: "lets try an animation where when you slect a food item and hte next one comes in, it scrolls to the side instead of just blurring in a new one and you can manually scroll to go back to change your answer. all per the design.md", then for Halls: "when pressing on the collge chips, make it scroll smoothly left and right instead of just blurring to change the content ... consistent with the rank udpate"). One shared component, src/components/ui/Pager.tsx, with .carousel.pager in globals.css: native horizontal scroll, scroll-snap x mandatory, full-width pages 16px apart (the gutter, so the next page never peeks), edge to edge but resting on the 16px gutter like .carousel; smooth scrollTo, instant under reduced motion and on first paint. The side scroll is the one movement: no new blur layers, no scale. Rank: one .duel per matchup; a pick shows the tick, then the next matchup is added and scrolled to; swiping back shows earlier picks (tick, other card at 0.5), tapping the other card there changes the answer (old vote undone first) without advancing; the page in view drives the meal label, Undo, Skip and Too tough; the "or" badge keeps its blur-fade. Halls: one page per hall in chip order ("<hall>, <meal>" header, status tint, dishes); a chip scrolls to its page, a swipe selects the chip and keeps it in view; each hall keeps its own meal and the meal switch keeps the blur-fade; the pager is as tall as the page in view. # draft -->

<!-- 2026-11-14 Halls "Best on campus" cards are filled like Rank's (his words: "on this page the best on campus should be in the fill card like the rank style as well"): each item is a .duel-opt (--card fill, --r-lg radius, 8px padding, 12px bottom), the photo inset at radius 16 (concentric), name and "hall · votes" inside under the photo, left-aligned, same type sizes; gold "#1" stays on the first photo; 156px photo, so the card is 172 wide; still a button that opens its hall and dims on press. # draft -->

<!-- 2026-11-14 Halls meal switch + search in one row (his words: "maybe if this slider is relevant, combine it with the search button. if you do, make ti look nice and give it the sidestash style too"). This extends the Sidestash finish to the meal switch at his request: the top bar's search button is gone; under the title one row holds the Seg with .raised (--raise fill, 0.5px --hi hairline, --chip-shadow, same as .topbar .iconbtn; the selected thumb unchanged) and, at the right end, a round .iconbtn.raised search button as tall as the Seg (48px at 440 wide, 45px at 320; never under 44). Search swaps the row for the search field plus a round close button with the existing blur-fade; closing swaps back. Under 360px wide "Late night" reads "Late" (Seg render prop, .seg-long/.seg-short) so the row fits at 320 with no horizontal scroll (measured). # draft -->

<!-- 2026-11-14 Best on campus cards: every name gets a fixed two-line box and is cut with an ellipsis after two lines (.clamp2), so all cards in the row are the same height (his ask: "truncate names if needed but i dont like how some are longer than others"). -->

<!-- 2026-11-14 Halls chips: the selected chip is a blue goo thumb (GooTrack, motion.goo + motion.spring) that follows the hall pager while it scrolls, not after it settles (his ask: "i dont want the chip to change at the end but while its going ... a bit of goo ... or spring"). A saved usual hall opens instantly (the pager never slides while the screen opens). -->

<!-- 2026-11-14 Cafe board on the site's real data (menus code; no new colors, classes, blur or motion; # draft). Rows keep their look; the sub-line now reads "<location> · <open status> · up to three things to eat", the status from each location's posted hours on dining.ucsc.edu in the halls' wording ("Open till 9 PM", "Opens at 8 AM", "Closed for the day", "Closed today"), left out when a location has no posted hours. The highlights are real lines from that day's menu, mains before bakery and bagels, never drinks, add-ons, bowl parts or spreads. The header's right label says which day the menus are from ("Today's menus", or "Menus from Monday" when the cafes are closed today); "Same menu every day" was wrong (bakery items and prices change day to day) and is gone. Porter Market and Merrill Market sit under their own "Markets" heading in the same card style with ShoppingBasket01Icon (Hugeicons) in the icon tile. "N items" is the count of lines the site lists that day. -->

<!-- 2026-11-14 Today "Rank today's food": the two dishes come from the meal the hall is serving now (or next), falling back to any ranked dish at the hall, so a lunch dish never shows at dinner. -->

<!-- 2026-11-14 (his asks, same evening):
- Sidestash segmented controls (Halls meal switch, Rank view switch) have a pressed-in thumb, trial: "make it look like the selected one is like an indentned curve, i might revert this tho ... the shading and maybe the gradietn". Reverse raise gradient (darker top), inner top shadow, faint white bottom lip, drawn over the goo thumb with the same spring (GooTrack `inset`). # draft values
- Rank: the This or that / Leaderboard switch and the live-vote QR button share one Sidestash row under the title (his ask: "for rank if that slider and that qr code should be combined do that too"), like Halls.
- Rank "or" notch is now painted (a --paper shape behind the badge, same 4px gap and 5px fillets) because card masks don't render inside the pager's scroller (his report: "the or coutout seems gone now").
- Top bar status chips (Today's hall/meal/hours, Budget's plan) are Sidestash and not pressable (his ask: "dont make it clicable and make it sidestash stye ... same for anywhere else this chip appears in the top bar").
- Budget chart: lines labeled on the chart (You, Your pace, Even pace), legend row and readout line removed; touching shows the day's values inside the plot (his ask: "put the you and pace ahead as labels on teh actual graph and remove a lot of the text up top its less easy to skim"). -->

<!-- 2026-11-14 (later): Sidestash switches are now a flat --paper-2 track with the chip shadow and a Sidestash thumb (raise, hairline, chip shadow); the pressed-in thumb is dropped (his call). Today's "Set up SlugGrub" is a pill (radius --r-pill) with its icon in a neutral circle (--paper-2 fill, --ink-2 icon), not blue (his ask). Budget ring sweeps 250 degrees and the pace pill sits in the opening at the bottom, below the number (his ask: "put it in that disconnect at the bottom ... shorten the ring to fit it"). -->

<!-- 2026-11-14 Rank card names clamp to two lines in a fixed 36px box (same .clamp2 as Halls), so both cards keep one height. -->

<!-- 2026-11-14 Top bar status chips keep their tint color (blue: --p3 fill, --p9 text) with the Sidestash finish: a top-to-bottom raise of their own color (lighter at the top), white hairline, chip shadow (his ask: "they should still be the color they were before, just sidestash style"). -->

<!-- 2026-11-14 Concentric corner badges: a pill in a photo corner sits at offset = photo radius - pill radius (24px pills: 4px in a 16px-radius photo, 6px in 18px; never under 4px); the Today hero chevron chip (26px) sits 8 + 3 = 11px in. Card 24 = photo 16 + 8 padding (his ask: "corner rounding ... cohesive with outer inner and ... the pill, pixel width formula"). -->

<!-- 2026-11-14 Budget chart cleanup (his ask: "remove the vertical and horizontal lines thats just clutter. dont allow mouse hover to interact wiht it and make sure hte labels dont clip"): no gridlines and no today line; y axis labels only 0 and the plan total; not interactive; line labels carry a 4px card-colored halo so no line runs through them. -->

<!-- 2026-11-14 Hall chip row: 8px of room above and below inside the scrolling row (negative margins keep the layout), so the goo thumb's soft edge is never cut flat by the row's clipping (his report: "this lookos clipped at the top and bottom"). -->

<!-- 2026-11-14 Halls search: the field has the Sidestash finish like the row it replaces, and results update from the first letter typed (his ask: "make sure hte search bar is sidestash style and that menu items actually appear live"). -->

<!-- 2026-11-14 Onboarding illustrations (his ask: "really nice and polished graphics and not crowd everything to the top of the screen"), src/components/screens/OnboardArt.tsx: meal plan = three fanned plan cards, the chosen plan in front (Sidestash raise) with its points per quarter; points = the Budget ring filled to the entered points; college and hall = a campus map (--paper-2 tile, contour lines) with every college or hall as a pin, the chosen one blue with a Sidestash name chip. Each step fills the screen: illustration, question and answers centered in the space above Continue. Choices blur-swap; nothing slides. # draft -->

<!-- 2026-11-14 Segmented controls, from his screen review (S08, Log): "the late night seems to have extra space on teh riht, just space them out enough and the one bolded should be the one with teh highlight on it". A switch stretched to its row spreads the spare width across all options (.seg > .track and .seg button flex 1 1 auto) instead of leaving it after the last one. The thumb could sit under the wrong option: the meal is read from the clock right after the page opens, so the switch first draws the placeholder (Dinner) and then changes to the real meal (Late night); the thumb slid there, and in a frozen capture stayed on Dinner while "Late night" was bold. GooTrack now jumps straight to the current option while the screen is opening and redraws its goo layer there (keyed on the index), then uses THE spring as before; this holds for every switch (Log, Halls, Rank, Budget). -->

<!-- 2026-11-14 Leaderboard color coding, from his screen review (S05): "i dont like how each college has this weird vertical strip of color. but i still think color coding would work, figure out a differnet way". The 8px color strip is gone; the place number sits in a 32px disc tinted with the hall's color (.rank-badge: 15% of --c-<hall> over --card, the number in the same hue mixed toward --ink), on both the Halls and Colleges boards. Flat, no shadow; the gold #1 number is replaced by the hall's color. -->

<!-- 2026-11-14 Budget chart and outlook, from his screen review (S06): "remove teh long text that says at this pace at the bottom of the graph and just have one line of bigger text that says at this pace you will run out by so and so date ... but make it actually match the pace. also make the graph line fade out and space out the labels more so they aren tso close to the lines". Under the chart: one 16px/600 --ink line, "At this pace you run out Dec 3" (computePace runOutDate, the exact day, no longer "the week of") or "At this pace you finish with 617 left" (leftoverAtQuarterEnd); the even-pace sentence is gone. Both come from the same average a day the dashed line is drawn with, so the sentence and the line's end agree. The "Your pace" line fades from 70% to 0 along its length and the even-pace line fades out over its last 45% (SVG linearGradient strokes, no blur). Labels: "You" centered 16px above the dot; "Your pace" starts above its line and reads toward the fade; "Even pace" ends below its line, so neither leans into its line. -->

<!-- 2026-11-14 Onboarding buttons, from his screen review (S10): "make all the continue buttons in onbaording sidestash style". Continue, "See what's good tonight" and "Continue with Google" take the Sidestash finish (.btn.raised). The blue button stays blue, raised like the food button: a gradient from 86% --p9 mixed with white at the top to --p9 at the bottom, a 30% white inner top highlight and the food button's shadow; the white button gets --raise, the --hi hairline and --chip-shadow. Presses still only dim. -->

<!-- 2026-11-14 Onboarding college and hall art, from his screen review (S12, S13): "i dont like this ggraphic" (both campus maps). Replaced with the plan step's language: a raised front card over two faded fanned cards. College: an "Your college" chip (Mortarboard01Icon), the college's seal on the right (a --p9 pill with its initial or short form: P, C9, JRL, RC; the one blue thing, the pick), the name at 26px/700 and "Dining hall: <hall>" under it. Hall: a preview of their usual hall now: one of today's dishes with its generated photo (the same pick as Log's demo plate, src/components/screens/demoPlates.ts) inside the card's 8px padding with concentric corners (card 24 = photo 16 + 8), the hall name, its open status from today's real hours (mealNow; a green --ok dot when open) and "<meal>: <dish>" on one clamped line. A hall closed today shows the neutral dish tile and "Closed today". No maps. Choices blur-swap; nothing slides. The .art-map, .art-pin and .art-tag classes are removed. -->

<!-- 2026-11-14 Ask layout, from his screen review (S09): "put the prompt bar near the bottom with the suggestions above it. make the prompt bar and the prompt send button sidestash style. also make sure this functionality actually works". The title stays at the top with the answer under it; the suggestion chips sit just above the prompt bar, which sticks to the bottom of the screen 40px above the nav bar in every state (idle, answering, scrolled). Its shelf is the page color (a 10px fade at its top edge, no blur), so answers scroll away behind it. The field is .input.raised at 16px (no zoom on focus in iOS); the send button keeps its blue in the Sidestash finish (--raise-blue: the same lighter-topped blue gradient, white inner highlight and food-button shadow as the onboarding buttons, now tokens shared by .btn-primary.raised and .iconbtn.send). Checked against the live menus: two real questions returned three picks each from JRL/C9's late night menu with label calories and protein. -->

<!-- 2026-11-14 Budget outlook line, from his screen review (S06): "center the at this pace text and increase padding from it and the graph per hte design.md". The one outlook line under the pace chart is centered (text-wrap: balance) and sits 16px (spacing.scale.4) under the chart's date labels, up from 6px. -->

<!-- 2026-11-14 Onboarding college map, back and polished, from his screen review (S12): "i think i liked the map more, just make it look better and not sloppy like before". Supersedes the college half of the cards note above (the hall step keeps its card). A --paper-2 map tile 8px inside a raised card (Sidestash raise, --hi hairline; corners 24 = 16 + 8), 320 x 208 at full width, inside the 236px art frame. The tile keeps the map's own aspect ratio (304:192), so the hill's contour lines (five soft closed curves in --paper, highest to the north) are never stretched. Each college is placed from its real latitude and longitude, north up, at about true proportions (east-west 1.09x), snapped to a 4px grid: Nine and John R. Lewis at the top, Crown and Merrill north-east, Cowell and Stevenson east, Kresge and Porter west, Rachel Carson and Oakes south-west. Pins: other colleges 8px --ink-3 with a 2px --card ring; the pick 12px --p9 with a 14px halo (18% --p9). Its name chip (.art-chip, location icon in --p9, name in --ink) takes the first of right, left, above, below or a corner that stays 6px inside the map and 7px clear of every other pin (OnboardArt.tsx tagSide; checked for all ten colleges). A small "N" mark top right. Changing the pick blur-fades the pin and chip out at the old college and in at the new one (STATE_OUT/STATE_IN, nothing slides). # draft -->

<!-- 2026-11-14 Onboarding hall card, from his screen review (S13): "keep this like this but only if you can get images of each college from the web and put them here or even better their dining hall building". The card stays (name, open status); the dish photo is replaced by a 140px photo of the hall (public/halls/<hall id>.jpg, 800 x 500, sources and licenses in public/halls/CREDITS.md), so a hall closed today (Porter/Kresge and Crown/Merrill on weekends) still shows a picture, with "Closed today" as its status. The "<meal>: <dish>" line is gone. Step dots: drawn with CSS (.step-dot: 7px, the current step 22px on --spring, done steps --p9) so they paint in place on the first frame; the framer dots had no size until their animation ran and were missing from frozen captures and steps opened by link. -->

<!-- 2026-11-14 (later) The onboarding page preloads the five hall photos (react-dom preload, low priority, about 390KB), so the hall step opens with its photo and switching halls never shows an empty tile. -->

<!-- 2026-11-14 (final check) Halls meal switch row fits the phone. Found driving the production build at 393px: the switch kept its natural width (about 330px), so with the 44px search button the row was 385px in a 361px column and pushed the search button, the section heads, the status chip and every dish card 8px past the right edge (the right gutter was gone and dish photos were cut). The switch now fills the space the button leaves (.seg.fill: flex 1 1 0, min-width 0) and its options share that width with 2px side padding, so the row is exactly the 16px-gutter column from 320px to 440px (checked at 320, 393 and 440; no element past the edge on any screen at 393). The goo thumb still sits under the picked meal. -->

<!-- 2026-11-14 (final check) Portions: UCSC's menus write ladled portions as "ozl" (ounces by ladle: "4 ozl" Artichoke Bisque, "6 ozl" soups), which read as a typo on Halls, Today, Ask and Log. They show as fluid ounces ("4 fl oz", src/components/screens/portion.ts); every other portion stays as the site writes it ("1 ea", "1/12 pie"). -->

<!-- 2026-11-14 Demo data chip (demo mode, DECISIONS.md of the same date). While demo mode is on, a small "Demo data" chip marks every screen whose rankings are mock, so they are never mistaken for real votes: right end of the Rank top bar, the Dining services "From N matchups" line, beside the /vote title, and before the Live tag on /vote/screen. It is the small Sidestash chip (.demo-chip, the same build as .art-chip: 26px pill, 0 10px padding, --raise, 0.5px --hi hairline, --chip-shadow), 12px 600 sentence-case text in --ink-2, no icon. Information only, not a button (no press dim). Hidden entirely when demo mode is off (src/components/ui/DemoChip.tsx). # draft -->

<!-- 2026-11-15 Goo on WebKit (his iPhone recording of the food button, Safari: "not only very laggy on mobile but also missing like
the fill and goo animation and also cutting off the button on the sides ... if you can keep the goo and fix it then do that", then
"just make all the animations play and perform properly on mobile and the webapp"). What WebKit did: liquid-gooey draws the goo in
an SVG sized to its Liquid element, promoted (will-change: filter, transform) and carrying a CSS drop-shadow. WebKit clips that layer
to its own box and ignores overflow: visible, and the food button's Liquid was only the 62px button, so the droplets (which travel
53px left and 71px up) lost their blue blobs, the bulge of the split was cut square at the button's top-left corner, and nothing
merged visibly. Chrome honors overflow: visible, which is why desktop looked right. It was also slow: the 84px filterPadding made a
330px-square filter area (about 1M device pixels at 3x) that WebKit re-rasterized on the CPU on every frame of the split, through
the goo blur plus an erode + blur pass for the lift shadow's -8px spread. Measured in Playwright WebKit (iPhone 14 Pro profile, 3x):
open drew 13 to 14 frames in 0.9 s (about 60ms each), close about 31ms per frame, in dev and in the production build.
What changed: the food button's Liquid element is now a 143 x 163 box hanging off the 62px button (69px to the left, 87px above, 12
right, 14 below; the tab bar layout is unchanged), holding the whole droplet path; it lets taps through (pointer-events none) and
only the main button and the open droplets take them. filterPadding 0. The blob's shadow is one plain drop shadow (0 4px 10px,
24% ink, no spread, which liquid-gooey hands to CSS and WebKit composites) plus the white inset top sheen; the 1px contact shadow and
the -8px-spread lift shadow merged into it. The droplet icons blur-fade (opacity + 4px, 220ms, no scale): the shared press rule had
been cutting their transition to opacity only. After: 60 frames in 0.9 s on open and close (avg 16ms), blue droplets, visible split
and merge, nothing clipped. GooTrack (tab capsule, segmented controls, hall chips) keeps its box (the thumb never leaves it) with
filterPadding 0, about a third of the filtered area; slider thumbs get 16px of room at each end (they overhang the track by 13px).
The /brand camera menu and slider take the same fix. Checked, no change needed: the Rank and Halls pager (native smooth scroll),
Swap and Appear (framer-motion runs their opacity and blur as WAAPI, which WebKit composites), the splash (fixed 12px backdrop
blur, prefixed, only opacity animates) and the budget ring (static). -->

<!-- 2026-11-15 Onboarding Slug Points slider (his report: "on the onbaording teh slugpoints gooey has some weird resistance. just
remove gooey there or fix it"). Causes, measured in Playwright WebKit: the thumb and fill re-aimed THE spring on every pointer move,
so during a drag the thumb trailed the finger by up to 76px; and only the 8px track took a touch (the thumb sits in the goo layer,
which lets taps through), so a finger on the thumb's upper or lower edge missed. Fixed in GooSlider (motion.tsx): while the finger is
down the thumb and fill follow it 1:1 with no spring (THE spring stays for keyboard steps), and .gs-track::before makes the whole 44px
row the hit area. The goo stays: its blob is drawn from the thumb in the same frame (0 to 1px off, step rounding). The ring still
updates live on every step. -->

<!-- 2026-11-15 Log processing moment (his ask: "when you first scan a food or do the demo im thinkign we add this border beam around the border of the phone and we have the image and then under it we have \"Processing the food...\" ... and then when its fully processed it morphs into the the stats for it"). While the photo is read (camera or demo plate), the processing beam (effects.registry processing-beam) rides the edge of the app frame, and under the photo one status card says what is happening: "Reading your plate…", then "Matching it to the dinner menu…", then "Sizing up the portions…", each blur-fading into the next on a timer (no shimmer, so the beam stays the one running loop on screen), over "Using the plate as a size guide". When the answer comes the same card morphs into the calorie card on THE spring (framer layout, only when the phase changes): its icon chip stays put, the text blur-fades into the calorie number, and the macros, dishes and buttons fade in under it in place (opacity, 0.24 s); an error morphs the same way into the error card with "Try another photo" under it. The photo's pill now always reads meal · hall (it said "Reading your plate" while reading, which the card now says). Color exception: the beam is the one place the app uses more than its blues, because it signals AI is working (# draft). -->

<!-- 2026-11-15 Onboarding art moves with the answer (his ask: "make all the onbaording graphics animated as you change the options like for the college or points cards make tehem shuffl and swtich for example and make this smooth or when the college selection dont just snap to the next collge but make it smooth"). A dated EXCEPTION to motion.state_change for the onboarding art only (src/components/screens/OnboardArt.tsx, moving parts in onboard-art.css): what MOVES between options rides THE spring (SPRING 300/28); text inside still blur-fades (Swap, STATE_FADE); nothing moves when a step opens (initial={false}). Meal plan: a deck of four plan cards (one per plan). The pick goes to the front (z-index raised at once, so it passes over the others), the rest take the fanned spots (-9deg/-18px and 8deg/+18px at 70% opacity) or wait hidden under the front (scale 0.92, opacity 0); x, y, rotate and scale on the spring, opacity on STATE_FADE. The Sidestash raise is a layer (.oa-raise) that fades in on the front card, and the face (label, points) blur-fades in only on the front card. Points: the ring's fill is a useSpring on THE spring (was a 200ms tween), so a drag reads as one continuous sweep that keeps its speed when the target moves. College map: one blue pin travels to the new college (left/top in % on the spring), its name tag rides with it; a side flip slides (a px gap on one wrapper plus a % self-shift on the chip, both transforms) and the chip's width follows the new name on the spring, measured from a hidden copy. The grey pin under the pick fades out and the one left behind fades back in (STATE_FADE); the blue pin draws above the tag so the tag slides under it. Hall: the old card tilts away (-9deg, -22px) as the new one deals in from the back-right fanned spot to the front on the spring; card opacity runs 120 to 140ms so the two cards' text never reads on top of each other; all in a fixed 240 x 212 box, so the question never moves. Reduced motion: nothing moves, changes are instant (opacity only). Supersedes "Choices blur-swap; nothing slides" in the 2026-11-14 onboarding notes, for the art only. # draft -->

<!-- 2026-11-15 Settings page and a louder Demo data chip (his ask: "a button in like settings or something that is demo mode where it completely starts from onboarding and primes the webapp in demo mode"). /settings opens from the profile button on Today's top bar (was a link to onboarding). One page (options.settings_ia single-page), back button and centered "Settings" in the top bar, the tab bar stays. Two sections, each a 17px/700 heading over a flat card (.card, 2px 14px padding) of hairline rows (60px min, 36px icon tile in --paper-2 with 10px corners, 15px/600 title, 12px --ink-3 sub, chevron in --ink-3); src/components/screens/settings.css. "Your plan": one row, "Edit my plan, college and hall", its sub the saved answers. "Demo mode" with an On/Off state pill on the heading row (On in the blue tint): "Start demo" (blue icon tile) opens a confirm step in place (blur-fade, Appear): a red icon tile, "Start over in demo mode?", exactly what will be cleared, and two 44px buttons, "Clear and start" (solid --bad, white text; the app's only destructive button) and "Cancel" (.btn-secondary.raised). Never a browser confirm(); the step closes when the page is left. "Leave demo" shows only while it is on. A 12px footnote says demo rankings are mock and nothing leaves the phone. Demo data chip: was the quiet ink-2 Sidestash chip; now the blue tint (--p3 fill, --p9 text, 22% --p9 hairline, no shadow) with a 6px solid --p9 dot before the words (src/components/ui/demo-chip.css over .demo-chip), so judges see it at a glance; also shown beside the greeting on Today in demo mode, since Today's dishes and college rank are mock then too. Gold stays for #1 moments. # draft -->

<!-- 2026-11-15 Ask SlugGrub streams, with a thinking orb and an action line (his ask: "i want smooth text streaming and action line like \"Thinking...\" or \"Reading menu...\" ... but actualy what the model is doing and i want thinking orb. look at Chalk app ... clone that action line and thinking orbs and smooth text streaming but follow this apps design.md"). Ported from his own Chalk app (prior code, disclose on Devpost), restyled here. The action line: the thinking orb (effects.registry thinking-orb), then the server's own words for the step it is on (Reading today's menus · Checking breakfast at JRL/C9, Cowell/Stevenson and Carson/Oakes · Asking Gemini about 25 dishes · Gemini's own thought heading in sentence case, e.g. Identifying vegetarian options · Writing · Matching picks to UCSC labels), then the real time since the question was sent (· 4s), 15px medium in --ink-3, one row cut with an ellipsis. Each step holds at least 600 ms, steps inside the hold collapse to the newest, and the last step always gets its hold before the end. A change blur-fades the words in place (Swap, 4px, 220 ms) while the words box eases to its new width (220 ms, standard curve, contain: layout paint on the row) so the time glides with it. A light sweep (Chalk's: a 30px masked window carries a --p9 copy of the label across it, 2.5 s a pass, transform only) runs over the live words. At the end the orb's slot closes and it fades with the time, the words become "Worked for 6s", hold 3 s, then the line fades out (2px, popLayout) and the answer and picks glide up on THE spring (framer layout="position", transform only). The answer text streams at Chalk's pace (src/components/ui/StreamText.tsx, its PACE numbers unchanged: at least 12 words a second while words wait, the source's own pace as the floor, a backlog drained over about 300 ms with the rate eased toward it, at most 3 words a frame, 40 a second for the tail); a word waits until it is whole, then fades and unblurs 2px over 220 ms on the standard curve (a small element, filter none at rest, within effects.blur_budget), and the paragraph becomes plain text once all have shown. The pick cards blur-fade in (2px, 160 ms, 50 ms apart) with layout on THE spring. Reduced motion: still orb, no sweep, text as it arrives with no fade, nothing moves. -->

<!-- 2026-11-15 Calorie goal, Today's calorie ring and the Slug Points charge (his words: "Shouldn't the calories today show like a ring of calories eaten vs calories left and shouldn't onboarding get your weight and height and age or whatever to calibrate the calorie tracker? I feel like this calorie thing is king of a gimmick ... And I want a visual to show that the slug points were taken off or something like that"; he picked the "optional step" design). Standing rule: calories are private, taste is social.
Onboarding step 5, "Want a daily calorie goal?" (OnboardingScreen.tsx): optional, "Skip" in the top bar's text button place means no goal. Art: GoalArt (OnboardArt.tsx), the points step's 250-degree ring at 144px (12px stroke, --paper-2 track, --p9 fill) in a 150px frame, filled to the goal on a 0 to 4,000 scale and following every input on THE spring, the goal blur-morphing in the middle over "cal a day"; empty ring and a dash with no goal (a zero-length round cap is hidden, so no stray dot). Body: one --ink-2 line about fueling, not dieting; one row of four 50px pill number fields on the page color (.input, 14px side padding, unit in --ink-3 inside on the right): Height ft, in, Weight lb, Age; sex as chip-sm chips (Male, Female, Rather not say) under "Sex, used only for the formula"; activity as the Seg (Light, Moderate, Very active) with its one-line meaning blur-swapping under it; the goal as a 132px number field ("cal") with a status line beside it; "Stays on this phone. Nobody else ever sees it." The button reads "Continue without a goal" while there is none, and "Save goal" when opened from Today or Settings for this step alone (?step=4&goal=1, no back button, returns to Today). Done screen adds one --ink-3 line with the goal or "No calorie goal. Add one any time from Today."
Today's calories card (CaloriesToday.tsx). With a goal: a 92px ring in the Budget ring's family (250-degree arc, 8px stroke, --paper-2 track, --p9 fill, round caps), "N left" in the middle (16px/700 number over 11px "left"), or "Goal reached" (12px/700 --p9) past 100%: never red, never "over"; to the right "Calories today", "N of GOAL eaten", a --protein dot with "Protein" and the grams (15px/700), and "Only you see this". The ring moves on THE spring when a plate was added. No goal: the old one-line card (fire tile, "Calories today", "Ng protein · private", the number) plus a "Set a goal" text button in --p9 at its right.
Arriving numbers (settle.ts): Today draws what it showed last time (kept per tab in sessionStorage), then about 450ms after it opens (just past ScreenClock) switches to the true value: the calorie ring springs, the numbers blur-morph (CountUp). Pages still open static.
Slug Points charge: on Log's Save, a small Sidestash chip (.visit-chip: raise, white hairline, chip shadow, 30px, 13px/600 --ink-2) centered under the Save button blur-fades in (STATE_FADE): "−15.60 Slug Points · Dinner at JRL/C9" for a visit's first plate, "Same visit, no extra charge" for a later plate, "Unlimited plan, no charge". Next time Today shows, its Slug Points number morphs down to the new total and the bar under it eases on the CSS spring (--spring, 500ms) at the same moment: one motion. Budget's note under the ring says "The 1,200 you entered Nov 15, minus 13.65 for the dining hall visit you logged since." and its footnote lists the four door prices. # draft -->
