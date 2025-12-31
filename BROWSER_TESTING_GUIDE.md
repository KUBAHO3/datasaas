# DataSaaS - Comprehensive Browser Testing Guide

## 🎯 Testing Overview

This guide provides step-by-step instructions for testing all features in the browser with different user roles and scenarios.

---

## 📋 Testing Checklist

- [ ] Company Registration & Onboarding
- [ ] Superadmin Approval Workflow
- [ ] Team Member Invitations
- [ ] Role-Based Access Control (Owner, Admin, Editor, Viewer)
- [ ] Form Builder & All Field Types
- [ ] Form Security & Access Control
- [ ] Public Form Submissions
- [ ] Data Collection & Management
- [ ] Data Import (Excel/CSV)
- [ ] Data Export (Excel, CSV, JSON, PDF)
- [ ] Analytics Dashboard
- [ ] Cross-Company Isolation
- [ ] Session Management

---

## 🚀 Testing Setup

### Prerequisites

1. **Appwrite Setup Complete**:
   - Import-temp storage bucket created
   - ImportJobs collection created
   - Environment variables added to `.env`

2. **Dev Server Running**:
```bash
npm run dev
```

3. **Browser Tools**:
   - Open Browser DevTools (F12)
   - Network tab for API calls
   - Console for errors
   - Use Incognito/Private windows for different users

4. **Test Data Files** (create these):
   - Sample Excel file for import
   - Sample images for logo upload
   - Sample documents (PDF) for company registration

---

## 📝 Test Scenario 1: Company Registration & Onboarding

### Step 1.1: Create Superadmin User (First)

**Action**: Create the first superadmin account

1. Go to `/auth/sign-up`
2. Fill in superadmin details:
```json
{
  "name": "Super Admin",
  "email": "admin@datasaas.com",
  "password": "Admin@123456"
}
```
3. Click "Sign Up"
4. ✅ Verify: Redirected to superadmin dashboard
5. ✅ Verify: Can see "Companies" and "Users" sections

**Note**: The first user is automatically a superadmin. Log out for next test.

---

### Step 1.2: Company Owner Registration

**Action**: Register a new company (TechCorp)

1. Go to `/auth/sign-up` (in new incognito window)
2. Create account:
```json
{
  "name": "John Doe",
  "email": "john@techcorp.com",
  "password": "John@123456"
}
```

3. **Step 2 - Company Basic Info**:
```json
{
  "companyName": "TechCorp Solutions",
  "industry": "Technology",
  "size": "11-50",
  "website": "https://techcorp.com",
  "phone": "+1-555-0100",
  "email": "info@techcorp.com",
  "description": "A leading technology solutions provider"
}
```

4. **Step 3 - Company Address**:
```json
{
  "street": "123 Tech Street",
  "city": "San Francisco",
  "state": "California",
  "country": "United States",
  "zipCode": "94102"
}
```

5. **Step 4 - Branding**:
```json
{
  "taxId": "12-3456789"
}
```
- Upload company logo (PNG/JPG)

6. **Step 5 - Documents**:
- Upload Business Registration (PDF)
- Upload Tax Document (PDF)
- Upload Proof of Address (PDF)
- Upload Certifications (optional)

7. **Step 6 - Review**:
- Review all information
- Submit for approval

8. ✅ Verify: Redirected to "Pending Approval" page
9. ✅ Verify: Cannot access dashboard yet

---

### Step 1.3: Second Company Registration (DataHub)

Repeat Step 1.2 with different data:

**Account**:
```json
{
  "name": "Sarah Johnson",
  "email": "sarah@datahub.io",
  "password": "Sarah@123456"
}
```

**Company**:
```json
{
  "companyName": "DataHub Analytics",
  "industry": "Data Analytics",
  "size": "51-200",
  "website": "https://datahub.io",
  "phone": "+1-555-0200",
  "email": "info@datahub.io"
}
```

---

## 📝 Test Scenario 2: Superadmin Approval Workflow

### Step 2.1: Login as Superadmin

