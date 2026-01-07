// @ts-nocheck - Supabase type generation issues
/**
 * API Route: Quiz Follow-Up Email Sequence
 * Sends follow-up emails to leads who purchased the report but haven't booked a call
 *
 * Email Schedule:
 * - Email 1: Immediately after report purchase
 * - Email 2: 2 days after Email 1
 * - Email 3: 1 day after Email 2 (Day 3)
 * - Email 4: 2 days after Email 3 (Day 5)
 */

import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { sendEmail } from '@/lib/email/service';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Calendar URL for booking calls
const CALENDAR_URL = 'https://link.quentinhunter.com/widget/booking/jBnz1S30qIJMi0enyxVK';

// Email subjects for the sequence
const EMAIL_SUBJECTS = {
  1: 'Ready to double your sales in the next 90 days?',
  2: 'The #1 question about business growth',
  3: '{{firstName}}, let\'s decode your Growth Score',
  4: 'Where will your business be 90 days from now?'
};

// Days to wait before sending each email (from sequence start)
const EMAIL_SCHEDULE_DAYS = {
  1: 0,  // Immediately
  2: 2,  // 2 days later
  3: 3,  // 3 days later (1 day after email 2)
  4: 5   // 5 days later (2 days after email 3)
};

// POST: Start the sequence for a specific lead (called after report purchase)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId, reportUrl } = body;

    if (!leadId) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    // Get the lead data
    const { data: lead, error: leadError } = await getSupabaseAdmin()
      .from('quiz_leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Check if sequence already started
    if (lead.email_sequence_started) {
      return NextResponse.json({
        success: true,
        message: 'Email sequence already started for this lead'
      });
    }

    // Generate unsubscribe token if not already present
    const unsubscribeToken = lead.unsubscribe_token || randomBytes(32).toString('hex');

    // Update lead with report URL and start sequence
    const now = new Date();
    const { error: updateError } = await getSupabaseAdmin()
      .from('quiz_leads')
      .update({
        report_url: reportUrl,
        report_purchased: true,
        report_purchased_at: now.toISOString(),
        email_sequence_started: true,
        last_email_sent: 0,
        next_email_at: now.toISOString(), // Send first email immediately
        unsubscribe_token: unsubscribeToken
      })
      .eq('id', leadId);

    if (updateError) {
      console.error('Error updating lead:', updateError);
      return NextResponse.json(
        { error: 'Failed to start email sequence' },
        { status: 500 }
      );
    }

    // Send the first email immediately (pass updated lead with token)
    const updatedLead = { ...lead, unsubscribe_token: unsubscribeToken };
    const result = await sendFollowUpEmail(updatedLead, 1, reportUrl);

    return NextResponse.json({
      success: true,
      message: 'Email sequence started',
      firstEmailSent: result.success
    });

  } catch (error: any) {
    console.error('Error starting quiz follow-up sequence:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start sequence' },
      { status: 500 }
    );
  }
}

// Helper function to send a specific follow-up email
async function sendFollowUpEmail(
  lead: any,
  emailNumber: number,
  reportUrl?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const firstName = lead.first_name || 'there';
    const companyName = lead.company_name || 'your business';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://quentinhunter.com';
    const unsubscribeUrl = `${baseUrl}/api/quiz/unsubscribe?token=${lead.unsubscribe_token}`;

    let subject = EMAIL_SUBJECTS[emailNumber as keyof typeof EMAIL_SUBJECTS];
    subject = subject.replace('{{firstName}}', firstName);

    // Generate email HTML based on email number
    const html = generateEmailHtml(emailNumber, {
      firstName,
      companyName,
      reportUrl: reportUrl || lead.report_url || '',
      calendarUrl: CALENDAR_URL,
      overallScore: lead.overall_score,
      zone: lead.zone,
      weakestPillar: lead.weakest_pillar,
      unsubscribeUrl
    });

    // Send the email
    const result = await sendEmail({
      to: lead.email,
      subject,
      html,
      metadata: {
        quiz_follow_up: true,
        lead_id: lead.id,
        email_number: emailNumber
      }
    });

    if (result.success) {
      // Calculate next email date
      const nextEmailNumber = emailNumber + 1;
      let nextEmailAt = null;

      if (nextEmailNumber <= 4) {
        const daysUntilNext = EMAIL_SCHEDULE_DAYS[nextEmailNumber as keyof typeof EMAIL_SCHEDULE_DAYS] -
                             EMAIL_SCHEDULE_DAYS[emailNumber as keyof typeof EMAIL_SCHEDULE_DAYS];
        nextEmailAt = new Date();
        nextEmailAt.setDate(nextEmailAt.getDate() + daysUntilNext);
      }

      // Update lead with email sent status
      await getSupabaseAdmin()
        .from('quiz_leads')
        .update({
          last_email_sent: emailNumber,
          next_email_at: nextEmailAt?.toISOString() || null
        })
        .eq('id', lead.id);
    }

    return result;

  } catch (error: any) {
    console.error(`Error sending follow-up email ${emailNumber}:`, error);
    return { success: false, error: error.message };
  }
}

