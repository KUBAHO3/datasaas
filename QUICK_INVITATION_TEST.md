# Quick Invitation Testing Guide

## ✅ What Was Fixed

Your invitation system had 3 major issues that are now **RESOLVED**:

1. ❌ **No invitation acceptance page** → ✅ Created at `app/(auth)/invite/accept/page.tsx`
2. ❌ **No way for users to set password** → ✅ Created password creation flow
3. ❌ **Users automatically added without email** → ✅ Proper invitation flow with email confirmation

## 🚀 Quick Test (5 Minutes)

### Prerequisites
- [ ] You have SMTP configured in Appwrite (see below)
- [ ] You're logged in as an admin/owner
- [ ] You have access to the test email inbox

### Test Steps

#### 1️⃣ Send Invitation (1 min)
```
1. Navigate to: /org/{your-org-id}/users
2. Click "Invite Member" button
3. Fill in:
   - Email: your-test-email@gmail.com
   - Name: Test User
   - Role: Viewer
4. Click "Send Invitation"
5. ✅ You should see: "Invitation sent to your-test-email@gmail.com"
```

#### 2️⃣ Check Email (1 min)
```
1. Open the test email inbox
2. Look for email with subject like: "Invitation to join [Team Name]"
3. ✅ Email should contain a link like:
   http://localhost:3000/invite/accept?membershipId=...&teamId=...&userId=...&secret=...&email=...
```

#### 3️⃣ Accept Invitation (2 min)
```
1. Click the link in the email (or copy/paste to browser)
2. ✅ You should see "Accept Invitation" page
3. Fill in:
   - Full Name: Test User
   - Password: Test1234 (min 8 chars, uppercase, lowercase, number)
   - Confirm Password: Test1234
4. Click "Accept Invitation & Join Team"
5. ✅ You should be automatically logged in
6. ✅ You should be redirected to /org/{team-id}
```

#### 4️⃣ Verify Member (1 min)
```
1. Log out and log back in as admin
2. Go to: /org/{your-org-id}/users
3. ✅ "Test User" should appear in "Active Members" (not pending)
4. ✅ Role should be "Viewer"
5. ✅ Status should be "Active"
```

## ⚙️ SMTP Configuration (REQUIRED)

**If you haven't configured SMTP yet, emails won't be sent!**

### Quick SMTP Setup (Gmail Example)

1. **Go to Appwrite Console** → Settings → SMTP

2. **Use these settings:**
   ```
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   SMTP Secure: TLS
   SMTP Username: your-gmail@gmail.com
   SMTP Password: [Create App Password - see below]
   Sender Email: noreply@yourdomain.com
   Sender Name: DataSaaS
   ```

3. **Create Gmail App Password:**
   ```
   1. Go to: https://myaccount.google.com/apppasswords
   2. Generate new app password for "Mail"
   3. Copy the 16-character password
   4. Use it as SMTP Password
   ```

4. **Test Connection** in Appwrite Console

### Alternative: Use Appwrite Cloud
If using Appwrite Cloud, SMTP is pre-configured. Just ensure:
- Auth → Templates → Team Invitation template is enabled
- Redirect URL points to your app

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| No email received | Check SMTP config, check spam folder, verify Appwrite logs |
| Invalid invitation link | Ensure all URL params are present, check APP_URL env variable |
| "Already accepted" error | User already accepted - use sign-in instead |
| Can't log in after accepting | Try password reset, check UserData was created |
| Password requirements error | Must have uppercase, lowercase, number, min 8 chars |

## 📊 What Happens Behind the Scenes

```
Admin clicks "Invite"
  ↓
Appwrite creates membership (pending)
  ↓
Appwrite sends email with secret link
  ↓
User clicks link → /invite/accept page
  ↓
User enters name + password
  ↓
Server action:
  • Creates user account
  • Creates session
  • Confirms membership
  • Creates UserData record
  ↓
User logged in → Redirected to dashboard
```

## 🎯 Expected Behavior

### Before Fix:
- ❌ User added to team immediately (no email)
- ❌ User can't login (no password)
- ❌ No invitation acceptance page

### After Fix:
- ✅ User receives invitation email
- ✅ User clicks link and creates account
- ✅ User sets their own password
- ✅ User auto-logged in after accepting
- ✅ Proper pending → active flow

## 📝 Next Steps After Testing

Once you verify the flow works:

1. **Customize email template** in Appwrite Console
2. **Update invitation expiry** settings (default 7 days)
3. **Add company branding** to invitation emails
4. **Test with different roles** (owner, admin, editor, viewer)
5. **Test edge cases**:
   - Expired invitation
   - Duplicate email
   - Already accepted invitation

## 📞 Still Having Issues?

Check these files for detailed info:
- `INVITATION_SETUP_GUIDE.md` - Complete setup and troubleshooting guide
- Server logs - `npm run dev` output
- Appwrite logs - Appwrite Console → Logs

---

**Quick Test Checklist:**
- [ ] SMTP configured
- [ ] Invitation sent successfully
- [ ] Email received
- [ ] Acceptance page loads
- [ ] Account created successfully
- [ ] User logged in automatically
- [ ] User appears in active members
