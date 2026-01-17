# UI Animations and Micro-Interactions Plan

## Overview

This plan details enhancements to add more animations and micro-interactions across the web UI to create a more polished, responsive, and delightful user experience. The project uses Next.js 16, React 19, Tailwind CSS 4, shadcn/ui components, and Framer Motion 12.

## Current State Analysis

### Already Implemented

- `tailwindcss-animate` plugin is installed and configured
- Tailwind config has shadow tokens (xs/sm/md/lg)
- NavigationBar has glassmorphism effect (`bg-background/80 backdrop-blur-md`)
- Button component has gradient variant
- Input/Textarea/Select have ring styling
- Accordion has basic expand/collapse animations via `tailwindcss-animate`
- Dialog has basic fade-in animations
- Tooltip has entrance animations
- Progress has indeterminate animation

### Gaps Identified

1. Many components use hardcoded colors instead of theme tokens
2. Limited hover effects and transitions
3. No loading spinner component
4. No skeleton loading component
5. Message animations for AI chat are basic
6. Pagination buttons lack micro-interactions
7. Scroll-to-top button needs entrance/exit animations
8. Card hover effects are minimal
9. Badge animations are limited

## Implementation Plan

### Phase 1: Global Animation Infrastructure

#### 1.1 Add Global Animation Keyframes to [`globals.css`](../src/pages/globals.css)

Add custom keyframes for:

- `fade-in`: Opacity 0 to 1
- `fade-out`: Opacity 1 to 0
- `slide-up`: Translate Y with fade
- `slide-down`: Translate Y with fade
- `slide-left`: Translate X with fade
- `slide-right`: Translate X with fade
- `scale-in`: Scale 0.95 to 1
- `scale-out`: Scale 1 to 0.95
- `bounce-subtle`: Gentle bounce effect
- `pulse-slow`: Slower pulse than default
- `spin-slow`: Slower spin for loading
- `shimmer`: For skeleton loading

#### 1.2 Update [`tailwind.config.js`](../tailwind.config.js)

Extend theme with:

- Custom animation utilities using the keyframes
- Transition duration variants (fast: 150ms, normal: 200ms, slow: 300ms)
- Transition easing variants (ease-out, ease-in-out, bounce)

### Phase 2: New Animation Components

#### 2.1 Create [`LoadingSpinner`](../src/components/ui/loading-spinner.jsx)

A reusable spinner component with:

- Size variants (sm, md, lg)
- Color variants (primary, secondary, current)
- Animation variants (spin, pulse, dots)
- Accessibility support

#### 2.2 Create [`Skeleton`](../src/components/ui/skeleton.jsx)

A skeleton loading component with:

- Width/height variants
- Shimmer animation
- Rounded corners support
- Multiple shape types (circle, rectangle, text)

### Phase 3: Enhance Core UI Components

#### 3.1 Enhance [`Button`](../src/components/ui/button.jsx)

Add animations:

- Hover: `hover:scale-105 hover:shadow-md`
- Active: `active:scale-95`
- Focus: Enhanced ring animation
- Loading state: Show spinner
- Gradient variant: Add subtle shimmer effect

#### 3.2 Enhance [`Input`](../src/components/ui/input.jsx)

Add animations:

- Focus: `focus:scale-[1.01]` subtle scale
- Focus ring: Animated expansion
- Label: Floating label animation
- Clear button: Hover scale effect

#### 3.3 Enhance [`Textarea`](../src/components/ui/textarea.jsx)

Add animations:

- Same focus animations as Input
- Auto-resize animation
- Focus ring expansion

#### 3.4 Enhance [`Select`](../src/components/ui/select.jsx)

Add animations:

- Dropdown: Slide-down with fade
- Option hover: Scale and background transition
- Selected state: Animated checkmark

### Phase 4: Navigation and Layout Enhancements

#### 4.1 Enhance [`NavigationBar`](../src/components/NavigationBar.js)

Add animations:

- Link hover: Underline slide-in effect
- Active link: Animated indicator
- Mobile menu: Slide-in from side
- Logo: Subtle hover bounce

#### 4.2 Enhance [`layout.js`](../src/pages/layout.js) Scroll-to-Top Button

Add animations:

- Entrance: Fade-in with slide-up
- Exit: Fade-out
- Hover: Scale and shadow increase
- Click: Ripple effect

### Phase 5: AI Chat Animations

#### 5.1 Enhance [`message.jsx`](../src/components/ai-elements/message.jsx)

Add animations:

- Message entrance: Fade-in with slide-up
- Typing indicator: Bouncing dots
- User message: Slide from right
- Assistant message: Slide from left

#### 5.2 Enhance [`prompt-input.jsx`](../src/components/ai-elements/prompt-input.jsx)

Add animations:

- Focus: Subtle border glow
- Button hover: Scale and color transition
- Recording: Pulsing red indicator
- Send button: Success animation after send

#### 5.3 Enhance [`conversation.jsx`](../src/components/ai-elements/conversation.jsx)

Add animations:

