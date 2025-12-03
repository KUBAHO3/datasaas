import "server-only";

import { sendEmail } from "./resend";

export async function sendCompanyApprovedEmail(
  email: string,
  companyName: string,
  ownerName?: string
) {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Company Approved</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
              
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e2e8f0;">
                  <div style="display: inline-block; background-color: #1e293b; width: 48px; height: 48px; border-radius: 8px; margin-bottom: 16px;">
                    <span style="color: #ffffff; font-size: 20px; font-weight: bold; line-height: 48px;">DS</span>
                  </div>
                  <h1 style="margin: 0; color: #1e293b; font-size: 24px; font-weight: 600;">DataSaaS</h1>
                </td>
              </tr>

              <!-- Success Icon -->
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center;">
                  <div style="display: inline-block; background-color: #dcfce7; width: 64px; height: 64px; border-radius: 50%;">
                    <span style="color: #16a34a; font-size: 32px; line-height: 64px;">✓</span>
                  </div>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 0 40px 40px;">
                  <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 20px; font-weight: 600; text-align: center;">
                    Welcome to DataSaaS!
                  </h2>
                  
                  ${
                    ownerName
                      ? `<p style="margin: 0 0 16px; color: #475569; font-size: 16px; line-height: 24px;">Hi ${ownerName},</p>`
                      : ""
                  }
                  
                  <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 24px;">
                    Great news! Your company <strong>${companyName}</strong> has been approved and is now active on DataSaaS.
                  </p>

                  <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
                    <p style="margin: 0 0 8px; color: #1e40af; font-weight: 600; font-size: 14px;">
                      What's Next?
                    </p>
                    <ul style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 14px; line-height: 20px;">
                      <li>Access your company dashboard</li>
                      <li>Create custom data collection forms</li>
                      <li>Invite team members</li>
                      <li>Start collecting and managing data</li>
                    </ul>
                  </div>

                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 0 0 24px;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
                           style="display: inline-block; background-color: #1e293b; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                          Go to Dashboard
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 20px; text-align: center;">
                    If you have any questions, feel free to reach out to our support team.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 24px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
                  <p style="margin: 0 0 8px; color: #64748b; font-size: 14px; text-align: center;">
                    © ${new Date().getFullYear()} DataSaaS. All rights reserved.
                  </p>
                  <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center;">
                    This is an automated email. Please do not reply.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `${companyName} - Application Approved!`,
    html,
  });
}

export async function sendCompanyRejectedEmail(
  email: string,
  companyName: string,
  reason: string,
  ownerName?: string
) {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Company Application Update</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
              
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e2e8f0;">
                  <div style="display: inline-block; background-color: #1e293b; width: 48px; height: 48px; border-radius: 8px; margin-bottom: 16px;">
                    <span style="color: #ffffff; font-size: 20px; font-weight: bold; line-height: 48px;">DS</span>
                  </div>
                  <h1 style="margin: 0; color: #1e293b; font-size: 24px; font-weight: 600;">DataSaaS</h1>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 20px; font-weight: 600;">
                    Application Update Required
                  </h2>
                  
                  ${
                    ownerName
                      ? `<p style="margin: 0 0 16px; color: #475569; font-size: 16px; line-height: 24px;">Hi ${ownerName},</p>`
                      : ""
                  }
                  
                  <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 24px;">
                    Thank you for your interest in DataSaaS. After reviewing your application for <strong>${companyName}</strong>, we need some additional information or corrections before we can approve your account.
                  </p>

                  <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
                    <p style="margin: 0 0 8px; color: #92400e; font-weight: 600; font-size: 14px;">
                      Reason for Review:
                    </p>
                    <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 20px;">
                      ${reason}
                    </p>
                  </div>

                  <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
                    <p style="margin: 0 0 8px; color: #1e40af; font-weight: 600; font-size: 14px;">
                      Next Steps:
                    </p>
                    <ul style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 14px; line-height: 20px;">
                      <li>Review the feedback above</li>
                      <li>Update your application information</li>
                      <li>Resubmit for review</li>
                    </ul>
                  </div>

                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 0 0 24px;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/onboarding" 
                           style="display: inline-block; background-color: #1e293b; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                          Update Application
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 20px; text-align: center;">
                    If you have any questions, please contact our support team.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 24px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
                  <p style="margin: 0 0 8px; color: #64748b; font-size: 14px; text-align: center;">
                    © ${new Date().getFullYear()} DataSaaS. All rights reserved.
                  </p>
                  <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center;">
                    This is an automated email. Please do not reply.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `${companyName} - Application Review Required`,
    html,
  });
}

export async function sendCompanySuspendedEmail(
  email: string,
  companyName: string,
  ownerName?: string
) {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Account Suspended</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
              
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e2e8f0;">
                  <div style="display: inline-block; background-color: #1e293b; width: 48px; height: 48px; border-radius: 8px; margin-bottom: 16px;">
                    <span style="color: #ffffff; font-size: 20px; font-weight: bold; line-height: 48px;">DS</span>
                  </div>
                  <h1 style="margin: 0; color: #1e293b; font-size: 24px; font-weight: 600;">DataSaaS</h1>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 20px; font-weight: 600;">
                    Account Suspended
                  </h2>
                  
                  ${
                    ownerName
                      ? `<p style="margin: 0 0 16px; color: #475569; font-size: 16px; line-height: 24px;">Hi ${ownerName},</p>`
                      : ""
                  }
                  
                  <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 24px;">
                    Your company account <strong>${companyName}</strong> has been temporarily suspended.
                  </p>

                  <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
                    <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 20px;">
                      During the suspension period, you will not be able to access your dashboard or use DataSaaS services.
                    </p>
                  </div>

                  <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 24px;">
                    If you believe this is an error or would like to discuss reactivating your account, please contact our support team immediately.
                  </p>

                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 0 0 24px;">
                        <a href="mailto:support@datasaas.com" 
                           style="display: inline-block; background-color: #1e293b; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                          Contact Support
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 24px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
                  <p style="margin: 0 0 8px; color: #64748b; font-size: 14px; text-align: center;">
                    © ${new Date().getFullYear()} DataSaaS. All rights reserved.
                  </p>
                  <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center;">
                    This is an automated email. Please do not reply.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `${companyName} - Account Suspended`,
    html,
  });
}
