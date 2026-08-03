import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { SmartImage } from "./SmartImage";

/**
 * Renders GitHub-flavoured markdown with raw HTML support.
 * Accepts a `className` prop applied to a wrapping div — react-markdown@10
 * removed `className` from the root `<Markdown>` element, so the class
 * must live on a wrapper.
 */
export const MarkdownContent = ({
  children,
  className,
  rehypePlugins = [],
}) => {
  return (
    <div className={className}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, ...rehypePlugins]}
        components={{
          img: SmartImage,
        }}
      >
        {children}
      </Markdown>
    </div>
  );
};
