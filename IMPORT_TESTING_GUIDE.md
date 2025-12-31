# Form Data Import Testing Guide

## Overview
The import feature allows bulk upload of data to forms via Excel/CSV files. It includes:
- File upload (Excel .xlsx or CSV)
- Automatic column mapping
- Data validation
- Error reporting
- Bulk import with progress tracking

## Prerequisites

### 1. Create a Test Form
Before testing imports, you need an active form with fields:

1. Navigate to: `/org/{orgId}/forms/create`
2. Create a form with these fields:
   - **First Name** (Text, required)
   - **Last Name** (Text, required)
   - **Email** (Email, required)
   - **Phone** (Text, optional)
   - **Age** (Number, optional)
   - **Department** (Dropdown: Sales, Marketing, Engineering, HR)
   - **Active** (Checkbox)
   - **Start Date** (Date)

3. Publish the form

### 2. Prepare Test Data

Create an Excel file or CSV with sample data:

**Sample Excel/CSV Format:**

| First Name | Last Name | Email | Phone | Age | Department | Active | Start Date |
|------------|-----------|-------|-------|-----|------------|--------|------------|
| John | Doe | john.doe@example.com | +1234567890 | 30 | Engineering | TRUE | 2024-01-15 |
| Jane | Smith | jane.smith@example.com | +1234567891 | 28 | Marketing | TRUE | 2024-01-20 |
| Bob | Johnson | bob.j@example.com | +1234567892 | 35 | Sales | FALSE | 2024-02-01 |
| Alice | Williams | alice.w@example.com | +1234567893 | 32 | HR | TRUE | 2024-02-10 |
| Charlie | Brown | charlie.b@example.com | +1234567894 | 29 | Engineering | TRUE | 2024-03-01 |

**Save as:** `test-import.xlsx` or `test-import.csv`

### 3. Test Files to Create

#### Valid Data File (test-import-valid.xlsx)
- All required fields filled
- Valid data types
- Should import successfully

#### Invalid Data File (test-import-errors.xlsx)
Include rows with errors to test validation:

| First Name | Last Name | Email | Phone | Age | Department | Active | Start Date |
|------------|-----------|-------|-------|-----|------------|--------|------------|
| John | Doe | john.doe@example.com | +1234567890 | 30 | Engineering | TRUE | 2024-01-15 |
| | Smith | invalid-email | +1234567891 | 28 | Marketing | TRUE | 2024-01-20 |
| Bob | | bob@test.com | +1234567892 | abc | Sales | FALSE | invalid-date |
| Alice | Williams | alice@test.com | | -5 | InvalidDept | TRUE | 2024-02-10 |

#### Large File (test-import-large.xlsx)
- 100+ rows to test performance
- Mix of valid and invalid data

## Step-by-Step Testing

### Step 1: Access Import Dialog

1. Navigate to: `/org/{orgId}/data-collection`
2. Click the **"Upload"** button with upload icon
3. Import dialog should open

**✅ Expected:** Dialog appears with "Upload File" step

### Step 2: Upload File

1. Click the file upload area or drag & drop
2. Select `test-import-valid.xlsx`
3. File should upload automatically

**✅ Expected:**
- Upload progress indicator
- Success toast: "File parsed successfully"
- Dialog moves to "Column Mapping" step
- Preview of first 5 rows displayed
- Detected columns shown

**❌ Common Issues:**
- **"File size must be under 10MB"** - File too large
- **"Only Excel and CSV files are allowed"** - Wrong file type
- **"Failed to upload file"** - Check Appwrite Storage bucket permissions

### Step 3: Column Mapping

The system auto-maps columns based on field names.

1. Review auto-mapped columns
2. Adjust mappings if needed using dropdowns
3. Unmapped columns are marked in yellow
4. Click **"Validate Data"**

**✅ Expected:**
- Auto-mapping suggestions shown
- Form fields listed in dropdowns
- Mapping state persists
- Validation button enabled when required fields are mapped

**Manual Mapping Test:**
- Change a mapping: Select different form field from dropdown
- Leave a column unmapped (optional field)
- Try mapping multiple columns to same field (should warn)

### Step 4: Data Validation

After clicking "Validate Data":

1. System validates each row against form rules
2. Progress indicator shows validation status
3. Results summary displayed

**✅ Expected (Valid File):**
- Green success message
- Summary: "X rows valid, 0 errors"
- Preview shows validated rows
- **"Import Data"** button enabled

**✅ Expected (Invalid File):**
- Yellow/Red warning message
- Summary: "X rows valid, Y rows with errors"
- Error rows highlighted in red
- Expandable error details
- Option to:
  - Download error report
  - Import only valid rows
  - Go back to fix mapping

**Validation Test Scenarios:**

| Scenario | Expected Result |
|----------|----------------|
| Missing required field | "Field 'First Name' is required" |
| Invalid email format | "Invalid email format" |
| Invalid number | "Must be a valid number" |
| Invalid date | "Invalid date format" |
| Invalid dropdown option | "Invalid option for Department" |
| Negative number in age | "Must be positive" (if validation set) |

