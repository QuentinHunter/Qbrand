// Growth Score Quiz Configuration
// Rebranded for Quentin Hunter - General Business Audience

export type QuestionType = 'TRI_STATE' | 'BOOLEAN'
export type Pillar = 'ATTRACT' | 'CONVERT' | 'ASCEND' | 'ACCELERATE'
export type Zone = 'DANGER' | 'CONSTRAINT' | 'GROWTH'

export interface Option {
  id: string
  label: string
  points: number
}

export interface Question {
  id: string
  pillar: Pillar
  type: QuestionType
  text: string
  options: Option[]
}

export interface PillarInfo {
  id: Pillar
  name: string
  description: string
  color: string
  icon: string
}

export const PILLARS: Record<Pillar, PillarInfo> = {
  ATTRACT: {
    id: 'ATTRACT',
    name: 'Attract',
    description: 'How effectively you attract ideal prospects to discover your business',
    color: '#14B8A6', // teal
    icon: '🎯'
  },
  CONVERT: {
    id: 'CONVERT',
    name: 'Convert',
    description: 'How well you convert interested prospects into paying customers',
    color: '#8B5CF6', // purple
    icon: '💫'
  },
  ASCEND: {
    id: 'ASCEND',
    name: 'Ascend',
    description: 'How successfully you retain customers, increase lifetime value, and generate referrals',
    color: '#F59E0B', // amber
    icon: '📈'
  },
  ACCELERATE: {
    id: 'ACCELERATE',
    name: 'Accelerate',
    description: 'How well your operations, systems, and team support sustainable growth',
    color: '#EC4899', // pink
    icon: '🚀'
  }
}

// TRI_STATE: Yes (3), Maybe (1), No (0)
// BOOLEAN: True (1), False (0)

const TRI_STATE_OPTIONS: Option[] = [
  { id: 'yes', label: 'Yes', points: 3 },
  { id: 'maybe', label: 'Maybe / Partially', points: 1 },
  { id: 'no', label: 'No', points: 0 }
]

const BOOLEAN_OPTIONS: Option[] = [
  { id: 'true', label: 'True', points: 1 },
  { id: 'false', label: 'False', points: 0 }
]

