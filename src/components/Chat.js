import { Badge, Accordion, AccordionItem, Chip } from '@nextui-org/react';
import { useTranslation } from 'react-i18next';

export const Chat = ({ data }) => {
  const { t } = useTranslation();
  return (
    <>
      {data && (
        <Accordion className="m-2 w-fit">
          <AccordionItem
            title={
              <div className="inline-block">
                <h2 className=" font-semibold text-2xl">{data.question}</h2>
                <Chip>{data.model}</Chip>
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
            <div className="prose prose-stone dark:prose-invert lg:prose-xl max-w-fit">
              <div dangerouslySetInnerHTML={{ __html: data.html }}></div>
            </div>
          </AccordionItem>
        </Accordion>
      )}
    </>
  );
};
