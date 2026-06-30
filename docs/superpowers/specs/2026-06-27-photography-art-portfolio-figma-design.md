# Photography Art Portfolio Figma Design Spec

Date: 2026-06-27
Project: `apps/photography`
Figma file: https://www.figma.com/design/YZxOp2jklIahQr2Yib2gHc

## 1. Purpose

This spec defines the design direction and Figma architecture for rebuilding the photography site from zero as an art-first portfolio. It is written so another AI agent can quickly understand the design intent, reproduce the Figma structure, and translate the design into code.

The site should feel like a quiet private exhibition, not a generic image grid. The experience should guide a visitor through a cover, a theme selection moment, a gallery wall, and a focused single-work detail view.

## 2. Product Positioning

The site is a static personal photography portfolio inside a monorepo. The current implementation uses React, Vite, TypeScript, Tailwind CSS, and Framer Motion, but the rebuild is allowed to introduce new content, dependencies, architecture, and implementation ideas if they improve the art portfolio experience.

The art direction takes priority over implementation inertia:

- Photos are the primary content.
- Layout, typography, and motion should create an exhibition-like viewing rhythm.
- Controls should be visible and accessible, but never visually louder than the work.
- Mobile is not a scaled desktop layout; it should be a viewing-first experience with touch-friendly controls.
- Performance remains required, especially for image loading, but it supports the viewing experience rather than defining the visual language.

## 3. Experience Flow

Primary route:

```text
Home / Cover
  -> Guide / Theme Selection
  -> Showcase / Gallery Wall
  -> Detail Overlay / Single Work
```

Screen roles:

- Home: creates the first impression with a strong typographic cover and abstracted photo-wall energy.
- Guide: presents the four themes as exhibition rooms.
- Showcase: combines a restrained directory with a masonry gallery.
- Detail Overlay: pauses the page and treats one photo as a single artwork with metadata.

Themes:

```text
暖 / Apricity
湛 / Azure
盛 / Lush
郁 / Pall
```

Theme colors:

```text
Apricity accent #C99567, soft #EBD7BF
Azure     accent #7F9FB0, soft #D7E4E9
Lush      accent #8F9F76, soft #DEE7D2
Pall      accent #8F8B84, soft #E0DDD7
```

## 4. Figma File Architecture

Use this professional website design structure:

```text
00 Brief & Flow
01 Foundations
02 Components
03 Patterns
04 Templates
05 Screens
06 Prototype & Motion
07 Build Notes
```

### 00 Brief & Flow

Purpose:

- Explain the project in one screen.
- Show the user journey.
- Record breakpoints and success criteria.

Recommended Figma content:

- Cover frame with title: `Photography Art Portfolio`
- Flow diagram: `Home -> Guide -> Showcase -> Detail Overlay`
- Desktop frame sizes: `1440 x 1024`, `1280 x 900`
- Mobile frame sizes: `320 x 812`, `390 x 844`, `430 x 932`
- Design principles block:
  - Photos first
  - Quiet exhibition rhythm
  - Serif metadata
  - Restrained controls
  - Mobile viewing-first

### 01 Foundations

Purpose:

- Define tokens, styles, and primitives before creating components.
- Make Figma variables correspond to future CSS variables and Tailwind tokens.

Figma features to use:

- Local variable collections
- Primitive variables
- Semantic variables
- Text styles
- Effect styles
- Documentation frames with color swatches, type specimens, spacing bars, and grid examples

Variable collections:

```text
Primitives
Color
Spacing
Radius
Size
Opacity
Motion
```

Primitives:

```text
primitive/color/porcelain      #F8F5EF
primitive/color/paper          #EFE9DF
primitive/color/ink            #1C1B18
primitive/color/ink-soft       #4A4740
primitive/color/mist           #D7E4E2
primitive/color/apricity-accent #C99567
primitive/color/apricity-soft   #EBD7BF
primitive/color/azure-accent   #7F9FB0
primitive/color/azure-soft     #D7E4E9
primitive/color/lush-accent    #8F9F76
primitive/color/lush-soft      #DEE7D2
primitive/color/penumbra-accent #8F8B84
primitive/color/penumbra-soft  #E0DDD7
```

Semantic color variables:

```text
color/bg/page          -> primitive/color/porcelain
color/bg/surface       -> primitive/color/paper
color/text/primary     -> primitive/color/ink
color/text/secondary   -> primitive/color/ink-soft
color/border/subtle    -> rgba ink 0.12
color/border/strong    -> primitive/color/ink
color/focus/default    -> primitive/color/ink
color/theme/apricity      -> primitive/color/apricity-accent
color/theme/apricity-soft -> primitive/color/apricity-soft
color/theme/azure      -> primitive/color/azure-accent
color/theme/azure-soft -> primitive/color/azure-soft
color/theme/lush       -> primitive/color/lush-accent
color/theme/lush-soft  -> primitive/color/lush-soft
color/theme/penumbra   -> primitive/color/penumbra-accent
color/theme/penumbra-soft -> primitive/color/penumbra-soft
```

Spacing variables:

```text
spacing/1  4
spacing/2  8
spacing/3  12
spacing/4  16
spacing/5  20
spacing/6  24
spacing/8  32
spacing/10 40
spacing/12 48
spacing/16 64
spacing/20 80
spacing/24 96
```

Radius variables:

```text
radius/none 0
radius/sm   2
radius/md   4
radius/lg   8
```

Size variables:

```text
size/touch-min 44
size/sidebar-desktop 340
size/gallery-gap-mobile 12
size/gallery-gap-desktop 20
```

Motion variables:

```text
motion/duration/fast      180ms
motion/duration/base      280ms
motion/duration/page      450ms
motion/duration/image     450ms
motion/ease/standard      ease-out
motion/ease/gallery       cubic-bezier(0.22, 1, 0.36, 1)
```

Text styles:

```text
Display/Cover
Display/Theme Han
Display/Theme Latin
Heading/Page
Heading/Section
Body/Serif
Body/Sans
Meta/Label
Meta/Value Numeric
Control/Label
```

Recommended type direction:

- Sans: Inter, Aptos, or system sans for controls and labels.
- Serif: Georgia, Times New Roman, Songti SC, SimSun for artwork notes and metadata.
- Numeric serif: Cambria, Georgia, Times New Roman with tabular lining numbers for EXIF values.

Typography constraints:

- No viewport-width font scaling in production code.
- Letter spacing must never be negative.
- Hero-scale type is only for the Home cover and theme display moments.
- Compact panels use smaller, tighter headings.

Effect styles:

```text
Effect/Overlay Blur Reference
Effect/Photo Lift Subtle
Effect/Detail Card
```

Use effects sparingly. Shadows should not create card-heavy SaaS styling.

### 02 Components

Purpose:

- Define reusable, variant-based parts before making page templates.
- Components should use auto layout and variables wherever Figma supports them.

Figma features to use:

- Components and component sets
- Variants for state, size, theme, and orientation
- Component properties for label text and optional content
- Auto layout for predictable resizing
- Text properties for editable labels
- Boolean properties for optional elements

Core components:

```text
Button
TopBar
ThemeControl
ThemeChip
DirectoryItem
MasonryPhotoPlaceholder
ExifRow
PhotoSwitchButton
CloseButton
DetailInfoPanel
SectionHeader
```

Component details:

### Button

Variants:

```text
Intent = Primary | Ghost | Text
Size = Sm | Md | Touch
State = Default | Hover | Focus | Disabled
```

Rules:

- Touch size must be at least 44px high.
- Primary button uses black fill and porcelain text.
- Ghost button uses transparent fill and ink stroke.
- Text button uses underline or subtle border, not pill styling.

### TopBar

Variants:

```text
Surface = Transparent | Page
Viewport = Desktop | Mobile
```

Properties:

- Back label
- Center title
- Show back button

### ThemeControl

Variants:

```text
Theme = Apricity | Azure | Lush | Pall
State = Default | Hover | Active | Focus
Viewport = Desktop | Mobile
```

Properties:

- Chinese title
- Latin subtitle
- Description
- Count

Rules:

- Theme colors appear as restrained accents, not dominant backgrounds.
- Chinese title should be visually primary.
- Latin subtitle should be secondary and quiet.

### MasonryPhotoPlaceholder

Variants:

```text
Orientation = Portrait | Landscape | Square | Tall
Theme = Apricity | Azure | Lush | Pall | Neutral
State = Placeholder | Loading | Loaded | Focus
```

Rules:

- Use proportional placeholder blocks instead of real photography in v1 Figma.
- Encode aspect ratio with component resizing and visual labels.
- Use soft theme tint and subtle frame line to indicate grouping.

### ExifRow

Variants:

```text
State = Present | Missing
```

Properties:

- Label
- Value
- Missing message

Rules:

- Missing value shows `已消失`.
- If any EXIF field is missing, the info panel also shows `不过回忆还在` at the same visual scale as values.
- Do not show original filenames to the visitor.