### Step 5: Import Execution

1. Click **"Import Data"** (or "Import Valid Rows Only")
2. Confirm the import
3. Progress bar shows import status

**✅ Expected:**
- Progress updates in real-time
- Success toast: "Successfully imported X rows"
- Results summary:
  - Total rows: X
  - Successful: Y
  - Failed: Z (if any)
- Dialog moves to "Results" step

**Post-Import Verification:**
1. Close dialog
2. Data collection table should refresh
3. Imported rows visible in table
4. Row count updated
5. Can view/edit imported submissions

### Step 6: Error Handling

**Download Error Report:**
1. After validation with errors, click "Download Error Report"
2. Excel file downloads with:
   - Original data
   - Error column showing issues
   - Row numbers

**✅ Expected:**
- File downloads successfully
- Errors clearly marked
- Can fix and re-upload

## Testing Checklist

### File Upload Tests
- [ ] Upload valid Excel file (.xlsx)
- [ ] Upload valid CSV file (.csv)
- [ ] Upload file > 10MB (should reject)
- [ ] Upload non-Excel/CSV file (should reject)
- [ ] Upload corrupted file (should show error)
- [ ] Cancel upload mid-process

### Column Mapping Tests
- [ ] Auto-mapping works for exact matches
- [ ] Auto-mapping suggests similar names
- [ ] Can manually change mappings
- [ ] Can leave optional fields unmapped
- [ ] Required fields must be mapped
- [ ] Validation button disabled until required fields mapped

### Data Validation Tests
- [ ] All valid data passes validation
- [ ] Missing required fields caught
- [ ] Invalid data types caught (text in number field)
- [ ] Invalid email format caught
- [ ] Invalid date format caught
- [ ] Invalid dropdown options caught
- [ ] Can download error report
- [ ] Error report contains correct errors

### Import Execution Tests
- [ ] Small file (5 rows) imports successfully
- [ ] Medium file (50 rows) imports successfully
- [ ] Large file (100+ rows) imports successfully
- [ ] Progress bar updates during import
- [ ] Can import only valid rows (skip errors)
- [ ] Duplicate detection (if implemented)
- [ ] Form quota limits enforced (if applicable)

### Error Recovery Tests
- [ ] Can go back from mapping to upload
- [ ] Can go back from validation to mapping
- [ ] Can close dialog and reopen (state resets)
- [ ] Can cancel import mid-process
- [ ] Network errors handled gracefully
- [ ] Session timeout handled

## Expected Performance

| File Size | Expected Time |
|-----------|---------------|
| 10 rows | < 2 seconds |
| 50 rows | < 5 seconds |
| 100 rows | < 10 seconds |
| 500 rows | < 30 seconds |
| 1000 rows | < 60 seconds |

## Common Issues & Solutions

### Issue: "Module not found: appwrite"
**Solution:** Install Appwrite Web SDK:
```bash
pnpm add appwrite
```

### Issue: "Failed to upload file"
**Solutions:**
- Check Appwrite Storage bucket exists
- Verify bucket permissions allow uploads
- Check IMPORT_TEMP_BUCKET_ID in env vars

### Issue: "Unauthorized access to this form"
**Solutions:**
- Verify user is logged in
- Check user belongs to correct organization
- Verify form belongs to user's organization

### Issue: "Form cannot accept submissions"
**Solutions:**
- Check form is published
- Check form is not archived
- Verify submission limits not reached

### Issue: Column mapping not working
**Solutions:**
- Ensure column headers in Excel match field labels
- Check for extra spaces in column names
- Verify field names are not duplicated

## Browser Testing

Test in multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader announces steps
- [ ] Error messages are accessible
- [ ] Focus management correct
- [ ] Color contrast sufficient

## Test Data Templates

Download these templates for testing:

### Valid Data Template
```csv
First Name,Last Name,Email,Phone,Age,Department,Active,Start Date
John,Doe,john@test.com,+1234567890,30,Engineering,TRUE,2024-01-15
Jane,Smith,jane@test.com,+1234567891,28,Marketing,TRUE,2024-01-20
```

### Error Testing Template
```csv
First Name,Last Name,Email,Phone,Age,Department,Active,Start Date
John,Doe,john@test.com,+1234567890,30,Engineering,TRUE,2024-01-15
,Smith,invalid-email,+1234567891,abc,Marketing,TRUE,invalid-date
Bob,,bob@test.com,,-5,InvalidDept,FALSE,2024-02-01
```

### Large File Template
Use Excel formula to generate test data:
- Column A: `="User" & ROW()`
- Column B: `="Last" & ROW()`
- Column C: `="user" & ROW() & "@test.com"`
- Etc.

## Next Steps

After successful testing:
1. Test with production-like data volumes
2. Test concurrent imports (multiple users)
3. Verify database performance
4. Check audit logs
5. Test export functionality with imported data

## Support

If you encounter issues:
1. Check browser console for errors
2. Check network tab for failed requests
3. Verify environment variables
4. Check Appwrite logs
5. Review error messages carefully
