import { useTitle } from 'ahooks';
import { useTranslation } from 'react-i18next';
import { HList } from '../components/HList';
import Layout from '../components/layout/Layout';
import { useGithubContent } from '../lib/useGithubContent';

const Index = () => {
  const { tags, issues } = useGithubContent();
  const { t } = useTranslation();
  useTitle(t('header.home'));
  return (
    <Layout>
      <HList header={tags} data={issues} />
    </Layout>
  );
};
export default Index;
