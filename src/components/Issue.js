import { Accordion, AccordionItem, Chip } from '@nextui-org/react';
import { useTranslation } from 'react-i18next';
import { Comment } from './Comment';
import { useGithubContent } from '../lib/useGithubContent';
import { useEffect, useState } from 'react';

export const Issue = ({ issue }) => {
  const { t } = useTranslation();
  const { getHtml } = useGithubContent();
  const [html, setHtml] = useState('');

  useEffect(() => {
    if (!issue?.html) {
      getHtml(issue.body).then((data) => setHtml(data));
    }
  }, [getHtml, issue.body, issue?.html]);

  return (
    <>
      {issue && (
        <Accordion
          aria-label={issue.title}
          shadow
          bordered
          className="m-2 w-fit"
        >
          <AccordionItem aria-label={issue.title}
            title={
              <div className=" inline-flex justify-items-stretch items-stretch justify-between">
                <h2 className=" font-semibold text-xl">{issue.title}</h2>
                {issue['labels.name'] &&
                  issue['labels.name'].map((label) => (
                    <div key={label}>
                      {/* <Spacer x={0.5} /> */}
                      <Chip className=" m-2">{label}</Chip>
                    </div>
                  ))}
                {/*  TODO: not sure how to present this part yet
                 <Chip
                  aria-label={issue.state}
                  color={issue.state === 'open' ? 'success' : 'error'}
                >{issue.state}</Chip> */}
              </div>
            }
            subtitle={
              (issue.created_at === issue.updated_at
                ? ''
                : t('issue.last_update') + ': ' + issue.updated_at.toString()) +
              ' ' +
              t('issue.created') +
              ': ' +
              issue.created_at.toString()
            }
          >
            <div className="prose prose-stone dark:prose-invert lg:prose-xl max-w-fit">
              <div dangerouslySetInnerHTML={{ __html: html }}></div>
            </div>

            {issue.commentList &&
              issue.commentList.map((commentArray) => (
                <Comment key={commentArray.id} comment={commentArray} />
              ))}
          </AccordionItem>
        </Accordion>
      )}
    </>
  );
};
