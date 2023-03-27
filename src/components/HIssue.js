import { Badge, Collapse, Grid, Spacer, Text } from '@nextui-org/react';
import { useEffect, useState } from 'react';
import { getMarkDownHtml } from '../lib/Requests';

export const HIssue = (issue) => {
    const [data, setData] = useState()

    useEffect(() => {
        if (issue) {
            // setData(issue.issue)
            getMarkDownHtml(issue.issue.body).then(
                (content) => {
                    setData({ ...issue.issue, html: content })
                }
            )
        }
    }, [issue]);
    return (
        <>
            <Spacer y={1} />
            {data &&
                <Collapse shadow bordered key={data.updated_at} title={data.title} subtitle={'last updated: ' + data.updated_at}>
                    <Grid.Container alignItems="center" gap={1}>
                        <Text >{"created: " + data.created_at}</Text>
                        <Spacer x={2} />
                        <Badge enableShadow disableOutline color={data.state === 'open' ? 'success' : 'error'}>{data.state}</Badge>
                        <Spacer x={2} />
                        {data['labels.name'] &&
                            data['labels.name'].map((label) => (
                                <div key={label}>
                                    <Spacer x={0.5} />
                                    <Badge enableShadow disableOutline >{label}</Badge>
                                </div>
                            )
                            )
                        }
                    </Grid.Container>

                    <Spacer key="last_spacer" y={1} />
                    <div dangerouslySetInnerHTML={{ __html: data.html }} ></div>
                </Collapse>
            }
        </>

    )

}