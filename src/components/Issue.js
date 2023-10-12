import { Accordion, AccordionItem, Chip } from '@nextui-org/react';
import { useTranslation } from 'react-i18next';
import { Comment } from './Comment';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { IssueModal } from './IssueModal';
import { useAuth } from '../lib/useAuth';

export const Issue = ({ issue }) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <>
      {issue && (
        <Accordion
          aria-label={issue.title}
          shadow
          bordered
          className="m-2 w-fit"
        >
          <AccordionItem
            aria-label={issue.title}
            title={
              <div className=" lg:inline-flex flex-wrap justify-items-stretch items-stretch justify-between">
                <h2 className=" font-semibold text-xl">{issue.title}</h2>
                {issue['labels.name']?.map((label) => (
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
            {user && <IssueModal issue={issue} action={'edit'} />}
            <div className="prose prose-stone dark:prose-invert lg:prose-xl max-w-fit">
              <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {issue.body}
              </Markdown>
            </div>
            {issue.comments > 0 && (
              <Comment className="ml-8" issue_id={issue.number} />
            )}
          </AccordionItem>
        </Accordion>
      )}
    </>
  );
};
