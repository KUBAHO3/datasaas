# Resend-Based Invitation System Setup Guide

## Overview

Your invitation system has been completely rebuilt to use **Resend for email delivery** instead of Appwrite's built-in emails. Users are now added to the company **only after they accept the invitation** and create their account.

---

## 🔄 How It Works Now

### Old Flow (Appwrite):
1. ❌ Admin invites → Appwrite creates membership → Appwrite sends email
2. ❌ User clicks link → User redirected to accept page (often broken)
3. ❌ User already in team before accepting

### **New Flow (Resend):**
1. ✅ Admin invites → Create invitation record → **Send beautiful email via Resend**
2. ✅ User clicks link with **token** → Accept invitation page
3. ✅ User creates account with password
4. ✅ **User added to company team** → User logged in automatically

---

## 📋 Setup Steps

### 1. Create Invitations Collection in Appwrite

**Go to Appwrite Console → Databases → Your Database → Create Collection**

**Collection Name:** `invitations`
**Collection ID:** Copy this and add to `.env.local`

#### Required Attributes:

| Attribute | Type | Size | Required | Array | Default |
|-----------|------|------|----------|-------|---------|
| email | string | 255 | Yes | No | - |
| name | string | 255 | No | No | - |
| role | enum | - | Yes | No | - |
| companyId | string | 50 | Yes | No | - |
| companyName | string | 255 | Yes | No | - |
| invitedBy | string | 50 | Yes | No | - |
| inviterName | string | 255 | Yes | No | - |
| token | string | 100 | Yes | No | - |
| expiresAt | datetime | - | Yes | No | - |
| status | enum | - | Yes | No | pending |

#### Enum Values:

**role enum values:**
- `owner`
- `admin`
- `editor`
- `viewer`

**status enum values:**
- `pending`
- `accepted`
- `expired`
- `cancelled`

#### Indexes (for performance):

1. **Index Name:** `token_idx`
   **Type:** unique
   **Attributes:** `token`

2. **Index Name:** `email_company_idx`
   **Type:** fulltext
   **Attributes:** `email`, `companyId`

3. **Index Name:** `company_status_idx`
   **Type:** key
   **Attributes:** `companyId`, `status`

4. **Index Name:** `expires_idx`
   **Type:** key
   **Attributes:** `expiresAt`

#### Permissions:

**Document Security:** Enabled

**Collection Permissions:**
- **Create:** Any (server will handle validation)
- **Read:** `team:[teamId]` (replace with your permission structure)
- **Update:** `team:[teamId]`
- **Delete:** `team:[teamId]`

Or for server-only access:
- **Create:** Role: `users` (authenticated users can create via server actions)
- **Read/Update/Delete:** None (server-only via Admin SDK)

---

### 2. Update Environment Variables

Add to your `.env.local`:

```env
# Invitations Collection
NEXT_PUBLIC_INVITATIONS_TABLE_ID=your-invitations-collection-id

# Resend API (for sending invitation emails)
RESEND_MAIL_API_KEY=re_your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com

# App URL (for invitation links)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # or your production URL
```

**Get Resend API Key:**
1. Go to https://resend.com
2. Sign up / Log in
3. Go to API Keys
4. Create new API key
5. Copy and add to `.env.local`

---

### 3. Verify Resend Domain (Production Only)

For production, you need to verify your domain with Resend:

1. Go to Resend Dashboard → Domains
2. Add your domain (e.g., `yourdomain.com`)
3. Add the DNS records Resend provides
4. Wait for verification (usually instant)
5. Update `EMAIL_FROM` to use your domain: `noreply@yourdomain.com`

**For development:** You can use Resend's test domain, but emails will only go to verified addresses.

---

## 🧪 Testing the System

### Test Invitation Flow (5 minutes)

1. **Send an invitation:**
   ```
   1. Log in as company owner/admin
   2. Navigate to: /org/{your-org-id}/users
   3. Click "Invite Member"
   4. Fill in:
      - Email: test@yourdomain.com
      - Name: Test User
      - Role: Viewer
   5. Click "Send Invitation"
   6. ✅ Success: "Invitation sent to test@yourdomain.com"
   ```

2. **Check the email:**
   ```
   ✅ Beautiful branded email received
   ✅ Clear call-to-action button
   ✅ Role badge showing invited role
   ✅ "What happens next" section
   ✅ Invitation link with token
   ```

3. **Accept invitation:**
   ```
   1. Click "Accept Invitation" button in email
   2. ✅ Redirected to: /invite/accept?token=xxxxx
   3. Fill in:
      - Full Name: Test User
      - Password: Test1234 (min 8 chars, uppercase, lowercase, number)
      - Confirm Password: Test1234
   4. Click "Accept Invitation & Join Team"
   5. ✅ Account created
   6. ✅ User added to company team
   7. ✅ Auto-logged in
   8. ✅ Redirected to: /org/{team-id}
   ```

4. **Verify in database:**
   ```
   ✅ Check Appwrite Teams → User is a member
   ✅ Check UserData collection → Record created
   ✅ Check Invitations collection → Status = "accepted"
   ```

---

## 📁 Files Created/Modified

### New Files:
- ✅ `lib/types/invitation-types.ts` - Invitation TypeScript types
- ✅ `lib/services/models/invitation.model.ts` - Invitation database model
- ✅ `RESEND_INVITATION_SETUP.md` - This guide