// Generate email HTML for each email in the sequence
function generateEmailHtml(emailNumber: number, props: {
  firstName: string;
  companyName: string;
  reportUrl: string;
  calendarUrl: string;
  overallScore: number;
  zone: string;
  weakestPillar: string;
  unsubscribeUrl: string;
}): string {
  const { firstName, companyName, reportUrl, calendarUrl, overallScore, zone, weakestPillar, unsubscribeUrl } = props;

  const baseStyles = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    color: #334155;
    line-height: 1.6;
  `;

  const buttonStyles = `
    display: inline-block;
    background: #0d9488;
    color: white;
    padding: 14px 28px;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    margin: 20px 0;
  `;

  const footerStyles = `
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #e2e8f0;
    font-size: 12px;
    color: #64748b;
  `;

  let content = '';

  switch (emailNumber) {
    case 1:
      content = `
        <p>Hi ${firstName},</p>
        <p>Thank you for completing the Growth Score Assessment and getting your personalised report.</p>
        <p>Your score of <strong>${overallScore}%</strong> puts you in the <strong>${zone}</strong>. Your biggest opportunity for growth is in the <strong>${weakestPillar}</strong> pillar.</p>
        <p>I've helped hundreds of business owners move from the Constraint Zone to the Growth Zone. The difference? Having the right systems in place.</p>
        <p>Would you like to discuss your specific situation and create a 90-day action plan? I'm offering a complimentary 30-minute strategy call.</p>
        <a href="${calendarUrl}" style="${buttonStyles}">Book Your Free Strategy Call</a>
        <p>Can't find a suitable time? Reply to this email and we'll find a slot that works for you.</p>
        <p>Best,<br>Quentin Hunter</p>
      `;
      break;
    case 2:
      content = `
        <p>Hi ${firstName},</p>
        <p>The most common question I get from business owners is: "Where do I start?"</p>
        <p>With so many possible improvements, it's easy to feel overwhelmed. But here's the secret: <strong>you don't need to fix everything at once.</strong></p>
        <p>Based on your Growth Score, your ${weakestPillar} pillar at ${overallScore}% is your biggest lever. One focused improvement there will create a ripple effect across your entire business.</p>
        <p>In a quick call, I can help you identify the single highest-impact action you could take this month.</p>
        <a href="${calendarUrl}" style="${buttonStyles}">Let's Find Your Starting Point</a>
        <p>P.S. Here's your report again in case you need it: <a href="${reportUrl}">View Report</a></p>
        <p>Best,<br>Quentin Hunter</p>
      `;
      break;
    case 3:
      content = `
        <p>${firstName},</p>
        <p>I've been looking at Growth Scores this week, and I noticed something interesting.</p>
        <p>Business owners who scored in the ${zone} (like you at ${overallScore}%) often share a common challenge: they're working <em>in</em> the business rather than <em>on</em> it.</p>
        <p>The good news? A few strategic systems can change that completely.</p>
        <p>I'd love to share what I've seen work for businesses in similar situations. No sales pitch - just practical insights you can use immediately.</p>
        <a href="${calendarUrl}" style="${buttonStyles}">Book a 30-Minute Chat</a>
        <p>Looking forward to connecting,<br>Quentin Hunter</p>
      `;
      break;
    case 4:
      content = `
        <p>Hi ${firstName},</p>
        <p>This is my last note about your Growth Score Assessment.</p>
        <p>I know you're busy running ${companyName}, so I'll keep this brief:</p>
        <p>90 days from now, your business will either be in a better position... or roughly where it is today.</p>
        <p>The difference usually comes down to having a clear plan and someone to hold you accountable.</p>
        <p>If you'd like help creating that plan, my offer for a free strategy call still stands. But I won't keep filling your inbox - this is the last reminder.</p>
        <a href="${calendarUrl}" style="${buttonStyles}">Yes, Let's Talk</a>
        <p>Either way, I wish you the best with your growth journey.</p>
        <p>Cheers,<br>Quentin Hunter</p>
        <p><em>P.S. Your report is always available <a href="${reportUrl}">here</a> when you need it.</em></p>
      `;
      break;
  }

  return `
    <div style="${baseStyles}">
      ${content}
      <div style="${footerStyles}">
        <p>Quentin Hunter | Business Growth Systems</p>
        <p><a href="${unsubscribeUrl}" style="color: #64748b;">Unsubscribe from these emails</a></p>
      </div>
    </div>
  `;
}

// GET: Process scheduled emails (called by cron job)
export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request from Vercel
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // Allow in development or if CRON_SECRET not set
      if (process.env.NODE_ENV === 'production' && process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const now = new Date();

    // Find leads that need their next email sent (exclude unsubscribed)
    const { data: leads, error } = await getSupabaseAdmin()
      .from('quiz_leads')
      .select('*')
      .eq('email_sequence_started', true)
      .eq('call_booked', false)
      .neq('unsubscribed', true)
      .lt('last_email_sent', 4)
      .lte('next_email_at', now.toISOString())
      .not('next_email_at', 'is', null);

    if (error) {
      console.error('Error fetching leads:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leads' },
        { status: 500 }
      );
    }

    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      details: [] as any[]
    };

    for (const lead of leads || []) {
      results.processed++;
      const nextEmailNumber = (lead.last_email_sent || 0) + 1;

      const result = await sendFollowUpEmail(lead, nextEmailNumber);

      if (result.success) {
        results.sent++;
        results.details.push({
          leadId: lead.id,
          email: lead.email,
          emailNumber: nextEmailNumber,
          status: 'sent'
        });
      } else {
        results.failed++;
        results.details.push({
          leadId: lead.id,
          email: lead.email,
          emailNumber: nextEmailNumber,
          status: 'failed',
          error: result.error
        });
      }

      // Small delay between sends to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    return NextResponse.json({
      success: true,
      ...results
    });

  } catch (error: any) {
    console.error('Error processing scheduled emails:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process scheduled emails' },
      { status: 500 }
    );
  }
}
