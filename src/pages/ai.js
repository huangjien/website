'use client';

import RootLayout from './layout';
import { useLocalStorageState, useTitle } from 'ahooks';
import { useTranslation } from 'react-i18next';
import { IssueList } from '../components/IssueList';
import { QuestionTabs } from '../components/QuestionTabs';
export default function AI() {
  const [content] = useLocalStorageState('QandA', {
    defaultValue: [],
  });

  const { t } = useTranslation();
  useTitle(t('header.ai'));

  return (
    <RootLayout>
      <div className="min-h-max w-auto text-lg lg:gap-8 lg:m-8 ">
        <QuestionTabs />
        <IssueList data={content} ComponentName={'Chat'} />
      </div>
    </RootLayout>
  );
}
