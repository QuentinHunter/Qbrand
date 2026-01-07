import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email/service'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const PILLARS: Record<string, { name: string; color: string }> = {
  ATTRACT: { name: 'Attract', color: '#14B8A6' },
  CONVERT: { name: 'Convert', color: '#8B5CF6' },
  ASCEND: { name: 'Ascend', color: '#F59E0B' },
  ACCELERATE: { name: 'Accelerate', color: '#EC4899' }
}

const ZONES: Record<string, { label: string; color: string; description: string }> = {
  DANGER: { label: 'Danger Zone', color: '#EF4444', description: 'Core growth foundations are missing or weak.' },
  CONSTRAINT: { label: 'Constraint Zone', color: '#F59E0B', description: 'Solid drivers in place, but bottlenecks are limiting potential.' },
  GROWTH: { label: 'Growth Zone', color: '#22C55E', description: 'Strong foundations that support scalable growth.' }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { results, name, leadId, businessInfo: bodyBusinessInfo, email: bodyEmail } = body

    if (!results || !results.weakestPillar || !results.zone) {
      return NextResponse.json({ success: false, error: 'Invalid quiz results' }, { status: 400 })
    }

    // Fetch businessInfo from database if leadId provided (for better personalization)
    let businessInfo = bodyBusinessInfo || ''
    let email = bodyEmail || ''
    if (leadId) {
      try {
        const { data: leadData } = await getSupabaseAdmin()
          .from('quiz_leads')
          .select('business_info, email')
          .eq('id', leadId)
          .maybeSingle()

        if (leadData) {
          businessInfo = leadData.business_info || businessInfo
          email = leadData.email || email
        }
      } catch (err) {
        console.error('Failed to fetch lead data:', err)
        // Continue without business info - don't block report generation
      }
    }

    const weakestPillar = PILLARS[results.weakestPillar] || { name: results.weakestPillar, color: '#14B8A6' }
    const zone = ZONES[results.zone] || ZONES.CONSTRAINT

    const pillarSummary = results.pillarScores
      ?.map((ps: { pillar: string; percentage: number }) => {
        const pillar = PILLARS[ps.pillar] || { name: ps.pillar }
        return `${pillar.name}: ${ps.percentage}%`
      })
      .join(', ') || ''

    const weakestScore = results.pillarScores?.find(
      (p: { pillar: string }) => p.pillar === results.weakestPillar
    )?.percentage || 0

    const prompt = `You are an expert business consultant specialising in helping owner-managed businesses grow and scale.

Generate a comprehensive, actionable growth assessment report. This report must be plain text only - NO markdown formatting whatsoever. No hashtags, no asterisks, no bullet points with dashes. Write in flowing prose with clear paragraph breaks.

QUIZ RESULTS:
Overall Score: ${results.overallPercentage}%
Zone: ${zone.label}
Weakest Pillar: ${weakestPillar.name} (${weakestScore}%)
All Pillars: ${pillarSummary}
${businessInfo ? `
BUSINESS CONTEXT (use this to personalise recommendations):
${businessInfo}

Use the business context above to make your recommendations highly specific and relevant to their situation. Reference their specific business type, challenges, and goals where appropriate.
` : ''}
REPORT STRUCTURE (use these exact section titles):

SECTION: EXECUTIVE SUMMARY
Write 2-3 warm, encouraging paragraphs about their position and potential. Be honest but optimistic.

SECTION: UNDERSTANDING YOUR SCORE
Explain what ${results.overallPercentage}% means practically. Clarify this is an assessment score measuring business systems, not a performance metric. Explain what businesses at this level typically experience.

SECTION: YOUR PRIMARY GROWTH CONSTRAINT - ${weakestPillar.name.toUpperCase()}
Deep dive into why ${weakestPillar.name} at ${weakestScore}% is holding them back. Explain the symptoms, root causes, and cascading effects on other areas.

SECTION: YOUR PERSONALISED ACTION PLAN
Provide exactly 8 actionable recommendations tailored to their business. For each recommendation, use this EXACT structure with clear labels on separate lines:

RECOMMENDATION [number]: [Brief title - 5-8 words max]

INVESTMENT: [Free / Under £100 / £100-500 / Premium £500+]

TIMEFRAME: [e.g., "1-2 weeks" or "4-6 weeks"]

WHAT TO DO:
Write 2-3 sentences explaining the specific action steps. Be concrete and specific.

WHY IT WORKS:
Write 2-3 sentences explaining why this is effective. Reference business growth principles or industry-specific insights.

EXPECTED OUTCOME:
Write 1-2 sentences with realistic metrics (e.g., conversion rates, leads, revenue impact).

Important: Each section (INVESTMENT, TIMEFRAME, WHAT TO DO, WHY IT WORKS, EXPECTED OUTCOME) must be on its own line with blank lines between sections for readability.

Mix of: 2-3 free options, 2-3 low-cost options, 2-3 premium options. Mix of quick wins and strategic builds. Focus on tactics relevant to the 4 pillars: Attract (lead generation, content, traffic), Convert (sales funnels, offers, conversion), Ascend (retention, upsells, referrals), Accelerate (systems, automation, team).

SECTION: BUSINESS GROWTH BENCHMARKS
Write a brief intro paragraph about how these benchmarks help them understand where they stand. Then include these key metrics:

General Business Key Metrics:
- Lead-to-customer conversion: 2-5% (top performers achieve 10%+)
- Average customer lifetime value: 3-5x initial purchase value
- Customer retention rate target: 85-95% annually
- Net Promoter Score target: 30-50+ (excellent: 70+)
- Referral rate: 10-25% of happy customers refer when asked directly
- Cost per lead (paid ads): £20-£100 depending on industry

Marketing Benchmarks:
- LinkedIn Ads CPC for B2B: £5-£15
- Google Ads for service businesses: £2-£8 per click
- Email open rates: 20-35%
- Email click rates: 2-5%
- Website lead conversion: 2-5% of visitors

Write 2-3 paragraphs explaining how they can use these benchmarks to evaluate their own performance and set realistic targets.

SECTION: YOUR NEXT STEPS
End with clear call to action. Mention booking a free strategy call with Quentin Hunter to create a prioritised implementation roadmap.

CRITICAL FORMATTING RULES:
1. NO markdown symbols whatsoever (no #, *, -, _, etc.)
2. NO bullet points - write in prose paragraphs
3. Use "SECTION:" prefix for each section heading exactly as shown
4. Use "RECOMMENDATION 1:", "RECOMMENDATION 2:", etc. for action items
5. Separate paragraphs with blank lines
6. Write naturally as a consultant would in a professional PDF report
7. UK English spelling throughout (colour, organisation, programme, centre, behaviour)
8. Approximately 1,600-2,000 words total
9. Sound human and consultative, not robotic

Generate the report now:`

    const anthropic = new Anthropic()
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 5000,
      messages: [{ role: 'user', content: prompt }]
    })

    const reportContent = message.content[0].type === 'text' ? message.content[0].text : ''
    const businessName = name || 'Your Business'
    const htmlReport = generateWowReport(reportContent, businessName, results, zone, weakestPillar)

    // If leadId provided, save the report to the database
    let reportUrl = null
    if (leadId) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://quentinhunter.com'
      reportUrl = `${baseUrl}/api/quiz/report/${leadId}`

      await getSupabaseAdmin()
        .from('quiz_leads')
        .update({
          report_html: htmlReport,
          report_url: reportUrl
        })
        .eq('id', leadId)
    }

    // Send admin email with report copy
    sendAdminReportNotification({
      businessName,
      email: email || 'Unknown',
      reportUrl,
      results,
      zone,
      weakestPillar
    }).catch(err => console.error('Failed to send admin report notification:', err))

    return NextResponse.json({ success: true, report: reportContent, htmlReport, reportUrl })
  } catch (error) {
    console.error('Report generation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: `Failed to generate report: ${errorMessage}` }, { status: 500 })
  }
}