export const QUESTIONS: Question[] = [
  // ATTRACT Pillar (Q1-Q4)
  {
    id: 'attract-1',
    pillar: 'ATTRACT',
    type: 'TRI_STATE',
    text: 'We have a documented profile of our ideal customer that outlines their demographics, pain points, goals, and how/why they choose one provider over another.',
    options: TRI_STATE_OPTIONS
  },
  {
    id: 'attract-2',
    pillar: 'ATTRACT',
    type: 'TRI_STATE',
    text: 'Our marketing is diversified across at least three channels (e.g., social media, content marketing, partnerships, paid ads, referrals, SEO) with no single channel representing more than 50% of our enquiries.',
    options: TRI_STATE_OPTIONS
  },
  {
    id: 'attract-3',
    pillar: 'ATTRACT',
    type: 'TRI_STATE',
    text: 'We have a system for producing valuable content on a regular basis (blog posts, case studies, videos, testimonials) and publishing it across multiple platforms (website, LinkedIn, email, etc).',
    options: TRI_STATE_OPTIONS
  },
  {
    id: 'attract-4',
    pillar: 'ATTRACT',
    type: 'BOOLEAN',
    text: 'Attracting new prospects is NOT a bottleneck to growth. We have all the enquiries we could ever need.',
    options: BOOLEAN_OPTIONS
  },

  // CONVERT Pillar (Q5-Q8)
  {
    id: 'convert-1',
    pillar: 'CONVERT',
    type: 'TRI_STATE',
    text: 'Our value proposition is clear and compelling (what makes us different, the outcomes we deliver) and our conversion rates are strong without resorting to pushy, aggressive, or misleading sales tactics.',
    options: TRI_STATE_OPTIONS
  },
  {
    id: 'convert-2',
    pillar: 'CONVERT',
    type: 'TRI_STATE',
    text: 'We have marketing systems and sales funnels (lead magnets, email sequences, discovery calls) that generate a consistent, predictable, and growing flow of new customers each month, largely on autopilot.',
    options: TRI_STATE_OPTIONS
  },
  {
    id: 'convert-3',
    pillar: 'CONVERT',
    type: 'TRI_STATE',
    text: 'We maintain a database of all our best performing and most profitable offers and promotions so they can be easily catalogued and redeployed.',
    options: TRI_STATE_OPTIONS
  },
  {
    id: 'convert-4',
    pillar: 'CONVERT',
    type: 'BOOLEAN',
    text: 'Conversion rate is NOT a bottleneck to growth. If we get the enquiries, we convert them into customers.',
    options: BOOLEAN_OPTIONS
  },

  // ASCEND Pillar (Q9-Q12)
  {
    id: 'ascend-1',
    pillar: 'ASCEND',
    type: 'TRI_STATE',
    text: 'Our average customer lifetime value is high relative to the competition thanks to a diverse and integrated range of offerings (upsells, cross-sells, premium tiers, recurring revenue streams).',
    options: TRI_STATE_OPTIONS
  },
  {
    id: 'ascend-2',
    pillar: 'ASCEND',
    type: 'TRI_STATE',
    text: 'We have automated email, SMS, and social media follow-up campaigns that consistently convert new enquiries and re-engage past customers on autopilot (welcome sequences, nurture campaigns, re-engagement flows).',
    options: TRI_STATE_OPTIONS
  },
  {
    id: 'ascend-3',
    pillar: 'ASCEND',
    type: 'TRI_STATE',
    text: 'We have a documented process in place for getting happy customers to leave positive reviews (on Google, Trustpilot, industry directories) and refer new customers (referral incentives, word-of-mouth campaigns).',
    options: TRI_STATE_OPTIONS
  },
  {
    id: 'ascend-4',
    pillar: 'ASCEND',
    type: 'BOOLEAN',
    text: 'Retention, upsell, and referral rates are NOT a bottleneck to growth. Once we win a customer, they stay, buy more, and refer others.',
    options: BOOLEAN_OPTIONS
  },

  // ACCELERATE Pillar (Q13-Q16)
  {
    id: 'accelerate-1',
    pillar: 'ACCELERATE',
    type: 'TRI_STATE',
    text: 'We utilise documented systems and data-driven scorecards to set growth targets (revenue goals, customer acquisition targets, retention rates), execute projects, and track our progress toward our goals.',
    options: TRI_STATE_OPTIONS
  },
  {
    id: 'accelerate-2',
    pillar: 'ACCELERATE',
    type: 'TRI_STATE',
    text: 'We have a robust and integrated tech stack that includes a CRM, email/SMS platform, website with lead capture, tracking/analytics, and a centralised customer database.',
    options: TRI_STATE_OPTIONS
  },
  {
    id: 'accelerate-3',
    pillar: 'ACCELERATE',
    type: 'TRI_STATE',
    text: 'We have a team composed of reliable staff and contractors all working together efficiently and effectively to achieve the business goals (clear roles, documented processes, regular communication).',
    options: TRI_STATE_OPTIONS
  },
  {
    id: 'accelerate-4',
    pillar: 'ACCELERATE',
    type: 'BOOLEAN',
    text: 'Our systems, technology, and team are NOT a bottleneck to growth. The business runs like a well-oiled machine.',
    options: BOOLEAN_OPTIONS
  }
]

export const ZONES: Record<Zone, { min: number; max: number; label: string; color: string; description: string }> = {
  DANGER: {
    min: 0,
    max: 15,
    label: 'Danger Zone',
    color: '#EF4444', // red
    description: 'Core growth foundations are missing or weak. Revenue is vulnerable and growth is highly constrained.'
  },
  CONSTRAINT: {
    min: 16,
    max: 51,
    label: 'Constraint Zone',
    color: '#F59E0B', // amber
    description: 'You have some solid growth drivers in place, but bottlenecks in key areas are limiting your potential.'
  },
  GROWTH: {
    min: 52,
    max: 100,
    label: 'Growth Zone',
    color: '#22C55E', // green
    description: 'You have strong foundations and systems that support scalable growth. Fine-tuning specific areas could unlock exponential gains.'
  }
}
