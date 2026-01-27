# YieldProof Style Guide

## Design Philosophy

Professional, distinctive design that builds confidence in the DeFi protocol while avoiding generic "AI slop" aesthetics. We prioritize bold choices, atmospheric depth, and thoughtful motion over safe, conservative defaults.

## Typography

### Font Families
**PRIMARY RULE: Avoid generic fonts (Inter, Roboto, Arial, system fonts)**

**Selected Font Pairing:**
- **Display/Headings**: Syne (800 weight) - Bold, geometric, distinctive
- **Body**: DM Sans (400, 500, 700) - Clean, professional, readable
- **Code/Technical**: JetBrains Mono - When displaying addresses or technical data

**Load from Google Fonts:**
```html
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
```

**Application:**
```css
h1, h2, h3, h4 {
  font-family: 'Syne', sans-serif;
  font-weight: 800;
}

body, p, span {
  font-family: 'DM Sans', sans-serif;
}
```

### Type Scale (Use Extremes)
- **Hero Titles**: text-6xl md:text-7xl font-bold (100-200 or 800-900 weight)
- **Section Titles**: text-5xl md:text-6xl font-bold
- **Card Titles**: text-2xl font-bold
- **Body Text**: text-xl font-light leading-relaxed (Note: light weight, not medium)
- **Small Labels**: text-sm font-medium uppercase tracking-wider

**Principle**: High contrast = interesting
- Use 100/200 weight vs 800/900, not 400 vs 600
- Size jumps of 3x+, not 1.5x
- Pair extremes: Ultra-light body with ultra-bold headings

## Color & Theme

### CSS Variables (Required)
```css
:root {
  --primary: #FF6B35;        /* Distinctive orange, not purple */
  --primary-dark: #E85A2A;
  --secondary: #004E89;       /* Deep blue */
  --accent: #FFD23F;          /* Vibrant yellow */
  --dark: #1A1A2E;           /* Rich dark, not pure black */
  --light: #F8F9FA;
}
```

