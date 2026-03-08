# Admin Template Mapping

## Base Decision

Use `Document & Credentials/admin.html` and `admin.css` as the primary UI reference for the dashboard side of this project.

Reason:
- The current app is already organized around a persistent `sidebar + topbar + main content` shell.
- Most active modules are admin, registrar, and faculty workflows.
- The admin template already contains patterns for stats, tables, filters, activity logs, settings, and modal-heavy management screens.

Do not copy the raw HTML/CSS directly into Next.js pages.
Translate the template into:
- reusable React layout/components
- Tailwind utility classes
- a small shared design-token layer in `src/app/globals.css`

## Primary Target Files

- `src/app/dashboard/layout.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/dashboard/registrar/verification/page.tsx`
- `src/app/dashboard/registrar/reports/page.tsx`
- `src/app/dashboard/faculty/grades/page.tsx`
- `src/app/dashboard/faculty/corrections/page.tsx`
- `src/app/dashboard/admin/users/page.tsx`
- `src/app/dashboard/admin/settings/page.tsx`
- `src/app/dashboard/audit-logs/page.tsx`
- `src/app/dashboard/profile/admin/page.tsx`
- `src/app/globals.css`

## Template-To-Project Mapping

| Admin template section | What it becomes in this project | Target file |
| --- | --- | --- |
| Topbar (`.topbar`) | Global dashboard header with page title, search slot, notifications slot, user avatar/pill | `src/app/dashboard/layout.tsx` |
| Sidebar (`.sidebar`, `.sb-item`) | Single shared role-aware navigation shell | `src/app/dashboard/layout.tsx` |
| Theme tokens in `admin.css` (`--b900`, `--surface`, shadows, radius, badges) | Shared design tokens for dashboard pages | `src/app/globals.css` |
| Dashboard hero (`.dash-hero`) | New overview hero for the main dashboard landing page | `src/app/dashboard/page.tsx` |
| Stats row (`.stats-row`, `.scard`) | Reusable stat cards for counts and summaries | `src/app/dashboard/page.tsx` and later shared component |
| Recent requests card | Recent grade activity / submission feed | `src/app/dashboard/page.tsx` |
| Quick actions card | Shortcut panel for major modules | `src/app/dashboard/page.tsx` |
| System status card | Current user, refresh state, data sync hints | `src/app/dashboard/page.tsx` |
| Queue view | Registrar verification queue for submitted grades | `src/app/dashboard/registrar/verification/page.tsx` |
| Processing center | Faculty encoding/publishing workflow and registrar in-progress review | `src/app/dashboard/faculty/grades/page.tsx` |
| Document generation view | Reports/export/generation workflow | `src/app/dashboard/registrar/reports/page.tsx` |
| Release tracking | Published/posting state of grades and corrections | `src/app/dashboard/faculty/corrections/page.tsx` and student grade pages |
| Archived records | Historical grade records / semestral archive | `src/app/dashboard/student/grades/semestral/page.tsx` |
| User management | Real admin user administration page | `src/app/dashboard/admin/users/page.tsx` |
| Audit logs | Full audit trail table and expandable details | `src/app/dashboard/audit-logs/page.tsx` |
| Notifications | Future module; keep topbar slot first, page later if needed | `src/app/dashboard/layout.tsx` then new route |
| Profile | Admin profile presentation using the same card language | `src/app/dashboard/profile/admin/page.tsx` |
| Settings | System configuration page using toggle/setting rows pattern | `src/app/dashboard/admin/settings/page.tsx` |
| Security guide | Optional help/compliance page; not priority for first pass | future route |

## Concrete Translation Rules

### 1. Layout shell

From the admin template, the first thing to carry over is the shell:
- fixed topbar
- fixed or sticky left sidebar
- scrollable main panel
- grouped navigation labels
- clear active nav state

Apply that to:
- `src/app/dashboard/layout.tsx`

What to keep:
- brand block
- user pill
- better active menu styling
- sidebar grouping

