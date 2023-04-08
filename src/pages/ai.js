import {
    Button,
    Card,
    Container,
    Grid,
    Pagination,
    Progress,
    Row,
    Spacer,
    Text,
    Textarea,
    useInput
} from '@nextui-org/react';
import { useDebounceEffect, useKeyPress, useLocalStorageState, useTitle } from 'ahooks';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BiQuestionMark, BiSearch } from 'react-icons/bi';
import { ControllableInput } from '../components/ControllableInput';
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
    const [searchValue, setSearchValue] = useState()
    const [pageTotal, setPageTotal] = useState(0);
    const { value: questionText, setValue: setQuestionText, reset } = useInput();
    const [content, setContent] = useLocalStorageState('QandA', {
        defaultValue: [],
    });
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const { getHtml } = useGithubContent();
    const [displayContent, setDisplayContent] = useState([])
    useTitle(t('header.ai'));
    const [fatal, success] = useMessage();

    useDebounceEffect(() => {
        if (content && content.length > 0) {
            var regex = new RegExp(searchValue, 'i');
            const filterred = content.filter((qAndA) => {
                return (
                    qAndA['question'].search(regex) > -1 || qAndA['answer'].search(regex) > -1
                );
            });
            setDisplayContent(filterred)
        }

    }, [content, searchValue], { wait: 1000 })

    useKeyPress(
        'ctrl.enter',
        () => {
            console.log(questionText);
            if (!questionText) return;
            request2AI();
        },
        {
            target: inputRef,
        },
        {
            exactMatch: true,
        }
    );

    useDebounceEffect(() => {
        // if content.length > 100, then delete all records of one month ago
        if (content.length > 1000) {
            const now = new Date();
            const oneMonthAgo = new Date(now.getTime() - (1000 * 60 * 60 * 24 * 30)).getTime()
            // const oneMonthAgo = new Date(now.getTime() - 1000 * 60 * 60).getTime();
            const oneMonthTimestamp = Math.round(oneMonthAgo / 1000);
            const newArray = content.filter((item) => {
                return item.timestamp > oneMonthTimestamp;
            });
            setContent(newArray)
        }
    }, [content], { wait: 2000 });

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
                            <Grid xs={6}>
                                <Card>
                                    <Card.Body>
                                        <Textarea
                                            rows={2}
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
                                    </Card.Body>
                                </Card>
                            </Grid>

                            <Grid xs={6}>
                                <Card>
                                    <Card.Body justify='space-evenly'>
                                        <Row justify='space-evenly' >
                                            <Button xs={1} flat auto bordered onPress={request2AI} disabled={!questionText} >
                                                {t('ai.send')}
                                            </Button>

                                            <ControllableInput x={1}
                                                clearable
                                                aria-label="search"
                                                value={searchValue}
                                                onChange={setSearchValue}

                                                contentLeft={
                                                    <BiSearch size='1em' />
                                                }

                                                placeholder={t('global.search')}
                                            />

                                            {pageTotal > 0 && (

                                                <Pagination
                                                    aria-label="pagination"
                                                    noMargin
                                                    shadow
                                                    total={pageTotal}
                                                    initialPage={1}
                                                />
                                            )}
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Grid>
                            <Spacer x={1} />
                        </Grid.Container>
                    </Card.Body>
                </Card>
                {loading && <Progress indeterminated />}
                {!loading && <Spacer y={2} />}
                <Container gap={2} fluid>
                    {/* display question and answer here */}
                    {displayContent &&
                        displayContent.length > 0 &&
                        displayContent.map((data, index) => {
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
                    setQuestionText('');
                    reset();
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
                        setQuestionText('');
                        reset();
                        setContent([qAndA, ...content]);
                        setLoading(false);

                    });
            });
    }
}
