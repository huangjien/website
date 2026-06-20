import React from "react";
import * as Accordion from "./ui/accordion";
import Badge from "./ui/badge";
import { useTranslation } from "react-i18next";
import { Comment } from "./Comment";
import { IssueModal } from "./IssueModal";
import { sanitizeMarkdown } from "../lib/markdown-utils";
import { MarkdownContent } from "./MarkdownContent";

export const Issue = React.memo(function Issue({ issue }) {
  const { t } = useTranslation();

  if (!issue) return null;

  const sanitizedBody = sanitizeMarkdown(issue.body);
  const commentsData = Array.isArray(issue.commentsData)
    ? issue.commentsData
    : [];

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
        className='transition-all duration-normal ease-out hover:shadow-glass rounded-2xl glass-card overflow-hidden'
      >
        <Accordion.Header>
          <Accordion.Trigger className='group w-full text-left px-6 py-5 hover:bg-[hsla(var(--glass-bg-hover))] transition-colors duration-normal ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
            <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 w-full'>
              <div className='flex-1 min-w-0'>
                <h2 className='display font-medium text-xl sm:text-2xl select-text pr-4 text-foreground'>
                  {issue.title}
                </h2>
                <span className='text-xs text-muted-foreground mt-1.5 block num-tabular tracking-tight'>
                  {subtitleText}
                </span>
              </div>
              {issue["labels.name"] && issue["labels.name"].length > 0 && (
                <div className='flex flex-wrap gap-1.5'>
                  {issue["labels.name"].map((label) => (
                    <Badge
                      key={label}
                      aria-label={t("issue.title", { defaultValue: "Label" })}
                      className='hover:scale-[1.03] transition-transform duration-normal ease-out cursor-pointer'
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
            <MarkdownContent>{sanitizedBody}</MarkdownContent>
          </div>
          {commentsData.length > 0 && (
            <Comment className='mt-6' list={commentsData} />
          )}
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
});
