// @ts-nocheck - Supabase type generation issues
/**
 * Email Service for Quentin Hunter
 * GDPR-compliant email sending with Resend
 */

import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Create Supabase client with service role for server-side operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type EmailNotificationType =
  | 'booking_confirmation'
  | 'booking_reminder'
  | 'booking_status_change'
  | 'review_request'
  | 'weekly_digest'
  | 'marketing'
  | 'system_updates'
  | 'subscription_created'
  | 'subscription_cancelled'
  | 'subscription_renewed'
  | 'payment_failed'
  | 'new_message';

interface SendEmailParams {
  to: string;
  userId?: string;
  subject: string;
  html: string;
  notificationType?: EmailNotificationType;
  metadata?: Record<string, any>;
  bcc?: string;
}

/**
 * Check if user has consented to receive this type of email (GDPR)
 */
export async function checkEmailConsent(
  userId: string,
  notificationType: EmailNotificationType
): Promise<boolean> {
  try {
    const { data: preferences, error } = await supabaseAdmin
      .from('email_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !preferences) {
      // If no preferences exist, create default ones
      await supabaseAdmin
        .from('email_preferences')
        .insert({ user_id: userId })
        .select()
        .single();

      // Default: allow transactional emails, not marketing
      return notificationType !== 'marketing' && notificationType !== 'weekly_digest';
    }

    // Check if user has unsubscribed from all emails
    if (preferences.unsubscribed_all) {
      // Only allow critical system updates
      return notificationType === 'system_updates';
    }

    // Check specific notification type preference
    const preferenceKey = notificationType as keyof typeof preferences;
    return preferences[preferenceKey] === true;
  } catch (error) {
    console.error('Error checking email consent:', error);
    // Fail safely: don't send if we can't verify consent
    return false;
  }
}

/**
 * Send email with GDPR compliance checks
 */
export async function sendEmail(params: SendEmailParams): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    const { to, userId, subject, html, notificationType, metadata = {}, bcc } = params;

    // Check email consent if userId provided and notificationType exists
    if (userId && notificationType) {
      const hasConsent = await checkEmailConsent(userId, notificationType);
      if (!hasConsent) {
        console.log(`Email not sent: User ${userId} has not consented to ${notificationType}`);

        // Log that consent was not given
        await logEmailActivity({
          userId,
          emailAddress: to,
          notificationType,
          subject,
          status: 'consent_denied',
          metadata: { reason: 'User has not consented to this email type' }
        });

        return {
          success: false,
          error: 'User has not consented to this email type'
        };
      }
    }

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Quentin Hunter <info@quentinhunter.com>',
      to,
      subject,
      html,
      ...(bcc ? { bcc } : {}),
      tags: [
        ...(notificationType ? [{ name: 'notification_type', value: notificationType }] : []),
        ...(userId ? [{ name: 'user_id', value: userId }] : [])
      ]
    });

    if (error) {
      console.error('Resend error:', error);

      // Log failure
      if (userId && notificationType) {
        await logEmailActivity({
          userId,
          emailAddress: to,
          notificationType,
          subject,
          status: 'failed',
          metadata: { error: error.message }
        });
      }

      return {
        success: false,
        error: error.message
      };
    }

    // Log successful send
    if (userId && notificationType) {
      await logEmailActivity({
        userId,
        emailAddress: to,
        notificationType,
        subject,
        status: 'sent',
        providerMessageId: data?.id,
        metadata
      });

      // Update last email sent timestamp
      await supabaseAdmin
        .from('email_preferences')
        .update({ last_email_sent_at: new Date().toISOString() })
        .eq('user_id', userId);
    }

    return {
      success: true,
      messageId: data?.id
    };
  } catch (error: any) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error.message || 'Unknown error'
    };
  }
}

/**
 * Log email activity for GDPR compliance (Article 30)
 */
async function logEmailActivity(params: {
  userId?: string;
  emailAddress: string;
  notificationType: EmailNotificationType;
  subject: string;
  status: string;
  providerMessageId?: string;
  metadata?: Record<string, any>;
}) {
  try {
    await supabaseAdmin
      .from('email_activity_log')
      .insert({
        user_id: params.userId || null,
        email_address: params.emailAddress,
        notification_type: params.notificationType,
        subject: params.subject,
        status: params.status,
        provider_message_id: params.providerMessageId || null,
        metadata: params.metadata || {}
      });
  } catch (error) {
    console.error('Error logging email activity:', error);
    // Don't throw - logging failure shouldn't break email sending
  }
}

/**
 * Get unsubscribe token for a user
 */
export async function getUnsubscribeToken(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('email_preferences')
      .select('unsubscribe_token')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data.unsubscribe_token;
  } catch (error) {
    console.error('Error getting unsubscribe token:', error);
    return null;
  }
}

/**
 * Unsubscribe user from emails (GDPR right to object)
 */
export async function unsubscribeUser(
  token: string,
  unsubscribeFrom: 'all' | 'marketing' = 'all'
): Promise<{ success: boolean; error?: string }> {
  try {
    if (unsubscribeFrom === 'all') {
      const { error } = await supabaseAdmin
        .from('email_preferences')
        .update({
          unsubscribed_all: true,
          marketing: false,
          weekly_digest: false,
          review_request: false,
          booking_reminder: false
        })
        .eq('unsubscribe_token', token);

      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin
        .from('email_preferences')
        .update({
          marketing: false,
          weekly_digest: false
        })
        .eq('unsubscribe_token', token);

      if (error) throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error unsubscribing user:', error);
    return {
      success: false,
      error: error.message || 'Unknown error'
    };
  }
}

/**
 * Record user consent (GDPR Article 7)
 */
export async function recordConsent(params: {
  userId: string;
  consentType: string;
  consented: boolean;
  consentText: string;
  consentVersion: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('user_consents')
      .insert({
        user_id: params.userId,
        consent_type: params.consentType,
        consented: params.consented,
        consent_text: params.consentText,
        consent_version: params.consentVersion,
        ip_address: params.ipAddress || null,
        user_agent: params.userAgent || null,
        metadata: params.metadata || {}
      });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error recording consent:', error);
    return {
      success: false,
      error: error.message || 'Unknown error'
    };
  }
}

/**
 * Helper to render React email template to HTML
 */
export async function renderEmailTemplate(component: React.ReactElement): Promise<string> {
  const { renderToStaticMarkup } = await import('react-dom/server');
  return renderToStaticMarkup(component);
}
