import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return new NextResponse('Report ID is required', { status: 400 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch the report from the database
    const { data: lead, error } = await supabaseAdmin
      .from('quiz_leads')
      .select('report_html, first_name, company_name')
      .eq('id', id)
      .single()

    if (error || !lead) {
      return new NextResponse('Report not found', { status: 404 })
    }

    if (!lead.report_html) {
      return new NextResponse('Report not yet generated', { status: 404 })
    }

    // Return the HTML report
    return new NextResponse(lead.report_html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
      }
    })

  } catch (error) {
    console.error('Report fetch error:', error)
    return new NextResponse('Failed to fetch report', { status: 500 })
  }
}
