import React from "react";

// Message: container for user/assistant messages
export function Message({ role = "assistant", children, className = "" }) {
  const isUser = role === "user" || role === "system-user";
  return (
    <div
      className={`flex items-start gap-3 w-full ${className}`}
      data-role={role}
      data-testid={`message-${role}`}
    >
      <div
        className={`rounded-lg px-3 py-2 text-sm leading-relaxed w-full whitespace-pre-wrap break-words ${
          isUser
            ? "bg-blue-600 text-white dark:bg-blue-500"
            : "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

// MessageContent: simple content wrapper for messages (markdown/plain)
export function MessageContent({ children }) {
  return (
    <div className='prose prose-neutral dark:prose-invert max-w-none'>
      {children}
    </div>
  );
}

export default Message;
