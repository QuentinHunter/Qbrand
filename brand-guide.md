# Quentin Hunter Brand Guide

A comprehensive guide for maintaining brand consistency across all marketing materials, communications, and digital assets.

---

## Brand Overview

### Brand Positioning
Quentin Hunter is a business growth consultant who helps owner-managed businesses install the 12 Growth Accelerators that move them from the Constraint Zone to the Growth Zone.

### Unique Value Proposition
"Most advisers have one of these skills. That rare combination is my unfair advantage. And it becomes yours when we work together."

The combination of:
- Chartered Accountant (financial rigour)
- Marketing Strategist (growth expertise)
- AI Developer (technology implementation)

### Target Audience
- Owner-managed businesses
- Businesses turning over £1M-£20M
- Business owners seeking scale without burnout
- Companies preparing for exit or investment

---

## Colour Palette

### Primary Colours

| Colour | Hex | RGB | Usage |
|--------|-----|-----|-------|
| **Teal** | `#0d9488` | 13, 148, 136 | Primary brand colour, CTAs, links, accents |
| **Navy** | `#1e293b` | 30, 41, 59 | Headings, primary text, footer backgrounds |

### Secondary Colours

| Colour | Hex | RGB | Usage |
|--------|-----|-----|-------|
| **Teal Dark** | `#0f766e` | 15, 118, 110 | Hover states, emphasis |
| **Teal Light** | `#14b8a6` | 20, 184, 166 | Highlights, secondary accents |
| **Navy Light** | `#334155` | 51, 65, 85 | Secondary headings |
| **Cream** | `#fefce8` | 254, 252, 232 | Hero backgrounds, warm sections |

### Neutral Colours

| Colour | Hex | Usage |
|--------|-----|-------|
| **White** | `#ffffff` | Page backgrounds, text on dark |
| **Gray 100** | `#f1f5f9` | Card backgrounds, dividers |
| **Gray 300** | `#cbd5e1` | Borders, subtle dividers |
| **Gray 500** | `#64748b` | Body text, secondary text |
| **Gray 700** | `#334155` | Important body text |
| **Gray 900** | `#0f172a` | High-contrast text, footer |

### Colour Usage Guidelines

1. **Teal** is the hero colour - use for all calls-to-action, links, and key highlights
2. **Navy** conveys professionalism - use for headings and important text
3. **Cream** creates warmth - use sparingly for hero sections and testimonial backgrounds
4. **Grays** provide hierarchy - use to create visual depth without competing with brand colours

---

## Typography

### Font Families

| Font | Weight | Usage |
|------|--------|-------|
| **Merriweather** | 400, 700, 900 | Headings (H1, H2, H3), logo, pull quotes |
| **Source Sans 3** | 400, 500, 600, 700 | Body text, navigation, buttons, captions |

### Font Stack
```css
/* Headings */
font-family: 'Merriweather', Georgia, serif;

/* Body */
font-family: 'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif;
```

### Type Scale

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| H1 | 2.8rem (50px) | 700 | 1.2 |
| H2 | 2rem (36px) | 700 | 1.3 |
| H3 | 1.3rem (23px) | 700 | 1.3 |
| Body | 18px | 400 | 1.7 |
| Small/Caption | 0.9rem (16px) | 400 | 1.6 |
| Eyebrow | 0.8rem (14px) | 700, uppercase | 1.4 |

### Typography Guidelines

1. **Headings** are always Merriweather - conveys authority and expertise
2. **Body text** is Source Sans 3 - clean, modern, highly readable
3. **Line height** of 1.7 for body text ensures comfortable reading
4. **Eyebrow text** is uppercase, small, letter-spaced (0.15em) for section labels

---

## Voice & Tone

### Language Standards

- **UK English** spelling throughout (colour, optimise, behaviour, etc.)
- **No contractions** in formal copy (write "do not" not "don't")
- **Professional but approachable** - expert without being condescending
- **Direct and confident** - avoid hedging language

### Writing Style

**Do:**
- Use active voice
- Be specific with outcomes and results
- Lead with benefits, follow with features
- Use the reader's perspective ("you" and "your")
- Keep sentences clear and scannable

**Avoid:**
- Jargon without explanation
- Hyperbole or exaggerated claims
- Passive constructions
- Unnecessary adjectives
- Exclamation marks (very sparingly, if at all)

### Key Phrases & Terminology

| Term | Usage |
|------|-------|
| **12 Growth Accelerators** | Core framework - always capitalised |
| **Constraint Zone** | Where businesses are stuck - always capitalised |
| **Growth Zone** | Target state - always capitalised |
| **Install** | Preferred verb for implementing accelerators |
| **Owner-managed businesses** | Target audience description |
| **Fractional CMO** | Service title - always capitalised |

