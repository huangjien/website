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
    <div className='prose prose-neutral dark:prose-invert max-w-none'>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default Response;