1. Go to `/auth/sign-in`
2. Login:
```json
{
  "email": "admin@datasaas.com",
  "password": "Admin@123456"
}
```

3. ✅ Verify: See superadmin dashboard
4. ✅ Verify: See "2 Pending" applications badge

### Step 2.2: Review Pending Applications

1. Click "Companies" in sidebar
2. ✅ Verify: See both TechCorp and DataHub in "Pending" tab
3. Click "View" on TechCorp application
4. ✅ Verify: All company details visible
5. ✅ Verify: Uploaded documents are downloadable

### Step 2.3: Approve TechCorp

1. Click "Approve" button on TechCorp
2. ✅ Verify: Success toast appears
3. ✅ Verify: TechCorp moves to "Active" tab
4. ✅ Verify: Approval email sent (check email or logs)
5. ✅ Verify: Appwrite team created for TechCorp

### Step 2.4: Reject DataHub

1. Click "Reject" button on DataHub
2. Enter rejection reason:
```
Missing required certification documents. Please upload ISO certifications and resubmit.
```
3. ✅ Verify: Success toast appears
4. ✅ Verify: DataHub moves to "Rejected" tab
5. ✅ Verify: Rejection email sent with reason

### Step 2.5: Test Resubmission

1. Login as Sarah (DataHub owner)
2. ✅ Verify: See rejection message with reason
3. Click "Resubmit Application"
4. Upload additional documents
5. Submit again
6. ✅ Verify: Status back to "Pending"

**Approve DataHub** (as superadmin) for next tests

---

## 📝 Test Scenario 3: Team Member Invitations

### Step 3.1: Login as TechCorp Owner

1. Login as john@techcorp.com
2. Go to "Users" page
3. ✅ Verify: See only yourself in Active Members

### Step 3.2: Invite Admin User

1. Click "Invite Member" button
2. Fill in details:
```json
{
  "email": "alice@techcorp.com",
  "role": "admin",
  "name": "Alice Smith",
  "jobTitle": "Operations Manager"
}
```
3. Send invitation
4. ✅ Verify: Invitation email sent
5. ✅ Verify: Alice appears in "Pending Invitations" table

### Step 3.3: Invite Editor User

Repeat with:
```json
{
  "email": "bob@techcorp.com",
  "role": "editor",
  "name": "Bob Williams",
  "jobTitle": "Data Analyst"
}
```

### Step 3.4: Invite Viewer User

Repeat with:
```json
{
  "email": "charlie@techcorp.com",
  "role": "viewer",
  "name": "Charlie Brown",
  "jobTitle": "Intern"
}
```

### Step 3.5: Accept Invitation (Alice - Admin)

1. **Get invitation link** from email or database
2. Open in new incognito window
3. Create account:
```json
{
  "email": "alice@techcorp.com",
  "password": "Alice@123456",
  "name": "Alice Smith"
}
```
4. ✅ Verify: Automatically joined TechCorp
5. ✅ Verify: Role is "admin"
6. ✅ Verify: Can access TechCorp dashboard

**Repeat for Bob and Charlie**

---

## 📝 Test Scenario 4: Role-Based Access Control (RBAC)

### Step 4.1: Owner Permissions (John)

**Login as**: john@techcorp.com

**Can Do**:
- [ ] Create forms
- [ ] Edit forms
- [ ] Publish forms
- [ ] Delete forms
- [ ] View all submissions
- [ ] Edit submissions
- [ ] Delete submissions
- [ ] Import data
- [ ] Export data
- [ ] Invite team members
- [ ] Change member roles
- [ ] Remove team members
- [ ] Suspend team members
- [ ] Access analytics
- [ ] Manage company settings

**Test**: Try all actions above ✅

---

### Step 4.2: Admin Permissions (Alice)

**Login as**: alice@techcorp.com

**Can Do**:
- [ ] Create forms
- [ ] Edit forms
- [ ] Publish forms
- [ ] Delete forms
- [ ] View all submissions
- [ ] Edit submissions
- [ ] Delete submissions
- [ ] Import data
- [ ] Export data
- [ ] Invite team members
- [ ] Change member roles (except owner)
- [ ] Access analytics

