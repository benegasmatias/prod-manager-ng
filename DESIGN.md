# Design System Specification: Editorial Admin Experience

## 1. Overview & Creative North Star

### The Creative North Star: "The Digital Curator"
This design system rejects the "utilitarian warehouse" aesthetic common in admin dashboards. Instead, it adopts the persona of **The Digital Curator**. We treat data not as a series of rows to be managed, but as a collection to be exhibited. 

By leveraging high-end editorial principles—asymmetric layouts, extreme tonal depth, and a high-contrast typography scale—we move beyond standard templates. The goal is to create an interface that feels bespoke and premium, where whitespace is a functional tool used to group high-priority insights, and the primary purple accent (`#742fe5`) acts as a deliberate spotlight within a sophisticated, neutral environment.

---

## 2. Colors & Surface Philosophy

The palette is anchored in a professional, deep-navy foundation (`on_surface: #193357`) contrasted against a spectrum of ethereal blues and purples.

### The "No-Line" Rule
**Borders are prohibited for sectioning.** To define space, designers must use background color shifts or tonal transitions. Use `surface_container_low` (`#f0f3ff`) to sit against the main `background` (`#f9f9ff`). This creates a seamless, "molded" look that feels more modern than a grid of boxes.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of fine paper. 
- **Base Layer:** `background` (#f9f9ff)
- **Sectional Layer:** `surface_container` (#e7eeff) or `surface_container_low` (#f0f3ff)
- **Interactive/Floating Layer:** `surface_container_lowest` (#ffffff) 

By nesting a `lowest` (pure white) card inside a `low` section, you achieve a natural lift that signals priority without adding visual noise.

### Signature Textures & Glass
- **The "Glassmorphism" Rule:** For floating menus, modals, or top-level navigation headers, use `surface_container_lowest` at 80% opacity with a `24px` backdrop blur. 
- **Tonal Soul:** Primary CTAs should never be flat. Apply a subtle linear gradient from `primary` (#742fe5) to `primary_container` (#8342f4) at a 135-degree angle to provide depth and a high-end finish.

---

## 3. Typography

The system utilizes a dual-typeface strategy to balance authoritative editorial style with functional legibility.

*   **Display & Headlines (Manrope):** Chosen for its geometric precision and modern "tech-premium" feel. Use `display-lg` (3.5rem) and `headline-md` (1.75rem) with tighter letter-spacing (-0.02em) to create impact.
*   **Body & UI (Inter):** A workhorse for clarity. Inter is used for all functional data. Use `body-md` (0.875rem) for the majority of dashboard content to maximize information density while maintaining breathability.
*   **Labels:** Use `label-md` (0.75rem) in `on_surface_variant` (#486086) for metadata. This keeps the interface quiet, allowing the headlines to lead the user's eye.

---

## 4. Elevation & Depth

### The Layering Principle
Hierarchy is achieved through **Tonal Layering** rather than structural lines. A card does not need a border if its background is `surface_container_lowest` and it sits on a `surface_container`.

### Ambient Shadows
When a physical "lift" is required (e.g., a dragged item or a primary modal), use an Ambient Shadow:
- **X: 0, Y: 12, Blur: 32, Spread: 0**
- **Color:** Use `on_surface` (#193357) at 6% opacity. 
This creates a soft, natural glow that mimics laboratory lighting rather than a harsh drop shadow.

### The "Ghost Border" Fallback
If accessibility requirements demand a container boundary, use a **Ghost Border**:
- Stroke: 1px
- Color: `outline_variant` (#9bb3de) at **15% opacity**.
- **Rule:** Never use 100% opaque borders for containers.

---

## 5. Components

### Cards & Layouts
- **Forbid Dividers:** Use vertical whitespace (e.g., 32px or 48px) to separate list items or card sections.
- **Rounding:** Use `md` (1.5rem) for standard dashboard cards and `xl` (3rem) for hero sections or main dashboard containers to echo the organic shapes seen in the reference material.

### Buttons
- **Primary:** Gradient (`primary` to `primary_container`), `on_primary` text, `full` rounding (pill shape).
- **Secondary:** `surface_container_high` background with `primary` text. No border.
- **Tertiary:** No background. `primary` text with an underline that appears only on hover.

### Status Indicators & Chips
- **Status Chips:** Use `secondary_container` (#e9def8) with `on_secondary_container` (#564e63) text.
- **Critical Alerts:** Use `error_container` (#f97386) with `on_error_container` (#6e0523). 
- **Shape:** All chips must use the `full` (pill) rounding scale.

### Input Fields
- **Style:** Use `surface_container_low` for the field background. 
- **Active State:** Change background to `surface_container_lowest` and add a 1px `ghost border` using the `primary` color at 40% opacity.

---

## 6. Do’s and Don’ts

### Do
- **Do** use asymmetrical spacing. A larger left margin than right margin can create a sophisticated, editorial "magazine" feel.
- **Do** use `display-lg` typography for single, high-impact numbers (e.g., "Total Volume") to create a clear focal point.
- **Do** utilize the `surface_dim` (#c8dbff) color for subtle background textures or disabled states to keep the palette cohesive.

### Don’t
- **Don’t** use black (#000000) for text. Always use `on_surface` (#193357) to maintain tonal depth.
- **Don’t** use standard "box-shadow" presets. Stick to the Ambient Shadow values defined in Section 4.
- **Don’t** crowd the cards. If a card feels full, increase the page height and add whitespace rather than shrinking the elements.
- **Don’t** use 1px lines to separate sidebar navigation items; use a `primary_container` background tint for the "active" state instead.