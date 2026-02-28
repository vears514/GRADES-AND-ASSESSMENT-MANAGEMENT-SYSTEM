# Integrated Business Process (IBP) Diagram

## Grades and Assessment Management System - Complete Workflow

This document provides a comprehensive Integrated Business Process diagram showing how all subsystems (Faculty, Registrar, and Student) work together through authentication, grade submission, verification, validation, and report generation.

---

## Complete System IBP Workflow

```mermaid
graph TD
    Start([System Start]) --> Auth{User Authentication}
    
    Auth -->|Faculty Login| FacAuth[Authenticate Faculty<br/>- Email Verification<br/>- Google OAuth<br/>- Custom Login]
    Auth -->|Registrar Login| RegAuth[Authenticate Registrar<br/>- Email Verification<br/>- Google OAuth<br/>- Custom Login]
    Auth -->|Student Login| StuAuth[Authenticate Student<br/>- Email Verification<br/>- Google OAuth<br/>- Custom Login]
    
    FacAuth --> FacDash[Faculty Dashboard]
    RegAuth --> RegDash[Registrar Dashboard]
    StuAuth --> StuDash[Student Dashboard]
    
    FacDash --> GradeInput[Grade Input Form]
    GradeInput --> DataVal{Data Validation}
    
    DataVal -->|Invalid| ValErr[Validation Error<br/>- Format Check<br/>- Range Validation<br/>- Required Fields]
    ValErr --> ErrNotif[Error Notification<br/>to Faculty]
    ErrNotif --> GradeInput
    
    DataVal -->|Valid| GradeSub[Grade Submission<br/>- Encode Grade Data<br/>- Timestamp Recording<br/>- Faculty Audit Log]
    
    GradeSub --> GradeStore[(Firestore Database<br/>- Grades Collection<br/>- Audit Trail<br/>- Verification Status)]
    
    GradeStore --> RegReview[Registrar Review<br/>- View Pending Grades<br/>- Check Faculty Info<br/>- Validate Against Rules]
    
    RegDash --> RegReview
    
    RegReview --> VerifDecision{Verification Decision}
    
    VerifDecision -->|Approve| Approve[Approve Grade<br/>- Update Status<br/>- Create Audit Entry<br/>- Timestamp Approval]
    
    VerifDecision -->|Request Correction| ReqCorr[Request Correction<br/>- Provide Feedback<br/>- Send Notification<br/>- Reopen for Faculty]
    
    VerifDecision -->|Reject| Reject[Reject Grade<br/>- Log Rejection Reason<br/>- Notify Faculty<br/>- Unlock for Resubmission]
    
    ReqCorr --> FacCorr[Faculty Receives Correction<br/>Request in Dashboard]
    FacCorr --> GradeInput
    
    Approve --> FinalStore[(Update Verified Status<br/>in Firestore)]
    Reject --> FinalStore
    
    FinalStore --> StuAccess[Student Access<br/>Verified Grades]
    
    StuDash --> StuGrades[Student Grade View<br/>- See Final Grades<br/>- View Grade History<br/>- Download Report]
    
    StuAccess --> StuGrades
    
    FinalStore --> ReportGen[Report Generation]
    
    ReportGen --> FacReport[Faculty Reports<br/>- Grade Distribution<br/>- Class Statistics<br/>- Submission Status]
    
    ReportGen --> RegReport[Registrar Reports<br/>- Verification Status<br/>- Audit Trail<br/>- Compliance Report]
    
    ReportGen --> StuReport[Student Report<br/>- Transcript<br/>- Grade Card<br/>- GPA Calculation]
    
    FacReport --> Export1[Export to PDF/CSV]
    RegReport --> Export2[Export to PDF/CSV]
    StuReport --> Export3[Export to PDF/CSV]
    
    Export1 --> Dashboard1[Return to Faculty<br/>Dashboard]
    Export2 --> Dashboard2[Return to Registrar<br/>Dashboard]
    Export3 --> Dashboard3[Return to Student<br/>Dashboard]
    
    Dashboard1 --> End([Process Complete])
    Dashboard2 --> End
    Dashboard3 --> End
    
    style Start fill:#90EE90
    style End fill:#FFB6C6
    style Auth fill:#87CEEB
    style DataVal fill:#FFD700
    style VerifDecision fill:#FFD700
    style GradeStore fill:#DDA0DD
    style FinalStore fill:#DDA0DD
```