**Cannot Do**:
- [ ] ❌ Remove owner
- [ ] ❌ Change owner role
- [ ] ❌ Delete company

**Test**: Try all actions, verify restrictions work ✅

---

### Step 4.3: Editor Permissions (Bob)

**Login as**: bob@techcorp.com

**Can Do**:
- [ ] Create forms
- [ ] Edit own forms
- [ ] View all forms
- [ ] Create submissions
- [ ] Edit own submissions
- [ ] View all submissions
- [ ] Import data
- [ ] Export data
- [ ] Access analytics (read-only)

**Cannot Do**:
- [ ] ❌ Delete forms
- [ ] ❌ Delete submissions
- [ ] ❌ Invite team members
- [ ] ❌ Change roles
- [ ] ❌ Access team management

**Test**: Try all actions, verify restrictions work ✅

---

### Step 4.4: Viewer Permissions (Charlie)

**Login as**: charlie@techcorp.com

**Can Do**:
- [ ] View all forms
- [ ] View all submissions
- [ ] Export data
- [ ] Access analytics (read-only)

**Cannot Do**:
- [ ] ❌ Create forms
- [ ] ❌ Edit forms
- [ ] ❌ Delete forms
- [ ] ❌ Create submissions
- [ ] ❌ Edit submissions
- [ ] ❌ Delete submissions
- [ ] ❌ Import data
- [ ] ❌ Invite team members

**Test**: Try all actions, verify read-only access ✅

---

## 📝 Test Scenario 5: Form Builder & All Field Types

### Step 5.1: Create Comprehensive Test Form

**Login as**: john@techcorp.com (owner)

1. Go to "Forms" → "Create Form"
2. Form details:
```json
{
  "name": "Employee Onboarding Form",
  "description": "Comprehensive form testing all field types"
}
```

3. **Add All Field Types** (drag from sidebar):

**Text Fields**:
- Short Text: "Full Name" (required)
- Long Text: "About Yourself" (max 500 chars)
- Email: "Work Email" (required, email validation)
- Phone: "Phone Number" (phone format)
- URL: "LinkedIn Profile"

**Number Fields**:
- Number: "Years of Experience" (min: 0, max: 50)
- Currency: "Expected Salary" (min: 30000)

**Date Fields**:
- Date: "Start Date" (required)
- DateTime: "Interview Scheduled"
- Time: "Preferred Contact Time"

**Selection Fields**:
- Dropdown: "Department" (options: Engineering, Sales, Marketing, HR)
- Radio: "Employment Type" (options: Full-time, Part-time, Contract)
- Checkbox: "Agree to Terms" (required)
- Multi-select: "Skills" (options: JavaScript, Python, Java, React, Node.js)

**File Fields**:
- File Upload: "Resume" (PDF only, max 5MB)
- Image Upload: "Profile Photo" (JPG/PNG, max 2MB)

**Rating Fields**:
- Rating: "Rate our hiring process" (1-5 stars)
- Scale: "Technical proficiency" (1-10)

**Other**:
- Section Header: "Personal Information"
- Section Header: "Professional Details"
- Divider (between sections)

4. ✅ Verify: All fields added successfully

---

### Step 5.2: Configure Field Validation

1. **Full Name** field:
   - Required: Yes
   - Min length: 2
   - Max length: 100

2. **Work Email** field:
   - Required: Yes
   - Email format validation

3. **Years of Experience**:
   - Min value: 0
   - Max value: 50

4. **Expected Salary**:
   - Min value: 30000
   - Max value: 500000

5. ✅ Verify: Validation rules saved

---

### Step 5.3: Configure Conditional Logic

1. Add conditional rule:
   - **IF** "Employment Type" = "Contract"
   - **THEN** show "Contract Duration" field (new number field)

2. ✅ Verify: Conditional logic works in preview

---

### Step 5.4: Customize Theme

