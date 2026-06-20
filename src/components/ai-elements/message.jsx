import React from "react";

// Message: container for user/assistant messages.
// User → right-aligned, solid primary bubble. Assistant → left-aligned, surface bubble.
export function Message({ role = "assistant", children, className = "" }) {
  const isUser = role === "user" || role === "system-user";
  const slideAnimation = isUser ? "animate-slide-left" : "animate-slide-right";

  return (
    <div
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"} ${slideAnimation} ${className}`}
      data-role={role}
      data-testid={`message-${role}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap wrap-break-word transition-shadow duration-normal ease-out ${
          isUser
            ? "glass-message-user text-primary-foreground rounded-br-sm hover:shadow-glass"
            : "glass-message-assistant text-foreground rounded-bl-sm hover:shadow-glass"
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
    <div className='prose prose-neutral dark:prose-invert max-w-none overflow-wrap-break-word break-words'>
      {children}
    </div>
  );
}

export default Message;
