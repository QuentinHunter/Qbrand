'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { QUESTIONS, PILLARS } from '@/lib/quiz-config'
import { calculateScores } from '@/lib/quiz-scoring'

export default function QuizQuestionsPage() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [direction, setDirection] = useState(1) // 1 = forward, -1 = backward

  const currentQuestion = QUESTIONS[currentIndex]
  const pillarInfo = PILLARS[currentQuestion.pillar]
  const progress = ((currentIndex + 1) / QUESTIONS.length) * 100

  const handleSelectOption = (optionId: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionId }))

    // Auto-advance after 300ms
    setTimeout(() => {
      if (currentIndex < QUESTIONS.length - 1) {
        setDirection(1)
        setCurrentIndex(prev => prev + 1)
      } else {
        // Quiz complete - calculate and store results
        const finalAnswers = { ...answers, [currentQuestion.id]: optionId }
        const results = calculateScores(finalAnswers)
        localStorage.setItem('quizResults', JSON.stringify(results))
        router.push('/growthquiz/results')
      }
    }, 300)
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setDirection(-1)
      setCurrentIndex(prev => prev - 1)
    }
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-bold text-teal-600 text-lg">Quentin Hunter</div>
            <div className="text-slate-600 text-sm">
              Question {currentIndex + 1} of {QUESTIONS.length}
            </div>
            <div className="text-slate-600 text-sm font-medium">
              {Math.round(progress)}% Complete
            </div>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-teal-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </header>

      {/* Question Area */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {/* Pillar Badge */}
            <div
              className="inline-block px-4 py-2 rounded-full text-sm font-semibold text-white mb-6"
              style={{ backgroundColor: pillarInfo.color }}
            >
              {pillarInfo.icon} {pillarInfo.name.toUpperCase()} PILLAR
            </div>

            {/* Question Text */}
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 leading-relaxed">
              {currentQuestion.text}
            </h2>

            {/* Answer Options */}
            <div className="space-y-4">
              {currentQuestion.options.map((option) => {
                const isSelected = answers[currentQuestion.id] === option.id
                return (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleSelectOption(option.id)}
                    className={`w-full flex items-center gap-4 p-6 rounded-2xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50 shadow-lg'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'border-teal-600 bg-teal-600'
                          : 'border-slate-300'
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-lg font-medium ${isSelected ? 'text-teal-900' : 'text-slate-700'}`}>
                      {option.label}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              currentIndex === 0
                ? 'text-slate-300 cursor-not-allowed'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
          <span className="text-slate-400 text-sm">
            {answers[currentQuestion.id] ? 'Advancing...' : 'Select an option to continue'}
          </span>
        </div>
      </footer>
    </div>
  )
}
