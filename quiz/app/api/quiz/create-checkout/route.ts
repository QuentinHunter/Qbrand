import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

    const body = await request.json()
    const { leadId, email, name } = body

    if (!leadId || !email) {
      return NextResponse.json(
        { success: false, error: 'Lead ID and email are required' },
        { status: 400 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'Growth Assessment Report',
              description: 'Personalised AI-powered growth report with 8-10 actionable recommendations, industry benchmarks, and implementation steps.',
              images: ['https://quentinhunter.com/assets/images/og-image.png']
            },
            unit_amount: 700 // £7.00 in pence
          },
          quantity: 1
        }
      ],
      metadata: {
        leadId,
        customerName: name
      },
      success_url: `${baseUrl}/growthquiz/report-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/growthquiz/results`
    })

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id
    })

  } catch (error) {
    console.error('Stripe checkout error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { success: false, error: `Failed to create checkout: ${errorMessage}` },
      { status: 500 }
    )
  }
}
