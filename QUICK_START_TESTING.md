# Quick Start Testing Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Complete Appwrite Setup (10-15 min)

**Create Storage Bucket**:
1. Open Appwrite Console → Storage
2. Create bucket: `import-temp`
3. Copy bucket ID
4. Settings:
   - Max file size: 10MB
   - Allowed extensions: xlsx, xls, csv
   - Permissions: team-based

**Create Collection**:
1. Appwrite Console → Databases → Your Database
2. Create collection: `ImportJobs`
3. Copy collection ID
4. Add 14 attributes (see [IMPORT_SETUP_GUIDE.md](IMPORT_SETUP_GUIDE.md) for details)
5. Add indexes: companyId, formId, status
6. Set permissions: team-based

**Update .env**:
```env
NEXT_PUBLIC_IMPORT_JOBS_TABLE_ID=your-collection-id-here
NEXT_PUBLIC_IMPORT_TEMP_BUCKET_ID=your-bucket-id-here
```

**Restart Server**:
```bash
npm run dev
```

---

### Step 2: Quick Test (5 min)

**Test 1: Register Superadmin**
1. Go to `http://localhost:3000/auth/sign-up`
2. Register:
   - Email: `admin@datasaas.com`
   - Password: `Admin@123456`
3. ✅ Should see superadmin dashboard

**Test 2: Register Company**
1. Open incognito window
2. Go to `http://localhost:3000/auth/sign-up`
3. Register:
   - Email: `john@techcorp.com`
   - Password: `John@123456`
4. Complete all 6 onboarding steps (use sample data from [test-users.json](test-data/test-users.json))
5. ✅ Should see "Pending Approval" page

**Test 3: Approve Company**
1. Login as superadmin
2. Go to Companies → Pending
3. Approve TechCorp
4. ✅ Should see in Active tab

**Test 4: Create Form & Import Data**
1. Login as john@techcorp.com
2. Create simple form with fields: Name, Email, Phone
3. Publish form
4. Go to Data Collection
5. Click "Import"
6. Upload [sample-import.csv](test-data/sample-import.csv)
7. Map columns
8. Validate
9. Import
10. ✅ Should see imported submissions

**If all tests pass**: Setup is complete! ✅

---

### Step 3: Full Testing (2-3 hours)

Follow the comprehensive guide in [BROWSER_TESTING_GUIDE.md](BROWSER_TESTING_GUIDE.md)

**Test all scenarios**:
- [ ] Company registration & onboarding
- [ ] Team member invitations (Owner, Admin, Editor, Viewer)
- [ ] Role-based access control
- [ ] Form builder (all 29 field types)
- [ ] Form security (password, domain restriction, expiry)
- [ ] Data collection & management
- [ ] Data import (Excel/CSV)
- [ ] Data export (Excel, CSV, JSON, PDF)
- [ ] Analytics dashboard
- [ ] Cross-company isolation

---

## 📁 Test Data Files

All test data is in the `test-data/` directory:

1. **[test-users.json](test-data/test-users.json)** - All user credentials and company info
2. **[sample-import.csv](test-data/sample-import.csv)** - Sample CSV for import testing

---

## 🎯 Test User Credentials

### Superadmin
- Email: `admin@datasaas.com`
- Password: `Admin@123456`

### TechCorp (Company 1)
- **Owner**: john@techcorp.com / John@123456
- **Admin**: alice@techcorp.com / Alice@123456
- **Editor**: bob@techcorp.com / Bob@123456
- **Viewer**: charlie@techcorp.com / Charlie@123456

### DataHub (Company 2)
- **Owner**: sarah@datahub.io / Sarah@123456
- **Admin**: david@datahub.io / David@123456
- **Editor**: emma@datahub.io / Emma@123456

---

## 🧪 Quick Test Checklist

### Critical Tests (Must Pass)
- [ ] Superadmin can approve/reject companies
- [ ] Company owner can invite team members
- [ ] Each role has correct permissions (Owner > Admin > Editor > Viewer)
- [ ] Forms can be created with all field types
- [ ] Public forms accept submissions
- [ ] Data import works (Excel & CSV)
- [ ] Data export works (all formats)
- [ ] TechCorp cannot access DataHub data (isolation)
- [ ] File uploads work
- [ ] Validation prevents invalid data

### Important Tests (Should Pass)
- [ ] Form conditional logic works
- [ ] Form security settings work (password, domain, expiry)
- [ ] Team management works (suspend, remove, role change)
- [ ] Analytics display correctly
- [ ] Email notifications sent
- [ ] Auto-save in forms works

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Import button missing | Check .env has IMPORT_JOBS_TABLE_ID and IMPORT_TEMP_BUCKET_ID |
| File upload fails | Verify Appwrite bucket created with correct permissions |
| Cannot access form | Check form published and user has correct role |
| No data showing | Verify companyId filtering and team membership |
| Export fails | Check all field types are supported |

---

## 📊 Test Results Template

After testing, document results:

```markdown
## Test Results - [Date]

**Environment**: Development
**Browser**: Chrome v120
**Tester**: [Your Name]

### Setup
- [✅/❌] Appwrite Storage bucket created
- [✅/❌] ImportJobs collection created
- [✅/❌] Environment variables configured
- [✅/❌] Server restarted successfully

### Quick Tests
- [✅/❌] Superadmin registration
- [✅/❌] Company registration (6-step onboarding)
- [✅/❌] Company approval
- [✅/❌] Form creation
- [✅/❌] Data import (CSV)

### Role-Based Access Control
- [✅/❌] Owner: Full access
- [✅/❌] Admin: Cannot remove owner
- [✅/❌] Editor: Cannot manage team
- [✅/❌] Viewer: Read-only access

### Features
- [✅/❌] Form builder (all field types)
- [✅/❌] Form security settings
- [✅/❌] Public form submissions
- [✅/❌] Data collection & management
- [✅/❌] Data import (Excel/CSV)
- [✅/❌] Data export (all formats)
- [✅/❌] Cross-company isolation
- [✅/❌] Analytics dashboard

### Issues Found
1. [Description of issue 1]
2. [Description of issue 2]

### Overall Status
- Total Tests: [X]
- Passed: [X]
- Failed: [X]
- Pass Rate: [X]%

### Recommendation
[Ready for production / Needs fixes / etc.]
```

---

## 📚 Documentation Reference

- **[BROWSER_TESTING_GUIDE.md](BROWSER_TESTING_GUIDE.md)** - Complete step-by-step testing guide
- **[IMPORT_SETUP_GUIDE.md](IMPORT_SETUP_GUIDE.md)** - Detailed import setup instructions
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Feature overview and summary
- **[test-users.json](test-data/test-users.json)** - All test user credentials
- **[sample-import.csv](test-data/sample-import.csv)** - Sample import data

---

## ✅ Next Steps

1. **Complete Appwrite Setup** (Step 1 above)
2. **Run Quick Tests** (Step 2 above)
3. **Execute Full Testing** (Step 3 above)
4. **Document Results**
5. **Fix Any Issues Found**
6. **Deploy to Production** (when ready)

---

Good luck with testing! 🚀

If you encounter any issues:
1. Check the detailed guides linked above
2. Review browser console for errors
3. Check Appwrite console logs
4. Verify all environment variables are set correctly
