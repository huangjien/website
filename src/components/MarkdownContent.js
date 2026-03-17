import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { SmartImage } from "./SmartImage";

export const MarkdownContent = ({
  children,
  className,
  rehypePlugins = [],
}) => {
  return (
    <Markdown
      className={className}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, ...rehypePlugins]}
      components={{
        img: SmartImage,
      }}
    >
      {children}
    </Markdown>
  );
};
