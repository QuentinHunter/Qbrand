// @ts-nocheck - Supabase type generation issues
/**
 * API Route: Unsubscribe Quiz Leads from Follow-Up Emails
 * GDPR compliant - allows quiz leads to opt-out of marketing emails
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Unsubscribe token is required' },
        { status: 400 }
      );
    }

    // Find and update the quiz lead
    const { data: lead, error: findError } = await supabaseAdmin
      .from('quiz_leads')
      .select('id, email, unsubscribed')
      .eq('unsubscribe_token', token)
      .single();

    if (findError || !lead) {
      return NextResponse.json(
        { error: 'Invalid unsubscribe token' },
        { status: 404 }
      );
    }

    // Already unsubscribed
    if (lead.unsubscribed) {
      return NextResponse.json({
        success: true,
        message: 'Already unsubscribed'
      });
    }

    // Update the lead to mark as unsubscribed
    const { error: updateError } = await supabaseAdmin
      .from('quiz_leads')
      .update({
        unsubscribed: true,
        next_email_at: null // Stop any pending emails
      })
      .eq('id', lead.id);

    if (updateError) {
      console.error('Error unsubscribing lead:', updateError);
      return NextResponse.json(
        { error: 'Failed to unsubscribe' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from quiz follow-up emails'
    });

  } catch (error: any) {
    console.error('Error in quiz unsubscribe endpoint:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}

// GET endpoint for direct link clicks (one-click unsubscribe)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/unsubscribe?error=missing_token', request.url));
  }

  try {
    // Find and update the quiz lead
    const { data: lead, error: findError } = await supabaseAdmin
      .from('quiz_leads')
      .select('id')
      .eq('unsubscribe_token', token)
      .single();

    if (findError || !lead) {
      return NextResponse.redirect(new URL('/unsubscribe?error=invalid_token', request.url));
    }

    // Update the lead to mark as unsubscribed
    await supabaseAdmin
      .from('quiz_leads')
      .update({
        unsubscribed: true,
        next_email_at: null
      })
      .eq('id', lead.id);

    // Redirect to success page
    return NextResponse.redirect(new URL('/unsubscribe?success=quiz', request.url));

  } catch (error) {
    console.error('Error in quiz unsubscribe GET:', error);
    return NextResponse.redirect(new URL('/unsubscribe?error=server_error', request.url));
  }
}
