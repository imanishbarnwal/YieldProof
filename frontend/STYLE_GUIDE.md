# YieldProof Style Guide

## Design Philosophy
Professional, clean, and trustworthy design that builds confidence in the DeFi protocol while maintaining modern aesthetics.

## Color Palette

### Primary Colors
- **Background**: `bg-slate-950` - Deep, professional dark background
- **Text Primary**: `text-white` - Clean white for headings and important text
- **Text Secondary**: `text-slate-400` - Muted gray for descriptions and secondary text
- **Text Accent**: `text-slate-300` - Medium gray for interactive elements

### UI Colors
- **Cards**: `bg-slate-800/30` with `border-slate-700/50` - Subtle glass morphism
- **Buttons**: `bg-slate-800` with `border-slate-600/50` - Professional button styling
- **Hover States**: `hover:bg-slate-700` - Subtle interaction feedback

### Status Colors
- **Success**: `text-emerald-400` / `bg-emerald-700`
- **Warning**: `text-amber-400` / `bg-amber-700`
- **Error**: `text-red-400` / `bg-red-700`
- **Info**: `text-blue-400` / `bg-blue-700`

## Typography

### Headings
- **Hero Titles**: `text-4xl md:text-6xl font-bold` - Large, impactful headings
- **Section Titles**: `text-4xl md:text-5xl font-bold` - Section headings
- **Card Titles**: `text-2xl font-bold` - Card and component titles
- **Subsections**: `text-xl font-semibold` - Smaller section headings

### Body Text
- **Primary**: `text-xl text-slate-400 leading-relaxed font-light` - Main descriptions
- **Secondary**: `text-slate-400 leading-relaxed` - Card descriptions
- **Small Text**: `text-sm text-slate-400` - Labels and minor text

### Special Text
- **Uppercase Labels**: `uppercase tracking-wider text-sm font-medium` - Section labels
- **Monospace**: `font-mono` - Addresses, hashes, technical data

## Layout & Spacing

### Container Widths
- **Hero Sections**: `max-w-4xl mx-auto` - Centered hero content
- **Content Sections**: `max-w-7xl` - Main content areas
- **Text Content**: `max-w-3xl mx-auto` - Readable text width

### Spacing
- **Section Spacing**: `space-y-32` - Large gaps between major sections
- **Component Spacing**: `space-y-16` - Medium gaps between components
- **Element Spacing**: `space-y-8` - Small gaps between related elements
- **Padding**: `p-6` or `p-8` - Consistent padding for cards and sections

### Grid Systems
- **Feature Cards**: `grid-cols-1 md:grid-cols-3 gap-8` - Three-column layout
- **Process Steps**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8` - Four-column process
- **Stats**: `grid-cols-2 md:grid-cols-4 gap-6` - Statistics display

## Components

### Buttons
```tsx
// Primary Action
<Button className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-8 py-4 rounded-xl">

// Secondary Action  
<Button variant="outline" className="bg-slate-900/50 hover:bg-slate-800/50 border-slate-600/50">

// Sizes
size="xl" // h-16 px-10 py-5 text-lg - Hero buttons
size="lg" // h-13 px-8 py-4 text-base - Section buttons
size="default" // h-11 px-6 py-3 - Standard buttons
size="sm" // h-9 px-4 py-2 text-xs - Small buttons
```

### Cards
```tsx
<Card className="border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
  <CardHeader className="text-center"> // Center align headers
    <CardTitle className="text-2xl font-bold text-white">
  </CardHeader>
  <CardContent className="text-center"> // Center align content
</Card>
```

### Badges
```tsx
// Status Badge
<Badge variant="success" className="px-4 py-2 text-sm font-medium rounded-full">
  <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse" />
  Live Status
</Badge>
```

### Icons
- **Size**: `w-6 h-6` for section labels, `w-8 h-8` for cards, `w-5 h-5` for buttons
- **Color**: `text-slate-300` or `text-slate-400` for consistency
- **Background**: `bg-slate-700/30 rounded-xl` for icon containers

## Animations

### Hover Effects
- **Scale**: `hover:scale-105` - Subtle lift effect for cards
- **Transform**: `group-hover:translate-x-2` - Arrow movement on hover
- **Opacity**: `opacity-0 group-hover:opacity-100` - Reveal effects

### Transitions
- **Duration**: `transition-all duration-300` - Standard transition timing
- **Easing**: `ease-out` for hover in, `ease-in-out` for interactions

### Framer Motion
```tsx
// Button animations
whileHover={{ scale: 1.02, transition: { duration: 0.2, ease: "easeOut" }}}
whileTap={{ scale: 0.98, transition: { duration: 0.1, ease: "easeInOut" }}}

// Card animations  
<AnimatedSection delay={0.1}> // Stagger animations with delays
```

## Hero Section Pattern

### Structure
```tsx
<div className="text-center space-y-8 max-w-4xl mx-auto">
  {/* Badges */}
  <div className="flex items-center justify-center gap-3 mb-6">
    <Badge variant="success" pulse>Status</Badge>
    <Badge variant="default">Version</Badge>
  </div>
  
  {/* Title */}
  <div className="space-y-6">
    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
      Page Title
    </h1>
    <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-light">
      Description text
    </p>
  </div>
  
  {/* Stats Grid (optional) */}
  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 max-w-4xl mx-auto">
    <div className="text-center space-y-2">
      <div className="text-2xl font-bold text-white">Value</div>
      <div className="text-sm text-slate-400">Label</div>
    </div>
  </div>
</div>
```

## Section Pattern

### Structure
```tsx
<AnimatedSection className="w-full max-w-7xl space-y-16" delay={0.2}>
  {/* Section Header */}
  <div className="text-center space-y-4">
    <div className="flex items-center justify-center gap-2 mb-4">
      <Icon className="w-6 h-6 text-slate-400" />
      <span className="text-slate-400 font-medium uppercase tracking-wider text-sm">
        Section Label
      </span>
    </div>
    <h2 className="text-4xl md:text-5xl font-bold text-white">Section Title</h2>
    <p className="text-slate-400 font-light text-xl max-w-3xl mx-auto">
      Section description
    </p>
  </div>
  
  {/* Section Content */}
  <StaggeredContainer className="grid grid-cols-1 md:grid-cols-3 gap-8" staggerDelay={0.2}>
    {/* Content items */}
  </StaggeredContainer>
</AnimatedSection>
```

## Best Practices

### Alignment
- **Center everything**: Use `text-center`, `mx-auto`, `justify-center` consistently
- **Consistent spacing**: Use the spacing scale (4, 6, 8, 12, 16, 32)
- **Grid alignment**: Ensure grid items have consistent heights and alignment

### Content
- **Clear hierarchy**: Use consistent heading sizes and spacing
- **Readable text**: Maintain good contrast and line height
- **Consistent tone**: Professional but approachable language

### Performance
- **Optimize images**: Use appropriate formats and sizes
- **Lazy loading**: Use AnimatedSection for performance
- **Minimal animations**: Keep animations subtle and purposeful

### Accessibility
- **Color contrast**: Ensure sufficient contrast ratios
- **Focus states**: Maintain visible focus indicators
- **Semantic HTML**: Use proper heading hierarchy and landmarks

## Implementation Checklist

- [ ] Hero section follows the standard pattern
- [ ] All text is center-aligned where appropriate
- [ ] Consistent spacing using the scale
- [ ] Icons are properly sized and colored
- [ ] Buttons use the standard variants
- [ ] Cards have consistent styling
- [ ] Animations are subtle and professional
- [ ] Color palette is followed throughout
- [ ] Typography scale is consistent
- [ ] Grid layouts are properly aligned