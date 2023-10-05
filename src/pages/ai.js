'use client';

import RootLayout from './layout';
import { useLocalStorageState, useTitle } from 'ahooks';
import { useTranslation } from 'react-i18next';
import { IssueList } from '../components/IssueList';
import { QuestionTabs } from '../components/QuestionTabs';
export default function AI() {
  const [content, setContent] = useLocalStorageState('QandA', {
    defaultValue: [],
  });

  const { t } = useTranslation();
  useTitle(t('header.ai'));

  const append = (qandA) => {
    if (!content){
      setContent([qandA])
    } else {
      setContent([qandA, ...content])
    }
    
  }

  return (
    <RootLayout>
      <div className="min-h-max w-auto text-lg lg:gap-8 lg:m-8 ">
        <QuestionTabs append={append} />
        <IssueList data={content} ComponentName={'Chat'}  />
      </div>
    </RootLayout>
  );
}
