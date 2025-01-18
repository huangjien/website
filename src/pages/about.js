import { useTitle } from "ahooks";
import { useTranslation } from "react-i18next";
import { useGithubContent } from "../lib/useGithubContent";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

export default function About() {
  const { about } = useGithubContent();
  const { t } = useTranslation();
  useTitle(t("header.about"));

  /**
   * Renders the content of the 'about' variable obtained from the 'useGithubContent' hook.
   * The content is displayed using the 'Markdown' component with the 'remark-gfm' and 'rehype-raw' plugins.
   *
   * @returns {JSX.Element} The rendered content of the 'about' variable.
   */
  return (
    <div className='prose prose-2xl dark:prose-invert justify-center items-center gap-8 m-2 w-full'>
      <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {about}
      </Markdown>
    </div>
  );
}