1. Go to "Theme" tab
2. Configure:
```json
{
  "primaryColor": "#3B82F6",
  "backgroundColor": "#FFFFFF",
  "fontFamily": "Inter",
  "buttonStyle": "rounded",
  "fontSize": "medium"
}
```

3. ✅ Verify: Theme applied in preview

---

### Step 5.5: Configure Form Settings

1. Go to "Settings" tab
2. Configure:
```json
{
  "isPublic": true,
  "allowAnonymous": true,
  "requireLogin": false,
  "allowEdit": true,
  "allowMultipleSubmissions": true,
  "maxSubmissions": 100,
  "expiresAt": "2025-12-31T23:59:59Z",
  "notifications": {
    "enabled": true,
    "email": "john@techcorp.com"
  },
  "autoSave": true,
  "showProgressBar": true,
  "submitButtonText": "Submit Application"
}
```

3. ✅ Verify: Settings saved

---

### Step 5.6: Publish Form

1. Click "Preview" → verify all fields display correctly
2. Click "Publish"
3. ✅ Verify: Form status changes to "Published"
4. ✅ Verify: Public form URL available
5. Copy public form URL for next test

---

## 📝 Test Scenario 6: Form Security & Access Control

### Step 6.1: Create Private Form

1. Create new form: "Internal HR Survey"
2. Go to "Settings" tab
3. Configure:
```json
{
  "isPublic": false,
  "requireLogin": true,
  "allowAnonymous": false,
  "visibility": "internal"
}
```

4. Publish form
5. ✅ Verify: Form requires login to access

### Step 6.2: Password-Protected Form

1. Create new form: "Confidential Feedback"
2. Configure:
```json
{
  "isPublic": true,
  "password": "Secret@123",
  "allowAnonymous": true
}
```

3. Publish form
4. Open public URL (incognito)
5. ✅ Verify: Password prompt appears
6. Enter correct password
7. ✅ Verify: Form loads
8. Try wrong password
9. ✅ Verify: Error message shows

### Step 6.3: Domain-Restricted Form

1. Create new form: "Partner Survey"
2. Configure:
```json
{
  "isPublic": true,
  "allowedDomains": ["techcorp.com", "partner.com"],
  "requireLogin": true
}
```

3. Publish form
4. ✅ Verify: Only emails from allowed domains can submit

### Step 6.4: Form with Expiry Date

1. Create form: "Limited Time Survey"
2. Configure:
```json
{
  "expiresAt": "2025-12-31T23:59:59Z",
  "isPublic": true
}
```

3. ✅ Verify: Form shows expiry date
4. (Optional) Set past date and verify form shows "Expired" message

### Step 6.5: Max Submissions Limit

1. Create form: "Beta Tester Application"
2. Configure:
```json
{
  "maxSubmissions": 3,
  "isPublic": true
}
```

3. Submit form 3 times
4. ✅ Verify: 4th submission blocked with "Max limit reached" message

---

## 📝 Test Scenario 7: Public Form Submissions

### Step 7.1: Anonymous Submission

1. Open "Employee Onboarding Form" public URL (incognito window)
2. Fill in all fields:
```json
{
  "fullName": "Test User 1",
  "aboutYourself": "I am a software engineer with 5 years of experience...",
  "workEmail": "test1@example.com",
  "phoneNumber": "+1-555-0123",
  "linkedInProfile": "https://linkedin.com/in/testuser1",
  "yearsOfExperience": 5,
  "expectedSalary": 85000,
  "startDate": "2025-02-01",
  "department": "Engineering",
  "employmentType": "Full-time",
  "agreeToTerms": true,
  "skills": ["JavaScript", "React", "Node.js"],
  "rating": 5,
  "technicalProficiency": 8
}
```

3. Upload resume (PDF)
4. Upload profile photo (JPG)
5. Click "Submit Application"
6. ✅ Verify: Success message appears
7. ✅ Verify: Submission ID shown

### Step 7.2: Authenticated Submission

1. Login as charlie@techcorp.com (viewer)
2. Navigate to form via internal link
3. Fill in form
4. Submit
5. ✅ Verify: Submission linked to Charlie's account