function generateWowReport(
  content: string,
  businessName: string,
  results: { overallPercentage: number; pillarScores: Array<{ pillar: string; percentage: number }> },
  zone: { label: string; color: string },
  weakestPillar: { name: string; color: string }
) {
  // Clean content of any remaining markdown
  let cleanContent = content
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/^[-•]\s/gm, '')
    .replace(/`/g, '')

  // Parse sections
  const sections: Record<string, string> = {}
  const sectionMatches = cleanContent.split(/SECTION:\s*/i)

  for (const section of sectionMatches) {
    if (!section.trim()) continue
    const lines = section.trim().split('\n')
    const title = lines[0].trim().toUpperCase()
    const body = lines.slice(1).join('\n').trim()
    sections[title] = body
  }

  // Parse recommendations with structured sections
  const actionPlan = sections['YOUR PERSONALISED ACTION PLAN'] || sections['YOUR PERSONALIZED ACTION PLAN'] || ''
  const recommendations: Array<{
    title: string
    investment: string
    timeframe: string
    whatToDo: string
    whyItWorks: string
    expectedOutcome: string
  }> = []
  const recMatches = actionPlan.split(/RECOMMENDATION\s*\d+[:.]\s*/i)

  for (let i = 1; i < recMatches.length; i++) {
    const rec = recMatches[i].trim()
    const lines = rec.split('\n')
    const title = lines[0].trim()

    // Parse structured sections
    const recContent = rec.substring(title.length)
    const investmentMatch = recContent.match(/INVESTMENT:\s*([^\n]+)/i)
    const timeframeMatch = recContent.match(/TIMEFRAME:\s*([^\n]+)/i)
    const whatToDoMatch = recContent.match(/WHAT TO DO:\s*([\s\S]*?)(?=WHY IT WORKS:|$)/i)
    const whyItWorksMatch = recContent.match(/WHY IT WORKS:\s*([\s\S]*?)(?=EXPECTED OUTCOME:|$)/i)
    const expectedOutcomeMatch = recContent.match(/EXPECTED OUTCOME:\s*([\s\S]*?)(?=RECOMMENDATION|$)/i)

    recommendations.push({
      title,
      investment: investmentMatch?.[1]?.trim() || '',
      timeframe: timeframeMatch?.[1]?.trim() || '',
      whatToDo: whatToDoMatch?.[1]?.trim() || '',
      whyItWorks: whyItWorksMatch?.[1]?.trim() || '',
      expectedOutcome: expectedOutcomeMatch?.[1]?.trim() || ''
    })
  }

  // Build pillar scores HTML
  const pillarScoresHtml = results.pillarScores.map(ps => {
    const p = PILLARS[ps.pillar]
    const isWeakest = ps.pillar === Object.keys(PILLARS).find(k => PILLARS[k].name === weakestPillar.name)
    return `
      <div class="pillar-card ${isWeakest ? 'weakest' : ''}">
        <div class="pillar-header">
          <span class="pillar-name">${p?.name || ps.pillar}</span>
          ${isWeakest ? '<span class="priority-badge">Priority Focus</span>' : ''}
        </div>
        <div class="pillar-score-bar">
          <div class="pillar-score-fill" style="width: ${ps.percentage}%; background: ${p?.color || '#14B8A6'}"></div>
        </div>
        <div class="pillar-percentage" style="color: ${p?.color || '#14B8A6'}">${ps.percentage}%</div>
      </div>
    `
  }).join('')

  // Build recommendations HTML with structured sections
  const recommendationsHtml = recommendations.map((rec, i) => {
    // Determine investment badge color
    let investmentColor = '#64748B'
    let investmentBg = '#F1F5F9'
    if (rec.investment.toLowerCase().includes('free')) {
      investmentColor = '#16A34A'
      investmentBg = '#DCFCE7'
    } else if (rec.investment.toLowerCase().includes('under £100') || rec.investment.toLowerCase().includes('£100')) {
      investmentColor = '#2563EB'
      investmentBg = '#DBEAFE'
    } else if (rec.investment.toLowerCase().includes('premium') || rec.investment.toLowerCase().includes('£500')) {
      investmentColor = '#9333EA'
      investmentBg = '#F3E8FF'
    }

    return `
    <div class="recommendation-card">
      <div class="rec-number">${i + 1}</div>
      <div class="rec-content">
        <h4>${rec.title}</h4>

        <div class="rec-meta">
          <span class="rec-badge" style="background: ${investmentBg}; color: ${investmentColor};">
            💰 ${rec.investment || 'Investment TBD'}
          </span>
          <span class="rec-badge" style="background: #FEF3C7; color: #92400E;">
            ⏱️ ${rec.timeframe || 'Timeframe TBD'}
          </span>
        </div>

        ${rec.whatToDo ? `
        <div class="rec-section">
          <div class="rec-section-title">What to do:</div>
          <p>${rec.whatToDo.replace(/\n/g, ' ')}</p>
        </div>
        ` : ''}

        ${rec.whyItWorks ? `
        <div class="rec-section">
          <div class="rec-section-title">Why it works:</div>
          <p>${rec.whyItWorks.replace(/\n/g, ' ')}</p>
        </div>
        ` : ''}

        ${rec.expectedOutcome ? `
        <div class="rec-section outcome">
          <div class="rec-section-title">Expected outcome:</div>
          <p>${rec.expectedOutcome.replace(/\n/g, ' ')}</p>
        </div>
        ` : ''}
      </div>
    </div>
  `}).join('')

  const formatSection = (text: string) => {
    if (!text) return ''
    return text.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('')
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Growth Assessment Report | ${businessName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #0D9488;
      --primary-light: #14B8A6;
      --primary-dark: #0F766E;
      --coral: #FF6B6B;
      --gold: #F59E0B;
      --purple: #8B5CF6;
      --slate-900: #0F172A;
      --slate-700: #334155;
      --slate-600: #475569;
      --slate-400: #94A3B8;
      --slate-200: #E2E8F0;
      --slate-100: #F1F5F9;
      --slate-50: #F8FAFC;
      --zone-color: ${zone.color};
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.7;
      color: var(--slate-700);
      background: linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 100%);
      min-height: 100vh;
    }

    .report-container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15);
    }

    /* Hero Header */
    .hero-header {
      background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 50%, var(--primary-light) 100%);
      padding: 60px 48px 80px;
      position: relative;
      overflow: hidden;
    }

    .hero-header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 80%;
      height: 200%;
      background: radial-gradient(ellipse, rgba(255,255,255,0.1) 0%, transparent 70%);
      transform: rotate(-15deg);
    }

    .hero-header::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 40px;
      background: white;
      border-radius: 40px 40px 0 0;
    }

    .logo-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(10px);
      padding: 8px 16px;
      border-radius: 50px;
      color: white;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 24px;
      border: 1px solid rgba(255,255,255,0.2);
    }

    .hero-title {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 42px;
      font-weight: 800;
      color: white;
      margin-bottom: 8px;
      letter-spacing: -0.5px;
      position: relative;
    }

    .hero-subtitle {
      font-size: 20px;
      color: rgba(255,255,255,0.9);
      font-weight: 500;
      margin-bottom: 32px;
    }

    .hero-business {
      font-size: 16px;
      color: rgba(255,255,255,0.7);
      margin-bottom: 8px;
    }

    .hero-date {
      font-size: 14px;
      color: rgba(255,255,255,0.6);
    }

    /* Score Dashboard */
    .score-dashboard {
      display: grid;
      grid-template-columns: 1fr 1.5fr;
      gap: 32px;
      padding: 0 48px;
      margin-top: -40px;
      position: relative;
      z-index: 10;
    }

    .main-score-card {
      background: white;
      border-radius: 24px;
      padding: 32px;
      box-shadow: 0 20px 40px -12px rgba(0,0,0,0.1);
      border: 1px solid var(--slate-200);
      text-align: center;
    }

    .score-circle {
      width: 160px;
      height: 160px;
      margin: 0 auto 20px;
      position: relative;
    }

    .score-circle svg {
      transform: rotate(-90deg);
      width: 100%;
      height: 100%;
    }

    .score-circle .bg {
      fill: none;
      stroke: var(--slate-100);
      stroke-width: 12;
    }

    .score-circle .progress {
      fill: none;
      stroke: var(--zone-color);
      stroke-width: 12;
      stroke-linecap: round;
      stroke-dasharray: ${results.overallPercentage * 4.4} 440;
      filter: drop-shadow(0 4px 8px ${zone.color}40);
    }

    .score-value {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
    }

    .score-number {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 48px;
      font-weight: 800;
      color: var(--zone-color);
      line-height: 1;
    }

    .score-label {
      font-size: 14px;
      color: var(--slate-400);
      font-weight: 500;
    }

    .zone-badge {
      display: inline-block;
      background: ${zone.color}15;
      color: var(--zone-color);
      padding: 8px 20px;
      border-radius: 50px;
      font-weight: 600;
      font-size: 14px;
      border: 2px solid ${zone.color}30;
    }

    .pillars-card {
      background: white;
      border-radius: 24px;
      padding: 32px;
      box-shadow: 0 20px 40px -12px rgba(0,0,0,0.1);
      border: 1px solid var(--slate-200);
    }

    .pillars-title {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 18px;
      font-weight: 700;
      color: var(--slate-900);
      margin-bottom: 24px;
    }

    .pillar-card {
      margin-bottom: 20px;
      padding: 16px;
      border-radius: 12px;
      background: var(--slate-50);
      transition: all 0.2s;
    }

    .pillar-card.weakest {
      background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
      border: 2px solid var(--gold);
    }

    .pillar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .pillar-name {
      font-weight: 600;
      color: var(--slate-900);
    }

    .priority-badge {
      background: var(--coral);
      color: white;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 50px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .pillar-score-bar {
      height: 8px;
      background: rgba(0,0,0,0.1);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .pillar-score-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 1s ease-out;
    }

    .pillar-percentage {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 20px;
      font-weight: 700;
      text-align: right;
    }

    /* Content Sections */
    .content-area {
      padding: 48px;
    }

    .section {
      margin-bottom: 48px;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .section-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      flex-shrink: 0;
    }

    .section-icon.teal { background: linear-gradient(135deg, var(--primary-light), var(--primary)); }
    .section-icon.coral { background: linear-gradient(135deg, #FF8F8F, var(--coral)); }
    .section-icon.purple { background: linear-gradient(135deg, #A78BFA, var(--purple)); }
    .section-icon.gold { background: linear-gradient(135deg, #FCD34D, var(--gold)); }

    .section-title {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 24px;
      font-weight: 700;
      color: var(--slate-900);
    }

    .section p {
      margin-bottom: 16px;
      font-size: 16px;
      color: var(--slate-600);
    }

    /* Recommendations */
    .recommendations-grid {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .recommendation-card {
      display: flex;
      gap: 20px;
      padding: 24px;
      background: linear-gradient(135deg, var(--slate-50) 0%, white 100%);
      border-radius: 16px;
      border: 1px solid var(--slate-200);
      transition: all 0.3s;
    }

    .recommendation-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 24px -8px rgba(0,0,0,0.1);
      border-color: var(--primary-light);
    }

    .rec-number {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: white;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 700;
      font-size: 18px;
      flex-shrink: 0;
    }

    .rec-content h4 {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 17px;
      font-weight: 700;
      color: var(--slate-900);
      margin-bottom: 12px;
    }

    .rec-content p {
      font-size: 15px;
      color: var(--slate-600);
      margin-bottom: 0;
      line-height: 1.6;
    }

    .rec-meta {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }

    .rec-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
    }

    .rec-section {
      margin-bottom: 14px;
      padding: 12px 16px;
      background: var(--slate-50);
      border-radius: 10px;
      border-left: 3px solid var(--primary-light);
    }

    .rec-section.outcome {
      background: #ECFDF5;
      border-left-color: #10B981;
    }

    .rec-section-title {
      font-size: 12px;
      font-weight: 700;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }

    .rec-section.outcome .rec-section-title {
      color: #059669;
    }

    .rec-section p {
      margin: 0;
      font-size: 14px;
    }

    /* Benchmarks */
    .benchmarks-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-top: 24px;
    }

    @media (max-width: 900px) {
      .benchmarks-grid { grid-template-columns: repeat(2, 1fr); }
    }

    .benchmark-card {
      background: var(--slate-50);
      border-radius: 12px;
      padding: 20px;
      border: 1px solid var(--slate-200);
    }

    .benchmark-label {
      font-size: 13px;
      color: var(--slate-400);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .benchmark-value {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 24px;
      font-weight: 700;
      color: var(--primary);
    }

    .benchmark-source {
      font-size: 11px;
      color: var(--slate-400);
      margin-top: 4px;
    }

    /* CTA Footer */
    .cta-footer {
      background: linear-gradient(135deg, var(--slate-900) 0%, #1E293B 100%);
      padding: 48px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .cta-footer::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }

    .cta-content {
      position: relative;
      z-index: 1;
    }

    .cta-badge {
      display: inline-block;
      background: var(--gold);
      color: var(--slate-900);
      font-size: 12px;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: 50px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 20px;
    }

    .cta-title {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 28px;
      font-weight: 700;
      color: white;
      margin-bottom: 12px;
    }

    .cta-text {
      color: var(--slate-400);
      font-size: 16px;
      margin-bottom: 28px;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }

    .cta-button {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 100%);
      color: white;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 700;
      font-size: 18px;
      padding: 18px 36px;
      border-radius: 14px;
      text-decoration: none;
      box-shadow: 0 8px 24px -4px rgba(20, 184, 166, 0.4);
      transition: all 0.3s;
    }

    .cta-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 32px -4px rgba(20, 184, 166, 0.5);
    }

    .footer-note {
      margin-top: 24px;
      color: var(--slate-400);
      font-size: 13px;
    }

    /* Print styles */
    @media print {
      .cta-footer { display: none; }
      .report-container { box-shadow: none; }
      .recommendation-card:hover { transform: none; box-shadow: none; }
    }

    @media (max-width: 768px) {
      .hero-header { padding: 40px 24px 60px; }
      .hero-title { font-size: 28px; }
      .score-dashboard { grid-template-columns: 1fr; padding: 0 24px; }
      .content-area { padding: 32px 24px; }
      .benchmarks-grid { grid-template-columns: 1fr; }
      .section-title { font-size: 20px; }
    }
  </style>
</head>
<body>
  <div class="report-container">
    <!-- Hero Header -->
    <header class="hero-header">
      <div class="logo-badge">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        Quentin Hunter
      </div>
      <h1 class="hero-title">Growth Assessment Report</h1>
      <p class="hero-subtitle">Your Personalised Roadmap to Business Growth</p>
      <p class="hero-business">Prepared for: ${businessName}</p>
      <p class="hero-date">Generated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    </header>

    <!-- Score Dashboard -->
    <div class="score-dashboard">
      <div class="main-score-card">
        <div class="score-circle">
          <svg viewBox="0 0 160 160">
            <circle class="bg" cx="80" cy="80" r="70"/>
            <circle class="progress" cx="80" cy="80" r="70"/>
          </svg>
          <div class="score-value">
            <div class="score-number">${results.overallPercentage}%</div>
            <div class="score-label">Overall Score</div>
          </div>
        </div>
        <div class="zone-badge">${zone.label}</div>
      </div>

      <div class="pillars-card">
        <h3 class="pillars-title">Your Growth Pillars</h3>
        ${pillarScoresHtml}
      </div>
    </div>

    <!-- Content Area -->
    <div class="content-area">
      <!-- Executive Summary -->
      <div class="section">
        <div class="section-header">
          <div class="section-icon teal">📋</div>
          <h2 class="section-title">Executive Summary</h2>
        </div>
        ${formatSection(sections['EXECUTIVE SUMMARY'] || '')}
      </div>

      <!-- Understanding Your Score -->
      <div class="section">
        <div class="section-header">
          <div class="section-icon purple">📊</div>
          <h2 class="section-title">Understanding Your Score</h2>
        </div>
        ${formatSection(sections['UNDERSTANDING YOUR SCORE'] || '')}
      </div>

      <!-- Primary Constraint -->
      <div class="section">
        <div class="section-header">
          <div class="section-icon coral">🎯</div>
          <h2 class="section-title">Your Primary Growth Constraint</h2>
        </div>
        ${formatSection(sections[`YOUR PRIMARY GROWTH CONSTRAINT - ${weakestPillar.name.toUpperCase()}`] || sections['YOUR PRIMARY GROWTH CONSTRAINT'] || '')}
      </div>

      <!-- Action Plan -->
      <div class="section">
        <div class="section-header">
          <div class="section-icon gold">🚀</div>
          <h2 class="section-title">Your Personalised Action Plan</h2>
        </div>
        <div class="recommendations-grid">
          ${recommendationsHtml || '<p>Your personalised recommendations are being prepared.</p>'}
        </div>
      </div>

      <!-- Benchmarks -->
      <div class="section">
        <div class="section-header">
          <div class="section-icon teal">📈</div>
          <h2 class="section-title">Business Growth Benchmarks</h2>
        </div>
        ${formatSection(sections["BUSINESS GROWTH BENCHMARKS"] || sections['UK INDUSTRY BENCHMARKS'] || '')}
        <div class="benchmarks-grid">
          <div class="benchmark-card">
            <div class="benchmark-label">Lead → Customer</div>
            <div class="benchmark-value">2-5%</div>
            <div class="benchmark-source">Top performers: 10%+</div>
          </div>
          <div class="benchmark-card">
            <div class="benchmark-label">Customer LTV</div>
            <div class="benchmark-value">3-5x</div>
            <div class="benchmark-source">Initial purchase value</div>
          </div>
          <div class="benchmark-card">
            <div class="benchmark-label">Annual Retention</div>
            <div class="benchmark-value">85-95%</div>
            <div class="benchmark-source">Target rate</div>
          </div>
          <div class="benchmark-card">
            <div class="benchmark-label">Referral Rate</div>
            <div class="benchmark-value">10-25%</div>
            <div class="benchmark-source">When asked directly</div>
          </div>
          <div class="benchmark-card">
            <div class="benchmark-label">Cost per Lead</div>
            <div class="benchmark-value">£20-£100</div>
            <div class="benchmark-source">Varies by industry</div>
          </div>
          <div class="benchmark-card">
            <div class="benchmark-label">Email Opens</div>
            <div class="benchmark-value">20-35%</div>
            <div class="benchmark-source">B2B average</div>
          </div>
          <div class="benchmark-card">
            <div class="benchmark-label">Website Conversion</div>
            <div class="benchmark-value">2-5%</div>
            <div class="benchmark-source">Of visitors</div>
          </div>
          <div class="benchmark-card">
            <div class="benchmark-label">NPS Target</div>
            <div class="benchmark-value">30-50+</div>
            <div class="benchmark-source">Excellent: 70+</div>
          </div>
        </div>
      </div>

      <!-- Next Steps -->
      <div class="section">
        <div class="section-header">
          <div class="section-icon purple">✨</div>
          <h2 class="section-title">Your Next Steps</h2>
        </div>
        ${formatSection(sections['YOUR NEXT STEPS'] || '')}
      </div>
    </div>

    <!-- CTA Footer -->
    <footer class="cta-footer">
      <div class="cta-content">
        <div class="cta-badge">Free Strategy Session</div>
        <h3 class="cta-title">Ready to Accelerate Your Growth?</h3>
        <p class="cta-text">Book a complimentary 30-minute strategy call with Quentin Hunter to discuss your results and create a prioritised action plan for your business.</p>
        <a href="https://link.quentinhunter.com/widget/booking/jBnz1S30qIJMi0enyxVK" class="cta-button">
          Book Your Free Call
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
        <p class="footer-note">No obligation • Expert guidance • Tailored to your business</p>
      </div>
    </footer>
  </div>
</body>
</html>`
}