---

## Authentication Flow (IBP Component 1)

```mermaid
graph LR
    User[User] --> Login{Login Page}
    Login -->|Email/Password| Email[Email Authentication]
    Login -->|Google OAuth| Google[Google OAuth 2.0]
    
    Email --> AuthService[Auth Service<br/>- Verify Credentials<br/>- Hash Password]
    Google --> GoogleAPI[Google API<br/>- OAuth Callback<br/>- Token Exchange]
    
    AuthService --> FireAuth[Firebase Auth<br/>- Create Session<br/>- Generate JWT]
    GoogleAPI --> FireAuth
    
    FireAuth --> GetRole[Get User Role<br/>- Firestore Lookup<br/>- Custom Claims Check]
    
    GetRole --> Dashboard{Route to Dashboard}
    Dashboard -->|Faculty| FacDash2[Faculty Dashboard]
    Dashboard -->|Registrar| RegDash2[Registrar Dashboard]
    Dashboard -->|Student| StuDash2[Student Dashboard]
    
    style User fill:#90EE90
    style Dashboard fill:#FFD700
```

---

## Grade Submission & Validation Flow (IBP Component 2)

```mermaid
graph TD
    Faculty[Faculty User] --> InputForm[Grade Input Form]
    
    InputForm --> FormData[Collect Grade Data<br/>- Course ID<br/>- Student ID<br/>- Grade Value<br/>- Additional Notes]
    
    FormData --> Validate1{Format<br/>Validation}
    
    Validate1 -->|Invalid| FormatErr[Format Error<br/>- Invalid Grade Format<br/>- Invalid IDs<br/>- Missing Fields]
    FormatErr --> ErrorMsg1[Show Error Message]
    ErrorMsg1 --> InputForm
    
    Validate1 -->|Valid| Validate2{Range<br/>Validation}
    
    Validate2 -->|Out of Range| RangeErr[Range Error<br/>- Grade Outside<br/>Valid Range<br/>- Numerical Error]
    RangeErr --> ErrorMsg2[Show Error Message]
    ErrorMsg2 --> InputForm
    
    Validate2 -->|Valid| Validate3{Business Rule<br/>Validation}
    
    Validate3 -->|Fails| BusinessErr[Business Rule Error<br/>- Duplicate Submission<br/>- Late Submission<br/>- Student Not Enrolled]
    BusinessErr --> ErrorMsg3[Show Error Message]
    ErrorMsg3 --> InputForm
    
    Validate3 -->|Passes| Encode[Encode Grade Data<br/>- Apply Conversion<br/>- Encrypt Sensitive Data]
    
    Encode --> Submit[Submit to Firestore<br/>- Create Grade Record<br/>- Set Status: Pending<br/>- Add Timestamp<br/>- Record Faculty ID]
    
    Submit --> AuditLog[Create Audit Log Entry<br/>- User: Faculty ID<br/>- Action: Grade Submitted<br/>- Timestamp<br/>- Grade Details]
    
    AuditLog --> Confirmation[Show Confirmation<br/>- Grade Submitted Successfully<br/>- Reference Number<br/>- Next Steps]
    
    Confirmation --> FacDashReturn[Return to Faculty<br/>Dashboard]
    
    style Faculty fill:#90EE90
    style Confirmation fill:#90EE90
```

---

## Verification & Correction Flow (IBP Component 3)

