import RootLayout from './layout';
import { useTitle } from 'ahooks';
import { useTranslation } from 'react-i18next';
import { useGithubContent } from '../lib/useGithubContent';

export default function About() {
  const { about } = useGithubContent();
  const { t } = useTranslation();
  useTitle(t('header.about'));

  return (
    <RootLayout>
      <div className="prose" dangerouslySetInnerHTML={{ __html: about }}></div>
    </RootLayout>
  );
}