### Modified Files:
- ✅ `lib/env-config.ts` - Added `INVITATIONS_TABLE_ID`
- ✅ `lib/schemas/user-schema.ts` - Updated `acceptInvitationSchema` and `resendInvitationSchema`
- ✅ `lib/services/actions/team-members.actions.ts` - Completely rewritten invitation actions
- ✅ `lib/services/email/resend.ts` - Added `sendTeamInvitationEmail` function
- ✅ `app/(auth)/invite/accept/page.tsx` - Updated to use token
- ✅ `features/auth/accept-invitation-card.tsx` - Updated to use token
- ✅ `features/company/pending-invitations-table.tsx` - Updated to use invitationId

---

## 🎨 Email Template Customization

The invitation email is fully customizable. Edit `lib/services/email/resend.ts`:

```typescript
function generateTeamInvitationEmailHTML(
  inviterName: string,
  teamName: string,
  role: string,
  invitationUrl: string,
  userName?: string
): string {
  // Customize colors, text, logo, etc.
  // Current features:
  // - Role-specific colors (owner=purple, admin=blue, editor=green, viewer=gray)
  // - Professional layout
  // - Mobile-responsive
  // - "What happens next" section
  // - Security information
}
```

**Customization Options:**
- Company logo (replace DS icon)
- Brand colors
- Custom footer text
- Additional information sections
- Multi-language support

---

## 🔐 Security Features

✅ **Token-based authentication** - Each invitation has a unique, random token
✅ **Expiration** - Invitations expire after 7 days (configurable)
✅ **Single-use tokens** - Token is invalidated after acceptance
✅ **Strong password requirements** - Min 8 chars, uppercase, lowercase, number
✅ **Server-side validation** - All checks done on server
✅ **Email verification** - User must have access to the invited email
✅ **Role-based access** - Only owners/admins can invite

---

## 🚀 Advanced Features

### 1. Custom Expiration Time

Edit `lib/services/models/invitation.model.ts`:

```typescript
static getExpirationDate(days: number = 7): string {
  const date = new Date();
  date.setDate(date.getDate() + days); // Change 7 to your preferred days
  return date.toISOString();
}
```

### 2. Bulk Invitations

Create a new action to send multiple invitations at once:

```typescript
export const bulkInviteMembers = createRoleAction(["owner", "admin"])
  .schema(z.object({
    invitations: z.array(z.object({
      email: z.string().email(),
      name: z.string().optional(),
      role: z.enum(["owner", "admin", "editor", "viewer"]),
    })),
    companyId: z.string(),
  }))
  .action(async ({ parsedInput, ctx }) => {
    // Loop through invitations and send each one
  });
```

### 3. Invitation Analytics

Track invitation metrics in a separate collection:

- Invitations sent
- Acceptance rate
- Time to accept
- Most common roles invited

### 4. Custom Invitation Message

Add a `message` field to invitations for personalized messages:

```typescript
export const inviteTeamMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["owner", "admin", "editor", "viewer"]),
  name: z.string().optional(),
  message: z.string().max(500).optional(), // Custom message
  companyId: z.string(),
});
```

---

## 🐛 Troubleshooting

### Issue: "Resend API key invalid"

**Solution:**
1. Check `.env.local` has correct `RESEND_MAIL_API_KEY`
2. Restart Next.js dev server after adding env variable
3. Verify API key is active in Resend dashboard

### Issue: "Email not received"

**Checklist:**
- ✅ Check spam/junk folder
- ✅ Verify Resend API key is valid
- ✅ Check Resend dashboard for delivery logs
- ✅ Verify `EMAIL_FROM` domain is verified (production)
- ✅ For dev, make sure test email is added in Resend

### Issue: "Invalid invitation token"

**Causes:**
- Token expired (> 7 days old)
- Invitation already accepted
- Token was tampered with
- Invitation was deleted/resent

**Solution:**
- Request admin to resend invitation
- Check Invitations collection in Appwrite for status

### Issue: "User not added to team after accepting"

**Debug steps:**
1. Check server logs for errors
2. Verify `acceptInvitation` action completed
3. Check Appwrite Teams - is user there?
4. Check UserData collection - is record created?
5. Check Invitations collection - status = "accepted"?

---

## 📊 Database Schema Reference

### Invitations Collection Structure

```typescript
interface Invitation {
  $id: string;                    // Document ID
  $createdAt: string;             // ISO timestamp
  $updatedAt: string;             // ISO timestamp
  email: string;                  // Invited user email
  name?: string;                  // Optional: Invited user name
  role: "owner" | "admin" | "editor" | "viewer";
  companyId: string;              // Company team ID
  companyName: string;            // Company name (for email)
  invitedBy: string;              // Inviter user ID
  inviterName: string;            // Inviter name (for email)
  token: string;                  // Unique invitation token
  expiresAt: string;              // ISO timestamp
  status: "pending" | "accepted" | "expired" | "cancelled";
}
```

---

## ✅ Success Checklist

Before going to production, verify:

- [  ] Invitations collection created in Appwrite
- [ ] All collection attributes added
- [ ] Indexes created for performance
- [ ] Environment variables set (`.env.local`)
- [ ] Resend API key configured
- [ ] Domain verified in Resend (production)
- [ ] Test invitation sent successfully
- [ ] Test invitation accepted successfully
- [ ] User appears in Appwrite Teams
- [ ] User appears in UserData collection
- [ ] Email template customized (optional)
- [ ] Invitation expiration time configured
- [ ] Error handling tested

---

## 🎉 You're Done!

Your invitation system is now using:
- ✅ **Resend for beautiful, reliable emails**
- ✅ **Token-based secure invitations**
- ✅ **User joins team only after accepting**
- ✅ **Complete audit trail in Invitations collection**

**Need help?** Check the troubleshooting section or contact support.

---

**Last Updated:** December 2025
