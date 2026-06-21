---
description: Design tokens, Tailwind config, global CSS, layout constraints, and recurring UI patterns
globs: ["**/*.jsx", "**/*.css", "tailwind.config*"]
alwaysApply: false
---

# Design System

Visual reference: `site4/` HTML prototype. All color, spacing, and typography decisions come from those files.

## Color Tokens

| Token | Hex | Usage |
|---|---|---|
| `primary-fixed` | `#9EFF00` | Neon green — accent, CTA, live badges **only** |
| `primary-fixed-dim` | `#88dc00` | Hover/dim state of accent |
| `background` | `#0B0B0B` | App background |
| `surface` | `#131313` | Card/panel background |
| `surface-container` | `#1F1F1F` | Inner card content |
| `surface-container-high` | `#2A2A2A` | Borders, dividers |
| `primary` | `#ffffff` | Primary text |
| `secondary` | `#c8c6c5` | Muted/secondary text |
| `error` | `#ffb4ab` | Error states |

**Rule:** `#9EFF00` is used on at most **one** element per screen. Do not use it as a background.

## Typography

- **Headlines:** Montserrat, weight 700–900, `uppercase`, `tracking-tight`
- **Body/Labels:** Inter, weight 400–700
- Loaded via Google Fonts CDN in `index.css`

## Tailwind Config (`tailwind.config.js`)

```js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary-fixed':          '#9EFF00',
        'primary-fixed-dim':      '#88dc00',
        'primary':                '#ffffff',
        'secondary':              '#c8c6c5',
        'background':             '#0B0B0B',
        'surface':                '#131313',
        'surface-container':      '#1f1f1f',
        'surface-container-high': '#2a2a2a',
        'surface-variant':        '#353535',
        'on-surface':             '#e2e2e2',
        'on-surface-variant':     '#c0cbad',
        'error':                  '#ffb4ab',
      },
      spacing: {
        'stack-sm': '8px', 'stack-md': '16px', 'stack-lg': '24px',
        'margin-mobile': '20px', gutter: '12px',
      },
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
      },
    },
  },
}
```

## Global CSS (`src/index.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Montserrat:wght@700;800;900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

@layer base {
  html { @apply dark; }
  body { @apply bg-background text-on-surface font-sans antialiased; }
}

@layer utilities {
  .neon-glow      { box-shadow: 0 0 15px rgba(158,255,0,0.3); }
  .neon-text-glow { text-shadow: 0 0 8px rgba(158,255,0,0.8); }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  .hide-scrollbar::-webkit-scrollbar { display: none; }
}
```

## Layout Constraints

- Customer-facing pages: `max-w-[480px] mx-auto` — phone-first, no desktop breakpoints needed
- Admin pages: full width — no max-width constraint
- Fixed header `h-16` → body needs `pt-16`
- Fixed bottom nav `h-16` → body needs `pb-20`
- Standard card: `bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden`

## Recurring UI Patterns

**Wait time badge:**
```jsx
<span className="border border-primary-fixed text-primary-fixed rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
  <span className="material-symbols-outlined text-[14px]">timer</span>
  ~{waitMin} phút
</span>
```

**Primary CTA button:**
```jsx
<button className="w-full bg-primary-fixed text-black font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl neon-glow hover:bg-primary-fixed-dim transition-colors">
  ĐẶT NGAY
</button>
```

**Live status dot:**
```jsx
<div className="w-2 h-2 rounded-full bg-primary-fixed animate-pulse" />
```

**Out-of-stock item:**
```jsx
<article className={`... ${!item.inStock ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
```

**Icons:** always use Material Symbols Outlined loaded via CDN:
```jsx
<span className="material-symbols-outlined">icon_name</span>
```
