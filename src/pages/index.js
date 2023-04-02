import { HList } from '../components/HList';
import Layout from '../components/layout/Layout';
import { useGithubContent } from '../lib/useGithubContent';

const Index = () => {
  const { tags, issues } = useGithubContent()

  return (
    <Layout>
      <HList header={tags} data={issues} />
    </Layout>
  );
};
export default Index;
