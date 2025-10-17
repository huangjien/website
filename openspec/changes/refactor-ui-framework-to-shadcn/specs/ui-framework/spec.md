# UI Framework

## ADDED Requirements

### Requirement: Use shadcn/ui as the primary component library

The system SHALL use shadcn/ui (Radix + Tailwind components shipped as local code) for all new and migrated UI components.

#### Scenario: Button component renders with variants

- WHEN a Button is rendered using the shadcn/ui Button component
- THEN it SHALL support variant and size props (e.g., default, outline, ghost; sm, md, lg)
- AND it SHALL apply Tailwind classes consistent with the chosen variant/size

#### Scenario: Dark mode styles apply via next-themes

- WHEN the theme is toggled to dark using next-themes
- THEN shadcn/ui components SHALL reflect dark styles via CSS variable overrides and `.dark` class

### Requirement: Tailwind configuration updated for shadcn/ui

The system SHALL configure Tailwind for shadcn/ui usage, remove the heroui plugin, and add `tailwindcss-animate`.

#### Scenario: Tailwind build succeeds with shadcn/ui

- WHEN building the project with Tailwind
- THEN the build SHALL succeed without requiring `@heroui/theme` plugin
- AND shadcn/ui component classes SHALL be included via content globs (components/ui/\*_/_)

### Requirement: Provide `cn` utility for class composition

The system SHALL provide a `cn` utility using `clsx` and `tailwind-merge` for consistent class composition.

#### Scenario: cn utility merges conditional classes

- WHEN `cn('p-2', condition && 'bg-primary', 'p-2')` is called
- THEN the resulting class string SHALL contain deduplicated classes with correct precedence

### Requirement: Use Radix primitives for interactions

The system SHALL use Radix primitives (via shadcn/ui) for accessible interactions (Dialog, Dropdown, Tooltip, Tabs, Accordion).

#### Scenario: Tooltip displays on hover/focus

- WHEN a Tooltip is rendered with Radix and the trigger is hovered or focused
- THEN the Tooltip content SHALL appear and be accessible (including keyboard nav)

## REMOVED Requirements

### Requirement: HeroUI as primary UI library

**Reason**: Move to Tailwind-first, local-component approach with higher customization and smaller dependency footprint.
**Migration**:

- Replace `@heroui/*` components with shadcn/ui equivalents
- Remove `HeroUIProvider` and `CssBaseline`
- Update Tailwind config to remove `heroui()` plugin and tokens
- Verify all UI flows and tests

#### Scenario: No imports from @heroui remain

- WHEN searching the codebase for `from "@heroui` or `@heroui/*`
- THEN there SHALL be zero matches after migration

### Requirement: HeroUI theme tokens & plugin in tailwind.config.js

**Reason**: Tokens and plugin no longer required; shadcn/ui uses Tailwind classes + CSS variables.
**Migration**:

- Remove heroui plugin usage and color token configuration
- Add `tailwindcss-animate` and ensure content globs include `components/ui/**/*`

#### Scenario: Tailwind config no longer references heroui

- WHEN inspecting `tailwind.config.js`
- THEN it SHALL not require or call `@heroui/theme` or `heroui()`
