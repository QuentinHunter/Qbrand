import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { success: false, error: 'Payment not completed' },
        { status: 400 }
      )
    }

    // Get leadId from metadata
    const leadId = session.metadata?.leadId
    const customerName = session.metadata?.customerName || session.customer_details?.name
    const customerEmail = session.customer_details?.email

    // Update lead with payment info
    if (leadId) {
      await supabaseAdmin
        .from('quiz_leads')
        .update({
          report_purchased: true,
          report_purchased_at: new Date().toISOString(),
          stripe_session_id: sessionId
        })
        .eq('id', leadId)
    }

    return NextResponse.json({
      success: true,
      leadId,
      customerName,
      customerEmail,
      paymentStatus: session.payment_status
    })

  } catch (error) {
    console.error('Payment verification error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { success: false, error: `Verification failed: ${errorMessage}` },
      { status: 500 }
    )
  }
}
