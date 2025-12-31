# Test Data Files

This directory contains sample data files for testing the import functionality.

## Files

### sample-import-valid.csv
- 10 rows of valid data
- All required fields filled correctly
- Should import without errors
- Use this to test successful imports

### sample-import-errors.csv
- 8 rows with various validation errors
- Tests error detection and reporting
- Includes:
  - Missing required fields (First Name, Last Name, Email)
  - Invalid email formats
  - Invalid data types (text in number field)
  - Invalid dates
  - Invalid dropdown options
  - Invalid boolean values
  - Out of range values

## How to Use

1. **Create a test form** with these fields:
   - First Name (Text, required)
   - Last Name (Text, required)
   - Email (Email, required)
   - Phone (Text, optional)
   - Age (Number, optional)
   - Department (Dropdown: Sales, Marketing, Engineering, HR)
   - Active (Checkbox)
   - Start Date (Date)

2. **Navigate to data collection page:**
   ```
   /org/{your-org-id}/data-collection
   ```

3. **Click the Upload button** to open import dialog

4. **Upload sample-import-valid.csv first** to test successful import flow

5. **Upload sample-import-errors.csv** to test error handling

## Creating Custom Test Data

### Quick Excel Formula Method

Open Excel and use these formulas to generate test data:

**Column A (First Name):**
```
="User" & ROW()
```

**Column B (Last Name):**
```
="Last" & ROW()
```

**Column C (Email):**
```
="user" & ROW() & "@test.com"
```

**Column D (Phone):**
```
="+123456" & TEXT(7000+ROW(),"0000")
```

**Column E (Age):**
```
=RANDBETWEEN(22,65)
```

**Column F (Department):**
```
=CHOOSE(MOD(ROW(),4)+1,"Sales","Marketing","Engineering","HR")
```

**Column G (Active):**
```
=IF(MOD(ROW(),2)=0,"TRUE","FALSE")
```

**Column H (Start Date):**
```
=TEXT(DATE(2024,RANDBETWEEN(1,12),RANDBETWEEN(1,28)),"yyyy-mm-dd")
```

Then drag down for as many rows as you need!

## Performance Testing

For large file testing, create files with:
- **Small:** 10-50 rows
- **Medium:** 100-500 rows
- **Large:** 1,000-5,000 rows
- **Extra Large:** 10,000+ rows (check system limits)

## Validation Test Cases

| Test Case | Expected Result |
|-----------|----------------|
| Empty required field | Error: "Field is required" |
| Invalid email | Error: "Invalid email format" |
| Text in number field | Error: "Must be a valid number" |
| Invalid date format | Error: "Invalid date format" |
| Invalid dropdown option | Error: "Invalid option" |
| Negative age (if min set) | Error: "Must be positive" |
| Future date (if restricted) | Error: "Date cannot be in future" |
| Duplicate email (if unique) | Error: "Email already exists" |
| Missing optional field | No error (should import) |

## Tips

1. **Always test with valid data first** to ensure the happy path works
2. **Test one error type at a time** to verify specific validations
3. **Mix valid and invalid rows** to test partial import functionality
4. **Use realistic data** for production-like testing
5. **Test with special characters** in text fields (é, ñ, 中文, etc.)
6. **Test boundary values** (min/max ages, very long text, etc.)

## Common Data Patterns to Test

### Email Variations
```
john@example.com          ✅ Valid
john.doe@example.com      ✅ Valid
john+tag@example.com      ✅ Valid
john@sub.example.com      ✅ Valid
invalid-email             ❌ Invalid
@example.com              ❌ Invalid
john@                     ❌ Invalid
```

### Date Formats
```
2024-01-15                ✅ Valid (ISO format)
01/15/2024                ⚠️ Check parser
15-01-2024                ⚠️ Check parser
January 15, 2024          ⚠️ Check parser
invalid-date              ❌ Invalid
2024-13-45                ❌ Invalid (bad month/day)
```

### Boolean Values
```
TRUE, true, True          ✅ Valid
FALSE, false, False       ✅ Valid
YES, yes, Y               ⚠️ Check parser
NO, no, N                 ⚠️ Check parser
1, 0                      ⚠️ Check parser
random-text               ❌ Invalid
```

## Cleanup

After testing, you may want to:
1. Delete test submissions from the database
2. Clear the import temp bucket in Appwrite Storage
3. Reset form submission counters (if applicable)
