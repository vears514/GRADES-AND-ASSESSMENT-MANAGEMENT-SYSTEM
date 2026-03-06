# Grade Publishing Feature (Student Portal)

Purpose: let faculty encode course grades and publish them to each student account; students can view, download, and track publication status.

## Roles & Permissions
- Registrar/Faculty: encode and publish grades for assigned courses/sections.
- Student: read-only access to own published grades; download semestral grade report.
- Admin: override, audit trail access, and bulk publish controls.

## Core Flows
1) Encode -> Validate -> Publish  
   - Faculty selects academic term -> course section -> uploads/inputs grades per student.  
   - System validates completeness, grade scale, and unit count.  
   - On publish, records are marked `Published` and become visible to the student.
2) Student View  
   - Default view: "Semestral Grade" page listing Subject Code, Subject, Subject Teacher, Units, Grade, Remarks, Status.  
   - Status badge shows `Published`; remarks show `Passed/Failed/In Progress`.  
   - Download button exports the current term's grades (PDF/CSV).
3) Updates / Corrections  
   - Faculty can republish; system versions the grade entry and logs who/when.
4) Notifications  
   - Optional: email or in-app alert when a grade changes status to Published.

## Data Model (minimal)
- Grade  
  - studentId  
  - termId  
  - subjectCode  
  - subjectTitle  
  - units (int)  
  - instructorName  
  - gradeValue (e.g., A, B+, 1.25)  
  - remarks (string)  
  - status: Draft | Submitted | Published  
  - publishedAt, publishedBy
- Term  
  - id, name (e.g., "1st Semester 2024-2025 - College"), startDate, endDate

## API/Backend Requirements
- Mutation: `publishGrades(termId, grades[])` (role: faculty/admin).
- Query (student): `listGrades(termId)` filtered by `studentId = auth.uid`.
- Authorization: enforce student-only access to own records; faculty scoped to their sections; admin full access.
- Audit trail: store previous grade versions with `updatedBy`, `updatedAt`.

## UI Acceptance Criteria (matches mock)
- Page title: "Semestral Grade"; breadcrumb `Grades > Semestral Grade`.
- Term selector defaulted to current term; dropdown ~400px width.
- Table columns: SUBJECT CODE, SUBJECT, SUBJECT TEACHER, UNITS, GRADE, REMARKS, STATUS.
- Example rows:  
  - CS101 | Introduction to computer science "Fundamentals of computer science and programming" | Professor Smith | 3 | B+ | Passed | Published  
  - DS301 | Database System "Relational databases and SQL" | Professor Smith | 3 | A- | Passed | Published  
  - DS201 | Data Structures "Advanced data structures and algorithms" | Professor Smith | 3 | A | Passed | Published
- Download button label: "Download Semestral" with icon, right-aligned under the table.
- Empty state: "No grades available for this term" with muted text and no table.

## Design System Alignment (apply across the feature and the system)
- Core palette: `--c1 #1E3A5F`, `--c2 #2D5986`, backgrounds `#F4F6F9` (page) and `#FFFFFF` (cards), borders `#E8E8E8`, text colors `#333/#666/#888/#AAA`.
- Typography: `-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif`; sizes—system title 1.4rem, nav 0.84rem, submenu 0.78rem, table headers 0.7rem, avatar initials 0.7rem.
- Layout shell: fixed sidebar 250px (white, 1px border right), sticky topbar 60px (white, 1px border bottom), main content margin-left 250px with 28px padding.
- Sidebar states: padding 9px 18px, radius 8px, 10px gap; hover `#F0F2F5`, active `#1E3A5F` with `#FFFFFF` text; submenu hover `rgba(30,58,95,0.06)`.
- Cards: radius 12px, border 1px `#E8E8E8`, header 16px/24px with `#F0F0F0` divider, body 24px padding.
- Tables: uppercase headers, 0.7rem, letter spacing 0.8px; borders `#E8E8E8`; use text colors per hierarchy.
- Spacing system: page padding 28px; section gap 18px; sidebar item padding 9px; card padding 24px.
- UIkit 3: include CDN `https://cdn.jsdelivr.net/npm/uikit@3.21.6/dist/css/uikit.min.css`; load custom theme overrides after UIkit.
- Avatars: 34px circle, background `#1E3A5F`, white text.

## Validation Rules
- Grade within allowed scale; units > 0; subjectCode exists; instructorName required on publish.
- Status transitions: Draft -> Published; republish creates new version; Published cannot be deleted, only superseded.

## Implementation Checklist (make it happen)
- Backend/Data
  - [ ] Add Grade/Term models (or Firestore collections) with indexes on `studentId` + `termId`.
  - [ ] Implement `publishGrades` mutation (faculty/admin) and `listGrades` query (student-only).
  - [ ] Enforce auth: student reads only their grades; faculty limited to their sections; admin full.
  - [ ] Write audit log entries on publish/republish (who, when, prior value).
- Frontend (Student portal)
  - [ ] Build Semestral Grade page per UI criteria using UIkit + theme tokens.
  - [ ] Term dropdown wired to Term data; default current term.
  - [ ] Render table with status badge "Published"; handle empty state.
  - [ ] "Download Semestral" exports visible rows to PDF/CSV.
- Frontend (Faculty/Registrar)
  - [ ] Grade entry form or CSV upload per section with validation.
  - [ ] Publish action triggers mutation; show success/error toasts.
  - [ ] Republish updates version and status.
- QA
  - [ ] Student cannot view others' grades; unauthorized access blocked.
  - [ ] Status flips to Published immediately after successful publish.
  - [ ] Download output matches on-screen table.
  - [ ] Republish retains prior version in audit log.

## Security & Compliance
- Server-side authorization on every query/mutation.
- No grade exposure across students; term filter required on read.
- Logs for publish/republish events with actor identity.