```mermaid
graph TD
    Registrar[Registrar User] --> ViewPending[View Pending Grades<br/>- Filter by Status<br/>- Sort by Faculty<br/>- Search Options]
    
    ViewPending --> GradeDetail[View Grade Details<br/>- Student Info<br/>- Course Info<br/>- Grade Value<br/>- Faculty Info<br/>- Submission Date]
    
    GradeDetail --> ComplianceCheck{Compliance<br/>Check}
    
    ComplianceCheck -->|Issues Found| Issues[Check Issues<br/>- Policy Violations<br/>- Data Anomalies<br/>- Missing Documentation]
    Issues --> ReviewIssues[Review with Faculty<br/>- Document Issue<br/>- Mark for Correction<br/>- Add Comments]
    
    ReviewIssues --> ReqCorrection[Request Correction<br/>- Send Notification<br/>- Status: Correction Requested<br/>- Create Correction Record]
    
    ReqCorrection --> FacNotif[Faculty Receives<br/>Correction Request<br/>- Dashboard Alert<br/>- Email Notification]
    
    FacNotif --> FacReview[Faculty Reviews<br/>- See Issues<br/>- Understand Requirements]
    
    FacReview --> FacSubmit[Resubmit Corrected<br/>Grade]
    
    FacSubmit --> ReverifyProcess{Re-verify<br/>Grade}
    
    ReverifyProcess -->|Still Issues| ReviewIssues
    ReverifyProcess -->|Resolved| Approved1[Grade Approved<br/>- Status: Verified<br/>- Create Approval Record]
    
    ComplianceCheck -->|Pass| Approved1
    
    Approved1 --> FinalAudit[Final Audit Entry<br/>- Action: Grade Verified<br/>- Registrar ID<br/>- Approval Timestamp<br/>- Final Status]
    
    FinalAudit --> StudentNotif[Notify Student<br/>- Grade Now Final<br/>- Available in Portal<br/>- Email Confirmation]
    
    StudentNotif --> UpdateDB[(Update Firestore<br/>- Verified Status<br/>- Audit Trail<br/>- Timestamps)]
    
    UpdateDB --> RegDashReturn[Return to Registrar<br/>Dashboard]
    
    style Registrar fill:#90EE90
    style Approved1 fill:#90EE90
    style RegDashReturn fill:#90EE90
```

---

## Student Grade Access & Report Flow (IBP Component 4)

```mermask
graph TD
    Student[Student User] --> StuDash[Student Dashboard]
    
    StuDash --> GradeView{View Grades}
    
    GradeView -->|Current Semester| CurrentGrades[Display Current<br/>Semester Grades<br/>- Course Name<br/>- Grade Value<br/>- Credit Hours<br/>- GPA Impact]
    
    GradeView -->|Grade History| HistoryGrades[Display Grade<br/>History<br/>- All Semesters<br/>- Semester GPA<br/>- Cumulative GPA<br/>- Trends]
    
    CurrentGrades --> ReportOption{Generate<br/>Report?}
    HistoryGrades --> ReportOption
    
    ReportOption -->|Yes| SelectReport{Report<br/>Type}
    ReportOption -->|No| ViewEnd([Back to Dashboard])
    
    SelectReport -->|Transcript| Transcript[Generate Transcript<br/>- Student Details<br/>- All Grades<br/>- GPA Calculation<br/>- Institution Seal]
    
    SelectReport -->|Grade Card| GradeCard[Generate Grade Card<br/>- Current Semester<br/>- Course Details<br/>- Grade Scale<br/>- Due Dates if Any]
    
    SelectReport -->|GPA Report| GPAReport[Generate GPA Report<br/>- Semester GPA<br/>- Cumulative GPA<br/>- GPA Trends<br/>- Academic Standing]
    
    Transcript --> Format{Export<br/>Format}
    GradeCard --> Format
    GPAReport --> Format
    
    Format -->|PDF| PDF[Export to PDF<br/>- Professional Format<br/>- Ready to Print<br/>- Digitally Signed]
    
    Format -->|CSV| CSV[Export to CSV<br/>- Spreadsheet Format<br/>- Data Portable<br/>- Excel Compatible]
    
    PDF --> Download[Download File<br/>- Browser Download<br/>- Save Locally]
    CSV --> Download
    
    Download --> Share{Share<br/>Report?}
    
    Share -->|Email| EmailShare[Email Report<br/>- Self-addressed<br/>- Share with Advisor<br/>- Share with Family]
    
    Share -->|No| ViewEnd
    EmailShare --> ViewEnd
    
    style Student fill:#90EE90
    style ViewEnd fill:#FFB6C6
```

