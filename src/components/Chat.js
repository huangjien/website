import * as Accordion from "./ui/accordion";
import Badge from "./ui/badge";
import Button from "./ui/button";
import { useTranslation } from "react-i18next";
import { BiCopyAlt, BiPlayCircle } from "react-icons/bi";
import { MarkdownContent } from "./MarkdownContent";

export const Chat = ({ data, player }) => {
  const { t } = useTranslation();
  const handleCopy = () => {
    navigator.clipboard.writeText(
      data.question + "\n\nmodel:" + data.model + "\n\n" + data.answer,
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
            className='transition-all duration-normal ease-out hover:shadow-glass hover:-translate-y-0.5 rounded-2xl glass-card'
          >
            <Accordion.Header>
              <Accordion.Trigger className='lg:inline-flex flex-wrap m-2 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl'>
                <h2 className='display font-medium m-2 text-xl sm:text-2xl select-text text-foreground'>
                  {data.question}
                </h2>
                <Badge
                  aria-label={t("chat.ai_model", { defaultValue: "AI Model" })}
                  className='m-2 hover:scale-[1.03] transition-transform duration-normal ease-out'
                >
                  {data.model}
                </Badge>
                {data?.temperature && (
                  <Badge
                    aria-label={t("ai.temperature", {
                      defaultValue: "Temperature",
                    })}
                    className='m-2 hover:scale-[1.03] transition-transform duration-normal ease-out'
                  >
                    {data.temperature}
                  </Badge>
                )}
                <span
                  data-testid='accordion-subtitle'
                  className='ml-2 text-xs text-muted-foreground num-tabular'
                >
                  {t("ai.question_length")} :{data.question_tokens}{" "}
                  {t("ai.answer_length")} :{data.answer_tokens}
                </span>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>
              <div className='relative'>
                <div className='absolute top-2 right-2 flex gap-2'>
                  <Button
                    size='icon'
                    onClick={handleCopy}
                    variant='ghost'
                    className='glass hover:bg-[hsla(var(--glass-bg-hover))] hover:-translate-y-px'
                    aria-label={t("global.copy", { defaultValue: "Copy" })}
                    title={t("global.copy", { defaultValue: "Copy" })}
                  >
                    <BiCopyAlt size={18} />
                  </Button>
                  <Button
                    size='icon'
                    onClick={handlePlay}
                    variant='ghost'
                    className='glass hover:bg-[hsla(var(--glass-bg-hover))] hover:-translate-y-px'
                    aria-label={t("ai.play", { defaultValue: "Play" })}
                    title={t("ai.play", { defaultValue: "Play" })}
                  >
                    <BiPlayCircle size={18} />
                  </Button>
                </div>
                <div className='select-text prose prose-stone dark:prose-invert lg:prose-xl max-w-fit '>
                  <MarkdownContent className='select-text prose prose-stone dark:prose-invert lg:prose-xl max-w-fit '>
                    {data.answer}
                  </MarkdownContent>
                </div>
              </div>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      )}
    </>
  );
};
