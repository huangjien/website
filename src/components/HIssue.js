import { Badge, Collapse, Grid, Spacer, Text } from '@nextui-org/react';

export const HIssue = (issue) => {
  // const [data, setData] = useState();

  // useEffect(() => {
  //   if (issue) {
  //     // setData(issue.issue)
  //     getMarkDownHtml(issue.issue.body).then((content) => {
  //       setData({ ...issue.issue, html: content });
  //     });
  //   }
  // }, [issue]);
  return (
    <>
      <Spacer y={1} />
      {issue && (
        <Collapse
          shadow
          bordered
          key={issue.issue.updated_at}
          title={issue.issue.title}
          subtitle={'last updated: ' + issue.issue.updated_at}
        >
          <Grid.Container alignItems="center" gap={1}>
            <Grid>
              <Text>{'created: ' + issue.issue.created_at}</Text>
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
        </Collapse>
      )}
    </>
  );
};
