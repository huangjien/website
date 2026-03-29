# Phase 15 Discussion: Auth Normalization Phase 2

## Context

Phase 5/6 established auth hardening for settings and issues. ROADMAP Workstream 4 targets extending authorization boundaries.

## Current Auth State Audit

| Route              | Auth Required | Notes                    |
| ------------------ | ------------- | ------------------------ |
| `/api/settings`    | ✅ Yes        | Session required         |
| `/api/issues` POST | ✅ Yes        | AuthenticationError      |
| `/api/ai`          | ✅ Yes        | Session check            |
| `/api/member`      | ❌ No         | GitHub token only        |
| `/api/labels`      | ❌ No         | GitHub token only        |
| `/api/comments`    | ❌ No         | GitHub token only        |
| `/api/markdown`    | ❌ No         | GitHub token only (POST) |

## Audit Findings

The GitHub token-backed routes (`/api/member`, `/api/labels`, `/api/comments`, `/api/markdown`) expose GitHub API data without user authentication. This means:

1. Anyone can query GitHub repository data (member list, labels, comments)
2. The GitHub token is server-side, but access is unauthenticated
3. This may be intentional for public repositories but exposes internal GitHub structure

## Approaches Considered

### Approach A: Document-only

Document current auth boundaries without behavior changes.

### Approach B: Add session requirement (Consensus: Chosen)

Require user authentication for GitHub-token routes.

### Approach C: Rate-limit consistency audit

Ensure abuse prevention across rate-limited routes.

### Approach D: GitHub token validation

Validate GitHub token rather than user session.

## Chosen Approach

**Approach B: Add session requirement to GitHub-token routes**

## Proposed Scope

1. Add `getServerSession` to `/api/member`
2. Add `getServerSession` to `/api/labels`
3. Add `getServerSession` to `/api/comments`
4. Add `getServerSession` to `/api/markdown`
5. Update tests to verify auth behavior
6. Run verification

## Proposed Slices

1. Auth enforcement slice - Add session checks
2. Test updates slice - Verify auth behavior
3. Verification slice - Run quality gates
