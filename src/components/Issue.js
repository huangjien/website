import * as Accordion from "./ui/accordion";
import Badge from "./ui/badge";
import { useTranslation } from "react-i18next";
import { Comment } from "./Comment";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { IssueModal } from "./IssueModal";

export const Issue = ({ issue }) => {
  const { t } = useTranslation();

  if (!issue) return null;

  const subtitleText =
    (issue.created_at === issue.updated_at
      ? ""
      : t("issue.last_update") + ": " + issue.updated_at.toString()) +
    " " +
    t("issue.created") +
    ": " +
    issue.created_at.toString();

  return (
    <Accordion.Root
      className='m-2 w-fit'
      type='single'
      collapsible
      data-testid='accordion'
    >
      <Accordion.Item
        value={String(issue.title || issue.number || issue.id || "issue-item")}
        data-testid='accordion-item'
        aria-label={issue.title}
      >
        <Accordion.Header>
          <Accordion.Trigger className='lg:inline-flex flex-wrap justify-items-stretch items-stretch justify-between'>
            <h2 className='font-semibold text-xl select-text'>{issue.title}</h2>
            {issue["labels.name"]?.map((label) => (
              <div key={label}>
                <Badge aria-label='label' className='m-2'>
                  {label}
                </Badge>
              </div>
            ))}
            <span className='ml-2 text-sm text-muted-foreground'>
              {subtitleText}
            </span>
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          {/* {session && <IssueModal issue={issue} action={'edit'} />} */}
          <div className='prose prose-stone dark:prose-invert lg:prose-xl max-w-fit'>
            <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {issue.body}
            </Markdown>
          </div>
          {issue.comments > 0 && (
            <Comment className='ml-8' issue_id={issue.number} />
          )}
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
};
