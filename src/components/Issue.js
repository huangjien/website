import React from "react";
import * as Accordion from "./ui/accordion";
import Badge from "./ui/badge";
import { useTranslation } from "react-i18next";
import { Comment } from "./Comment";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { IssueModal } from "./IssueModal";
import { SmartImage } from "./SmartImage";
import { sanitizeMarkdown } from "../lib/markdown-utils";

export const Issue = React.memo(function Issue({ issue }) {
  const { t } = useTranslation();

  if (!issue) return null;

  const sanitizedBody = sanitizeMarkdown(issue.body);

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
      className='w-full'
      type='single'
      collapsible
      data-testid='accordion'
    >
      <Accordion.Item
        value={String(issue.title || issue.number || issue.id || "issue-item")}
        data-testid='accordion-item'
        aria-label={issue.title}
        className='transition-all duration-fast ease-out hover:shadow-glass rounded-2xl glass-card overflow-hidden'
      >
        <Accordion.Header>
          <Accordion.Trigger className='w-full text-left px-6 py-4 hover:bg-[hsla(var(--glass-bg-hover))] transition-colors duration-200'>
            <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 w-full'>
              <div className='flex-1 min-w-0'>
                <h2 className='font-semibold text-lg sm:text-xl select-text pr-4'>
                  {issue.title}
                </h2>
                <span className='text-sm text-muted-foreground mt-1 block'>
                  {subtitleText}
                </span>
              </div>
              {issue["labels.name"] && issue["labels.name"].length > 0 && (
                <div className='flex flex-wrap gap-2'>
                  {issue["labels.name"].map((label) => (
                    <Badge
                      key={label}
                      aria-label={t("issue.title", { defaultValue: "Label" })}
                      className='hover:scale-105 transition-transform duration-200 cursor-pointer'
                    >
                      {label}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content className='px-6 pb-6'>
          <div className='prose prose-stone dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline'>
            <Markdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                img: SmartImage,
              }}
            >
              {sanitizedBody}
            </Markdown>
          </div>
          {issue.comments > 0 && (
            <Comment className='mt-6' issue_id={issue.number} />
          )}
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
});
