# SmartBusbar UI Redesign Plan

## Analysis Summary

**Product type**: Industrial engineering tool (B2B) for UPS busbar selection
**Tech stack**: Vue 3 + Element Plus + Vite + Tailwind CSS
**Current state**: Dark-first industrial theme, 12-column grid, left sidebar input + right results area

### Current Issues Identified

1. **Inconsistent dark mode tokens**: Some components use `dark:bg-surface-900`, others `dark:bg-surface-950`
2. **Light mode is secondary**: The CSS defaults to dark (`:root` vars are dark), light mode feels like an afterthought
3. **Decorative blur**: `backdrop-blur-xl` on glass-panel is excessive for an engineering tool (violates `blur-purpose` rule)
4. **Hardcoded colors in Element Plus overrides**: Many `!important` overrides with raw hex instead of tokens
5. **Inconsistent component styling**: InputPanel uses `bg-surface-900`, App uses `bg-surface-950`
6. **Missing reduced-motion support**: Animations run without respecting `prefers-reduced-motion`
7. **No proper focus ring visibility**: Focus states rely on Element Plus defaults
8. **Emoji in help dialog**: Uses emoji (⚠️, 📊, 🔧, etc.) instead of SVG icons
9. **Tab indicator**: Uses `bg-cyan-400` instead of `bg-primary-400` (inconsistent with design tokens)
10. **Missing dark mode parity**: Some colors like `bg-red-950/30` and `bg-amber-950/20` are hardcoded

## Design Decisions

### Style Selection: Industrial Minimal (keep dark-first approach)

**Rationale**: This is a professional engineering tool. The current dark industrial theme is the right direction. The issue is not the style choice but the execution inconsistencies.

Per ui-ux-pro-max skill:
- `style-match`: Industrial/engineering tools → dark mode, high information density, minimal decoration
- `color-palette-from-product`: Cyan/teal primary is appropriate for engineering (calm, precise, technical)
- `no-emoji-icons`: Must replace emoji with SVG icons
- `blur-purpose`: Remove decorative blur, use only for modal backdrop dismissal

### Color System: Dual-mode with semantic tokens