- Staggered message entrance
- Smooth scroll to bottom

### Phase 6: Card and List Animations

#### 6.1 Enhance [`Issue`](../src/components/Issue.js)

Add animations:

- Card hover: `hover:shadow-lg hover:-translate-y-1`
- Badge hover: Scale and color shift
- Accordion trigger: Arrow rotation animation

#### 6.2 Enhance [`Chat`](../src/components/Chat.js)

Add animations:

- Same as Issue component
- Copy/Play button hover: Scale and color change

#### 6.3 Enhance [`IssueList`](../src/components/IssueList.js)

Add animations:

- List item entrance: Staggered fade-in
- Pagination buttons: Hover scale and shadow
- Clear button: Rotate animation on hover

### Phase 7: Modal and Dialog Enhancements

#### 7.1 Enhance [`dialog.jsx`](../src/components/ui/dialog.jsx)

Add animations:

- Overlay: Fade-in
- Content: Scale-in with fade
- Close: Scale-out with fade
- Backdrop blur transition

#### 7.2 Enhance [`IssueModal`](../src/components/IssueModal.js)

Add animations:

- Form inputs: Focus animations
- Save button: Loading state with spinner
- Success: Checkmark animation

### Phase 8: Badge and Dropdown Enhancements

#### 8.1 Enhance [`badge.jsx`](../src/components/ui/badge.jsx)

Add animations:

- Hover: Scale and color transition
- Active: Pulse effect
- New badge: Bounce animation

#### 8.2 Enhance [`LanguageSwitch`](../src/components/LanguageSwitch.js)

Add animations:

- Dropdown: Slide-down with fade
- Option hover: Slide-left arrow
- Selected item: Animated checkmark

#### 8.3 Enhance [`Login`](../src/components/Login.js)

Add animations:

- Dropdown: Same as LanguageSwitch
- Avatar hover: Scale and ring effect
- Menu item hover: Slide effect

### Phase 9: Tooltip and Notification Enhancements

#### 9.1 Enhance [`tooltip.jsx`](../src/components/ui/tooltip.jsx)

Add animations:

- Entrance: Pop-in with scale
- Exit: Pop-out
- Follow cursor: Smooth transition

#### 9.2 Enhance [`Notification.js`](../src/components/Notification.js)

Add animations:

- Toast entrance: Slide-in from top/right
- Toast exit: Slide-out
- Progress bar: Animated fill

### Phase 10: Settings and Other Pages

#### 10.1 Enhance [`settings.js`](../src/pages/settings.js)

Add animations:

- Table row hover: Highlight and scale
- Pagination: Button micro-interactions
- Loading: Skeleton for table

#### 10.2 Enhance [`about.js`](../src/pages/about.js)

Add animations:

- Content fade-in
- Prose elements: Hover effects on links

#### 10.3 Enhance [`Joke`](../src/components/Joke.js)

Add animations:

- Refresh button: Spin on click
- Joke text: Fade-in after refresh
- Loading: Spinner

## Animation Principles

### Performance

- Use CSS transforms and opacity for GPU acceleration
- Avoid animating layout properties (width, height, margin, padding)
- Use `will-change` sparingly
- Test on low-end devices

### Accessibility

- Respect `prefers-reduced-motion` media query
- Ensure animations don't interfere with screen readers
- Provide sufficient duration for users to perceive changes
- Don't use flashing animations (seizure risk)

### Consistency

- Use consistent easing functions (ease-out for exits, ease-in for entrances)
- Maintain consistent timing (150-300ms for micro-interactions)
- Keep animation durations proportional to element importance

## Testing Strategy

### Unit Tests

- Test animation classes are applied correctly
- Test loading states show appropriate components
- Test reduced motion preference is respected

### E2E Tests

- Test animations don't break interactions
- Test loading states complete properly
- Test reduced motion mode

### Visual Testing

- Compare screenshots before/after
- Test in both light and dark themes
- Test on different viewport sizes

## Rollout Plan

1. **Infrastructure First**: Implement global animations and new components
2. **Core Components**: Enhance Button, Input, Select
3. **Page by Page**: Enhance Navigation, AI chat, Home, Settings
4. **Polish**: Add micro-interactions and refine timing
5. **Testing**: Comprehensive test across all pages and themes

## Risks and Mitigations

| Risk                                  | Mitigation                                                      |
| ------------------------------------- | --------------------------------------------------------------- |
| Performance degradation               | Use CSS-only animations, test on low-end devices                |
| Test failures due to animation timing | Add wait utilities, use role-based selectors                    |
| Accessibility issues                  | Test with screen readers, respect reduced motion                |
| Animation fatigue                     | Keep animations subtle and purposeful                           |
| Browser compatibility                 | Use widely supported CSS features, fallbacks for older browsers |

## Success Criteria

- All interactive elements have clear hover/focus states
- Loading states are visually indicated with animations
- Page transitions feel smooth and natural
- Animations respect user's motion preferences
- No performance regression (FCP/LCP unchanged or improved)
- All tests pass with updated assertions
