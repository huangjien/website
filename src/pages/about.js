import { useTitle } from "ahooks";
import { useTranslation } from "react-i18next";
import { useGithubContent } from "../lib/useGithubContent";
import { MarkdownContent } from "../components/MarkdownContent";

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
    <div className='hallmark-page'>
      <article className='hallmark-prose'>
        <MarkdownContent>{about}</MarkdownContent>
      </article>
    </div>
  );
}
