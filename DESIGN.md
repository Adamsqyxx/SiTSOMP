---
name: Civic Governance System
colors:
  surface: '#f9f9ff'
  surface-dim: '#d9d9e2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3fc'
  surface-container: '#ededf6'
  surface-container-high: '#e7e8f0'
  surface-container-highest: '#e1e2ea'
  on-surface: '#191c21'
  on-surface-variant: '#424752'
  inverse-surface: '#2e3037'
  inverse-on-surface: '#f0f0f9'
  outline: '#727784'
  outline-variant: '#c2c6d4'
  surface-tint: '#115cb9'
  primary: '#003f87'
  on-primary: '#ffffff'
  primary-container: '#0056b3'
  on-primary-container: '#bbd0ff'
  inverse-primary: '#acc7ff'
  secondary: '#355e9f'
  on-secondary: '#ffffff'
  secondary-container: '#90b6fe'
  on-secondary-container: '#174687'
  tertiary: '#722b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#983c00'
  on-tertiary-container: '#ffc2a7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d7e2ff'
  primary-fixed-dim: '#acc7ff'
  on-primary-fixed: '#001a40'
  on-primary-fixed-variant: '#004491'
  secondary-fixed: '#d7e3ff'
  secondary-fixed-dim: '#abc7ff'
  on-secondary-fixed: '#001b3f'
  on-secondary-fixed-variant: '#164686'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb694'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7b2f00'
  background: '#f9f9ff'
  on-background: '#191c21'
  surface-variant: '#e1e2ea'
  success: '#166534'
  warning: '#9a3412'
  danger: '#991b1b'
  info: '#075985'
  surface-muted: '#f8fafc'
  border-subtle: '#e2e8f0'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  code-md:
    fontFamily: monospace
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  max-width: 1280px
---

## Brand & Style

The brand identity is built on the pillars of **Trust, Authority, and Accessibility**. As a government information system, it must project stability and neutrality, ensuring that citizens feel secure when submitting sensitive data. The visual language is intentionally "Invisible"—it prioritizes the task at hand over decorative flair.

The design style is **Corporate Modern**, leaning into **Functional Minimalism**. It utilizes a clean, systematic approach characterized by:
- **High Information Density:** Organized through clear grids and typographic hierarchy rather than excessive whitespace.
- **Utilitarian Aesthetics:** Using system-like precision, subtle borders, and a disciplined color palette to convey professionalism.
- **Accessibility-First:** Every design choice is filtered through WCAG 2.1 Level AA compliance, ensuring the interface is usable by all citizens regardless of their device or ability.

## Colors

The color palette is anchored by **Professional Blue (#0056b3)**, a hue synonymous with institutional reliability. The system uses a high-contrast ratio for all text elements to ensure readability.

- **Primary & Secondary:** Used for branding, primary actions, and active navigation states.
- **Neutral Grays:** A slate-leaning gray scale is used for text, borders, and backgrounds to maintain a "cool" and professional temperament.
- **Semantic Palette:** These colors are strictly reserved for status indicators. `Success` for approvals, `Warning` for pending verifications, `Danger` for rejections or errors, and `Info` for general notifications.
- **Interactive Maps:** Maps should use a desaturated base layer (grayscale or light blue) to allow colorful status markers and boundary polygons to remain the focal point.

## Typography

**Inter** is the sole typeface for the design system, chosen for its exceptional legibility on digital screens and its neutral, modern tone.

- **Scale:** The system uses a tight scale to maintain density. Headlines use slightly tighter letter spacing and heavier weights to establish clear section breaks.
- **Numeric Data:** For NIK numbers, ticket IDs, and official letter numbers, use `body-md` or `code-md` to ensure character clarity and prevent misreading.
- **Mobile Adjustments:** On mobile devices, headline sizes are scaled down to prevent awkward line breaks while maintaining a distinct weight contrast from body text.

## Layout & Spacing

The layout follows a **Mobile-First, Fluid Grid** philosophy. 

- **Desktop:** A 12-column grid with a maximum width of 1280px. Sidebars for administrative dashboards are fixed (280px), with the main content area remaining fluid.
- **Mobile:** A single-column stack with 16px side margins. 
- **Spacing Rhythm:** Based on a 4px baseline. Components like cards and form groups use 16px (base * 4) or 24px (base * 6) padding to create a structured, professional rhythm.
- **Maps:** Interactive maps should always attempt to fill the available viewport height on mobile to facilitate touch-based navigation and polygon selection.

## Elevation & Depth

To maintain an authoritative and clean look, the design system avoids heavy shadows in favor of **Tonal Layers** and **Subtle Outlines**.

- **Surface Levels:** 
  - **Level 0 (Background):** Slate-50 or White for the main canvas.
  - **Level 1 (Cards/Sections):** White background with a 1px `border-subtle` (#e2e8f0).
  - **Level 2 (Modals/Popovers):** White background with a soft, diffused ambient shadow (10% opacity) to provide focus.
- **Interactive Depth:** Buttons and interactive elements use a slight darkening of the background color on hover rather than physical elevation changes. This keeps the interface feeling "flat" and fast.

## Shapes

The shape language is **Soft (0.25rem)**. This provides a modern touch without appearing overly "bubbly" or consumer-oriented. 

- **Inputs and Buttons:** Use the standard 4px radius.
- **Status Badges:** Use a higher `rounded-lg` (8px) or pill-shape to distinguish them from interactive buttons.
- **Map Markers:** Use geometric shapes (Circles or Pins) with sharp contrast borders to ensure they stand out against the map tiles.

## Components

### Buttons & Inputs
- **Primary Action:** Solid Professional Blue with white text. High contrast is mandatory.
- **Secondary Action:** Ghost style (border only) or subtle gray background.
- **Form Fields:** Use 1px borders with clear `label-md` headers. Error states must include both a red border and a supporting text icon for accessibility.

### Status Badges
Badges use a "Subtle Tint" approach: a light background version of the semantic color with dark, high-contrast text. 
- *Example:* "Disetujui" (Approved) uses a light green background with dark green text.

### Interactive Maps
- **Polygons:** Use 20% opacity fills for RT/RW boundaries with a 2px solid stroke.
- **Controls:** Position zoom and layer controls in the bottom-right for easy thumb access on mobile.

### Lists & Data Tables
- Use "Zebra Striping" or subtle bottom borders to separate rows. 
- Columns containing NIK or IDs should use a tabular (monospace) font setting to ensure vertical alignment of digits.

### QR Code Authentication
- Official documents and PDF previews must feature a 1:1 aspect ratio QR code container with a minimum size of 80px to ensure scanability.