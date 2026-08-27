import nodemailer from "nodemailer";
import { NormalizedHackathon } from "@/types/hackathon";

const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER || "";
const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASSWORD || "";

export function getTransporter() {
  if (!gmailUser || !gmailPass) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  });
}

/**
 * Sends a welcome email with the current list of ongoing hackathons to a new subscriber.
 */
export async function sendOngoingDigestEmail(
  subscriberEmail: string,
  ongoingHackathons: NormalizedHackathon[]
): Promise<{ success: boolean; error?: string }> {
  const transporter = getTransporter();

  if (!transporter) {
    console.warn(
      `⚠️ [Mailer] Gmail credentials not set. Ongoing digest for ${subscriberEmail} logged to console.`
    );
    return { success: true };
  }

  const subject = `🚀 Welcome to onlyhub! Here are ${ongoingHackathons.length} Live Ongoing Hackathons`;

  const hackathonRowsHtml = ongoingHackathons
    .slice(0, 15) // Top 15 live hackathons
    .map((h) => {
      const platformColor =
        h.platform === "devfolio"
          ? "#2762eb"
          : h.platform === "dorahacks"
          ? "#ff761c"
          : h.platform === "mlh"
          ? "#e73427"
          : h.platform === "unstop"
          ? "#0073e6"
          : "#10b981";

      return `
        <div style="margin-bottom: 16px; padding: 16px; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 10px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <span style="display: inline-block; padding: 3px 8px; border-radius: 999px; background-color: #f0f0f0; color: ${platformColor}; font-size: 11px; font-weight: 700; text-transform: uppercase;">
              ${h.platform}
            </span>
            <span style="font-size: 11px; color: #10b981; font-weight: 700; background-color: #ecfdf5; padding: 2px 8px; border-radius: 999px;">
              ● LIVE NOW
            </span>
          </div>

          <h3 style="margin: 0 0 6px 0; font-size: 16px; font-weight: 700; color: #111111;">
            <a href="${h.url}" target="_blank" style="color: #111111; text-decoration: none;">
              ${h.title}
            </a>
          </h3>

          <p style="margin: 0 0 10px 0; font-size: 13px; color: #555555; line-height: 1.4;">
            ${h.shortDescription || h.description || "Active global hackathon opportunity."}
          </p>

          <div style="font-size: 12px; color: #777777; margin-bottom: 12px;">
            📅 <strong>Dates:</strong> ${h.displayDates} &nbsp;|&nbsp; 
            📍 <strong>Mode:</strong> ${h.mode} 
            ${h.prizePool ? `&nbsp;|&nbsp; 🏆 <strong>Prize:</strong> <span style="color: #111111; font-weight: 600;">${h.prizePool}</span>` : ""}
          </div>

          <div>
            <a href="${h.url}" target="_blank" style="display: inline-block; padding: 8px 16px; background-color: #000000; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700; border-radius: 6px;">
              Apply / View Details ↗
            </a>
          </div>
        </div>
      `;
    })
    .join("");

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; background-color: #f9f9fb; color: #111111;">
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 24px; padding: 20px; background-color: #000000; border-radius: 12px; color: #ffffff;">
        <h1 style="font-size: 26px; font-weight: 900; margin: 0; letter-spacing: -0.03em;">
          only<span style="color: #10b981;">hub.</span>
        </h1>
        <p style="font-size: 13px; color: #a0a0a0; margin: 6px 0 0 0;">Global Hackathon Radar & Notification Engine</p>
      </div>

      <!-- Welcome Message -->
      <div style="background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <h2 style="font-size: 18px; font-weight: 800; margin: 0 0 8px 0; color: #111111;">
          You're Subscribed! 🎉
        </h2>
        <p style="font-size: 14px; color: #444444; line-height: 1.5; margin: 0 0 12px 0;">
          Welcome aboard! You will now receive <strong>24-hour advance alerts</strong> before upcoming hackathons kick off across Devfolio, DoraHacks, MLH, Unstop, and WeMakeDevs.
        </p>
        <p style="font-size: 13px; color: #666666; margin: 0;">
          Below are the <strong>${ongoingHackathons.length} ongoing competitions</strong> happening right now that are currently open for builds:
        </p>
      </div>

      <!-- Live Hackathon Cards -->
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 14px; font-weight: 800; color: #000000; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 12px 4px;">
          Active Hackathons List (${ongoingHackathons.length})
        </h3>
        ${hackathonRowsHtml}
      </div>

      <!-- Footer -->
      <div style="text-align: center; font-size: 11px; color: #888888; border-top: 1px solid #e0e0e0; padding-top: 16px;">
        Sent with ⚡ by <a href="https://onlyhub.vercel.app" style="color: #000000; font-weight: 700; text-decoration: none;">onlyhub</a><br/>
        You are receiving this because you subscribed to onlyhub Hackathon Radar.
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"onlyhub Radar" <${gmailUser}>`,
      to: subscriberEmail,
      subject: subject,
      html: htmlContent,
    });
    console.log(`✅ [Mailer] Ongoing digest email sent to ${subscriberEmail}`);
    return { success: true };
  } catch (error: any) {
    console.error(`❌ [Mailer] Error sending email to ${subscriberEmail}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Sends a 24-hour advance reminder email to all active subscribers for hackathons starting tomorrow.
 */
export async function sendUpcomingAlertEmail(
  subscriberEmails: string[],
  upcomingHackathons: NormalizedHackathon[]
): Promise<{ success: boolean; error?: string }> {
  if (subscriberEmails.length === 0 || upcomingHackathons.length === 0) {
    return { success: true };
  }

  const transporter = getTransporter();

  if (!transporter) {
    console.warn(
      `⚠️ [Mailer] Gmail credentials not set. 24h alert for ${upcomingHackathons.length} hackathons logged to console.`
    );
    return { success: true };
  }

  const subject = `⏰ [onlyhub Alert] ${upcomingHackathons.length} Hackathon${upcomingHackathons.length > 1 ? "s" : ""} Starting Tomorrow!`;

  const hackathonCardsHtml = upcomingHackathons
    .map((h) => {
      const platformColor =
        h.platform === "devfolio"
          ? "#2762eb"
          : h.platform === "dorahacks"
          ? "#ff761c"
          : h.platform === "mlh"
          ? "#e73427"
          : h.platform === "unstop"
          ? "#0073e6"
          : "#10b981";

      return `
        <div style="margin-bottom: 16px; padding: 16px; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 10px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <span style="display: inline-block; padding: 3px 8px; border-radius: 999px; background-color: #f0f0f0; color: ${platformColor}; font-size: 11px; font-weight: 700; text-transform: uppercase;">
              ${h.platform}
            </span>
            <span style="font-size: 11px; color: #f59e0b; font-weight: 700; background-color: #fef3c7; padding: 2px 8px; border-radius: 999px;">
              ⚡ STARTS IN 24H
            </span>
          </div>

          <h3 style="margin: 0 0 6px 0; font-size: 16px; font-weight: 700; color: #111111;">
            <a href="${h.url}" target="_blank" style="color: #111111; text-decoration: none;">
              ${h.title}
            </a>
          </h3>

          <p style="margin: 0 0 10px 0; font-size: 13px; color: #555555; line-height: 1.4;">
            ${h.shortDescription || h.description || "Registration and kickoff starting in 24 hours."}
          </p>

          <div style="font-size: 12px; color: #777777; margin-bottom: 12px;">
            📅 <strong>Schedule:</strong> ${h.displayDates} &nbsp;|&nbsp; 
            📍 <strong>Mode:</strong> ${h.mode}
            ${h.prizePool ? `&nbsp;|&nbsp; 🏆 <strong>Prize:</strong> <span style="color: #111111; font-weight: 600;">${h.prizePool}</span>` : ""}
          </div>

          <div>
            <a href="${h.url}" target="_blank" style="display: inline-block; padding: 8px 16px; background-color: #000000; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700; border-radius: 6px;">
              Register / View Event ↗
            </a>
          </div>
        </div>
      `;
    })
    .join("");

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; background-color: #f9f9fb; color: #111111;">
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 24px; padding: 20px; background-color: #000000; border-radius: 12px; color: #ffffff;">
        <h1 style="font-size: 26px; font-weight: 900; margin: 0; letter-spacing: -0.03em;">
          only<span style="color: #10b981;">hub.</span>
        </h1>
        <p style="font-size: 13px; color: #a0a0a0; margin: 6px 0 0 0;">24-Hour Advance Hackathon Alert</p>
      </div>

      <!-- Alert Banner -->
      <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
        <h2 style="font-size: 17px; font-weight: 800; margin: 0 0 6px 0; color: #92400e;">
          ⏰ 24-Hour Kickoff Reminder
        </h2>
        <p style="font-size: 13px; color: #78350f; line-height: 1.5; margin: 0;">
          The following <strong>${upcomingHackathons.length} hackathon${upcomingHackathons.length > 1 ? "s are" : " is"} starting tomorrow</strong>! Ensure your team is formed and your project registration is confirmed.
        </p>
      </div>

      <!-- Events List -->
      <div style="margin-bottom: 24px;">
        ${hackathonCardsHtml}
      </div>

      <!-- Footer -->
      <div style="text-align: center; font-size: 11px; color: #888888; border-top: 1px solid #e0e0e0; padding-top: 16px;">
        Sent with ⚡ by <a href="https://onlyhub.vercel.app" style="color: #000000; font-weight: 700; text-decoration: none;">onlyhub</a><br/>
        You are receiving this automated alert as an active onlyhub subscriber.
      </div>
    </div>
  `;

  try {
    // Send via BCC to protect subscriber privacy
    await transporter.sendMail({
      from: `"onlyhub Radar" <${gmailUser}>`,
      to: gmailUser,
      bcc: subscriberEmails,
      subject: subject,
      html: htmlContent,
    });
    console.log(`✅ [Mailer] 24h Alert email sent to ${subscriberEmails.length} subscribers.`);
    return { success: true };
  } catch (error: any) {
    console.error(`❌ [Mailer] Error broadcasting 24h alerts:`, error);
    return { success: false, error: error.message };
  }
}
