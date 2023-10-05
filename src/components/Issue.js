import { Badge, Accordion, AccordionItem, Chip } from '@nextui-org/react';
import { useTranslation } from 'react-i18next';
import { Comment } from './Comment';

export const Issue = ({ issue }) => {
    const { t } = useTranslation();
    console.log(issue)
    return (
        <>
            {issue && (
                <Accordion
                    shadow
                    bordered className='m-2 w-fit'
                >
                    <AccordionItem title={
                        <div  className='inline-block'>
                            <Badge content={issue.state} aria-label={issue.state}
                             placement="bottom-left"
                                color={issue.state === 'open' ? 'success' : 'error'}
                            >
                                <h2 className=' font-semibold text-2xl' >
                                    {issue.title}
                                </h2>
                                {issue['labels.name'] &&
                                    issue['labels.name'].map((label) => (
                                        <div key={label}>
                                            {/* <Spacer x={0.5} /> */}
                                            <Chip className=' m-2' >
                                                {label}
                                            </Chip>
                                        </div>
                                    ))}
                            </Badge>
                        </div>
                    }
                        subtitle={ (issue.created_at===issue.updated_at? '': t('issue.last_update') + ': ' + issue.updated_at.toString())
                            + ' ' + t('issue.created') + ': ' + issue.created_at.toString()} >
                        <div className='prose prose-stone dark:prose-invert lg:prose-xl max-w-fit' >
                            <div dangerouslySetInnerHTML={{ __html: issue.html }}></div>
                        </div>
                        
                        {issue.commentList &&
                            issue.commentList.map((commentArray) => (
                                <Comment key={commentArray.id} comment={commentArray} />
                            ))}
                    </AccordionItem>
                </Accordion>
            )}
        </>
    );
};