**CRITICAL: Avoid clichéd color schemes**
❌ Purple gradients on white backgrounds
❌ Generic blue (#3B82F6) as primary
❌ Timid, evenly-distributed palettes
✅ Dominant colors with sharp accents
✅ High-contrast, memorable combinations

### Background Strategy
**Create Atmosphere and Depth (Never solid colors):**

```css
/* Animated gradient background */
.hero-bg {
  background: linear-gradient(135deg, #004E89 0%, #1A1A2E 50%, #FF6B35 100%);
}

.hero-bg::before {
  background: 
    radial-gradient(circle at 20% 50%, rgba(255, 107, 53, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 210, 63, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 40% 20%, rgba(0, 78, 137, 0.3) 0%, transparent 50%);
  animation: float 20s ease-in-out infinite;
}

/* Mesh gradient alternative */
.mesh-gradient {
  background: 
    radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 0.3) 0px, transparent 50%),
    radial-gradient(at 97% 21%, hsla(125, 98%, 72%, 0.2) 0px, transparent 50%),
    radial-gradient(at 52% 99%, hsla(354, 98%, 61%, 0.3) 0px, transparent 50%);
}
```

### UI Colors
- **Cards**: Use layered backgrounds, not flat colors
  ```css
  background: white;
  border: 2px solid transparent;
  position: relative;
  ```
- **Hover States**: Transform-based, not just color change
- **Status Colors**: Maintain accessibility while being distinctive

## Motion & Animation

### Philosophy
One well-orchestrated page load with staggered reveals creates more delight than scattered micro-interactions

### CSS-Only Animations (Preferred)
```css
/* Page load sequence */
.fade-in {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 0.8s ease forwards;
}

.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.2s; }
.delay-3 { animation-delay: 0.3s; }

/* Hover micro-interactions */
.feature-card {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.feature-card:hover {
  transform: translateY(-8px);
}

.feature-card::before {
  transform: scaleX(0);
  transition: transform 0.4s ease;
}

.feature-card:hover::before {
  transform: scaleX(1);
}
```

### Button Animations
```css
.cta-button {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.cta-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.cta-button:hover::before {
  width: 300px;
  height: 300px;
}
```

### Motion Library for React
When React is available, use Framer Motion:
```tsx
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, delay: 0.2 }}
/>
```

## Components

### Buttons
```tsx
// Primary CTA - Must have animated hover effect
<button className="cta-button bg-[var(--primary)] text-white px-8 py-4 rounded-full font-bold shadow-lg">
  <span className="relative z-10">Get Started</span>
</button>

// Sizes (use extremes)
// - Hero: px-10 py-5 text-lg
// - Standard: px-8 py-4 text-base
// - Small: px-4 py-2 text-sm
```

### Cards
```tsx
<div className="feature-card bg-white rounded-3xl p-8 border-2 border-transparent hover:border-[var(--primary)] transition-all duration-400">
  {/* Top accent bar */}
  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] transform scale-x-0 group-hover:scale-x-100 transition-transform" />
  
  {/* Card content */}
</div>
```

### Icon Styling
```tsx
// Icon containers - distinctive shapes
<div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
  <Icon className="w-8 h-8 text-white" />
</div>
```

## Layout Patterns

### Hero Section (With Staggered Animation)
```tsx
<section className="relative min-h-screen flex items-center">
  {/* Animated background */}
  <div className="hero-bg absolute inset-0" />
  
  <div className="relative z-10 max-w-7xl mx-auto px-8">
    <div className="grid md:grid-cols-2 gap-12">
      <div>
        <h1 className="text-7xl font-bold mb-6 fade-in">
          Hero Title
        </h1>
        <p className="text-xl text-slate-200 fade-in delay-1">
          Description
        </p>
        <div className="flex gap-4 fade-in delay-2">
          {/* CTA buttons */}
        </div>
        <div className="flex gap-8 fade-in delay-3">
          {/* Stats */}
        </div>
      </div>
      <div className="fade-in delay-4">
        {/* Visual element */}
      </div>
    </div>
  </div>
</section>
```

### Feature Grid
```tsx
<div className="grid md:grid-cols-3 gap-8">
  {features.map((feature, i) => (
    <div 
      key={i}
      className="feature-card"
      style={{ animationDelay: `${i * 0.1}s` }}
    >
      {/* Feature content */}
    </div>
  ))}
</div>
```

## Avoid Generic AI Aesthetics

### ❌ Don't Use
- Inter, Roboto, Arial (fonts)
- Purple gradients on white
- bg-white, bg-gray-50 without layering
- Predictable 3-column card grids without variation
- Flat, solid color backgrounds
- Generic blue as primary color
- Animations on every element
- Medium font weights (400, 500, 600)

### ✅ Do Use
- Distinctive font pairings (Syne + DM Sans)
- Cohesive theme with CSS variables
- Layered backgrounds with gradients/patterns
- Dominant color with sharp accents
- One well-orchestrated page load sequence
- Extreme font weights (100-200 or 800-900)
- Transform-based hover effects
- Atmospheric depth in backgrounds

## Inspiration Sources

Draw from:
- **IDE Themes**: VS Code themes, terminal color schemes
- **Cultural Aesthetics**: Solarpunk, brutalism, Swiss design
- **Specific Products**: Linear, Stripe, Vercel (not generic SaaS)

## Process:
1. Choose a distinctive aesthetic direction
2. Define CSS variables for cohesive palette
3. Select unique font pairing
4. Design atmospheric backgrounds
5. Plan one primary animation sequence
6. Add transform-based micro-interactions

## Implementation Checklist

- [ ] Custom font pairing loaded (not Inter/Roboto)
- [ ] CSS variables defined for cohesive theme
- [ ] Atmospheric backgrounds (not solid colors)
- [ ] Staggered page load animations
- [ ] Transform-based hover effects
- [ ] Extreme font weight contrast
- [ ] Dominant color with sharp accents
- [ ] Distinctive, context-specific design
- [ ] High-impact button animations
- [ ] Layered card styling with depth

## Critical Reminders

**Think outside the box!** Each generation should feel genuinely designed for its context, not cookie-cutter AI output. Vary between light/dark themes, different aesthetics, unexpected choices. Commit fully to a cohesive vision rather than playing it safe.

**One great animation beats many mediocre ones.** Focus on the page load experience with carefully staggered reveals rather than adding hover effects everywhere.

**Backgrounds create atmosphere.** Never default to solid colors. Layer gradients, use patterns, add depth.