### PhotoSwitchButton

Variants:

```text
Direction = Previous | Next
State = Default | Hover | Focus | Hidden
```

Rules:

- Square outline button.
- Arrow text can be `<` and `>` or icon components.
- Hidden variant documents first/last photo behavior.

## 5. Patterns

Patterns are repeated design compositions that are larger than components but smaller than pages. They are important for translating Figma to code without creating one-off page files.

Create these in `03 Patterns`:

```text
Pattern / Home Cover Composition
Pattern / Theme Rail Desktop
Pattern / Theme Rail Mobile
Pattern / Showcase Desktop Shell
Pattern / Showcase Mobile Shell
Pattern / Masonry Gallery Desktop 3 Columns
Pattern / Masonry Gallery Mobile 2 Columns
Pattern / Detail Overlay Landscape
Pattern / Detail Overlay Portrait
Pattern / Loading Image Stack
Pattern / Reduced Motion Alternative
```

### Home Cover Composition

The composition should combine:

- Oversized black uppercase title
- Thin structural lines
- A controlled photo-stack placeholder area
- Vertical Chinese title mark
- Minimal enter control

It should feel like a poster or exhibition cover, not a marketing landing page.

### Theme Rail

Desktop:

- Horizontal scroll rail with large theme panels.
- Panels are tall and exhibition-room-like.
- Right-side overflow hints there are more panels.

Mobile:

- Horizontal rail remains, but cards become narrower and more touch-oriented.
- Text must not collide with card boundaries at 320px width.

### Showcase Shell

Desktop:

- Left sticky directory, right masonry gallery.
- Directory width around 340px.
- Gallery has 3 columns, never 4 columns on ultra-wide screens.

Mobile:

- No heavy sidebar.
- Theme controls move to a top horizontal area.
- Gallery has 2 columns.
- Intro copy is shorter and less visually dominant.

### Detail Overlay

Desktop:

- Background dims and blurs.
- Detail content uses left info and right image.
- Image keeps white border/mat around it.

Mobile:

- Image first, info below.
- Info panel can scroll.
- Close button stays in a safe fixed position.
- Switch controls remain reachable and at least 44px.

## 6. Templates

Create templates in `04 Templates`. Templates define layout constraints and slots without binding to final copy.

Templates:

```text
Template / Home / Desktop
Template / Home / Mobile
Template / Guide / Desktop
Template / Guide / Mobile
Template / Showcase / Desktop
Template / Showcase / Mobile
Template / Detail / Desktop Landscape
Template / Detail / Desktop Portrait
Template / Detail / Mobile
```

Template rules:

- Use auto layout for structural groups.
- Use components and patterns, not raw duplicated shapes.
- Add named slots where content changes:
  - `Slot / Hero Title`
  - `Slot / Theme Rail`
  - `Slot / Directory`
  - `Slot / Gallery`
  - `Slot / Detail Image`
  - `Slot / Detail Metadata`

## 7. Screens

Create final high-fidelity screens in `05 Screens` from templates.

Required screen frames:

```text
Desktop / Home / 1440
Desktop / Guide / 1440
Desktop / Showcase / 1440
Desktop / Detail Landscape / 1440
Desktop / Detail Portrait / 1440

Mobile / Home / 320
Mobile / Home / 390
Mobile / Guide / 390
Mobile / Showcase / 390
Mobile / Detail / 390
Mobile / Showcase / 430
Mobile / Detail / 430
```

Screens should be editable instances wherever possible. Avoid flattening the page into one-off frames.

## 8. Prototype And Motion

Create `06 Prototype & Motion` to document interactive behavior. If possible, add Figma prototype links for major flows.

Primary prototype flow:

```text
Home Enter -> Guide
Guide Theme Card -> Showcase
Showcase Photo Placeholder -> Detail Overlay
Detail Close -> Showcase
Detail Previous / Next -> Detail Overlay Variant
```

Motion rules:

### Page transitions

- Home enters with a slow opacity and slight x/y shift.
- Guide enters with a short vertical shift.
- Showcase fades in with no dramatic movement.

### Theme rail

- Cards can have a subtle hover scale on pointer devices.
- Do not rely on hover for touch devices.
- Scrolling is the main interaction.

### Masonry gallery

- Items fade and rise slightly when they enter.
- Stagger is very small.
- Images use LQIP/placeholder concept in code.

### Detail overlay

- Background uses dim + blur.
- Detail card fades and scales from 0.98 to 1.
- Large image fades over preview image.
- If large image fails, preview remains visible.