---

## Faculty Report Generation Flow (IBP Component 5)

```mermaid
graph TD
    Faculty[Faculty User] --> FacDash[Faculty Dashboard]
    
    FacDash --> ReportMenu[Access Reports<br/>Menu]
    
    ReportMenu --> SelectReport{Select<br/>Report Type}
    
    SelectReport -->|Grade Distribution| DistReport[Generate Grade<br/>Distribution Report<br/>- Grade Breakdown<br/>- Number of A/B/C/D/F<br/>- Mean Grade<br/>- Standard Deviation]
    
    SelectReport -->|Class Statistics| StatReport[Generate Class<br/>Statistics Report<br/>- Total Students<br/>- Average Grade<br/>- Highest/Lowest<br/>- Class Performance]
    
    SelectReport -->|Submission Status| SubReport[Generate Submission<br/>Status Report<br/>- Submitted Grades<br/>- Pending Grades<br/>- Corrections Needed<br/>- Verified Grades]
    
    DistReport --> Filter{Apply<br/>Filters?}
    StatReport --> Filter
    SubReport --> Filter
    
    Filter -->|By Course| CourseFilter[Filter by Course<br/>- Select Course<br/>- Refine Data]
    
    Filter -->|By Semester| SemFilter[Filter by Semester<br/>- Select Term<br/>- Update Results]
    
    Filter -->|No Filter| NoFilter[Use Full Dataset]
    
    CourseFilter --> Generate[Generate Report<br/>- Compile Data<br/>- Calculate Metrics<br/>- Format Output]
    
    SemFilter --> Generate
    NoFilter --> Generate
    
    Generate --> Preview[Preview Report<br/>- Review Content<br/>- Check Calculations<br/>- Verify Data]
    
    Preview --> Export{Export<br/>Format?}
    
    Export -->|PDF| PDF2[Export to PDF<br/>- Print-ready<br/>- Professional Look<br/>- Password Protected]
    
    Export -->|CSV| CSV2[Export to CSV<br/>- Data Analysis<br/>- Further Processing<br/>- Excel Import]
    
    Export -->|View Only| ViewOnly[View in Browser<br/>- Screen Display<br/>- Interactive Charts]
    
    PDF2 --> Download2[Download/Print]
    CSV2 --> Download2
    ViewOnly --> Display[Display Report]
    
    Download2 --> Archive[Archive Report<br/>- Store in System<br/>- Reference Copy<br/>- Audit Trail]
    
    Archive --> FacReturn[Return to Faculty<br/>Dashboard]
    Display --> FacReturn
    
    style Faculty fill:#90EE90
    style FacReturn fill:#90EE90
```

---

## Registrar Report & Compliance Flow (IBP Component 6)

