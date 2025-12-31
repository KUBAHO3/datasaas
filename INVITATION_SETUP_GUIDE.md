# Team Invitation Setup Guide

## Overview

This guide explains how to properly configure and test the team member invitation flow. The invitation system allows administrators to invite users to their organization via email.

## How the Invitation Flow Works

1. **Admin invites user** - Admin enters email, name, and role in the invite dialog
2. **Appwrite sends email** - Appwrite automatically sends an invitation email with a magic link
3. **User clicks link** - User receives email and clicks the invitation link
4. **User creates account** - User is redirected to `/invite/accept` page to set their name and password
5. **Account created & logged in** - User account is created, membership confirmed, and user is automatically logged in

## Files Created/Modified

### New Files Created:
- ✅ `app/(auth)/invite/accept/page.tsx` - Invitation acceptance page
- ✅ `features/auth/accept-invitation-card.tsx` - UI component for invitation acceptance
- ✅ `lib/schemas/user-schema.ts` - Added `acceptInvitationSchema`

### Modified Files:
- ✅ `lib/services/actions/team-members.actions.ts` - Added `acceptInvitation` server action

## Required: Configure Appwrite Email Settings

**CRITICAL**: Appwrite needs to be configured to send invitation emails. Without this, users won't receive invitation emails.

### Option 1: Configure SMTP (Recommended for Production)

1. Go to your Appwrite Console
2. Navigate to **Settings** → **SMTP**
3. Configure your SMTP settings:
   ```
   SMTP Host: smtp.gmail.com (or your email provider)
   SMTP Port: 587
   SMTP Secure: TLS
   SMTP Username: your-email@gmail.com
   SMTP Password: your-app-password
   Sender Email: noreply@yourdomain.com
   Sender Name: YourApp Name
   ```

4. **Test the connection** using the "Test" button in Appwrite

### Option 2: Use Appwrite Cloud (Easiest for Testing)

If you're using Appwrite Cloud, SMTP is pre-configured. You just need to:

1. Go to **Auth** → **Templates** → **Team Invitation**
2. Customize the email template (optional)
3. Ensure the redirect URL matches your `APP_URL` environment variable

### Option 3: Configure Environment Variables (Self-Hosted)

For self-hosted Appwrite, add these to your `.env`:

```env
_APP_SMTP_HOST=smtp.gmail.com
_APP_SMTP_PORT=587
_APP_SMTP_SECURE=tls
_APP_SMTP_USERNAME=your-email@gmail.com
_APP_SMTP_PASSWORD=your-app-password
_APP_SYSTEM_EMAIL_ADDRESS=noreply@yourdomain.com
_APP_SYSTEM_EMAIL_NAME=YourApp
```

## Customize Email Template (Optional)

1. Go to Appwrite Console → **Auth** → **Templates**
2. Find **Team Invitation** template
3. Customize the email content
4. Make sure the link uses this format:
   ```
   {{url}}?membershipId={{membershipId}}&userId={{userId}}&secret={{secret}}&teamId={{teamId}}&email={{email}}
   ```

## Testing the Invitation Flow

### Step 1: Invite a User

1. Log in as an admin or owner
2. Go to your organization's team members page
3. Click "Invite Member"
4. Fill in:
   - Email: `test@example.com`
   - Name: `Test User` (optional)
   - Role: Select appropriate role
5. Click "Send Invitation"

### Step 2: Check Email

The invited user should receive an email with:
- Subject: "Invitation to join [Team Name]"
- A link that looks like:
  ```
  https://yourapp.com/invite/accept?membershipId=xxx&userId=xxx&secret=xxx&teamId=xxx&email=test@example.com
  ```

### Step 3: Accept Invitation

1. Click the link in the email
2. You should see the "Accept Invitation" page
3. Fill in:
   - Full Name
   - Password (min 8 chars, uppercase, lowercase, number)
   - Confirm Password
4. Click "Accept Invitation & Join Team"

### Step 4: Verify Success

After accepting:
- User should be automatically logged in
- User should be redirected to `/org/[teamId]`
- User should appear in the active members list
- User should have the role assigned during invitation

## Troubleshooting

### Issue: "User didn't receive email"

**Solution:**
1. Check Appwrite SMTP configuration
2. Check spam/junk folder
3. Verify the email address is correct
4. Check Appwrite logs for SMTP errors:
   ```bash
   docker logs appwrite-worker-mails
   ```

### Issue: "Invalid Invitation Link"

**Solution:**
1. Ensure all URL parameters are present (membershipId, teamId, userId, secret, email)
2. Check that `NEXT_PUBLIC_APP_URL` environment variable is correct
3. Verify the invitation hasn't expired (Appwrite default: 7 days)

### Issue: "This invitation has already been accepted"

**Solution:**
- The user has already accepted this invitation
- They should use the regular sign-in page instead
- Admin can remove the old invitation and send a new one if needed

### Issue: "Failed to accept invitation"

**Possible Causes:**
1. **User already exists**: Check if an account with that email already exists
2. **Invalid secret**: The invitation link may have expired or been tampered with
3. **Membership already confirmed**: User already accepted the invitation
4. **Appwrite API error**: Check server logs for detailed error messages

### Issue: "User can't log in after accepting"

**Solution:**
1. The user account should be created automatically during acceptance
2. If login fails, try password reset flow
3. Check that UserData record was created in the database
4. Verify the user is a member of the team in Appwrite Console

## Security Notes

- ✅ Invitation links contain a secret token that expires
- ✅ Each invitation can only be accepted once
- ✅ User passwords are hashed by Appwrite
- ✅ User is automatically logged in after account creation (secure session)
- ✅ Role-based access control is enforced at the database level

## API Flow Details

For developers, here's the detailed flow:

```typescript
// 1. Admin invites user
await teamsService.createMembership(
  companyId,
  [role],
  email,
  inviteUrl, // Points to /invite/accept
  undefined, // userId (not known yet)
  undefined, // phone
  name
);
// ↓ Appwrite sends email with link containing: membershipId, userId, secret, teamId

// 2. User clicks link → Redirected to /invite/accept with params

// 3. User submits form → acceptInvitation action executes:
//    a. Create user account with password
await adminAccountService.create(userId, email, password, name);

//    b. Create session
await adminAccountService.createSession(email, password);

//    c. Confirm team membership
await sessionTeamsService.updateMembershipStatus(teamId, membershipId, userId, secret);

//    d. Create UserData record
await userDataModel.createUserData(userId, { name, email, companyId: teamId, role });

// 4. User is now logged in and redirected to dashboard
```

## Next Steps

After setting up invitations, you may want to:

1. **Customize email templates** in Appwrite Console
2. **Set invitation expiry time** in Appwrite settings
3. **Add invitation analytics** to track acceptance rates
4. **Implement invitation reminders** for pending invitations
5. **Add bulk invitation** capability for inviting multiple users

## Support

If you encounter issues:
1. Check Appwrite Console logs
2. Check Next.js server logs
3. Verify environment variables are set correctly
4. Test with a different email address
5. Clear browser cache and cookies

---

**Documentation created:** December 2025
**Last updated:** December 2025