### Reduced motion

All animation should collapse to:

- opacity transition only, or
- immediate state change for page transitions,
- no infinite floating animation,
- no parallax,
- no large position shifts.

## 9. Build Notes

Create `07 Build Notes` to translate design into implementation choices.

Recommended implementation architecture:

```text
src/
  app/
    PhotographyApp.tsx
  views/
    HomeView.tsx
    GuideView.tsx
    ShowcaseView.tsx
  components/
    Button.tsx
    TopBar.tsx
    ThemeControl.tsx
    DirectoryItem.tsx
    ExifRow.tsx
    PhotoSwitchButton.tsx
  patterns/
    MasonryGallery.tsx
    ThemeRail.tsx
    DetailOverlay.tsx
    ProgressiveImage.tsx
  data/
    photos.json
    themes.ts
  motion/
    transitions.ts
    useReducedMotionPreference.ts
  styles/
    tokens.css
    globals.css
  types/
    photography.ts
```

Possible new or changed implementation ideas:

- Split `photos.json` and `themes.ts` so theme descriptions, theme colors, and display names are not repeated per photo.
- Generate multiple image sizes and formats: JPEG fallback, WebP/AVIF where practical.
- Add `srcset` and `sizes` for masonry previews and detail images.
- Keep IntersectionObserver as the primary preload strategy.
- Add idle preload for first gallery previews and adjacent detail images.
- Consider React Router or TanStack Router only if direct URLs for themes/photos become a goal.
- Keep a strict no-backend requirement unless future scope explicitly changes.

Quality gates:

```text
npm run validate:photos
npm run typecheck:photography
npm run build:photography
```

If Playwright is added during rebuild, verify:

- 320px, 390px, 430px mobile layouts
- 1440px desktop layout
- detail overlay open/close
- keyboard Escape and arrow navigation
- focus visibility
- no text overlap
- masonry columns are 3 desktop / 2 mobile

## 10. Accessibility Requirements

Design must preserve:

- Semantic buttons for actions.
- Semantic links for navigation.
- Focus-visible states for all controls.
- Close button in detail overlay focused on open.
- Escape closes detail overlay.
- Arrow keys navigate previous/next photo.
- Touch targets at least 44px.
- Mobile detail info scrolls without trapping the user.
- `prefers-reduced-motion` has a documented alternative.
- Visible photo alt text must be sourced from structured data.

## 11. Figma Build Procedure

Build the Figma system in phases:

### Phase 0: Discovery

- Inspect the new Figma file.
- Search available design libraries for existing reusable primitives.
- Lock v1 scope: foundations, components, patterns, templates, screens, motion notes, build notes.

### Phase 1: Foundations

- Create variable collections.
- Create primitive and semantic variables.
- Set variable scopes explicitly.
- Set WEB code syntax for variables.
- Create text styles and effect styles.
- Add documentation frames for swatches, typography, spacing, and grid.

### Phase 2: File Structure

- Create pages:
  - `00 Brief & Flow`
  - `01 Foundations`
  - `02 Components`
  - `03 Patterns`
  - `04 Templates`
  - `05 Screens`
  - `06 Prototype & Motion`
  - `07 Build Notes`

### Phase 3: Components

- Build components one at a time.
- Use variants, component properties, auto layout, and token bindings.
- Validate each component visually before using it in patterns.

### Phase 4: Patterns And Templates

- Assemble patterns from components.
- Assemble templates from patterns.
- Keep layout constraints and slots clear.

### Phase 5: Screens And Prototype

- Create high-fidelity screens from templates.
- Add prototype links for the primary flow.
- Add motion notes as editable documentation.

## 12. Open Implementation Decisions

These should be revisited before coding:

- Whether to keep Framer Motion or introduce a lighter motion helper.
- Whether to add router support for shareable theme/photo URLs.
- Whether to generate AVIF/WebP variants during `prepare:photos`.
- Whether to add Playwright for visual and interaction regression checks.
- Whether to use a virtualized masonry library if the gallery grows substantially.

## 13. Spec Self-Review

- No placeholder requirements remain.
- The design direction is art portfolio first.
- Figma architecture follows `Brief -> Foundations -> Components -> Patterns -> Templates -> Screens -> Prototype -> Build Notes`.
- Figma-specific features are explicitly required: variables, styles, components, variants, auto layout, component properties, prototype links, and documentation pages.
- Code translation is mapped without forcing the current implementation to remain unchanged.
- Mobile breakpoints, accessibility, image loading, and reduced motion are included as first-class requirements.
