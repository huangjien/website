import { useRequest, useSessionStorageState } from 'ahooks';
import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
// import { getReadme } from '../lib/Requests';
import { aboutContent } from '../lib/global';
import { getMarkDownHtml, getReadme } from '../lib/Requests';
export default function About() {
    const [bio, setBio] = useSessionStorageState(aboutContent);
    const [htmlContent, setHtmlContent] = useState();
    useRequest(getReadme, {
        onSuccess: (result) => {
            setBio(result)
        }
    })

    useEffect(() => {
        if (bio) {
            getMarkDownHtml(bio).then(
                (content) => {
                    // console.log(content)
                    setHtmlContent(content)
                }
            )
        }
    }, [bio])

    return (
        <Layout>
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} ></div>
        </Layout>
    )
}