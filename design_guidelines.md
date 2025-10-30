# Design Guidelines: EPUB Reader Application

## Design Approach
**System Selected:** Material Design with inspiration from Google Play Books and Apple Books
**Rationale:** Content-focused reading application requiring excellent typography, clean layouts, and minimal visual distractions to optimize the reading experience.

## Core Design Principles
1. **Reading First:** Minimize UI chrome when reading; maximize content visibility
2. **Clarity:** Clean information hierarchy in library and reader views
3. **Efficiency:** Fast access to books and chapters with intuitive navigation

---

## Typography System

### Library View
- **Book Titles:** Font size text-lg, font-semibold
- **Book Descriptions:** Font size text-sm, line-height relaxed, max 3 lines with ellipsis
- **Section Headers:** Font size text-2xl, font-bold
- **Metadata (Author, Pages):** Font size text-xs, font-medium

### Reader View
- **Chapter Titles:** Font size text-xl, font-semibold, mb-6
- **Body Text:** Font size text-base (16px), line-height leading-relaxed (1.75), max-width max-w-2xl for optimal reading
- **Navigation Elements:** Font size text-sm

**Font Stack:** System fonts via Tailwind's default stack for instant loading and native feel

---

## Layout System

**Spacing Units:** Use Tailwind units of 2, 3, 4, 6, 8, 12, 16 for consistent rhythm
- Small gaps: gap-2, gap-3
- Component padding: p-4, p-6
- Section spacing: mb-8, mb-12, mt-16
- Reading margins: px-6, py-8

**Container Strategy:**
- Library view: max-w-7xl mx-auto px-4
- Reader view: max-w-4xl mx-auto px-6 (centered, optimized reading width)

---

## Component Library

### 1. Navigation Header
- Fixed top bar (sticky top-0) with app title and minimal controls
- Height: h-16
- Contains: App logo/name, search icon, settings icon
- Library view: Visible, Reader view: Auto-hide on scroll

### 2. Book Library Grid
**Layout:**
- Grid: grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5
- Gap: gap-4 md:gap-6

**Book Card Component:**
- Cover container: aspect-[2/3] (standard book ratio)
- Cover image: rounded-lg, shadow-md, object-cover w-full h-full
- Content padding: p-3
- Title: 2 lines max with truncate
- Description: 3 lines max with line-clamp
- Metadata row: flex items-center justify-between
- Hover state: transform scale-105 transition, shadow-lg

### 3. Book Detail/Reader View
**Structure:**
- Two-column layout on desktop (lg:grid-cols-[300px_1fr])
- Left sidebar: Chapter navigation (fixed/sticky position)
- Right content: Reading area

**Chapter Sidebar:**
- Width: w-[300px] on desktop, full-width drawer on mobile
- Chapter list: space-y-2
- Active chapter: Highlighted with subtle indicator
- Chapter items: px-4 py-2, hover:bg-subtle, rounded

**Reading Content Area:**
- Max width: max-w-3xl for comfortable reading
- Padding: px-8 py-12
- Line length: Optimal 65-75 characters per line
- Paragraph spacing: mb-4

### 4. Navigation Controls
**Chapter Navigation:**
- Bottom fixed bar on mobile, inline on desktop
- Previous/Next buttons: Large touch targets (min-h-12)
- Position indicator: "Chapter 3 of 15" centered
- Icons: Use Heroicons (ChevronLeft, ChevronRight, List)

**Progress Indicator:**
- Thin progress bar (h-1) at top showing reading position in current chapter
- Updates on scroll

### 5. Empty States
- When no books in folder: Centered message with upload/folder icon
- Large icon (w-16 h-16), instructional text, suggested action

### 6. Loading States
- Book cards: Skeleton loaders with pulse animation
- Reader content: Spinner centered with "Loading chapter..." text

---

## Animations
**Minimal Use Only:**
- Page transitions: Simple fade (transition-opacity duration-200)
- Card hover: Subtle scale (scale-105 duration-200)
- Chapter navigation: Slide in content (translate-x animation, duration-300)
- Sidebar toggle: Slide animation (transform duration-200)

**No animations for:**
- Text rendering
- Scrolling
- Reading content loading (instant display)

---

## Images

### Book Covers
**Source:** Extracted from EPUB metadata
**Implementation:**
- Aspect ratio: 2:3 (standard book cover)
- Object-fit: cover
- Fallback: Generic book icon placeholder when no cover available
- Loading: Lazy loading with blur placeholder

### Placeholder Images
- Use book icon from Heroicons as fallback
- Display with subtle background and centered icon

**No Hero Images:** This is a utility app, not a marketing site

---

## Accessibility Features
- Keyboard navigation: Tab through books, arrow keys for chapters
- Focus indicators: Visible outline on all interactive elements
- ARIA labels: Proper labels for icons and navigation
- Text contrast: Ensure readable text at all sizes
- Touch targets: Minimum 44x44px on mobile

---

## Responsive Breakpoints
- **Mobile (base):** Single column, drawer-based chapter nav, larger touch targets
- **Tablet (md:):** 3-column grid, persistent sidebar option
- **Desktop (lg:+):** 4-5 column grid, two-column reader with fixed chapter sidebar