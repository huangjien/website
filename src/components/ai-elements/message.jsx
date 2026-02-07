import React from "react";

// Message: container for user/assistant messages
export function Message({ role = "assistant", children, className = "" }) {
  const isUser = role === "user" || role === "system-user";
  // User messages slide from right, assistant messages slide from left
  const slideAnimation = isUser ? "animate-slide-right" : "animate-slide-left";

  return (
    <div
      className={`flex items-start gap-3 w-full ${slideAnimation} ${className}`}
      data-role={role}
      data-testid={`message-${role}`}
    >
      <div
        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed w-full whitespace-pre-wrap break-words transition-all duration-fast cursor-pointer ${
          isUser
            ? "glass-message-user text-white hover:shadow-glass-glow-hover hover:scale-[1.01]"
            : "glass-message-assistant text-foreground hover:shadow-glass-hover hover:scale-[1.01]"
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
