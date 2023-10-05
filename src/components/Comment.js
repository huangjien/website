import { Avatar, Accordion, AccordionItem, Spacer } from '@nextui-org/react';
import { useTranslation } from 'react-i18next';

export const Comment = ({ comment }) => {
  const { t } = useTranslation();
  console.log(comment);
  return (
    <>
      {comment && (
        <Accordion
          shadow
          bordered
          title={
            <div>
              <Avatar
                zoomed
                bordered
                text={comment['user.login']}
                src={comment['user.avatar_url']}
              />

              <b>{comment['user.login']}</b>
            </div>
          }
          subtitle={
            t('issue.created') +
            ': ' +
            comment.created_at +
            '  ' +
            t('issue.last_update') +
            ': ' +
            comment.updated_at
          }
          key={comment.id}
        >
          <AccordionItem>
            <div dangerouslySetInnerHTML={{ __html: comment.html }}></div>
          </AccordionItem>
        </Accordion>
      )}
    </>
  );
};