What to change:
- keep current role-aware menu logic
- replace inline `onclick` behavior with `Link`, route checks, and React state
- do not port raw emoji/icons as the final design system

### 2. Dashboard landing page

Map the current plain overview into the admin template's stronger structure.

Recommended structure for `src/app/dashboard/page.tsx`:
- hero banner
- 4 to 5 summary stat cards
- module shortcut cards
- recent activity panel
- audit log preview panel

Suggested content mapping:
- `Total Requests` -> `Total Grades`
- `In Queue` -> `Pending Review`
- `Processing` -> `Draft/Submitted`
- `Released` -> `Published`
- `Recent Requests` -> `Recent Grade Activity`

### 3. Registrar verification page

`admin.html` queue view is the closest match to:
- `src/app/dashboard/registrar/verification/page.tsx`

Carry over these patterns:
- page header block
- status flow tabs
- search/filter row
- wide management table
- row actions
- modal-based review action

Rename for grade context:
- `Request Queue` -> `Verification Queue`
- `Pending / Verified / Processing / Released / Rejected`
  becomes
  `Submitted / Under Review / Approved / Posted / Rejected`

### 4. Faculty grade entry page

The faculty page already has strong functional logic.
Use the admin template only for visual structure:
- filter card
- denser table header treatment
- badge system
- right-side activity panel
- consistent action buttons

Best target:
- `src/app/dashboard/faculty/grades/page.tsx`

Do not replace:
- existing data-fetching logic
- grade computation logic
- audit integration

Only replace:
- visual hierarchy
- spacing
- color and badge system
- shared page-header pattern

### 5. Reports and export page

`Generate Document` from the template maps best to:
- `src/app/dashboard/registrar/reports/page.tsx`

Carry over:
- left list / right preview split
- action buttons
- clearer section headers
- summary cards

Rename for grade context:
- `Generate Document` -> `Generate Reports`
- `Document Preview` -> `Report Preview`

### 6. User management and settings

The template is much more complete than the current placeholder pages.

Direct targets:
- `src/app/dashboard/admin/users/page.tsx`
- `src/app/dashboard/admin/settings/page.tsx`

Carry over from the template:
- user list table
- add/edit modal patterns
- status badges
- setting rows with toggles
- section cards

These are high-value because both pages are currently placeholders.

### 7. Audit logs and profile

Map these template areas directly:
- `Audit Logs` -> `src/app/dashboard/audit-logs/page.tsx`
- `My Profile` -> `src/app/dashboard/profile/admin/page.tsx`

Use:
- stronger header treatment
- card segmentation
- metadata rows
- better action blocks

## Recommended Implementation Order

1. Rebuild the dashboard shell in `src/app/dashboard/layout.tsx`.
2. Move core visual tokens into `src/app/globals.css`.
3. Redesign `src/app/dashboard/page.tsx` using the hero + stat-card structure.
4. Apply queue styling patterns to `src/app/dashboard/registrar/verification/page.tsx`.
5. Apply admin-table/card patterns to `src/app/dashboard/faculty/grades/page.tsx`.
6. Build out `src/app/dashboard/admin/users/page.tsx`.
7. Build out `src/app/dashboard/admin/settings/page.tsx`.
8. Refresh `src/app/dashboard/audit-logs/page.tsx` and `src/app/dashboard/profile/admin/page.tsx`.

## What Not To Do

- Do not paste the full `admin.css` into the app unchanged.
- Do not rebuild working business logic just to match the template.
- Do not mix raw HTML template state handling with React state.
- Do not force student-facing pages to use the admin template; those should reference `Document.html` later.

## Practical Summary

For this project, treat the admin template as:
- the master visual language for dashboard pages
- the main reference for admin/registrar/faculty modules
- the source of layout, cards, tables, filters, badges, modals, and settings patterns

Use it first on the shared dashboard shell and admin-heavy modules.
Use the student template only after that, for student-only screens.
