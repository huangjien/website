import { useTitle } from 'ahooks';
import { useTranslation } from 'react-i18next';
import Layout from '../components/layout/Layout';
import NoSSR from '../lib/NoSSR';
import { useGithubContent } from '../lib/useGithubContent';
export default function About() {
  const { about } = useGithubContent();
  const { t } = useTranslation()
  useTitle(t('header.about'))

  return (
    <Layout>
      <NoSSR>
        <div dangerouslySetInnerHTML={{ __html: about }}></div>
      </NoSSR>
    </Layout>
  );
}
