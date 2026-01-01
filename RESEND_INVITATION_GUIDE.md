# Resend Invitation Feature Guide

## ✅ Already Implemented!

Good news - **the resend invitation feature is fully implemented and ready to use!**

## How It Works

### UI Location
1. Navigate to **Team Members** page at `/org/{orgId}/users`
2. Look at the **Pending Invitations** table
3. Each pending invitation has a **"Resend" button**

### What Happens When You Resend

1. **User clicks "Resend"** on a pending invitation
2. **Old invitation is deleted** from Appwrite
3. **New invitation is created** with:
   - Same email
   - Same role
   - Same name (if provided)
   - Fresh secret token
   - New 7-day expiration
4. **Appwrite sends new email** automatically to the invited user
5. **New invitation URL** with updated parameters

### Technical Flow

```typescript
// File: lib/services/actions/team-members.actions.ts (lines 306-362)

export const resendInvitation = createRoleAction(["owner", "admin"]).schema(
  resendInvitationSchema
).action(async ({ parsedInput, ctx }) => {
  // 1. Verify it's still pending
  if (membership.confirm) {
    throw new Error("This user has already accepted the invitation");
  }

  // 2. Delete old membership
  await teamsService.deleteMembership(companyId, membershipId);

  // 3. Create new membership (sends new email)
  const inviteUrl = `${APP_URL}/invite/accept`;
  await teamsService.createMembership(
    companyId,
    [role],
    email,
    inviteUrl,
    undefined,
    undefined,
    membership.userName
  );
});
```

## UI Components

### Pending Invitations Table
**File:** `features/company/pending-invitations-table.tsx`

Features:
- ✅ Shows all pending invitations
- ✅ Displays: Email, Role, Invited Date, Status
- ✅ **Resend button** with loading state
- ✅ **Cancel invitation** option (removes the invitation)
- ✅ Role badges with color coding
- ✅ Real-time status updates

### Button States
```typescript
<Button
  variant="ghost"
  size="sm"
  onClick={() => handleResendInvitation(membershipId, email)}
  disabled={isResending}
>
  <MailCheck className="mr-2 h-4 w-4" />
  {isResending ? "Sending..." : "Resend"}
</Button>
```

## When to Use Resend

### Good Reasons to Resend:
1. **User didn't receive email** (check spam first!)
2. **Invitation expired** (after 7 days)
3. **User lost the original email**
4. **Email was sent to wrong address** (cancel old, create new)
5. **User's email provider had issues**

