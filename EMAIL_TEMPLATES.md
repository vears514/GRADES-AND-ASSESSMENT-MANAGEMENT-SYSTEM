# Email Templates & Notification Specifications
## Grades & Assessment Management System

**Document Version**: 1.0  
**Last Updated**: December 17, 2025  
**Status**: Implementation Ready

---

## Table of Contents
1. [Email System Overview](#email-system-overview)
2. [Template Structure](#template-structure)
3. [Grade Encoding Notifications](#grade-encoding-notifications)
4. [Verification Notifications](#verification-notifications)
5. [Correction Notifications](#correction-notifications)
6. [System Notifications](#system-notifications)
7. [Email Configuration](#email-configuration)
8. [Personalization & Localization](#personalization--localization)

---

## Email System Overview

### Email Service Provider
- **Primary**: Firebase Cloud Functions + SendGrid
- **Fallback**: Firebase Realtime Database with scheduled notifications
- **Rate Limiting**: 100 emails per minute per account
- **Retry Policy**: 3 retries with exponential backoff

### Notification Channels
1. Email (primary)
2. In-app notifications (secondary)
3. SMS (for critical alerts)

### Email Categories

| Category | Trigger | Recipients | Frequency | Priority |
|----------|---------|-----------|-----------|----------|
| Grade Posted | Instructor submits grades | Students | Immediate | High |
| Verification Status | Grade verified/rejected | Instructors | Immediate | High |
| Correction Request | New correction request | Approvers | Immediate | High |
| System Alert | Errors, maintenance | Admins | Immediate | Critical |
| Weekly Summary | End of week | Faculty | Daily 6 PM | Low |
| Deadline Reminder | Before deadline | Faculty | 24h before | Medium |

---

## Template Structure

### Email Component Hierarchy

```
Base Template
├── Header (logo, greeting)
├── Primary Content
│   ├── Heading
│   ├── Main Message
│   └── Details Table
├── Call-to-Action Button(s)
├── Secondary Information
├── Footer
│   ├── Unsubscribe link
│   ├── Notification preferences
│   └── Contact support
└── Metadata
    ├── Track ID
    ├── Timestamp
    └── System signature
```

### HTML Email Template Base

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <style>
    * { margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: #1e3a8a; color: white; padding: 20px; }
    .content { padding: 20px; background: #f9fafb; }
    .footer { background: #1f2937; color: #d1d5db; padding: 10px; text-align: center; }
    .button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Grades & Assessment Management System</h1>
    </div>
    <div class="content">
      {{content}}
    </div>
    <div class="footer">
      <p>© 2025 University Name. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

---

## Grade Encoding Notifications

### 1. Grade Submitted Confirmation (Faculty → Faculty)

**Trigger**: Instructor submits grades for a course  
**Recipient**: Submitting instructor  
**Priority**: Medium  
**Schedule**: Immediate

```
Subject: Grade Submission Confirmation - {{course_code}} - {{submission_date}}

Dear {{faculty_name}},

Your grade submission has been received and recorded in the system.

Submission Details:
- Course: {{course_code}} - {{course_name}}
- Section: {{section_number}}
- Submitted: {{submission_datetime}}
- Total Grades: {{grade_count}}
- Status: Awaiting Verification

Next Steps:
The submitted grades have been forwarded to the Registrar's office for verification.
You'll receive notification once the verification process is complete.

Action Required:
If you need to modify any grades before they're verified, contact the Registrar immediately.
Editing deadline: {{editing_deadline}}

---
View Submission Details: [View in System]
Track Status: [View Status Page]

Questions? Contact: registrar@university.edu
```

### 2. Grade Posted to Students (Faculty → Students)

**Trigger**: Instructor posts approved grades  
**Recipient**: Students in course  
**Priority**: High  
**Schedule**: Immediate

```
Subject: Your {{course_code}} Grades Are Now Available

Hi {{student_name}},

Your grades for {{course_code}} - {{course_name}} have been posted and are now available to view.

Course Details:
- Course: {{course_code}} - {{course_name}}
- Instructor: {{instructor_name}}
- Section: {{section_number}}
- Posted: {{posting_date}}

Your Grade:
- Final Grade: {{final_grade}} ({{grade_points}} points)
- Class Average: {{class_average}}
- Your Standing: {{percentile_rank}}th percentile

Course Impact:
- Cumulative GPA Impact: {{gpa_change}}
- New GPA: {{current_gpa}} (was {{previous_gpa}})

View Full Details:
[Click here to view detailed grade breakdown]
[View transcript impact]

Important Notes:
- Grades are now final and posted
- Grade appeals must be submitted within {{appeal_deadline}} days
- If you have questions, contact your instructor

Questions about your grade?
1. Review your grade details in the system
2. Contact your instructor during office hours
3. Submit a formal grade appeal if needed

---
View Your Grades: [Link]
Grade Appeal Form: [Link]
Support: help@university.edu
```

### 3. Bulk Grade Upload Notification (Faculty → Faculty)

**Trigger**: Instructor uploads grades via CSV/Excel  
**Recipient**: Uploading instructor  
**Priority**: High  
**Schedule**: Immediate

```
Subject: Bulk Grade Upload Results - {{course_code}} - {{upload_datetime}}

Dear {{faculty_name}},

Your bulk grade upload has been processed. See summary below:

Upload Summary:
- File: {{filename}}
- Uploaded: {{upload_datetime}}
- Total Records: {{total_records}}
- Successfully Imported: {{successful_count}}
- Errors: {{error_count}}
- Status: {{status}}

Success Details:
{{#if successful_grades}}
- Grades Imported: {{successful_count}}
- New Entries: {{new_count}}
- Updates: {{update_count}}
- Drafts Saved: {{draft_count}}
{{/if}}

{{#if errors}}
Issues Found:

| Row | Student ID | Issue | Resolution |
|-----|-----------|-------|-----------|
{{#each errors}}
| {{row}} | {{student_id}} | {{error_message}} | {{suggested_fix}} |
{{/each}}

Action Needed:
1. Review the errors in the table above
2. Fix the CSV file with the suggested corrections
3. Re-upload the corrected file
{{/if}}

Next Steps:
{{#if status == 'partial'}}
The successfully imported grades are now in draft status and can be edited.
Please fix the errors and re-upload or manually enter the remaining grades.
{{/if}}

{{#if status == 'complete'}}
All grades have been successfully imported and are awaiting verification.
You'll receive confirmation once the Registrar verifies these grades.
{{/if}}

---
View Upload Results: [View Details]
Download Error Report: [Download CSV]
Re-upload Corrected File: [Upload Again]

Questions? Contact: registrar@university.edu
```

### 4. Grade Editing Deadline Reminder (System → Faculty)

**Trigger**: 24 hours before editing deadline  
**Recipient**: Faculty with unverified submissions  
**Priority**: High  
**Schedule**: 24 hours before deadline

```
Subject: 🕐 Grade Editing Deadline - {{hours_remaining}} Hours Remaining - {{course_code}}

Dear {{faculty_name}},

REMINDER: Your deadline to edit submitted grades is approaching.

Deadline Information:
- Course: {{course_code}} - {{course_name}}
- Current Status: {{current_status}}
- Deadline: {{deadline_datetime}} ({{hours_remaining}} hours remaining)
- Grades Submitted: {{grade_count}}

Status of Your Submission:
{{#if verification_status == 'pending'}}
- Your grades are pending verification by the Registrar
- You can still make edits before the deadline
{{/if}}

{{#if verification_status == 'issues'}}
- The Registrar has flagged {{issue_count}} grades for review
- You can edit these specific grades
- Details: [View Issues]
{{/if}}

Action Items:
1. Review your submitted grades immediately
2. Make any necessary corrections before deadline
3. Contact registrar if you need an extension

Editable Grades:
[View Submission] [Edit Grades]

After the Deadline:
Once the deadline passes, you will no longer be able to edit these grades.
Any further changes will require formal correction request procedures.

---
View & Edit Grades: [Go to System]
Request Extension: [Contact Registrar]
Support: registrar@university.edu
```

---

## Verification Notifications

### 1. Grades Sent for Verification (System → Registrar)

**Trigger**: Faculty submits grades  
**Recipient**: Registrar office staff  
**Priority**: Medium  
**Schedule**: Immediate

```
Subject: New Grades Awaiting Verification - {{course_code}} - {{grade_count}} Records

Dear Registrar Team,

New grades have been submitted and are awaiting verification.

Submission Summary:
- Submitted By: {{faculty_name}} ({{faculty_id}})
- Course: {{course_code}} - {{course_name}}
- Section: {{section_number}}
- Total Grades: {{grade_count}}
- Submission Time: {{submission_datetime}}
- Priority: {{priority_level}}

Distribution Overview:
- A: {{count_a}} | B: {{count_b}} | C: {{count_c}} | D: {{count_d}} | F: {{count_f}}
- Average: {{average_grade}}
- Median: {{median_grade}}
- Std Deviation: {{std_dev}}

Anomaly Detection:
{{#if anomalies}}
⚠️ The following items require attention:
{{#each anomalies}}
- {{anomaly_description}} ({{count}} grades affected)
{{/each}}
{{else}}
✓ No significant anomalies detected
{{/if}}

Course History Comparison:
- Last Semester Average: {{last_sem_avg}}
- Historical Average: {{historical_avg}}
- Variance: {{variance_percentage}}

Action Required:
1. Review the grades for accuracy and consistency
2. Check for anomalies flagged by the system
3. Approve or request corrections from faculty

Options:
[Review & Approve] [Request Corrections] [View Full Details]

---
Verification Queue: [View Queue]
Submission Details: [View All Info]
Support: help@university.edu
```

### 2. Grades Approved (System → Faculty)

**Trigger**: Registrar approves submitted grades  
**Recipient**: Submitting faculty  
**Priority**: High  
**Schedule**: Immediate

```
Subject: ✅ Grades Approved - {{course_code}} - {{approval_date}}

Dear {{faculty_name}},

Your submitted grades for {{course_code}} have been approved and are now final.

Approval Details:
- Course: {{course_code}} - {{course_name}}
- Section: {{section_number}}
- Approved: {{approval_date}} at {{approval_time}}
- Approved By: {{registrar_name}}
- Total Approved: {{grade_count}}

Timeline:
- Submitted: {{submission_date}}
- Verification Started: {{verification_start_date}}
- Approved: {{approval_date}}

What Happens Next:
1. Grades are now posted to the student information system
2. Students will receive notification that grades are available
3. Grades are now locked for normal editing
4. Any future changes require formal correction procedures

Student Notifications:
Students will receive their grade notifications at {{student_notification_time}}.

Correction Process:
If errors are discovered after this notification, please use the Grade Correction
Request process to submit corrections for review.

Important Dates:
- Grade Appeal Window Opens: {{appeal_window_start}}
- Grade Appeal Window Closes: {{appeal_window_end}}
- Next Submission Deadline: {{next_deadline}}

---
View Approved Submission: [View Details]
Submit Grade Correction: [New Correction Request]
Archive Submission: [Archive]

Questions? Contact: registrar@university.edu
```

### 3. Corrections Requested (System → Faculty)

**Trigger**: Registrar identifies issues and requests changes  
**Recipient**: Submitting faculty  
**Priority**: High  
**Schedule**: Immediate

```
Subject: ⚠️ Grade Correction Requested - {{course_code}} - Action Required

Dear {{faculty_name}},

The Registrar's office has identified issues with your submitted grades and
requested corrections before approval.

Correction Summary:
- Course: {{course_code}} - {{course_name}}
- Issues Found: {{issue_count}}
- Deadline for Corrections: {{deadline_datetime}}
- Request Date: {{request_date}}

Issues Requiring Attention:

| Student ID | Student Name | Current Grade | Issue | Suggested Action |
|-----------|---|------|-------|----------|
{{#each corrections}}
| {{student_id}} | {{student_name}} | {{current_grade}} | {{issue}} | {{action}} |
{{/each}}

Common Issues:
{{#if has_grade_anomalies}}
- Grade Anomalies: Grades outside typical range ({{anomaly_count}} records)
{{/if}}

{{#if has_invalid_students}}
- Invalid Students: Student IDs not found in system ({{count}} records)
{{/if}}

{{#if has_data_format}}
- Data Format Issues: Incorrect format in submitted data
{{/if}}

Action Required:
1. Review the issues listed above
2. Verify each flagged grade with your records
3. Submit corrected grades or explanation by {{deadline_datetime}}

Options:
[Review Detailed Issues] [Resubmit Corrected Grades] [Provide Explanations]

Next Steps:
- Resubmit corrected CSV file, or
- Manually edit each grade in the system, or
- Request extension (requires justification)

Extension Requests:
If you need more time, reply to this email with justification within 24 hours.
Extension decisions typically made within 24 hours.

Support:
Questions about the issues? Contact the Registrar's office.

---
View Issues Details: [View Full Issues]
Resubmit Grades: [Upload New File]
Contact Registrar: [Email]
```

### 4. Grade Appeal Notification (System → Faculty)

**Trigger**: Student submits grade appeal  
**Recipient**: Course instructor  
**Priority**: High  
**Schedule**: Immediate

```
Subject: Grade Appeal Submitted - {{course_code}} - {{student_name}}

Dear {{faculty_name}},

A student has submitted a formal grade appeal for your course.

Appeal Details:
- Student: {{student_name}} ({{student_id}})
- Course: {{course_code}} - {{course_name}}
- Received Grade: {{received_grade}}
- Appeal Submitted: {{submission_date}}
- Response Deadline: {{response_deadline}}

Appeal Reason:
"{{appeal_reason}}"

Supporting Evidence:
{{#if has_attachments}}
- Files attached: {{attachment_count}}
- Download: [View Attachments]
{{/if}}

Your Options:
1. ✓ Maintain Current Grade (provide written explanation)
2. ✓ Change Grade (provide rationale for change)
3. ✓ Schedule Meeting with Student (if needed)

Submission Process:
1. Review the appeal and any attached evidence
2. Consider the student's claims
3. Make your decision and respond via the system
4. Your response must be submitted by {{response_deadline}}

Important:
- This is a formal process with documentation requirements
- Your response will be reviewed by academic affairs if disputed further
- Both you and the student will receive copies of all documentation

Response Template:
[View Response Form]

Timeline:
- Appeal Submitted: {{submission_date}}
- Your Response Due: {{response_deadline}}
- Student Notified: {{student_notification_date}}
- Appeal Resolution: {{resolution_deadline}}

---
View Appeal Details: [View Full Appeal]
Submit Response: [Respond Now]
Appeal Policy: [View Policy]
Support: appeals@university.edu
```

---

## Correction Notifications

### 1. New Correction Request (System → Approver)

**Trigger**: Faculty submits correction request  
**Recipient**: Level 1 approver (Department Head)  
**Priority**: High  
**Schedule**: Immediate

```
Subject: New Grade Correction Request - {{student_name}} - {{course_code}} - Action Required

Dear {{approver_name}},

A new grade correction request requires your review and approval.

Request Summary:
- Requested By: {{requester_name}} ({{requester_title}})
- Student: {{student_name}} ({{student_id}})
- Course: {{course_code}} - {{course_name}}
- Current Grade: {{current_grade}}
- Proposed Grade: {{proposed_grade}}
- Request Date: {{request_date}}

Request Details:
- Correction Type: {{correction_type}}
- Reason: {{reason}}
- Impact: {{impact_description}}

Documentation Attached:
{{#each documents}}
- {{document_name}} ({{file_size}})
{{/each}}

Approval History:
{{#if approval_chain}}
This request follows the approval chain:
1. Initial Request: Submitted {{initial_submit_date}}
2. Current Level: {{current_level}} (awaiting your approval)
3. Final Approval: Will go to {{final_approver_title}}
{{/if}}

Your Actions:
- ✓ Approve: Forward to next level
- ✗ Reject: Return to requester with feedback
- ⓘ Request Info: Ask for clarification
- ⏱ Defer: Review within 5 days

Deadline:
Your response is due by {{approval_deadline}} ({{hours_remaining}} hours remaining).

---
View Full Request: [View Details]
Approve Request: [Approve]
Reject Request: [Reject]
Request Information: [Ask Questions]
```

### 2. Correction Approved (System → Faculty)

**Trigger**: All approvers approve correction  
**Recipient**: Requesting faculty  
**Priority**: High  
**Schedule**: Immediate

```
Subject: ✅ Grade Correction Approved - {{student_name}} - {{course_code}}

Dear {{faculty_name}},

Your grade correction request has been approved and the grade has been updated in the system.

Correction Details:
- Student: {{student_name}} ({{student_id}})
- Course: {{course_code}} - {{course_name}}
- Previous Grade: {{previous_grade}}
- New Grade: {{new_grade}}
- Effective Date: {{effective_date}}

Approval Chain:
{{#each approvers}}
- {{approver_title}}: Approved {{approval_date}} by {{approver_name}}
{{/each}}

Updates Made:
✓ Student record updated
✓ Transcript updated
✓ GPA recalculated
✓ Academic standing updated (if applicable)
✓ Student notified

Student Notification:
{{student_name}} has been notified of the grade change via email.

Academic Impact (if applicable):
{{#if academic_impact}}
- New GPA: {{new_gpa}} (was {{old_gpa}})
- Academic Standing: {{standing}} (was {{previous_standing}})
- Progress Notes: {{progress_notes}}
{{/if}}

What's Next:
1. The correction has been recorded in the permanent record
2. All affected systems have been updated
3. Documentation is archived for audit purposes
4. No further action needed

Records Available:
[View Correction Details]
[Download Confirmation]
[View Audit Trail]

Questions?
Contact the Registrar's office if you have any questions about this correction.

---
View Correction Details: [View]
Download Certificate: [PDF]
Support: registrar@university.edu
```

### 3. Correction Rejected (System → Faculty)

**Trigger**: Approver rejects correction request  
**Recipient**: Requesting faculty  
**Priority**: High  
**Schedule**: Immediate

```
Subject: Grade Correction Request Rejected - {{student_name}} - {{course_code}}

Dear {{faculty_name}},

Your grade correction request has been rejected. See details below.

Rejection Details:
- Student: {{student_name}} ({{student_id}})
- Course: {{course_code}} - {{course_name}}
- Request ID: {{request_id}}
- Rejected By: {{rejector_title}}, {{rejector_name}}
- Rejection Date: {{rejection_date}}

Reason for Rejection:
"{{rejection_reason}}"

Reviewer Feedback:
{{feedback_detailed}}

Next Steps:
You have the following options:

1. Appeal the Decision
   - File a formal appeal within {{appeal_window}} days
   - Provide additional evidence or documentation
   - [File Appeal]

2. Resubmit Request
   - Address the reviewer's concerns
   - Provide additional documentation
   - Resubmit within {{resubmit_window}} days
   - [Resubmit Request]

3. Accept Decision
   - No further action taken
   - Grade remains unchanged

Important Dates:
- Appeal Deadline: {{appeal_deadline}}
- Resubmit Deadline: {{resubmit_deadline}}

Support:
Questions about the rejection? Contact the {{rejector_title}}'s office.

---
View Full Details: [View Request]
Appeal Decision: [File Appeal]
Resubmit Request: [Submit New]
Contact Office: [Email]
```

---

## System Notifications

### 1. System Maintenance Alert

**Trigger**: Scheduled maintenance  
**Recipient**: All users  
**Priority**: High  
**Schedule**: 48h, 24h, 1h before maintenance

```
Subject: ⚠️ Scheduled System Maintenance - {{maintenance_date}}

Dear User,

We will be performing scheduled maintenance on our system. Here are the details:

Maintenance Window:
- Date: {{maintenance_date}}
- Time: {{start_time}} - {{end_time}} ({{duration}} hours)
- Duration: Approximately {{duration}} hours
- Status: {{status_message}}

What to Expect:
- System will be unavailable during this window
- Grade submission disabled
- Grade viewing disabled
- All system functions will be offline

Impact:
- Ongoing grade submissions will need to be completed after maintenance
- All data remains secure and protected
- No data loss expected

Preparation:
- Save any work before {{maintenance_start_time}}
- Plan alternative work during the maintenance window
- Have offline access to documents if needed

Questions?
Contact the IT Help Desk if you have urgent needs during the maintenance window.

---
Maintenance Details: [View Full Details]
Help Desk: help@university.edu
System Status: [Status Page]
```

### 2. Account Security Alert

**Trigger**: Suspicious activity detected  
**Recipient**: Affected user  
**Priority**: Critical  
**Schedule**: Immediate

```
Subject: 🔒 Security Alert - Unusual Activity on Your Account

Dear {{user_name}},

We detected unusual activity on your account and want to ensure your account security.

Activity Detected:
- Activity: {{activity_type}}
- Time: {{activity_datetime}}
- Location: {{location}}
- Device: {{device_type}}
- IP Address: {{ip_address}}

Was This You?
- Yes, this was me: [Confirm Activity]
- No, I didn't do this: [Report Suspicious Activity]

If This Wasn't You:
1. Change your password immediately
2. Report the activity
3. We'll monitor your account for fraud

Security Steps:
1. Verify your identity: [Verify]
2. Review recent access: [View Access Log]
3. Update security settings: [Security Settings]
4. Enable two-factor authentication: [Enable 2FA]

What We're Doing:
- Monitoring your account for fraud
- Reviewing access logs
- Securing your data
- Standing by to assist

Your Account Status:
Status: {{account_status}}
Last Verified: {{last_verified}}

Questions?
Contact the Security Team immediately if you have concerns.

---
Change Password: [Reset Password]
Report Issue: [Report]
View Activity: [Activity Log]
Security Team: security@university.edu
```

### 3. Deadline Approaching

**Trigger**: Deadline within 24 hours  
**Recipient**: Users with pending actions  
**Priority**: High  
**Schedule**: 24h, 48h, 72h before deadline

```
Subject: 🕐 Reminder: {{action_type}} Deadline - {{hours_remaining}} Hours Left

Dear {{user_name}},

Reminder: Your deadline to {{action_type}} is approaching.

Deadline Information:
- Task: {{action_type}}
- Deadline: {{deadline_datetime}}
- Time Remaining: {{hours_remaining}} hours
- Status: {{current_status}}

What's Pending:
{{#each pending_items}}
- {{pending_item_description}}
{{/each}}

Action Required:
Complete these steps before the deadline:
{{#each required_steps}}
1. {{step_description}}
{{/each}}

Quick Links:
[Start {{action_type}}]
[View Instructions]
[Request Extension]

Consequences of Missing Deadline:
{{#if consequences}}
{{consequences_description}}
{{/if}}

Questions?
Contact your department or support team for assistance.

---
Complete Task: [Go to System]
View Instructions: [Help]
Support: help@university.edu
```

---

## Email Configuration

### Email Sending Configuration

```typescript
// src/services/email.ts
import nodemailer from 'nodemailer'
import sendgrid from '@sendgrid/mail'

export interface EmailConfig {
  from: string
  replyTo: string
  provider: 'sendgrid' | 'smtp'
  retryCount: number
  retryDelay: number
}

const emailConfig: EmailConfig = {
  from: 'noreply@university.edu',
  replyTo: 'support@university.edu',
  provider: 'sendgrid',
  retryCount: 3,
  retryDelay: 5000
}

export const sendEmail = async (
  to: string,
  subject: string,
  htmlContent: string,
  textContent: string,
  options?: {
    cc?: string[]
    bcc?: string[]
    attachments?: any[]
    templateId?: string
    dynamicData?: Record<string, any>
  }
) => {
  try {
    const msg = {
      to,
      from: emailConfig.from,
      replyTo: emailConfig.replyTo,
      subject,
      html: htmlContent,
      text: textContent,
      cc: options?.cc,
      bcc: options?.bcc,
      attachments: options?.attachments,
      trackingSettings: {
        clickTracking: { enable: true },
        openTracking: { enable: true }
      }
    }

    await sendgrid.send(msg)
    
    // Log successful send
    logger.info({
      event: 'email_sent',
      to,
      subject,
      timestamp: new Date()
    })
    
    return { success: true }
  } catch (error) {
    logger.error({ event: 'email_failed', error, to, subject })
    throw error
  }
}
```

### Email Template Rendering

```typescript
// src/services/emailTemplates.ts
import Handlebars from 'handlebars'

export const renderEmailTemplate = (
  template: string,
  data: Record<string, any>
) => {
  const compiled = Handlebars.compile(template)
  return compiled(data)
}

// Register custom helpers
Handlebars.registerHelper('formatDate', (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
})

Handlebars.registerHelper('formatTime', (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
})
```

### Email Queue & Scheduling

```typescript
// src/services/emailQueue.ts
import Bull from 'bull'

const emailQueue = new Bull('emails', {
  redis: process.env.REDIS_URL
})

emailQueue.process(async (job) => {
  const { to, subject, template, data } = job.data
  
  try {
    const htmlContent = renderEmailTemplate(template, data)
    await sendEmail(to, subject, htmlContent, '')
    
    job.progress(100)
    return { success: true }
  } catch (error) {
    if (job.attemptsMade < emailConfig.retryCount) {
      throw error // Retry
    }
    
    // Log final failure
    logger.error({
      event: 'email_failed_max_retries',
      to,
      subject,
      error: error.message
    })
  }
})

// Schedule email send
export const scheduleEmail = async (
  to: string,
  subject: string,
  template: string,
  data: Record<string, any>,
  delay?: number
) => {
  const job = await emailQueue.add(
    { to, subject, template, data },
    {
      delay,
      attempts: emailConfig.retryCount,
      backoff: {
        type: 'exponential',
        delay: emailConfig.retryDelay
      }
    }
  )
  
  return job.id
}
```

---

## Personalization & Localization

### Dynamic Content Insertion

```
Standard Placeholders:
- {{first_name}} - User's first name
- {{last_name}} - User's last name
- {{email}} - User's email
- {{user_role}} - User's role (Faculty, Registrar, Student, Admin)
- {{institution_name}} - University name
- {{current_date}} - Current date
- {{current_year}} - Current year

Conditional Sections:
{{#if condition}}
  Content shown if true
{{/if}}

{{#each array}}
  Content repeated for each item
{{/each}}

Formatting Helpers:
{{formatDate date}} - Format date as "December 17, 2025"
{{formatTime time}} - Format time as "10:30 AM"
{{formatCurrency amount}} - Format currency as "$1,234.56"
{{formatPercent value}} - Format as percentage "87%"
```

### Localization Support

```
Language Support:
- English (default)
- Spanish
- French
- Mandarin Chinese
- Arabic

Template Storage:
- One master template per email type
- Localized strings in separate JSON files
- Automatic language selection based on user preference

Example Localization:
{
  "en": {
    "subject": "Grade Submission Confirmation",
    "greeting": "Dear {{first_name}},",
    "body": "Your grade submission has been received..."
  },
  "es": {
    "subject": "Confirmación de Envío de Calificaciones",
    "greeting": "Estimado {{first_name}},",
    "body": "Se ha recibido su envío de calificaciones..."
  }
}
```

### Accessibility Standards

```
HTML Email Accessibility:
- Proper heading hierarchy (h1, h2, h3)
- Alt text for all images
- High contrast colors (WCAG AA)
- Semantic HTML structure
- Mobile-responsive design
- Plain text alternative provided

Color Contrast Requirements:
- Text on background: 4.5:1 ratio
- Link colors: Distinct from text
- Status indicators: Not color-only
```

---

**Document Version**: 1.0  
**Status**: Implementation Ready  
**Last Updated**: December 17, 2025
