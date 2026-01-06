'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { PILLARS, ZONES } from '@/lib/quiz-config'
import { type QuizResult, getZoneInfo, getPillarInfo } from '@/lib/quiz-scoring'

interface LeadData {
  firstName: string
  lastName: string
  email: string
  companyName: string
  businessInfo: string
}

export default function QuizResultsPage() {
  const [results, setResults] = useState<QuizResult | null>(null)
  const [leadData, setLeadData] = useState<LeadData>({
    firstName: '',
    lastName: '',
    email: '',
    companyName: '',
    businessInfo: ''
  })
  const [hasSubmittedDetails, setHasSubmittedDetails] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [reportError, setReportError] = useState('')
  const [leadId, setLeadId] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('quizResults')
    if (stored) {
      setResults(JSON.parse(stored))
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setLeadData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const isFormValid = leadData.firstName && leadData.lastName && leadData.email && leadData.companyName

  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid || !results) return

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/quiz/save-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...leadData,
          results
        })
      })

      const data = await response.json()
      if (data.success && data.leadId) {
        setLeadId(data.leadId)
      }
      setHasSubmittedDetails(true)
    } catch (error) {
      console.error('Failed to save lead:', error)
      setHasSubmittedDetails(true) // Still show results even if save fails
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePurchaseReport = async () => {
    if (!results || !leadId) return

    setIsGeneratingReport(true)
    setReportError('')

    try {
      const response = await fetch('/api/quiz/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          email: leadData.email,
          name: `${leadData.firstName} ${leadData.lastName}`
        })
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        setReportError(data.error || 'Failed to create checkout. Please try again.')
      }
    } catch (error) {
      setReportError('Network error. Please check your connection and try again.')
    } finally {
      setIsGeneratingReport(false)
    }
  }

  // Loading state
  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-600">Loading your results...</p>
        </div>
      </div>
    )
  }

  const zoneInfo = getZoneInfo(results.zone)
  const weakestPillarInfo = getPillarInfo(results.weakestPillar)
  const weakestScore = results.pillarScores.find(p => p.pillar === results.weakestPillar)

  const radarData = results.pillarScores.map(ps => ({
    pillar: PILLARS[ps.pillar].name,
    score: ps.percentage,
    fullMark: 100
  }))

  // GATE: Show email capture form BEFORE any results
  if (!hasSubmittedDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="font-bold text-teal-600 text-lg text-center">Quentin Hunter Growth Assessment</div>
          </div>
        </header>

        <main className="max-w-xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-8"
          >
            {/* Success checkmark */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Assessment Complete!</h1>
              <p className="text-slate-600">
                Your results are ready. Enter your details below to unlock your personalised growth score and recommendations.
              </p>
            </div>

            {/* Teaser */}
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-4 mb-8 border border-teal-100">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🎯</div>
                <div>
                  <p className="font-semibold text-slate-900">Your results include:</p>
                  <p className="text-sm text-slate-600">Overall growth score, pillar breakdown, biggest bottleneck, and action steps</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitDetails} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={leadData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={leadData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all"
                    placeholder="Smith"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={leadData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all"
                  placeholder="john@yourbusiness.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Business Name or Website *</label>
                <input
                  type="text"
                  name="companyName"
                  required
                  value={leadData.companyName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all"
                  placeholder="Your Business Ltd"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">About Your Business & Growth Challenges</label>
                <textarea
                  name="businessInfo"
                  value={leadData.businessInfo}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all resize-none"
                  placeholder="Tell us about your business, what you offer, and any growth challenges you're facing..."
                />
                <p className="text-xs text-slate-500 mt-1">
                  The more detail you provide, the more personalised and accurate your report will be.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                className="w-full bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-bold py-4 px-8 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/30"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Unlock My Results →'
                )}
              </button>

              <p className="text-xs text-slate-400 text-center mt-4">
                Your data is secure and never shared. We'll only contact you about your results.
              </p>
            </form>
          </motion.div>
        </main>
      </div>
    )
  }

  // RESULTS PAGE - Only shown after email submission
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 pb-16">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="font-bold text-teal-600 text-lg text-center">Quentin Hunter Growth Assessment</div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Welcome message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-slate-600 mb-8"
        >
          Hi {leadData.firstName}, here are your results for <strong>{leadData.companyName}</strong>
        </motion.p>

        {/* Score Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-12"
        >
          <div className="inline-block relative">
            <svg className="w-48 h-48" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="45" fill="none"
                stroke={zoneInfo.color} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${results.overallPercentage * 2.83} 283`}
                transform="rotate(-90 50 50)"
                initial={{ strokeDasharray: "0 283" }}
                animate={{ strokeDasharray: `${results.overallPercentage * 2.83} 283` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                className="text-5xl font-bold"
                style={{ color: zoneInfo.color }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {results.overallPercentage}%
              </motion.span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div
              className="inline-block px-6 py-2 rounded-full text-lg font-bold text-white mb-4"
              style={{ backgroundColor: zoneInfo.color }}
            >
              {zoneInfo.label}
            </div>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {zoneInfo.description}
            </p>
          </motion.div>
        </motion.div>

        {/* Assessment Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-3xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Assessment Complete</h2>
          <p className="text-lg text-slate-600 mb-4">
            Based on your answers, you received a score of <strong>{results.overallPercentage}%</strong>,
            placing you in the <strong style={{ color: zoneInfo.color }}>{zoneInfo.label}</strong>.
          </p>
          <div
            className="p-4 rounded-xl border-l-4"
            style={{ borderLeftColor: weakestPillarInfo.color, backgroundColor: `${weakestPillarInfo.color}10` }}
          >
            <p className="text-slate-700">
              <strong>Your {weakestPillarInfo.name} pillar scored {weakestScore?.percentage}%.</strong>{' '}
              This is where you'll see the biggest impact from focused improvements.
            </p>
          </div>
        </motion.div>

        {/* Dual CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="grid md:grid-cols-2 gap-6 mb-8"
        >
          {/* Free Call CTA */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-teal-600 relative">
            <div className="absolute -top-3 left-6 bg-teal-600 text-white px-4 py-1 rounded-full text-sm font-bold">
              RECOMMENDED
            </div>
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Book Free Strategy Call</h3>
            <p className="text-slate-600 mb-6">
              Get personalised advice in a 30-minute call. We'll review your results, identify quick wins, and create a tailored action plan for your business.
            </p>
            <ul className="space-y-3 mb-6">
              {[
                '30-minute personalised consultation',
                'Custom action plan for your business',
                'Expert guidance on your biggest bottleneck',
                'No obligation, just practical advice'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-700">
                  <svg className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <div className="text-2xl font-bold text-teal-600 mb-4">FREE <span className="text-sm font-normal text-slate-500">(Worth £250)</span></div>
            <a
              href="https://link.quentinhunter.com/widget/booking/jBnz1S30qIJMi0enyxVK"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 px-8 rounded-xl text-center transition-all"
            >
              Book My Free Call
            </a>
          </div>

          {/* £7 Report CTA */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Get Detailed Report</h3>
            <p className="text-slate-600 mb-4">
              Get an AI-powered report with personalised recommendations based on your specific quiz answers and business situation.
            </p>
            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-slate-600 italic">
                <strong>Why this works:</strong> This isn't generic advice. The AI analyses your specific answers to provide actionable recommendations tailored to your current stage and challenges.
              </p>
            </div>
            <ul className="space-y-3 mb-6">
              {[
                '8-10 tailored solution options',
                'Personalised to your quiz answers',
                'Industry benchmarks included',
                'Instant download, implement today'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-700">
                  <svg className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <div className="text-2xl font-bold text-slate-900 mb-4">£7 <span className="text-sm font-normal text-slate-500">One-time payment</span></div>
            <button
              onClick={handlePurchaseReport}
              disabled={isGeneratingReport}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-8 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingReport ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                'Get My Report - £7'
              )}
            </button>
            {reportError && (
              <p className="text-red-500 text-sm mt-2 text-center">{reportError}</p>
            )}
          </div>
        </motion.div>

        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="bg-white rounded-3xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Your Growth Profile</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="pillar" tick={{ fill: '#64748b', fontSize: 14 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8' }} />
                <Radar name="Score" dataKey="score" stroke="#14B8A6" fill="#14B8A6" fillOpacity={0.3} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pillar Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Pillar Breakdown</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {results.pillarScores.map((ps) => {
              const pillar = PILLARS[ps.pillar]
              const isWeakest = ps.pillar === results.weakestPillar
              return (
                <div
                  key={ps.pillar}
                  className={`bg-white rounded-2xl shadow-lg p-6 border-t-4 relative ${isWeakest ? 'ring-2 ring-red-400' : ''}`}
                  style={{ borderTopColor: pillar.color }}
                >
                  {isWeakest && (
                    <div className="absolute -top-3 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      PRIORITY
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{pillar.icon}</span>
                    <h3 className="text-xl font-bold text-slate-900">{pillar.name}</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">{pillar.description}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: pillar.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${ps.percentage}%` }}
                        transition={{ duration: 0.8, delay: 1.7 }}
                      />
                    </div>
                    <span className="text-lg font-bold" style={{ color: pillar.color }}>
                      {ps.percentage}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