// Send admin notification when report is purchased
async function sendAdminReportNotification(data: {
  businessName: string
  email: string
  reportUrl: string | null
  results: { overallPercentage: number; pillarScores: Array<{ pillar: string; percentage: number }> }
  zone: { label: string; color: string }
  weakestPillar: { name: string; color: string }
}) {
  const { businessName, email, reportUrl, results, zone, weakestPillar } = data

  const pillarScoresHtml = results.pillarScores
    .map(ps => {
      const pillar = PILLARS[ps.pillar] || { name: ps.pillar }
      return `<li><strong>${pillar.name}:</strong> ${ps.percentage}%</li>`
    })
    .join('')

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0d9488;">AI Report Purchased</h2>

      <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin-top: 0; color: #065f46;">Customer Details</h3>
        <p><strong>Business:</strong> ${businessName}</p>
        <p><strong>Email:</strong> ${email}</p>
      </div>

      <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin-top: 0; color: #334155;">Quiz Results</h3>
        <p><strong>Overall Score:</strong> ${results.overallPercentage}%</p>
        <p><strong>Zone:</strong> ${zone.label}</p>
        <p><strong>Weakest Pillar:</strong> ${weakestPillar.name}</p>
        <h4>Pillar Scores:</h4>
        <ul>${pillarScoresHtml}</ul>
      </div>

      ${reportUrl ? `
      <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin-top: 0; color: #92400e;">View Report</h3>
        <p><a href="${reportUrl}" style="color: #0d9488; font-weight: bold;">Click here to view the full AI report</a></p>
      </div>
      ` : ''}

      <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">
        This customer has paid for the Growth Assessment Report.
      </p>
    </div>
  `

  await sendEmail({
    to: 'info@quentinhunter.com',
    subject: `Report Purchased: ${businessName} - ${email}`,
    html
  })
}
