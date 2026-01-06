// Quiz Scoring Logic
import { QUESTIONS, PILLARS, ZONES, type Pillar, type Zone } from './quiz-config'

export interface PillarScore {
  pillar: Pillar
  score: number
  maxScore: number
  percentage: number
}

export interface QuizResult {
  overallScore: number
  overallMaxScore: number
  overallPercentage: number
  zone: Zone
  weakestPillar: Pillar
  pillarScores: PillarScore[]
  answers: Record<string, string>
}

export function calculateScores(answers: Record<string, string>): QuizResult {
  const pillarScores: Record<Pillar, { score: number; maxScore: number }> = {
    ATTRACT: { score: 0, maxScore: 0 },
    CONVERT: { score: 0, maxScore: 0 },
    ASCEND: { score: 0, maxScore: 0 },
    ACCELERATE: { score: 0, maxScore: 0 }
  }

  // Calculate scores for each question
  for (const question of QUESTIONS) {
    const answer = answers[question.id]
    const option = question.options.find(o => o.id === answer)
    const maxOption = question.options.reduce((max, o) => o.points > max.points ? o : max, question.options[0])

    pillarScores[question.pillar].maxScore += maxOption.points
    if (option) {
      pillarScores[question.pillar].score += option.points
    }
  }

  // Calculate percentages for each pillar
  const pillarResults: PillarScore[] = (Object.keys(pillarScores) as Pillar[]).map(pillar => {
    const { score, maxScore } = pillarScores[pillar]
    return {
      pillar,
      score,
      maxScore,
      percentage: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
    }
  })

  // Calculate overall score
  const overallScore = pillarResults.reduce((sum, p) => sum + p.score, 0)
  const overallMaxScore = pillarResults.reduce((sum, p) => sum + p.maxScore, 0)
  const overallPercentage = overallMaxScore > 0 ? Math.round((overallScore / overallMaxScore) * 100) : 0

  // Determine zone
  let zone: Zone = 'CONSTRAINT'
  if (overallPercentage <= ZONES.DANGER.max) {
    zone = 'DANGER'
  } else if (overallPercentage >= ZONES.GROWTH.min) {
    zone = 'GROWTH'
  }

  // Find weakest pillar
  const weakestPillar = pillarResults.reduce((weakest, current) =>
    current.percentage < weakest.percentage ? current : weakest
  ).pillar

  return {
    overallScore,
    overallMaxScore,
    overallPercentage,
    zone,
    weakestPillar,
    pillarScores: pillarResults,
    answers
  }
}

export function getZoneInfo(zone: Zone) {
  return ZONES[zone]
}

export function getPillarInfo(pillar: Pillar) {
  return PILLARS[pillar]
}
