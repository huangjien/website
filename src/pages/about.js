import RootLayout from './layout';
import { useTitle } from 'ahooks';
import { useTranslation } from 'react-i18next';
import { useGithubContent } from '../lib/useGithubContent';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export default function About() {
  const { about } = useGithubContent();
  const { t } = useTranslation();
  useTitle(t('header.about'));

  return (
    <RootLayout>
      <div className="prose prose-2xl dark:prose-invert justify-center items-center gap-8 m-2 w-full">
        <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {about}
        </Markdown>
      </div>
    </RootLayout>
  );
}