### Not Necessary When:
1. Invitation was just sent (< 1 minute ago)
2. User already accepted (they're in active members)
3. Email is in their spam folder (ask them to check first)

## Testing the Resend Feature

### Quick Test (2 minutes)

1. **Send initial invitation**
   ```
   1. Go to /org/{orgId}/users
   2. Click "Invite Member"
   3. Email: test@example.com
   4. Role: Viewer
   5. Click "Send Invitation"
   ```

2. **Verify pending state**
   ```
   ✅ User appears in "Pending Invitations" table
   ✅ Status shows "Pending" badge
   ✅ "Resend" button is visible
   ```

3. **Resend the invitation**
   ```
   1. Click "Resend" button
   2. ✅ Button shows "Sending..."
   3. ✅ Success toast: "Invitation resent to test@example.com"
   4. ✅ Table refreshes
   ```

4. **Check email**
   ```
   ✅ New email received (check timestamp)
   ✅ New invitation link with different parameters
   ✅ Old link is now invalid
   ```

## Error Handling

### "This user has already accepted the invitation"
**Cause:** User already accepted and is now an active member

**Solution:** They should use the regular sign-in page instead

### "Failed to resend invitation"
**Causes:**
- No permission (must be owner/admin)
- Membership not found
- Appwrite API error

**Solution:** Check user role and verify membership exists

### Email not received after resend
**Checklist:**
1. ✅ Check spam/junk folder
2. ✅ Verify SMTP is configured in Appwrite
3. ✅ Check Appwrite logs: `docker logs appwrite-worker-mails`
4. ✅ Test SMTP connection in Appwrite Console
5. ✅ Verify email address is correct

## Advanced: Custom Branded Emails (Optional)

I've created a **custom invitation email template** using Resend that you can optionally use instead of Appwrite's default emails.

### Custom Email Features
- ✅ Beautiful branded design
- ✅ Role-specific colors and descriptions
- ✅ Clear call-to-action button
- ✅ "What happens next" section
- ✅ Security information
- ✅ Mobile-responsive

### How to Use Custom Emails

**File:** `lib/services/email/resend.ts`

```typescript
import { sendTeamInvitationEmail } from "@/lib/services/email/resend";

// In your invitation action:
await sendTeamInvitationEmail(
  email,              // User's email
  inviterName,        // Name of person who sent invite
  teamName,           // Organization name
  role,               // owner/admin/editor/viewer
  invitationUrl,      // Full invitation URL with params
  userName            // Optional: User's name
);
```

### To Switch to Resend Emails:

1. **Ensure env variables are set:**
   ```env
   RESEND_MAIL_API_KEY=re_xxxxxxxxxxxxx
   EMAIL_FROM=noreply@yourdomain.com
   ```

2. **Modify invitation action** (optional - requires manual token generation):
   - Generate your own invitation tokens
   - Store them in a custom collection
   - Send via Resend instead of Appwrite
   - Validate tokens manually

**Note:** Using custom Resend emails requires additional implementation. The default Appwrite flow is recommended because it handles token generation, validation, and expiration automatically.

## Comparison: Appwrite vs Resend

| Feature | Appwrite (Current) | Resend (Custom) |
|---------|-------------------|-----------------|
| Email sending | ✅ Automatic | ⚙️ Manual |
| Token generation | ✅ Automatic | ⚠️ Manual |
| Token validation | ✅ Built-in | ⚠️ Manual |
| Expiration | ✅ Automatic (7 days) | ⚠️ Manual |
| Email template | ⚠️ Basic | ✅ Branded |
| Setup complexity | ✅ Simple | ⚠️ Complex |
| Recommended | ✅ Yes | For advanced users |

## Best Practices

### 1. Don't Spam
- Wait at least 5 minutes between resends
- Max 3 resends per invitation
- Ask user to check spam before resending

### 2. Communication
- Tell the user you're resending
- Provide expected timeline (email arrives in 1-2 minutes)
- Give alternative contact method if issues persist

### 3. Monitoring
- Track resend frequency
- Monitor email delivery rates
- Check Appwrite logs for SMTP errors

### 4. User Experience
```typescript
// Good pattern
onClick={() => {
  toast.info("Resending invitation...");
  handleResendInvitation(membershipId, email);
}}

// Shows immediate feedback
// Success/error handled by action result
```

## Troubleshooting Common Issues

### Issue: "Resend button doesn't work"
**Check:**
1. User role (must be owner/admin)
2. Browser console for errors
3. Network tab for API response
4. Server logs for detailed error

### Issue: "Multiple resends don't work"
**Cause:** Each resend deletes and recreates the membership, changing the membershipId

**Solution:** The UI automatically refreshes after resend, showing the new membershipId

### Issue: "User never receives emails"
**Check:**
1. Appwrite SMTP configuration
2. Email provider settings (Gmail, Outlook, etc.)
3. SPF/DKIM records for your domain
4. Resend API key validity (if using custom emails)

## Summary

✅ **Resend invitation is fully working!**

- Feature: Already implemented in your codebase
- Location: Pending Invitations table
- How: Click "Resend" button
- Email: Sent automatically by Appwrite
- Custom option: Resend templates available (optional)

**Just ensure SMTP is configured in Appwrite and you're ready to go!**

---

**Last updated:** December 2025
