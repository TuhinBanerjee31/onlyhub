import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, platformUrl, platformName, feedback } = body;

    // 1. Validation
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!platformUrl || typeof platformUrl !== "string" || platformUrl.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "The platform website URL is required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim();
    const cleanUrl = platformUrl.trim();
    const cleanName = (platformName || "").trim() || cleanUrl;
    const cleanFeedback = (feedback || "").trim();
    const submissionTime = new Date().toLocaleString("en-US", {
      timeZone: "UTC",
      dateStyle: "full",
      timeStyle: "long",
    });

    console.log(`📬 New Platform Request received for: ${cleanName} (${cleanUrl}) from ${cleanEmail}`);

    // 2. Read SMTP / Gmail Environment Variables
    const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASSWORD;
    const recipient = process.env.RECIPIENT_EMAIL || gmailUser;

    // 3. If credentials exist, dispatch email via Gmail SMTP
    if (gmailUser && gmailPass) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });

      const emailSubject = `🚀 [onlyhub] Platform Request: ${cleanName}`;

      const htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; color: #111111; border: 1px solid #e5e5e5; border-radius: 12px;">
          <div style="border-bottom: 2px solid #000000; padding-bottom: 16px; margin-bottom: 20px;">
            <h1 style="font-size: 22px; font-weight: 800; margin: 0; color: #000000; letter-spacing: -0.02em;">
              only<span style="color: #666666;">hub.</span>
            </h1>
            <p style="font-size: 13px; color: #666666; margin: 4px 0 0 0;">New Platform Inclusion Request</p>
          </div>

          <div style="background-color: #f7f7f8; border-radius: 8px; padding: 18px; margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 6px 0; color: #666666; width: 140px; font-weight: 600;">Platform / Name:</td>
                <td style="padding: 6px 0; font-weight: 700; color: #000000;">${cleanName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #666666; font-weight: 600;">Platform URL:</td>
                <td style="padding: 6px 0;">
                  <a href="${cleanUrl}" target="_blank" style="color: #0066cc; text-decoration: underline; word-break: break-all;">
                    ${cleanUrl}
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #666666; font-weight: 600;">Requested By:</td>
                <td style="padding: 6px 0;">
                  <a href="mailto:${cleanEmail}" style="color: #111111; text-decoration: underline;">
                    ${cleanEmail}
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #666666; font-weight: 600;">Submitted At:</td>
                <td style="padding: 6px 0; color: #666666; font-size: 12px;">${submissionTime} (UTC)</td>
              </tr>
            </table>
          </div>

          ${
            cleanFeedback
              ? `
          <div style="margin-bottom: 24px;">
            <h3 style="font-size: 14px; font-weight: 700; color: #000000; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.05em;">
              Requester Notes & Feedback:
            </h3>
            <div style="background-color: #ffffff; border: 1px solid #e0e0e0; border-left: 4px solid #000000; padding: 14px; border-radius: 6px; font-size: 14px; line-height: 1.6; color: #333333;">
              ${cleanFeedback.replace(/\n/g, "<br/>")}
            </div>
          </div>
          `
              : ""
          }

          <div style="border-top: 1px solid #eeeeee; padding-top: 16px; font-size: 11px; color: #888888; text-align: center;">
            Sent automatically by <strong style="color: #000000;">onlyhub Global Hackathon Radar</strong>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: `"onlyhub Radar" <${gmailUser}>`,
        to: recipient,
        replyTo: cleanEmail,
        subject: emailSubject,
        text: `New Platform Request on onlyhub:\n\nName: ${cleanName}\nURL: ${cleanUrl}\nRequester Email: ${cleanEmail}\nNotes: ${cleanFeedback || "None"}\nTime: ${submissionTime}`,
        html: htmlContent,
      });

      console.log(`✅ Platform request notification email sent to ${recipient}`);
    } else {
      console.warn(
        "⚠️ GMAIL_USER and GMAIL_APP_PASSWORD are not yet set in .env. Request was logged to console successfully."
      );
    }

    return NextResponse.json({
      success: true,
      message: "Platform request received successfully!",
    });
  } catch (error: any) {
    console.error("❌ Error processing platform request:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to submit platform request.",
      },
      { status: 500 }
    );
  }
}