### Step 7.3: Test Conditional Logic

1. Open form
2. Select "Contract" for Employment Type
3. ✅ Verify: "Contract Duration" field appears
4. Change to "Full-time"
5. ✅ Verify: "Contract Duration" field disappears

### Step 7.4: Test Field Validation

1. Try to submit without required fields
2. ✅ Verify: Validation errors show
3. Enter invalid email format
4. ✅ Verify: Email validation error
5. Enter number outside min/max range
6. ✅ Verify: Range validation error

### Step 7.5: Test Auto-Save (Draft)

1. Fill in half the form
2. ✅ Verify: Draft saved automatically
3. Close browser
4. Reopen form (same session)
5. ✅ Verify: Draft data restored

### Step 7.6: Create Multiple Test Submissions

Create 10-15 submissions with varied data for testing data collection features.

---

## 📝 Test Scenario 8: Data Collection & Management

### Step 8.1: View Submissions

**Login as**: john@techcorp.com

1. Go to "Data Collection"
2. Select "Employee Onboarding Form"
3. ✅ Verify: All submissions visible in table
4. ✅ Verify: Stats show correct counts (Total, Completed, Draft)

### Step 8.2: Test Table Features

1. **Sorting**:
   - Click on "Submitted At" column
   - ✅ Verify: Sorts ascending/descending

2. **Filtering**:
   - Click "Show Filters"
   - Filter by date range
   - ✅ Verify: Results filtered correctly
   - Filter by status (Completed)
   - ✅ Verify: Only completed submissions show

3. **Search**:
   - Search for "test1@example.com"
   - ✅ Verify: Matching submission shows

4. **Pagination**:
   - ✅ Verify: Pagination controls work
   - Change items per page
   - ✅ Verify: Updates correctly

### Step 8.3: View Submission Details

1. Click "View" on a submission
2. ✅ Verify: All field values display correctly
3. ✅ Verify: File downloads work (Resume, Photo)
4. ✅ Verify: Submitter information shows
5. ✅ Verify: Timestamp information correct

### Step 8.4: Edit Submission

1. Click "Edit" on a submission
2. Modify some fields
3. Save changes
4. ✅ Verify: Changes saved successfully
5. ✅ Verify: Updated timestamp reflects change

### Step 8.5: Delete Submission

1. Click "Delete" on a submission
2. Confirm deletion
3. ✅ Verify: Submission removed from list
4. ✅ Verify: Stats updated

### Step 8.6: Bulk Delete

1. Select multiple submissions (checkboxes)
2. Click "Delete (X)" button
3. Confirm
4. ✅ Verify: All selected submissions deleted

### Step 8.7: Switch View Modes

1. Click "Cards" view toggle
2. ✅ Verify: Card view displays correctly
3. ✅ Verify: All actions work in card view
4. Switch back to "Table" view

---

## 📝 Test Scenario 9: Data Import (Excel/CSV)

### Step 9.1: Prepare Test Import File

Create `test-import.xlsx` with matching columns:

| Full Name | Work Email | Phone Number | Years of Experience | Expected Salary | Start Date | Department | Employment Type | Agree to Terms | Skills |
|-----------|------------|--------------|---------------------|-----------------|------------|------------|-----------------|----------------|--------|
| Import User 1 | import1@example.com | +1-555-1001 | 3 | 70000 | 2025-03-01 | Engineering | Full-time | true | JavaScript,React |
| Import User 2 | import2@example.com | +1-555-1002 | 5 | 85000 | 2025-03-15 | Marketing | Full-time | true | Python |
| Import User 3 | import3@example.com | +1-555-1003 | 2 | 60000 | 2025-04-01 | Sales | Part-time | true | Java |
| Invalid User | invalid-email | abc | 999 | -1000 | not-a-date | Unknown | Maybe | no | None |

### Step 9.2: Upload and Parse File

1. Click "Import" button
2. Upload `test-import.xlsx`
3. ✅ Verify: File parses successfully
4. ✅ Verify: Shows "4 rows detected"
5. ✅ Verify: Preview shows first 5 rows

