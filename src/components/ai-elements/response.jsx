import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";

// Response: render assistant markdown content with code highlighting
export function Response({ children }) {
  const content =
    typeof children === "string" ? children : String(children ?? "");
  return (
    <div className='prose prose-neutral dark:prose-invert max-w-none overflow-wrap-break-word break-words'>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{
          // Custom code block component to handle overflow
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline ? (
              <code className={className} {...props}>
                {children}
              </code>
            ) : (
              <code className='break-all' {...props}>
                {children}
              </code>
            );
          },
          // Custom pre component to handle horizontal scroll for code blocks
          pre({ children }) {
            return <div className='overflow-x-auto'>{children}</div>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default Response;
