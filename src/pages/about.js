import Layout from '../components/layout/Layout';
import NoSSR from '../lib/NoSSR';
import { useGithubContent } from '../lib/useGithubContent';
export default function About() {
  const { about } = useGithubContent();

  return (
    <Layout>
      <NoSSR>
        <div dangerouslySetInnerHTML={{ __html: about }}></div>
      </NoSSR>
    </Layout>
  );
}
