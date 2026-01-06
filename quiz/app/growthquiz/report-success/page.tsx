'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'

function ReportSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  const [status, setStatus] = useState<'loading' | 'generating' | 'success' | 'error'>('loading')
  const [reportUrl, setReportUrl] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!sessionId) {
      setStatus('error')
      setErrorMessage('No session ID found')
      return
    }

    generateReport()
  }, [sessionId])

  const generateReport = async () => {
    setStatus('generating')

    try {
      // Get results from localStorage
      const storedResults = localStorage.getItem('quizResults')
      if (!storedResults) {
        throw new Error('Quiz results not found')
      }

      const results = JSON.parse(storedResults)

      // Verify payment and get customer info
      const verifyResponse = await fetch('/api/quiz/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      })

      const verifyData = await verifyResponse.json()

      if (!verifyData.success) {
        throw new Error(verifyData.error || 'Payment verification failed')
      }

      // Generate the report (pass leadId to save it)
      const reportResponse = await fetch('/api/quiz/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          results,
          name: verifyData.customerName || 'Your Business',
          email: verifyData.customerEmail,
          leadId: verifyData.leadId
        })
      })

      const reportData = await reportResponse.json()

      if (!reportData.success || !reportData.htmlReport) {
        throw new Error('Failed to generate report')
      }

      // Use the permanent report URL if available, otherwise create blob
      let url: string
      if (reportData.reportUrl) {
        url = reportData.reportUrl
      } else {
        const blob = new Blob([reportData.htmlReport], { type: 'text/html' })
        url = URL.createObjectURL(blob)
      }
      setReportUrl(url)
      setStatus('success')

      // Auto-open the report
      window.open(url, '_blank')

      // Start the follow-up email sequence via Resend
      if (verifyData.leadId && reportData.reportUrl) {
        fetch('/api/quiz/follow-up-sequence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadId: verifyData.leadId,
            reportUrl: reportData.reportUrl
          })
        }).catch(err => console.error('Failed to start email sequence:', err))
      }

    } catch (error) {
      console.error('Report generation error:', error)
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to generate report')
    }
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl p-8 text-center"
      >
        {/* Loading */}
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Verifying Payment...</h1>
            <p className="text-slate-600">Please wait while we confirm your purchase.</p>
          </>
        )}

        {/* Generating */}
        {status === 'generating' && (
          <>
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-teal-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Generating Your Report...</h1>
            <p className="text-slate-600 mb-4">Our AI is creating your personalised growth report. This takes about 30 seconds.</p>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div className="bg-teal-600 h-full rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </>
        )}

        {/* Success */}
        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Your Report is Ready!</h1>
            <p className="text-slate-600 mb-6">Your personalised Growth Assessment Report has been generated.</p>

            <div className="space-y-4">
              {reportUrl && (
                <a
                  href={reportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 px-8 rounded-xl transition-all"
                >
                  Open Report →
                </a>
              )}

              <Link
                href="/growthquiz/results"
                className="block w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-8 rounded-xl transition-all"
              >
                Back to Results
              </Link>
            </div>

            <div className="mt-8 p-4 bg-teal-50 rounded-xl border border-teal-100">
              <p className="text-sm text-teal-800">
                <strong>Tip:</strong> Save your report to your device for future reference. You can also print it as a PDF.
              </p>
            </div>
          </>
        )}

        {/* Error */}
        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Something Went Wrong</h1>
            <p className="text-slate-600 mb-2">{errorMessage}</p>
            <p className="text-slate-500 text-sm mb-6">Don't worry - if you've paid, we'll send your report via email.</p>

            <div className="space-y-4">
              <button
                onClick={generateReport}
                className="block w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 px-8 rounded-xl transition-all"
              >
                Try Again
              </button>

              <Link
                href="/growthquiz/results"
                className="block w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-8 rounded-xl transition-all"
              >
                Back to Results
              </Link>
            </div>
          </>
        )}
      </motion.div>

      {/* Support note */}
      <p className="text-center text-slate-400 text-sm mt-8">
        Need help? Contact us at info@quentinhunter.com
      </p>
    </main>
  )
}

export default function ReportSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="font-bold text-teal-600 text-lg text-center">Quentin Hunter Growth Assessment</div>
        </div>
      </header>

      <Suspense fallback={
        <main className="max-w-xl mx-auto px-4 py-16">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Loading...</h1>
          </div>
        </main>
      }>
        <ReportSuccessContent />
      </Suspense>
    </div>
  )
}
