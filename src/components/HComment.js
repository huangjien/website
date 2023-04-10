import { Avatar, Collapse, Row, Spacer } from '@nextui-org/react';
import { useTranslation } from 'react-i18next';

export const HComment = (comment) => {
  const { t } = useTranslation();

  return (
    <>
      {comment?.comment && (
        <Collapse
          shadow
          bordered
          title={
            <Row>
              <Avatar
                zoomed
                bordered
                text={comment.comment['user.login']}
                src={comment.comment['user.avatar_url']}
              />
              <Spacer x={1} />
              <b>{comment.comment['user.login']}</b>
            </Row>
          }
          subtitle={
            t('issue.created') +
            ': ' +
            comment.comment.created_at +
            '  ' +
            t('issue.last_update') +
            ': ' +
            comment.comment.updated_at
          }
          key={comment.comment.id}
        >
          <div dangerouslySetInnerHTML={{ __html: comment.comment.html }}></div>
        </Collapse>
      )}
    </>
  );
};
