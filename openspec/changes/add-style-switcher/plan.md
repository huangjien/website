# Design Style Switcher Plan

## Goal

Add a new "Design Style" switcher to the navigation bar that allows users to toggle between different UI design trends.

## Requirements

- **Location**: Beside 'language' on the navigation bar.
- **Options**:
  - Glassmorphism (Default)
  - Neumorphism
  - Claymorphism
  - Minimalism
  - Brutalism
  - Skeuomorphism
  - Bento Grid
  - Responsive
  - Flat Design
- **Helper**: Use `ui-ux-pro-max` to help implement these styles.

## Architecture

### 1. `ui-ux-pro-max` Library

Since `ui-ux-pro-max` does not exist in the codebase, we will create it as a utility library: `src/lib/ui-ux-pro-max.js`.

- It will export the list of available styles.
- It will provide the CSS class definitions or variable mappings for each style.
- It will handle the logic of applying the style (e.g., setting a `data-design-style` attribute on the `<html>` or `<body>` tag).

### 2. State Management

- Update `src/lib/useSettings.js` to store `currentStyle` in session/local storage.
- Default value: `glassmorphism`.

### 3. Components

- **`StyleSwitch.js`**: A new component similar to `LanguageSwitch.js`.
  - Uses `ui-ux-pro-max` to get the list of styles.
  - Uses `useSettings` to get/set the current style.
  - Renders a dropdown menu (using `@radix-ui/react-dropdown-menu` and `shadcn/ui` components).
- **`NavigationBar.js`**: Add `StyleSwitch` component beside `LanguageSwitch`.

### 4. Global Styling

- Update `src/styles/globals.css` (or `globals.css`) to define the visual rules for each `data-design-style`.
- Alternatively, `ui-ux-pro-max` can inject these styles or we can use Tailwind's arbitrary variants if possible, but CSS variables are cleaner for switching themes.
- **Style Definitions**:
  - **Glassmorphism**: Translucent backgrounds, blur effects, white borders (Current default look).
  - **Neumorphism**: Soft shadows, low contrast, "extruded" plastic look.
  - **Claymorphism**: 3D floating effect, rounded corners, strong inner shadows.
  - **Minimalism**: Clean, lots of whitespace, simple borders, no shadows.
  - **Brutalism**: High contrast, thick borders, raw colors, sharp corners.
  - **Skeuomorphism**: Realistic textures (simulated), gradients, bevels.
  - **Bento Grid**: Card-based layout emphasis (might just affect spacing/borders).
  - **Responsive**: (Standard behavior, maybe emphasizes fluid typography).
  - **Flat Design**: No shadows, solid colors, simple 2D elements.

## Tasks

- [ ] 1. Create `src/lib/ui-ux-pro-max.js`
  - [ ] Define style constants.
  - [ ] Define helper functions to apply styles.
- [ ] 2. Update `src/lib/useSettings.js`
  - [ ] Add `currentStyle` state with default `glassmorphism`.
  - [ ] Expose `currentStyle` and `setCurrentStyle`.
- [ ] 3. Create `src/components/StyleSwitch.js`
  - [ ] Implement dropdown UI.
  - [ ] Connect to `useSettings`.
- [ ] 4. Update `src/components/NavigationBar.js`
  - [ ] Import and render `StyleSwitch`.
- [ ] 5. Implement Styles in `src/styles/globals.css`
  - [ ] Define CSS variables/classes for each style in `ui-ux-pro-max` context.
  - [ ] Ensure `data-design-style` attribute triggers these changes.
- [ ] 6. Apply Style Logic
  - [ ] Create a hook or effect (in `_app.js` or `layout.js`) to apply the `data-design-style` attribute to `document.documentElement` based on `currentStyle`.
- [ ] 7. Verification
  - [ ] Verify switching styles changes the UI appearance.
  - [ ] Verify persistence on reload.
- [ ] 8. L10N
  - [ ] Add translation keys for style options.
