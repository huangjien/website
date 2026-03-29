# Phase 23 Discussion: Comment POST Implementation

## Context

Phase 23 adds POST support to `/api/comments` for creating GitHub issue comments.

## Current State

**`/api/comments`** (GET only)

- ✅ Already requires authentication
- ✅ Validates issue_number query parameter
- ❌ Only supports GET (read comments)
- ❌ No POST support for creating comments

## Implementation Plan

### Changes to `/api/comments.js`

1. **Add POST to allowed methods**
   - Change `["GET"]` to `["GET", "POST"]`

2. **Add body validation for POST**
   - body: Required, 1-65536 characters

3. **Add POST fetch call**
   - Use same GitHub API endpoint
   - POST with `{ body: string }` in request body

### GitHub API Reference

```
POST /repos/{owner}/{repo}/issues/{issue_number}/comments
{
  "body": "Comment text"
}
```

## Validation Rules

| Field        | Rule                         |
| ------------ | ---------------------------- |
| body         | Required, 1-65536 characters |
| issue_number | Required (from query params) |

## Test Cases to Add

| Test                    | Description        | Expected         |
| ----------------------- | ------------------ | ---------------- |
| POST without auth       | No session         | 401 Unauthorized |
| POST without body       | body missing       | 400 Bad Request  |
| POST with empty body    | body = ""          | 400 Bad Request  |
| POST with valid body    | body = "Comment"   | 201 Created      |
| POST with body too long | body > 65536 chars | 400 Bad Request  |

## Questions for Discussion

1. Should we add rate limiting for comment creation?
2. Any additional validation needed?
3. Proceed with implementation?

---

**Recommendation:** Proceed with implementation - add POST support with body validation.
