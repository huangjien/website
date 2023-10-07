import { useGithubContent } from '../lib/useGithubContent';
import RootLayout from './layout';
import { useTitle } from 'ahooks';
import { useTranslation } from 'react-i18next';
import { IssueList } from '../components/IssueList';

export default function Home() {
  const { tags, issues } = useGithubContent();
  const { t } = useTranslation();
  useTitle(t('header.home'));
  return (
    <RootLayout>
      <IssueList data={issues} ComponentName={'Issue'} />
    </RootLayout>
  );
}