### Sample Copy Styles

**Headlines:**
- "Install the 12 Growth Accelerators That Move You From Constraint to Growth"
- "Stop Being the Bottleneck in Your Own Business"
- "Your Business Should Work For You, Not The Other Way Around"

**Body Copy:**
- "Every business has growth accelerators - systems and strategies that drive results. Most are missing several. The diagnostic identifies exactly which ones you need to install."

**CTAs:**
- "Book Your Diagnostic"
- "Start Your Growth Assessment"
- "Download the Scorecard"

---

## Logo & Identity

### Logo Usage

- The logo is the text "Quentin Hunter" in Merriweather font
- Primary colour: **Teal** (`#0d9488`)
- On dark backgrounds: **White** (`#ffffff`)
- Minimum size: 120px width for digital

### Clear Space

Maintain clear space around the logo equal to the height of the "Q" in Quentin on all sides.

### Logo Don'ts

- Do not change the font
- Do not stretch or distort
- Do not use colours outside the brand palette
- Do not add effects (shadows, gradients, outlines)
- Do not place on busy backgrounds without sufficient contrast

---

## Imagery

### Photography Style

1. **Professional portraits** - confident, approachable, natural lighting
2. **Action shots** - speaking, consulting, working with clients
3. **Personal touches** - skiing, adventures (shows character)
4. **Business contexts** - boardrooms, conferences, modern offices

### Image Treatment

- Natural, warm colour grading
- Avoid heavy filters or effects
- High quality, professional resolution
- Good lighting, avoid harsh shadows

### Iconography

- Simple, line-based icons (stroke width: 2px)
- Teal colour for icons on light backgrounds
- White icons on teal/navy backgrounds
- Consistent sizing within contexts

---

## UI Elements

### Buttons

**Primary Button:**
```css
background: #0d9488;
color: #ffffff;
padding: 16px 35px;
border-radius: 8px;
font-weight: 700;
```

**Secondary Button:**
```css
background: #ffffff;
color: #1e293b;
border: 2px solid #cbd5e1;
padding: 16px 35px;
border-radius: 8px;
```

**Hover States:**
- Primary: Darken to `#0f766e`, slight lift (`translateY(-2px)`)
- Secondary: Border colour to teal

### Cards

```css
background: #f1f5f9;
border-radius: 16px;
padding: 35px;
border: 2px solid transparent;
/* Hover: border-color: #0d9488 */
```

### Form Fields

```css
background: #ffffff;
border: 2px solid #cbd5e1;
border-radius: 8px;
padding: 12px 15px;
/* Focus: border-color: #0d9488 */
```

---

## Applications

### Email Signatures

```
Quentin Hunter
Fractional CMO | Business Growth Systems

quentinhunter.com
[LinkedIn Icon] linkedin.com/in/quentin-hunter
```

### Social Media

**LinkedIn:**
- Professional tone
- Share insights on business growth, AI, marketing
- Use teal accent in graphics
- Include clear CTAs

**Profile Header:**
- Teal accent colour
- Clear value proposition
- Professional headshot

### Presentation Slides

- White or cream backgrounds
- Navy headings (Merriweather)
- Teal for accent colours and highlights
- Clean, minimal design
- One idea per slide

### Print Materials

- Business cards: Navy background, white/teal text
- Brochures: White background, navy/teal accents
- Ensure CMYK conversion of colours for print

---

## Digital Assets

### Favicon
- Location: `/assets/images/favicon.ico`
- Teal "Q" on white background

### Open Graph Image
- Size: 1200x630px
- Location: `/assets/images/og-image.png`
- Include logo and tagline

### Social Sharing Images
- Size: 1200x630px (Facebook/LinkedIn)
- Size: 1200x675px (Twitter)
- Consistent branding with teal/navy palette

---

## Quick Reference

### Brand Colours (Copy-Paste)
```
Teal:       #0d9488
Teal Dark:  #0f766e
Teal Light: #14b8a6
Navy:       #1e293b
Navy Light: #334155
Cream:      #fefce8
White:      #ffffff
Gray 500:   #64748b
Gray 900:   #0f172a
```

### Google Fonts Link
```html
<link href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,400;0,700;0,900;1,400&family=Source+Sans+3:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Key Brand Elements Checklist
- [ ] Teal as primary accent colour
- [ ] Merriweather for headings
- [ ] Source Sans 3 for body text
- [ ] UK English spelling
- [ ] No contractions in formal copy
- [ ] Clear CTAs with action verbs
- [ ] Professional, confident tone
- [ ] "12 Growth Accelerators" framework referenced

---

*Last updated: December 2024*
