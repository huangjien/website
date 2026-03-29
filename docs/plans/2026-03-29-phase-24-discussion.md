# Phase 24 Discussion: Frontend UI Integration

## Context

Phase 24 adds frontend UI integration for creating GitHub issues and comments.

## Current State

### IssueModal.js

- ✅ Has UI for creating/editing issues (title, body, labels)
- ❌ **No API integration** - Save button just closes modal

### Comment.js

- ✅ Has UI for displaying comments (read-only)
- ✅ Fetches comments from GET /api/comments
- ❌ **No UI for creating new comments**

## Implementation Plan

### 1. IssueModal.js - Add API Integration

**Current:** Save button just calls `handleClose()`

**New:** Save button calls `POST /api/issues`

```javascript
const handleSave = async () => {
  if (!title.trim()) {
    alert("Title is required");
    return;
  }
  try {
    const res = await fetch("/api/issues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body: content, labels }),
    });
    if (res.ok) {
      // Refresh data
      handleClose();
    } else {
      const error = await res.json();
      alert(error.error || "Failed to create issue");
    }
  } catch (err) {
    alert("Failed to create issue");
  }
};
```

### 2. Comment.js - Add Create Comment Form

**Add:** Form at bottom of comment list to add new comment

```javascript
const [newComment, setNewComment] = useState("");
const handleSubmitComment = async () => {
  if (!newComment.trim()) return;
  try {
    const res = await fetch(`/api/comments?issue_number=${issue_id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: newComment }),
    });
    if (res.ok) {
      setNewComment("");
      // Refresh comments
    }
  } catch (err) {
    alert("Failed to add comment");
  }
};
```

## Components to Update

| Component       | Change                       |
| --------------- | ---------------------------- |
| `IssueModal.js` | Add POST /api/issues on save |
| `Comment.js`    | Add comment creation form    |

## Questions for Discussion

1. Should we add loading states during API calls?
2. Should we add success/error notifications?
3. Proceed with implementation?

---

**Recommendation:** Proceed with implementation - add API integration with basic loading states and error handling.
