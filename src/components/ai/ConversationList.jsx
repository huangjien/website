import React from "react";

/**
 * ConversationList
 * Lists saved conversations and allows selecting one.
 */
export default function ConversationList({ conversations = [], onSelect, onDelete }) {
  if (!Array.isArray(conversations)) conversations = [];

  return (
    <div className="rounded-md border border-gray-200 p-3 dark:border-gray-700">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Conversations</div>
      {conversations.length === 0 ? (
        <div className="text-sm text-gray-500 dark:text-gray-400">No conversations yet.</div>
      ) : (
        <ul className="space-y-2">
          {conversations.map((c, idx) => (
            <li key={c.id || idx} className="flex items-center justify-between gap-2">
              <button
                type="button"
                className="flex-1 truncate text-left text-sm underline-offset-2 hover:underline"
                onClick={() => onSelect?.(c, idx)}
                title={c?.question || c?.title || `Conversation ${idx + 1}`}
              >
                {c?.question?.slice(0, 80) || c?.title || `Conversation ${idx + 1}`}
              </button>
              <button
                type="button"
                className="inline-flex h-7 items-center justify-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                onClick={() => onDelete?.(c, idx)}
                aria-label="delete"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}