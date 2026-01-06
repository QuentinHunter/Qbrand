'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { PILLARS } from '@/lib/quiz-config'

export default function QuizLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
      {/* Header Banner */}
      <div className="bg-teal-600 text-white py-3 text-center">
        <div className="flex items-center justify-center gap-3">
          <span className="font-medium">Free Growth Assessment for Business Owners</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-4 leading-tight">
            Your Business Could Be Thriving. Here's What's In The Way.
          </h1>
          <p className="text-2xl md:text-3xl font-semibold text-teal-600 mb-6">
            Find your #1 growth bottleneck in 5 minutes.
          </p>
          <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Most businesses have hidden bottlenecks holding back their growth. The problem isn't your product or service... it's your systems.
          </p>
          <Link href="/growthquiz/questions">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white font-bold text-xl py-5 px-10 rounded-2xl shadow-xl shadow-coral-500/30 transition-all"
              style={{ background: 'linear-gradient(to right, #0d9488, #0f766e)' }}
            >
              Get My Free Growth Score Now
            </motion.button>
          </Link>
          <div className="flex items-center justify-center gap-6 mt-6 text-slate-500">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              5 minutes
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              100% free
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              Instant results
            </span>
          </div>
        </motion.div>
      </section>

      {/* Why Take This Assessment */}
      <section className="bg-slate-900 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Why Take This Assessment?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🎯',
                title: 'Identify Your Biggest Bottleneck',
                description: 'Most business owners focus on the wrong things. This assessment pinpoints exactly where to focus your energy for maximum impact.'
              },
              {
                icon: '📊',
                title: 'Get Your Growth Score',
                description: 'See how your business performs across 4 critical pillars: Attract, Convert, Ascend, and Accelerate.'
              },
              {
                icon: '💡',
                title: 'Actionable Recommendations',
                description: 'Walk away with specific, practical steps you can implement immediately to start growing your revenue.'
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 text-center"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-slate-300">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What You'll Discover */}
      <section className="py-16 max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
          What You'll Discover
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: '📊', title: 'Your Exact Growth Score', desc: 'See how your business stacks up across 4 critical pillars' },
            { icon: '🔍', title: 'Your #1 Bottleneck Revealed', desc: 'Identify the single biggest constraint holding you back' },
            { icon: '💡', title: '8-10 Actionable Solutions', desc: 'Get specific, practical recommendations tailored to you' },
            { icon: '📈', title: 'Industry Benchmarks & Data', desc: 'Compare your performance against successful businesses' }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-slate-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            How It Works
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            {[
              { num: '1', title: 'Answer 16 Questions', desc: '5 minutes of your time' },
              { num: '2', title: 'Get Your Score', desc: 'Instant results' },
              { num: '3', title: 'Take Action', desc: 'Free call or detailed report' }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-teal-600 text-white text-2xl font-bold flex items-center justify-center mb-4">
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">{step.title}</h3>
                <p className="text-slate-600">{step.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block w-16 h-0.5 bg-slate-300 mt-8 ml-32 -mr-16" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Four Pillars */}
      <section className="py-16 max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">
          The 4 Pillars of Growth
        </h2>
        <p className="text-xl text-slate-600 text-center mb-12 max-w-2xl mx-auto">
          Every successful business excels in these four areas
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(Object.values(PILLARS)).map((pillar, i) => (
            <motion.div
              key={pillar.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-6 shadow-lg border-t-4"
              style={{ borderTopColor: pillar.color }}
            >
              <div className="text-4xl mb-4">{pillar.icon}</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{pillar.name}</h3>
              <p className="text-slate-600 text-sm">{pillar.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-slate-900 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-block bg-teal-600 text-white px-4 py-1 rounded-full text-sm font-medium mb-6">
            LIMITED TIME: Free Strategy Call Worth £250
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Stop Guessing. Start Growing.
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400 mb-8">
            <span>500+ Businesses Assessed</span>
            <span>•</span>
            <span>£2.8M+ Revenue Unlocked</span>
            <span>•</span>
            <span>4.9/5 Average Rating</span>
          </div>
          <Link href="/growthquiz/questions">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="text-white font-bold text-xl py-5 px-10 rounded-2xl shadow-xl transition-all"
              style={{ background: 'linear-gradient(to right, #0d9488, #0f766e)' }}
            >
              Get My Free Growth Score Now
            </motion.button>
          </Link>
          <p className="text-slate-500 mt-6 flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Your data is secure and never shared
          </p>
        </div>
      </section>
    </div>
  )
}
