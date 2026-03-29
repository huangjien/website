# Phase 22 Discussion: Issue POST API Contract Tests

## Context

Phase 22 adds API contract tests for POST /api/issues. The endpoint already exists but lacks test coverage.

## Current State

**`/api/issues`**

- GET: Returns list of issues (tested ✅)
- POST: Creates new issue (NOT tested ❌)

## Test Cases to Add

| Test | Description                           | Expected Behavior |
| ---- | ------------------------------------- | ----------------- |
| 1    | POST without auth                     | 401 Unauthorized  |
| 2    | POST with auth, no body               | 400 Bad Request   |
| 3    | POST with auth, title only            | 201 Created       |
| 4    | POST with auth, title + body          | 201 Created       |
| 5    | POST with auth, title + labels        | 201 Created       |
| 6    | POST with empty title                 | 400 Bad Request   |
| 7    | POST with title too long (>200 chars) | 400 Bad Request   |

## Validation Rules (from Charter)

| Field  | Rule                         |
| ------ | ---------------------------- |
| title  | Required, 1-200 characters   |
| body   | Optional, 0-65536 characters |
| labels | Optional, max 20 labels      |

## Questions for Discussion

1. Should validation be added to the API (currently passes through to GitHub)?
2. Should we add rate limiting to issue creation?
3. Proceed with test implementation?

---

**Recommendation:** Proceed with Option B - Add validation tests only (let GitHub handle actual limits).
