import { Accordion, AccordionItem, Chip, Button } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { BiCopyAlt, BiPlayCircle } from "react-icons/bi";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

export const Chat = ({ data, player }) => {
  const { t } = useTranslation();
  const handleCopy = () => {
    navigator.clipboard.writeText(
      data.question + "\n\nmodel:" + data.model + "\n\n" + data.answer
    );
  };
  const handlePlay = () => {
    player(data.answer);
  };
  return (
    <>
      {data && (
        <Accordion className='m-2 w-fit'>
          <AccordionItem
            aria-label={data.question}
            title={
              <div className='lg:inline-flex flex-wrap m-2'>
                <h2 className=' font-semibold m-2 text-xl  select-text'>
                  {data.question}
                </h2>
                <Chip aria-label='ai model' className='m-2'>
                  {data.model}
                </Chip>
                {data?.temperature && (
                  <Chip aria-label='temperature' className='m-2'>
                    {data.temperature}
                  </Chip>
                )}
              </div>
            }
            subtitle={
              t("ai.question_length") +
              " :" +
              data.question_tokens +
              " " +
              t("ai.answer_length") +
              " :" +
              data.answer_tokens
            }
          >
            <div>
              <Button
                size='lg'
                opPress={handleCopy}
                variant='light'
                className=' bg-transparent  text-primary  m-3  right-6'
              >
                <BiCopyAlt className='w-8 h-8' />
              </Button>
              <Button
                size='lg'
                onPress={handlePlay}
                variant='light'
                className=' bg-transparent  text-primary  m-3  right-3'
              >
                <BiPlayCircle className='w-8 h-8' />
              </Button>
              <div className='select-text prose prose-stone dark:prose-invert lg:prose-xl max-w-fit '>
                <Markdown
                  className='select-text prose prose-stone dark:prose-invert lg:prose-xl max-w-fit '
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                >
                  {data.answer}
                </Markdown>
              </div>
            </div>
          </AccordionItem>
        </Accordion>
      )}
    </>
  );
};