### Step 9.3: Auto-Mapping

1. ✅ Verify: Columns auto-mapped to correct fields
2. ✅ Verify: Confidence levels shown (High/Medium/Low)
3. ✅ Verify: "Full Name" → "Full Name" (high confidence)
4. ✅ Verify: "Work Email" → "Work Email" (high confidence)

### Step 9.4: Manual Mapping Adjustment

1. Find any low-confidence mapping
2. Manually select correct field from dropdown
3. ✅ Verify: Mapping updated

### Step 9.5: Validate Data

1. Click "Validate Data"
2. Wait for validation
3. ✅ Verify: Shows "3 valid rows, 1 invalid row"
4. ✅ Verify: Validation errors shown:
   - Row 4: Invalid email format
   - Row 4: Invalid number (999 > max)
   - Row 4: Invalid date format
   - Row 4: Invalid department option

### Step 9.6: Review Validation Results

1. ✅ Verify: Error details clearly displayed
2. ✅ Verify: Suggestions provided where applicable
3. ✅ Verify: Warnings shown (if any)

### Step 9.7: Execute Import

1. Click "Import 3 Valid Rows"
2. ✅ Verify: Progress bar appears
3. ✅ Verify: Progress updates (e.g., "Processing 1/3...")
4. Wait for completion
5. ✅ Verify: Success message: "Successfully imported 3 of 4 rows"

### Step 9.8: Download Error Report

1. Click "Download Error Report"
2. ✅ Verify: CSV file downloads
3. Open error report
4. ✅ Verify: Contains:
   - Row Number: 4
   - Field Name: Work Email
   - Error Message: Must be a valid email address
   - Suggestion: Format: user@example.com
5. ✅ Verify: All errors for row 4 listed

### Step 9.9: Verify Imported Data

1. Go back to Data Collection
2. ✅ Verify: 3 new submissions visible
3. ✅ Verify: Data matches import file
4. ✅ Verify: Form stats updated (+3 submissions)

### Step 9.10: Test Import Edge Cases

**Empty File**:
1. Create empty CSV
2. Try to import
3. ✅ Verify: Error "File is empty"

**File Too Large**:
1. Create >10MB file
2. Try to import
3. ✅ Verify: Error "File size must be under 10MB"

**Wrong File Type**:
1. Try to upload .txt file
2. ✅ Verify: Error "Only Excel and CSV files supported"

**Duplicate Column Names**:
1. Create CSV with duplicate column "Name, Name, Email"
2. ✅ Verify: Error "Duplicate column names found"

---

## 📝 Test Scenario 10: Data Export

### Step 10.1: Export as Excel

1. Go to Data Collection
2. Click "Export" button
3. Select format: "Excel"
4. Select fields: All fields
5. Include metadata: Yes
6. Click "Export"
7. ✅ Verify: XLSX file downloads
8. Open file
9. ✅ Verify: All submissions present
10. ✅ Verify: All columns included
11. ✅ Verify: Data is correct

### Step 10.2: Export as CSV

1. Repeat export process
2. Select format: "CSV"
3. ✅ Verify: CSV downloads and opens correctly
4. ✅ Verify: Special characters handled (commas, quotes)

### Step 10.3: Export as JSON

1. Select format: "JSON"
2. Export
3. ✅ Verify: Valid JSON structure
4. ✅ Verify: All data present

### Step 10.4: Export as PDF

1. Select format: "PDF"
2. Export
3. ✅ Verify: PDF renders correctly
4. ✅ Verify: Formatted nicely

### Step 10.5: Export with Filters

1. Apply filters (date range, status)
2. Export
3. ✅ Verify: Only filtered submissions exported

### Step 10.6: Export Selected Fields Only

1. Deselect some fields
2. Export
3. ✅ Verify: Only selected fields in export

### Step 10.7: Export Selected Submissions

1. Select specific submissions (checkboxes)
2. Export
3. ✅ Verify: Only selected submissions exported

---

## 📝 Test Scenario 11: Analytics Dashboard

### Step 11.1: Company Dashboard