```mermaid
graph TD
    Registrar[Registrar User] --> RegDash[Registrar Dashboard]
    
    RegDash --> ComplianceMenu[Access Compliance<br/>& Reports]
    
    ComplianceMenu --> SelectReport{Select<br/>Report Type}
    
    SelectReport -->|Verification Status| VerReport[Generate Verification<br/>Status Report<br/>- Total Grades<br/>- Verified Count<br/>- Pending Count<br/>- Rejected Count]
    
    SelectReport -->|Audit Trail| AuditReport[Generate Audit<br/>Trail Report<br/>- All Transactions<br/>- User Actions<br/>- Timestamps<br/>- Changes Made]
    
    SelectReport -->|Compliance| CompReport[Generate Compliance<br/>Report<br/>- Policy Adherence<br/>- Error Rates<br/>- Corrections Made<br/>- Outstanding Issues]
    
    VerReport --> DateRange{Specify<br/>Date Range?}
    AuditReport --> DateRange
    CompReport --> DateRange
    
    DateRange -->|Specify| CustomRange[Enter Date Range<br/>- Start Date<br/>- End Date<br/>- Filter Data]
    DateRange -->|Default| DefaultRange[Use Default Range<br/>- Current Semester<br/>- Academic Year]
    
    CustomRange --> Compile[Compile Report Data<br/>- Query Database<br/>- Apply Filters<br/>- Calculate Metrics]
    
    DefaultRange --> Compile
    
    Compile --> Validate[Validate Data<br/>- Cross-Reference<br/>- Check Consistency<br/>- Verify Totals]
    
    Validate --> ValidOK{Data<br/>Valid?}
    
    ValidOK -->|Issues| DataIssue[Flag Data Issues<br/>- Log Discrepancies<br/>- Alert Admin<br/>- Request Review]
    
    DataIssue --> Compile
    
    ValidOK -->|Valid| Format{Report<br/>Format?}
    
    Format -->|PDF| PDF3[Export to PDF<br/>- Official Document<br/>- Signed/Sealed<br/>- Archive Copy]
    
    Format -->|Excel| Excel[Export to Excel<br/>- Data Analysis<br/>- Further Processing<br/>- Pivot Tables]
    
    Format -->|Summary| Summary[Generate Summary<br/>- Key Metrics<br/>- Dashboard View<br/>- Highlights]
    
    PDF3 --> Store[(Store Report<br/>- Archive System<br/>- Compliance Records<br/>- Audit Trail)]
    
    Excel --> Store
    Summary --> Store
    
    Store --> Notify[Send Notifications<br/>- Admin Review<br/>- Executive Summary<br/>- Alert if Issues]
    
    Notify --> RegReturn[Return to Registrar<br/>Dashboard]
    
    style Registrar fill:#90EE90
    style RegReturn fill:#90EE90
```

---

## Key IBP Process Characteristics

### Integration Points
1. **Authentication Hub**: All users authenticate through centralized system
2. **Grade Lifecycle**: Clear progression from submission → validation → verification → access
3. **Audit Trail**: Every action recorded across all subsystems
4. **Data Consistency**: Single source of truth in Firestore
5. **Notification System**: Automated alerts across all stakeholders

### Business Rules Enforced
- Faculty can only submit grades for their own courses
- Registrar can only verify grades (cannot edit)
- Students can only view their own grades
- All corrections tracked with full audit trail
- Compliance validations at each stage

### Performance Considerations
- Asynchronous processing for report generation
- Real-time status updates for grade verification
- Batch processing for large report generation
- Cache management for frequently accessed reports

### Security Measures
- Role-based access control (RBAC)
- End-to-end encryption for sensitive data
- Complete audit trail for compliance
- JWT token-based authentication
- Firebase security rules enforcement

---

## Process Metrics & KPIs

| Metric | Target | Description |
|--------|--------|-------------|
| **Grade Submission Time** | < 5 min | Time to submit a grade from input |
| **Validation Processing** | < 2 sec | Real-time validation response |
| **Verification Turnaround** | 24-48 hrs | Time to verify submitted grades |
| **Report Generation** | < 30 sec | Generate reports on demand |
| **System Availability** | 99.5% | Uptime requirement |
| **Data Accuracy** | 99.9% | Error rate in grade processing |

---

## Document Links
- [Architecture Overview](ARCHITECTURE.md)
- [Implementation Guide](IMPLEMENTATION_GUIDE.md)
- [Grades Subsystem Documentation](GRADES_SUBSYSTEM_DOCUMENTATION.md)
- [Firebase Integration](FIREBASE_INTEGRATION.md)
- [Error Handling Specs](ERROR_HANDLING_SPECS.md)
