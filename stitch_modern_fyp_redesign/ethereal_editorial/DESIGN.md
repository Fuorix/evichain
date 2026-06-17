---
name: Ethereal Editorial
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45474c'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#75777d'
  outline-variant: '#c5c6cd'
  surface-tint: '#545f73'
  primary: '#091426'
  on-primary: '#ffffff'
  primary-container: '#1e293b'
  on-primary-container: '#8590a6'
  inverse-primary: '#bcc7de'
  secondary: '#006b5f'
  on-secondary: '#ffffff'
  secondary-container: '#62fae3'
  on-secondary-container: '#007165'
  tertiary: '#0d1614'
  on-tertiary: '#ffffff'
  tertiary-container: '#222a29'
  on-tertiary-container: '#88918f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e3fb'
  primary-fixed-dim: '#bcc7de'
  on-primary-fixed: '#111c2d'
  on-primary-fixed-variant: '#3c475a'
  secondary-fixed: '#62fae3'
  secondary-fixed-dim: '#3cddc7'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005047'
  tertiary-fixed: '#dbe4e2'
  tertiary-fixed-dim: '#bfc8c6'
  on-tertiary-fixed: '#151d1c'
  on-tertiary-fixed-variant: '#404947'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.2'
  title-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.1em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  container-padding: 2rem
  gutter: 1.5rem
  card-gap: 1rem
  section-margin: 3rem
---

## Brand & Style
The design system embodies an **Editorial Soft-form** aesthetic, blending the precision of high-end print media with the fluid depth of modern digital interfaces. It moves away from sharp, technical grids toward a more organic, airy, and premium atmosphere. 

The brand personality is calm, sophisticated, and highly functional. It targets users who value clarity and a stress-free environment, such as premium fintech, wellness, or high-end productivity tools. The visual language relies on heavy backdrop blurs, organic shadows, and large-radius corners to create a "tactile glass" feel that invites interaction while maintaining an elite, understated presence.

## Colors
The palette is anchored by a high-contrast **Deep Slate (Primary)** for critical actions and typography, ensuring absolute legibility against the ethereal backgrounds. The **Mint Teal (Secondary)** provides a fresh, optimistic accent for growth indicators or highlights.

The background is never a flat color but a soft, multidimensional gradient of pale greys and subtle greens. Glass elements utilize semi-transparent white fills (`rgba(255, 255, 255, 0.7)`) to react dynamically to the underlying gradient.

## Typography
We utilize **Geist** for its exceptional geometric clarity and generous apertures, which complement the soft-form UI. The typographic hierarchy leans into an editorial style: large, bold headlines with tight letter-spacing contrasted by widely-spaced uppercase labels. 

Headlines should use a "Deep Slate" color to anchor the page, while secondary body text should use a softer grey-blue to maintain the airy feel.

## Layout & Spacing
The layout follows a fluid, organic philosophy. While it respects a 12-column structure for desktop, the emphasis is on **negative space** and perceived weight rather than rigid borders. 

- **Desktop:** Large 32px-48px margins. Content is grouped in floating "glass" containers.
- **Mobile:** Margins reduce to 16px. Containers typically stack vertically and fill the width, maintaining the large corner radius to preserve the brand's softness.
- **Rhythm:** Use an 8px base grid, but allow for "optical centering" in glass cards to account for the heavy roundedness.

## Elevation & Depth
Depth is created through "Soft-form Glassmorphism" rather than traditional elevation scales.
- **Backdrop Blur:** All cards must use a `backdrop-filter: blur(20px)`.
- **Inner Glow:** Apply a 1px solid border with 20% white opacity and a subtle 2px white inner shadow to simulate the edge of a glass pane.
- **Shadows:** Use extremely soft, large-spread shadows with very low opacity (e.g., `box-shadow: 0 20px 40px rgba(0,0,0,0.04)`).
- **Z-Axis:** Instead of multiple shadow levels, depth is implied by the intensity of the blur and the transparency of the background fill.

## Shapes
The design system is defined by its **3xl roundedness**. Sharp corners are non-existent.
- **Cards/Containers:** Use `rounded-3xl` (24px or 1.5rem) as the standard.
- **Buttons:** Fully pill-shaped for high-contrast primary actions.
- **Inputs:** `rounded-2xl` to balance the larger container radii.
The goal is to make every element feel "smooth to the touch," like a polished river stone.

## Components
- **Primary Buttons:** High-contrast Deep Slate fills with white text. Pill-shaped. Subtle lift on hover.
- **Glass Cards:** Semi-transparent white background, heavy backdrop blur, and `rounded-3xl` corners. Include a subtle white stroke for edge definition.
- **Navigation:** Vertical sidebar using "Active" states that are solid white pill-shapes with a soft drop shadow, creating a "pressed-out" effect against the glass.
- **Inputs:** Minimalist glass fields with internal labels. The focus state should highlight the inner glow rather than a heavy outer border.
- **Chips/Badges:** Soft Mint or Teal backgrounds with low opacity (10-15%) and high-contrast text for status indicators.
- **Charts:** Use soft, rounded bars and smooth splines. Avoid sharp data points; favor "glow" effects on hover.