import { Grid, Text } from '@nextui-org/react'
import { useTranslation } from 'react-i18next'

const question = (data) => {
    return (
        <Grid xs={12} >
            <Text>{data}</Text>
        </Grid>
    )
}

const answer = (data) => {
    return (
        <Grid xs={12}>
            <div dangerouslySetInnerHTML={{ __html: data }}></div>
        </Grid>
    )
}


const sampleData = [
    {question: 'This is a question', answer: 'The code looks like below:\n\n```This is code```\n Finished here.'},
    {question: 'This is another question', answer: '### title\n\n content \n\n'}
]

const ai = () => {
    const [content, setContent] = useState(sampleData)
    const {t} = useTranslation()

useEffect(() => {

}, [content])

    return (
        <>
        <Grid.Container gap = {1} justify="center">
            {/* display question and answer here */}


            {/* display input here */}
        </Grid.Container>
        </>
    )
}