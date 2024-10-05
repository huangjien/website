'use client';

import { useLocalStorageState, useTitle, useDebounceEffect } from 'ahooks';
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
    if (!content) {
      setContent([qandA]);
    } else {
      setContent([qandA, ...content]);
    }
  };

  useDebounceEffect(
    () => {
      // if content.length > 100, then delete all records of one month ago
      if (content.length > 1000) {
        const now = new Date();
        const oneMonthAgo = new Date(
          now.getTime() - 1000 * 60 * 60 * 24 * 30
        ).getTime();
        // const oneMonthAgo = new Date(now.getTime() - 1000 * 60 * 60).getTime();
        const oneMonthTimestamp = Math.round(oneMonthAgo / 1000);
        const newArray = content.filter((item) => {
          return item.timestamp > oneMonthTimestamp;
        });
        setContent(newArray);
      }
    },
    [content],
    { wait: 200000 }
  );

  return (
    <div className="min-h-max w-auto text-lg lg:gap-4 lg:m-4 ">
      <QuestionTabs append={append} />
      <IssueList data={content} ComponentName={'Chat'} />
    </div>
  );
}
