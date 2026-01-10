import * as Accordion from "./ui/accordion";
import Badge from "./ui/badge";
import Button from "./ui/button";
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
        <Accordion.Root
          className='m-2 w-fit'
          type='single'
          collapsible
          data-testid='accordion'
        >
          <Accordion.Item
            value={String(data.question || data.id || "chat-item")}
            className='transition-all duration-fast ease-out hover:shadow-md hover:-translate-y-0.5 rounded-xl'
          >
            <Accordion.Header>
              <Accordion.Trigger className='lg:inline-flex flex-wrap m-2 items-center'>
                <h2 className='font-semibold m-2 text-xl select-text'>
                  {data.question}
                </h2>
                <Badge
                  aria-label='ai model'
                  className='m-2 hover:scale-110 transition-transform duration-fast'
                >
                  {data.model}
                </Badge>
                {data?.temperature && (
                  <Badge
                    aria-label='temperature'
                    className='m-2 hover:scale-110 transition-transform duration-fast'
                  >
                    {data.temperature}
                  </Badge>
                )}
                <span
                  data-testid='accordion-subtitle'
                  className='ml-2 text-sm text-muted-foreground'
                >
                  {t("ai.question_length")} :{data.question_tokens}{" "}
                  {t("ai.answer_length")} :{data.answer_tokens}
                </span>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>
              <div>
                <Button
                  size='lg'
                  onClick={handleCopy}
                  variant='ghost'
                  className='bg-transparent text-primary m-3 right-6'
                  aria-label='copy'
                  title='copy'
                >
                  <BiCopyAlt className='w-8 h-8' />
                </Button>
                <Button
                  size='lg'
                  onClick={handlePlay}
                  variant='ghost'
                  className='bg-transparent text-primary m-3 right-3'
                  aria-label='play'
                  title='play'
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
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      )}
    </>
  );
};