Keep the current color palette but ensure proper light/dark mode support:
- Primary: Cyan/teal (#06b6d4) — appropriate for engineering
- Surface: Slate-based gray scale — professional, neutral
- Semantic: Success/warning/error — already well-defined

### Typography: Keep Inter + JetBrains Mono

Excellent pairing for this use case:
- Inter: Clean, legible for UI text
- JetBrains Mono: Tabular figures for data alignment

### Layout: Keep 12-column grid with sidebar

The current layout is appropriate for this tool type:
- Left sidebar for input parameters (narrow)
- Right main area for results (wide)
- Responsive: collapses to single column on mobile

## Implementation Tasks

### Task 1: Fix dark mode token consistency

**Files**: `src/App.vue`, `src/components/*.vue`

Replace all inconsistent token usage:
- `dark:bg-surface-950` → ensure consistent base (use `dark:bg-surface-950` everywhere for page bg)
- `dark:bg-surface-900` → use for cards/panels in dark mode
- `dark:bg-surface-800` → use for elevated surfaces
- `dark:border-surface-700` → consistent border token

Specific fixes:
- `App.vue:2`: `bg-surface-50 dark:bg-surface-950` — OK (page base)
- `InputPanel.vue:3`: `dark:bg-surface-900` — change to `dark:bg-surface-800` (card level)
- `CurrentDashboard.vue:2`: `glass-panel` — remove blur, use solid dark background
- All `glass-panel` usages: Remove `backdrop-blur-xl`, keep border and background

### Task 2: Remove decorative blur effects

**File**: `src/style.css`

```css
/* Before */
.glass-panel {
  @apply bg-surface-800/80 backdrop-blur-xl border border-surface-700/50 rounded-xl;
}

/* After */
.glass-panel {
  @apply bg-surface-800 border border-surface-700/50 rounded-xl;
}
```

Also remove `backdrop-blur-xl` from header:
- `App.vue:5`: Remove `backdrop-blur-xl` from header

### Task 3: Fix Element Plus dark mode overrides

**File**: `src/style.css`

Replace hardcoded hex with CSS custom properties where possible. The current approach of overriding every Element Plus component is necessary due to Element Plus's theming limitations, but we can make it cleaner.

Keep the `!important` overrides (Element Plus requires them), but ensure consistency:
- All background colors use the same base: `#0a0f1a` (darkest), `#111827` (panels), `#1e293b` (elevated)
- All border colors use: `#1e293b` (subtle), `#334155` (default), `#475569` (prominent)
- All text colors use: `#f1f5f9` (primary), `#cbd5e1` (regular), `#94a3b8` (secondary)

### Task 4: Add light mode support

**File**: `src/style.css`

Currently the `:root` CSS variables define dark colors. For proper light mode:

```css
:root {
  /* Keep current dark vars as defaults */
  --el-bg-color: #ffffff;
  --el-bg-color-page: #f8fafc;
  /* ... etc */
}
```

This requires significant Element Plus variable overrides for light mode. Given the tool is primarily used in dark mode, this can be a lower priority.

### Task 5: Replace emoji with SVG icons

**File**: `src/App.vue` (help dialog)

Replace:
- 📊 → `<ElIconDataAnalysis />`
- 🔧 → `<ElIconTools />`
- ⚠️ → `<ElIconWarningFilled />`
- 📏 → `<ElIconRuler />`
- 🔗 → `<ElIconLink />`
- 📄 → `<ElIconDocument />`

Also check other components for emoji usage.

### Task 6: Fix inconsistent color references

**Files**: Various components

| Location | Current | Fix |
|----------|---------|-----|
| `App.vue:103` | `bg-cyan-400` | `bg-primary-400` |
| `App.vue:126` | `border-red-900/50 bg-red-950/30` | `border-semantic-error/20 bg-semantic-error/5` |
| `App.vue:129` | `text-semantic-error` | OK |
| `CurrentDashboard.vue:12` | `ring-cyan-500/40` | `ring-primary-500/40` |
| `CurrentDashboard.vue:52` | `border-amber-800/40 bg-amber-950/20` | `border-semantic-warning/20 bg-semantic-warning/5` |
| `CurrentDashboard.vue:59` | `text-amber-600` | `text-semantic-warning` |
| `RecommendPanel.vue:77` | `text-slate-100` | `text-surface-100` |

### Task 7: Add reduced-motion support

**File**: `src/style.css`

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Task 8: Improve focus states

**File**: `src/style.css`

Add visible focus rings for keyboard navigation:

```css
:focus-visible {
  outline: 2px solid #06b6d4;
  outline-offset: 2px;
}
```

### Task 9: Fix tab indicator inconsistency

**File**: `src/App.vue`

Line 103: `bg-cyan-400` → `bg-primary-400`

### Task 10: Update stat-card for light mode

**File**: `src/style.css`

The current stat-card gradient only works in dark mode:

```css
.stat-card {
  @apply relative overflow-hidden rounded-lg border border-surface-700/50 p-4;
  background: linear-gradient(135deg, #111827 0%, #0a0f1a 100%);
}
```

Add light mode variant:

```css
.stat-card {
  @apply relative overflow-hidden rounded-lg border p-4;
  border-color: theme('colors.surface.200');
  background: linear-gradient(135deg, theme('colors.surface.50') 0%, theme('colors.surface.100') 100%);
}

.dark .stat-card {
  border-color: theme('colors.surface.700 / 0.5');
  background: linear-gradient(135deg, #111827 0%, #0a0f1a 100%);
}
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/style.css` | Remove blur, add reduced-motion, fix focus states, update stat-card |
| `src/App.vue` | Fix color references, remove header blur, replace emoji in help dialog |
| `src/components/CurrentDashboard.vue` | Fix color references |
| `src/components/RecommendPanel.vue` | Fix color references |
| `src/components/InputPanel.vue` | Verify dark mode token consistency |
| `src/components/SafetyVerificationPanel.vue` | Verify dark mode token consistency |
| `src/components/CostEstimationPanel.vue` | Verify dark mode token consistency |
| `src/components/CableRecommendPanel.vue` | Verify dark mode token consistency |
| `src/components/BatteryPanel.vue` | Fix amber color references |
| `src/components/ConnectionGuide.vue` | Verify dark mode token consistency |
| `src/components/VoltageDrop.vue` | Verify dark mode token consistency |
| `src/components/CustomBusbarPanel.vue` | Verify dark mode token consistency |
| `src/components/CorrectionBreakdown.vue` | Verify dark mode token consistency |
| `src/components/UpsFlowDiagram.vue` | Verify dark mode token consistency |

## Validation

1. `npm run build` — ensure no errors
2. `npm run dev` — verify visual consistency in dark mode
3. Toggle browser dark/light mode — check light mode doesn't break
4. Test keyboard navigation — verify focus rings visible
5. Check with `prefers-reduced-motion: reduce` — animations should stop
6. Inspect help dialog — no emoji icons
7. Check all stat cards — consistent dark background
8. Verify tab indicator uses `primary-400` not `cyan-400`

## Out of Scope

- Full light mode redesign (would require extensive Element Plus variable work)
- Component architecture changes
- New features or functionality
- Mobile layout changes
- Accessibility audit beyond the fixes listed
