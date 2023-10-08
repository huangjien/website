import { Accordion, AccordionItem, Chip } from '@nextui-org/react';
import { useTranslation } from 'react-i18next';

export const Chat = ({ data }) => {
  const { t } = useTranslation();
  return (
    <>
      {data && (
        <Accordion className="m-2 w-fit">
          <AccordionItem
            title={
              <div className="inline-flex m-2">
                <h2 className=" font-semibold m-2 text-xl  select-text">
                  {data.question}
                </h2>
                <Chip aria-label="ai model" className="m-2">
                  {data.model}
                </Chip>
                {data?.temperature && (
                  <Chip aria-label="temperature" className="m-2">
                    {data.temperature}
                  </Chip>
                )}
              </div>
            }
            subtitle={
              t('ai.question_length') +
              ' :' +
              data.question_tokens +
              ' ' +
              t('ai.answer_length') +
              ' :' +
              data.answer_tokens
            }
          >
            <div className="prose prose-stone dark:prose-invert lg:prose-xl max-w-fit select-text">
              <div dangerouslySetInnerHTML={{ __html: data.html }}></div>
            </div>
          </AccordionItem>
        </Accordion>
      )}
    </>
  );
};
