import {
    Button,
    Card,
    Container,
    Grid,
    Progress,
    Spacer,
    Text,
    Textarea,
    useInput,
} from '@nextui-org/react';
import { useKeyPress, useLocalStorageState, useTitle } from 'ahooks';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BiQuestionMark } from 'react-icons/bi';
import Layout from '../components/layout/Layout';
import NoSSR from '../lib/NoSSR';
import { useGithubContent } from '../lib/useGithubContent';
import { useMessage } from '../lib/useMessage';

const getAnswer = async (question) => {
    const requestBody = {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: question }],
    };
    return await fetch('/api/ai', {
        method: 'POST',
        body: JSON.stringify(requestBody),
    })
        .then((res) => res.json())
        .then((data) => {
            return data;
        });
};

export default function AI() {
    const inputRef = useRef(null);
    const { value: questionText, setValue: setQuestionText, reset } = useInput();
    const [content, setContent] = useLocalStorageState('QandA', {
        defaultValue: [],
    });
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const { getHtml } = useGithubContent();
    useTitle(t('header.ai'));
    const [fatal, success] = useMessage();

    useKeyPress(
        'ctrl.enter',
        () => {
            console.log(questionText);
            if (!questionText) return;
            request2AI();
        },
        {
            target: inputRef,
        }
    );

    useEffect(() => {
        // if content.length > 100, then delete all records of one month ago
        if (content.length > 2) {
            const now = new Date();
            // const oneMonthAgo = new Date(now.getTime() - (1000 * 60 * 60 * 24 * 30)).getTime()
            const oneMonthAgo = new Date(now.getTime() - 1000 * 60 * 60).getTime();
            const oneMonthTimestamp = Math.round(oneMonthAgo / 1000);
            const newArray = content.filter((item) => {
                return item.timestamp > oneMonthTimestamp;
            });
            console.log(newArray);
        }
    }, [content]);

    return (
        <Layout>
            <NoSSR>
                {/* display input here */}
                <Card
                    isHoverable
                    variant="bordered"
                    css={{ position: 'sticky', top: '5em', zIndex: 100 }}
                >
                    <Card.Body>
                        <Grid.Container gap={1}>
                            <Grid xs={10}>
                                <Textarea
                                    rows={3}
                                    aria-label="question"
                                    ref={inputRef}
                                    fullWidth={true}
                                    id="question" clearable
                                    disabled={loading}
                                    helperColor="success"
                                    onChange={(event) => setQuestionText(event.target.value)}
                                    placeholder={t('ai.input_placeholder')}
                                    helperText={t('ai.input_helptext')}
                                />
                            </Grid>
                            <Spacer x={1} />
                            <Grid xs={1}>
                                <Button flat bordered onPress={request2AI} >{t('ai.send')}</Button>
                            </Grid>
                        </Grid.Container>


                    </Card.Body>
                </Card>
                {loading && <Progress indeterminated />}
                {!loading && <Spacer y={2} />}
                <Container gap={2} fluid>
                    {/* display question and answer here */}
                    {content &&
                        content.length > 0 &&
                        content.map((data, index) => {
                            return (
                                <>
                                    <Card
                                        css={{ p: '$6' }}
                                        isHoverable
                                        variant="bordered"
                                        key={index}
                                    >
                                        <Card.Header>
                                            <BiQuestionMark size="1.3em" color="green" />
                                            <Grid.Container css={{ pl: '$6' }}>
                                                <Grid xs={12}>
                                                    <Text b css={{ lineHeight: '$xs' }}>
                                                        {data.question}
                                                    </Text>
                                                </Grid>
                                                <Grid xs={12}>
                                                    <Text i css={{ color: '$accents8' }}>
                                                        {t('ai.question_length') + ' :' +
                                                            data.question_tokens + ' ' +
                                                            t('ai.answer_length') + ' :' +
                                                            data.answer_tokens}
                                                    </Text>
                                                </Grid>
                                            </Grid.Container>
                                        </Card.Header>
                                        <Card.Divider />
                                        <Card.Body>
                                            <div
                                                dangerouslySetInnerHTML={{ __html: data.html }}
                                            ></div>
                                        </Card.Body>
                                    </Card>
                                    <Spacer y={1} />
                                </>
                            );
                        })}
                </Container>
            </NoSSR>
        </Layout>
    );

    function request2AI() {
        setLoading(true);
        getAnswer(questionText)
            .then((data) => {
                if (data.error) {
                    fatal(t('ai.return_error') + ':\n' + data.error.message);
                    setLoading(false);
                    throw new Error(t('ai.return_error') + ':\n' + data.error.message);
                }
                // add question and answer to content
                var newQandA = {
                    question: questionText,
                    answer: data.choices[0].message.content,
                    key: data.id,
                    id: data.id,
                    timestamp: data.created,
                    model: data.model,
                    question_tokens: data.usage.prompt_tokens,
                    answer_tokens: data.usage.completion_tokens,
                    total_tokens: data.usage.total_tokens,
                };
                success(
                    t('ai.return_length') + ': ' +
                    data.usage.completion_tokens
                );
                return newQandA;
            })
            .then((qAndA) => {
                getHtml(qAndA.answer)
                    .then((html) => {
                        qAndA.html = html;
                        return qAndA;
                    })
                    .then((qAndA) => {
                        if (!content) {
                            setContent([qAndA]);
                            return;
                        }
                        setContent([qAndA, ...content]);
                        setLoading(false);
                        setQuestionText('');
                        reset();
                    });
            });
    }
}
