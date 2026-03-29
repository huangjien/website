# Milestone 5 Charter

**Milestone:** #5 - GitHub Issue & Comment Creation  
**Created:** 2026-03-29  
**Status:** Active - Confirmed Scope

---

## Executive Summary

Add capabilities for authenticated users to create GitHub issues and comments through the website. This enables user interaction without requiring direct GitHub access.

---

## Confirmed Scope

| Feature            | Include | Notes                                  |
| ------------------ | ------- | -------------------------------------- |
| Issue POST (API)   | ✅      | Already exists                         |
| Comment POST (API) | ✅      | Needs implementation                   |
| Frontend UI        | ✅      | Create issue/comment forms             |
| Validation         | ✅      | Title length, body length, rate limits |
| Rate Limiting      | ✅      | Prevent spam                           |

---

## Validation Rules

| Field        | Rule                             |
| ------------ | -------------------------------- |
| Issue title  | 1-200 characters                 |
| Issue body   | 0-65536 characters               |
| Comment body | 1-65536 characters               |
| Labels       | Max 20 labels, each max 50 chars |

---

## Rate Limiting Strategy

| Action         | Limit                |
| -------------- | -------------------- |
| Create issue   | 10 per hour per user |
| Create comment | 30 per hour per user |

Implementation: Use existing `rateLimit.js` with sliding window.

---

## Frontend UI Components

### 1. Create Issue Button/Form

- Appears in NavigationBar or IssueList
- Modal or inline form
- Fields: Title (required), Body (optional), Labels (optional)

### 2. Create Comment Form

- Appears in IssueDetail or IssueModal
- Fields: Body (required)
- Appears on existing issues

---

## API Endpoints

### POST /api/issues

**Status:** Already implemented

**Request:**

```json
{
  "title": "Issue title (1-200 chars)",
  "body": "Issue description (0-65536 chars)",
  "labels": ["bug", "help wanted"]
}
```

**Response:** GitHub Issue object

---

### POST /api/comments (NEW)

**Status:** Needs implementation

**Request:**

```json
{
  "body": "Comment text (1-65536 chars)"
}
```

**Response:** GitHub Comment object

---

## Phases

| Phase    | Work             | Description                                 |
| -------- | ---------------- | ------------------------------------------- |
| Phase 22 | Issue POST Tests | Add API contract tests for POST /api/issues |
| Phase 23 | Comment POST     | Implement POST method for comments          |
| Phase 24 | Frontend UI      | Add create issue/comment forms              |

---

## Success Criteria

| Criteria                                | Status  |
| --------------------------------------- | ------- |
| POST /api/issues tested                 | Pending |
| POST /api/comments implemented & tested | Pending |
| Frontend issue creation form            | Pending |
| Frontend comment form                   | Pending |
| Rate limiting active                    | Pending |
| All quality gates pass                  | Pending |
