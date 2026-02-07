import React from "react";

// Conversation: simple layout wrapper for a chat thread
export function Conversation({ children, className = "" }) {
  return (
    <div className={`w-full ${className}`}>
      <div className='flex flex-col gap-4' data-testid='conversation'>
        {children}
      </div>
    </div>
  );
}

// ConversationContent: container to wrap messages, allows future virtualization or grouping
export function ConversationContent({ children, className = "" }) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          // Add staggered animation delay based on index
          const delayStyle = {
            animationDelay: `${index * 100}ms`,
          };
          return (
            <div style={delayStyle} className='animate-slide-up'>
              {child}
            </div>
          );
        }
        return child;
      })}
    </div>
  );
}

export default Conversation;
