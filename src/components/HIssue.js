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
                        <Text key='created_at' >{"created: " + data.created_at}</Text>
                        <Spacer x={2} />
                        <Badge key='status' enableShadow disableOutline color={data.state === 'open' ? 'success' : 'error'}>{data.state}</Badge>
                        <Spacer x={2} />
                        {data['labels.name'] &&
                            data['labels.name'].map(label => (
                                <>
                                    <Spacer x={1} />
                                    <Badge key={label} enableShadow disableOutline >{label}</Badge>
                                </>
                            )
                            )
                        }
                    </Grid.Container>

                    <Spacer y={1} />
                    <div dangerouslySetInnerHTML={{ __html: data.html }} ></div>
                </Collapse>
            }
        </>

    )

}