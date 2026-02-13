# Website Codebase Improvement Plan

## Phase 1: Critical Bug Fixes (High Priority)

1. Fix typos in `src/components/ai-elements/response.jsx`:
   - Line 12: Fix className syntax error
   - Line 19: Fix regex pattern for language detection
2. Fix typos in `src/pages/api/transcribe.js`:
   - Line 15: Correct API endpoint URL
   - Line 16: Fix property name from "header" to "headers"
3. Fix typo in `.prettierrc`:
   - Line 9: Change "trailingComma" to "trailingComma"

## Phase 2: Remove Debug Code (High Priority)

1. Remove all console.log/warn/error statements from production code (31 files)
2. Replace with proper logging utility for development only
3. Focus on high-frequency components: Comment.js, ai.js, useAudioRecording.js

## Phase 3: Security Enhancements (Medium Priority)

1. Add request payload size limits to API routes
2. Implement proper input sanitization for all API endpoints
3. Add CSRF protection for state-changing operations
4. Enhance error messages to not expose internal details

## Phase 4: Performance Optimizations (Medium Priority)

1. Add React.memo to expensive components (Issue, Comment, Conversation)
2. Implement useCallback/useMemo in components with complex computations
3. Set up bundle size limits in next.config.js
4. Implement dynamic imports for non-critical components

## Phase 5: Code Quality Improvements (Low Priority)

1. Standardize export patterns (prefer named exports for components)
2. Extract duplicate fetch logic to shared API client
3. Add JSDoc comments to all public functions
4. Run dependency audit and remove unused packages
5. Add integration tests for API routes
6. Add visual regression tests

## Estimated Impact

- **Phase 1-2**: 2-3 hours - Critical bugs and production cleanup
- **Phase 3**: 2-3 hours - Security hardening
- **Phase 4**: 3-4 hours - Performance improvements
- **Phase 5**: 4-6 hours - Long-term maintainability

## Testing Plan

After each phase:

1. Run `pnpm lint:fix` to ensure code quality
2. Run `pnpm test` to ensure no regressions
3. Run `pnpm type-check` to catch type errors
4. Run `pnpm e2e` for end-to-end verification
