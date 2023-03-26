import { Collapse } from '@nextui-org/react';
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
            {data &&
                <Collapse key={data.updated_at} title={data.title} subtitle={'last updated: ' + data.updated_at + "   created: " + data.created_at + "   status: " + data.state}>
                    <div dangerouslySetInnerHTML={{ __html: data.html }} ></div>
                </Collapse>
            }
        </>


    )

}