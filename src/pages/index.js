import { useGithubContent } from '../lib/useGithubContent';
import RootLayout from './layout';
import { useTitle } from 'ahooks';
import { useTranslation } from 'react-i18next';
import { IssueList } from '../components/IssueList';
import { Issue } from '../components/Issue';

export default function Home() {
  const { tags, issues } = useGithubContent();
  const { t } = useTranslation();
  useTitle(t('header.home'));
  return (
    <RootLayout>
      {/* <ScrollShadow offset={8}  > */}
      {/* <div className="flex flex-col items-center justify-between p-24"> */}
      {/* <pre>{JSON.stringify(issues, null, 2)}</pre> */}
      {/* </ScrollShadow> */}
      {/* </div> */}
      <IssueList data={issues} ComponentName={'Issue'} />
    </RootLayout>
  );
}