**Login as**: john@techcorp.com

1. Go to main dashboard
2. ✅ Verify: Stats cards show:
   - Total Forms
   - Total Submissions
   - Active Users
   - Recent Activity

3. ✅ Verify: Charts display:
   - Submissions over time (line chart)
   - Submissions by form (bar chart)

### Step 11.2: Form-Specific Analytics

1. Go to specific form
2. Click "Analytics" tab
3. ✅ Verify: Form-specific stats:
   - Total submissions
   - Completion rate
   - Average completion time
   - Drop-off rate

4. ✅ Verify: Field-specific analytics:
   - Most common answers for dropdowns
   - Average for number fields
   - Date distribution

### Step 11.3: Submission Charts

1. ✅ Verify: Submission trends chart (daily/weekly/monthly)
2. ✅ Verify: Status breakdown (completed vs draft)
3. ✅ Verify: Department distribution (from dropdown field)

---

## 📝 Test Scenario 12: Cross-Company Isolation

### Step 12.1: Create Data in TechCorp

**Login as**: john@techcorp.com

1. Create a form: "TechCorp Internal Survey"
2. Add submissions
3. Note form ID and submission IDs

### Step 12.2: Create Data in DataHub

**Login as**: sarah@datahub.io

1. Create a form: "DataHub Feedback"
2. Add submissions
3. Note form ID and submission IDs

### Step 12.3: Test Isolation (TechCorp User)

**Login as**: john@techcorp.com

1. Try to access DataHub form by direct URL:
   `/org/[datahub-company-id]/forms/[datahub-form-id]`
2. ✅ Verify: Access denied or 404
3. Try to access DataHub submission
4. ✅ Verify: Access denied
5. Check Data Collection
6. ✅ Verify: Only TechCorp submissions visible

### Step 12.4: Test Isolation (DataHub User)

**Login as**: sarah@datahub.io

1. Try to access TechCorp resources
2. ✅ Verify: Access denied
3. ✅ Verify: Only DataHub data visible

### Step 12.5: Test Isolation via API

1. Open Browser DevTools → Network tab
2. Find API calls to submission endpoints
3. Copy request, modify company ID to another company
4. Replay request
5. ✅ Verify: Access denied (401/403 error)

---

## 📝 Test Scenario 13: Team Management

### Step 13.1: Change Member Role

**Login as**: john@techcorp.com (owner)

1. Go to "Users"
2. Find Bob (editor)
3. Click "Change Role"
4. Change to "admin"
5. ✅ Verify: Role updated

**Login as**: bob@techcorp.com

6. ✅ Verify: Can now access team management
7. ✅ Verify: Can invite new members

### Step 13.2: Suspend Member

**Login as**: john@techcorp.com

1. Find Charlie (viewer)
2. Click "Suspend"
3. Enter reason: "Violation of company policy"
4. Confirm
5. ✅ Verify: Charlie suspended

**Login as**: charlie@techcorp.com

6. ✅ Verify: See "Account Suspended" message
7. ✅ Verify: Cannot access any pages

### Step 13.3: Unsuspend Member

**Login as**: john@techcorp.com

1. Find Charlie
2. Click "Unsuspend"
3. ✅ Verify: Charlie active again

**Login as**: charlie@techcorp.com

4. ✅ Verify: Can access dashboard again

### Step 13.4: Remove Member

**Login as**: john@techcorp.com

1. Create and invite a test user
2. After they join, remove them
3. ✅ Verify: User removed from team

**Login as**: removed user

4. ✅ Verify: No access to TechCorp resources

### Step 13.5: Test Owner Protection

**Login as**: alice@techcorp.com (admin)

1. Try to change John's (owner) role
2. ✅ Verify: Cannot change owner role
3. Try to remove John
4. ✅ Verify: Cannot remove owner
5. Try to suspend John
6. ✅ Verify: Cannot suspend owner

### Step 13.6: Resend Invitation

1. Invite new user
2. Don't have them accept yet
3. Click "Resend Invitation"
4. ✅ Verify: New invitation email sent

---

