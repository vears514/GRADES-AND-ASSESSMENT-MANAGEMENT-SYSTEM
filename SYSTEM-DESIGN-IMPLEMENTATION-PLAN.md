# HR System UI Implementation Plan

Checklist-style plan to implement the provided System Design Specification using UIkit 3.

## 1) Foundations
- [ ] Add UIkit 3 CDN CSS (and JS if components need it) to the base HTML layout.
- [ ] Create global stylesheet `src/styles/theme.css` (or equivalent) and import it after UIkit.
- [ ] Define root tokens: `--c1 #1e3a5f`, `--c2 #2d5986`, `--bg #f4f6f9`, `--card #ffffff`, `--border #e8e8e8`, plus text roles (`--t1 #333`, `--t2 #666`, `--t3 #888`, `--t4 #aaa`) and interaction colors (`--hover #f0f2f5`, `--active #1e3a5f`, `--active-text #fff`, `--submenu-hover rgba(30,58,95,0.06)`).
- [ ] Set global font stack `-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif`; base font size 16px; smoothing and reset for body background `var(--bg)` and text color `var(--t1)`.
- [ ] Create spacing utilities or CSS variables for page (28px), card (24px), section gap (18px), sidebar item (9px x 18px).

## 2) Layout Shell
- [ ] Build fixed left sidebar: 250px width, 100vh height, white background, right border `1px solid var(--border)`, vertical scroll.
- [ ] Build sticky topbar: 60px height, white background, bottom border `1px solid var(--border)`, padding `0 28px`, z-index above sidebar.
- [ ] Set main content wrapper `.mn` with `margin-left: 250px`, background `var(--bg)`, `min-height: 100vh`; inner `.mn-inner` with `padding: 28px`.
- [ ] Ensure layout works with UIkit grid/container classes without overriding required dimensions.

## 3) Sidebar Navigation
- [ ] Style nav items: padding `9px 18px`, radius 8px, gap 10px between items; font 0.84rem (submenu 0.78rem), color `var(--t1)`.
- [ ] Hover: background `var(--hover)`. Active: background `var(--active)`, text `var(--active-text)`. Submenu hover: `rgba(30,58,95,0.06)`.
- [ ] Provide icon/text alignment; maintain vertical scroll; handle active state for current route.

## 4) Topbar Details
- [ ] Align content center vertically; place system title (1.4rem) left and avatar right.
- [ ] Avatar: 34px circle, background `var(--c1)`, text white, font 0.7rem bold; optional status dot if needed.
- [ ] Keep topbar sticky on scroll and independent of sidebar scroll.

## 5) Main Content Patterns
- [ ] Page header block inside `.mn-inner` with title and optional breadcrumbs/actions; spacing below uses section gap (18px).
- [ ] Card component: background `var(--card)`, radius 12px, border `1px solid var(--border)`, overflow hidden.
  - Header: padding `16px 24px`, bottom border `1px solid #f0f0f0`, title uses `var(--t1)`; optional actions aligned right.
  - Body: padding 24px; use UIkit grid for responsive content.
- [ ] Table styling: uppercase headers, 0.7rem, letter spacing 0.8px; border color `var(--border)`; row text `var(--t1)`/`var(--t2)`; sample columns EMPLOYEE NAME, POSITION, STATUS, DATE.
- [ ] Forms: align inputs with card padding; use UIkit form classes but keep border radius and colors consistent.

## 6) Interaction & States
- [ ] Ensure focus outlines remain visible and meet contrast on dark active background.
- [ ] Define button/link hover states consistent with palette (e.g., primary button background `var(--c1)` hover darken 5–8%).
- [ ] Add subtle transition (150–200ms) for hover/active on sidebar items and buttons.

## 7) Responsiveness
- [ ] At ≤1024px: reduce main padding to 20px; consider shrinking sidebar width to ~220px.
- [ ] At ≤768px: collapse sidebar to off-canvas/drawer; main content margin-left becomes 0; topbar keeps 60px height.
- [ ] Verify typography scales acceptably; avoid overflow in table headers.

## 8) Accessibility & QA
- [ ] Contrast check: primary text on white, active sidebar (#fff on #1E3A5F), hover backgrounds vs text; meet WCAG AA.
- [ ] Keyboard nav: tab through sidebar items, topbar actions, and table controls.
- [ ] Cross-browser smoke test (Chromium, Firefox) and responsive viewport checks.

## 9) Integration Steps
- [ ] Wire routes or template includes so sidebar active state is driven by current page.
- [ ] Apply classes/utilities consistently across pages (dashboard, employee list, forms).
- [ ] Document class names and tokens in a short README for future contributors.

## 10) Done Criteria
- Layout matches specified dimensions/colors/spacing.
- Sidebar/topbar remain fixed/sticky; main area scrolls independently.
- Cards and tables follow the detailed paddings, borders, and typography sizes.
- Responsive behavior verified; UIkit components retain theme consistency.
