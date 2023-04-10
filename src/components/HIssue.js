import { Badge, Collapse, Grid, Spacer, Text } from '@nextui-org/react';
import { useTranslation } from 'react-i18next';
import { HComment } from './HComment';

export const HIssue = (issue) => {
  const { t } = useTranslation();

  return (
    <>
      <Spacer y={1} />
      {issue && (
        <Collapse
          shadow
          bordered
          key={issue.issue.updated_at}
          title={issue.issue.title}
          subtitle={t('issue.last_update') + ': ' + issue.issue.updated_at}
        >
          <Grid.Container alignItems="center" gap={1}>
            <Grid>
              <Text>{t('issue.created') + ': ' + issue.issue.created_at}</Text>
            </Grid>

            <Grid>
              <Badge
                enableShadow
                disableOutline
                color={issue.issue.state === 'open' ? 'success' : 'error'}
              >
                {issue.issue.state}
              </Badge>
            </Grid>
            <Grid></Grid>
            {issue.issue['labels.name'] &&
              issue.issue['labels.name'].map((label) => (
                <Grid key={label}>
                  {/* <Spacer x={0.5} /> */}
                  <Badge enableShadow disableOutline>
                    {label}
                  </Badge>
                </Grid>
              ))}
          </Grid.Container>

          <Spacer key="last_spacer" y={1} />
          <div dangerouslySetInnerHTML={{ __html: issue.issue.html }}></div>
          {/* if contains comments, put here */}
          {issue.issue?.commentList &&
            // <pre key={issue.issue.id}>
            //   {JSON.stringify(issue.issue.commentList)}
            // </pre>}
            issue.issue.commentList.map((comment) => (
              <HComment key={comment.id} comment={comment} />
            ))}
        </Collapse>
      )}
    </>
  );
};