## 📝 Test Scenario 14: Session Management

### Step 14.1: Multiple Sessions

1. Login on Chrome: john@techcorp.com
2. Login on Firefox: john@techcorp.com
3. Go to Settings → Sessions (if available)
4. ✅ Verify: See both active sessions
5. ✅ Verify: Can see device/browser info

### Step 14.2: Logout from One Device

1. In Chrome, click "Logout"
2. ✅ Verify: Logged out in Chrome
3. Switch to Firefox
4. ✅ Verify: Still logged in Firefox

### Step 14.3: Logout All Sessions

1. In Firefox, click "Logout All Sessions"
2. ✅ Verify: Logged out in Firefox
3. Try to access protected page
4. ✅ Verify: Redirected to login

---

## 📝 Test Scenario 15: Security Testing

### Step 15.1: XSS Prevention

1. Create form field with malicious input:
```
<script>alert('XSS')</script>
```
2. Submit form
3. View submission
4. ✅ Verify: Script not executed, shown as text

### Step 15.2: SQL Injection Prevention

1. Try SQL injection in search:
```
'; DROP TABLE users; --
```
2. ✅ Verify: No error, no damage
3. ✅ Verify: Safely handled

### Step 15.3: CSRF Protection

1. Try to submit form from different origin
2. ✅ Verify: Request rejected
3. ✅ Verify: CSRF token required

### Step 15.4: File Upload Security

1. Try to upload executable (.exe, .sh)
2. ✅ Verify: Rejected
3. Try to upload very large file (>10MB)
4. ✅ Verify: Rejected
5. Upload valid PDF
6. ✅ Verify: Accepted and stored securely

---

## 🎯 Complete Testing Checklist

### Critical Features (Must Pass)
- [ ] Company registration and onboarding (6 steps)
- [ ] Superadmin approval workflow
- [ ] Team member invitations
- [ ] Role-based access control (all 4 roles)
- [ ] Form builder (all field types)
- [ ] Form security settings
- [ ] Public form submissions
- [ ] Data collection and management
- [ ] Data import (Excel/CSV)
- [ ] Data export (all formats)
- [ ] Cross-company isolation
- [ ] Multi-tenancy enforcement

### Important Features (Should Pass)
- [ ] Form conditional logic
- [ ] Form theme customization
- [ ] Analytics dashboard
- [ ] Team management (suspend, remove, role change)
- [ ] Session management
- [ ] File uploads
- [ ] Email notifications

### Security Features (Must Pass)
- [ ] XSS prevention
- [ ] SQL injection prevention
- [ ] CSRF protection
- [ ] File upload security
- [ ] Authentication required for protected routes
- [ ] Authorization checked on all actions
- [ ] No data leakage between companies

---

## 📊 Testing Summary Template

After completing all tests, fill in:

```markdown
## Test Results Summary

**Date**: [Date]
**Tester**: [Your Name]
**Browser**: [Chrome/Firefox/Safari] v[Version]
**Environment**: [Development/Production]

### Pass/Fail Summary
- Total Tests: [X]
- Passed: [X]
- Failed: [X]
- Blocked: [X]

### Critical Issues Found
1. [Description]
2. [Description]

### Minor Issues Found
1. [Description]
2. [Description]

### Recommendations
1. [Recommendation]
2. [Recommendation]
```

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Import button not showing | Verify Appwrite bucket and collection created |
| File upload fails | Check file size limits and bucket permissions |
| Cannot access form | Check form security settings and user role |
| Data not showing | Check companyId filtering and team membership |
| Export fails | Verify all field types supported |
| Email not sent | Check Resend API key and email configuration |

---

## ✅ Test Data Cleanup

After testing, clean up test data:

1. **Delete Test Companies**:
   - TechCorp Solutions
   - DataHub Analytics

2. **Delete Test Forms**:
   - All test forms created

3. **Delete Test Submissions**:
   - All import test data

4. **Delete Test Users**:
   - All invited test users

5. **Delete Test Files**:
   - Uploaded documents and images

---

Happy Testing! 🚀
