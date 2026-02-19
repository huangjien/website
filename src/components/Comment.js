import React, { useState, useEffect } from "react";
import Avatar from "./ui/avatar";
import * as Accordion from "./ui/accordion";
import { useTranslation } from "react-i18next";
import { useSettings } from "../lib/useSettings";
import { extractContentAccordingContentList } from "../lib/useGithubContent";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { sanitizeMarkdown } from "../lib/markdown-utils";
import { SmartImage } from "./SmartImage";

export const Comment = React.memo(function Comment({ issue_id }) {
  const { t } = useTranslation();
  const { getSetting } = useSettings();
  const commentContent = getSetting("comment.content");
  const commentContentList = commentContent?.split(",");
  const [commentList, setCommentList] = useState([]);

  useEffect(() => {
    const temp_array = [];
    async function fetchComments() {
      try {
        const res = await fetch("/api/comments?issue_number=" + issue_id, {
          method: "GET",
        });
        const comment = await res.json();
        if (comment && Array.isArray(comment)) {
          for (const oneComment of comment) {
            const oneCommentContent = extractContentAccordingContentList(
              commentContentList,
              oneComment,
            );
            temp_array.push(oneCommentContent);
          }
          setCommentList(temp_array);
        } else if (comment === null) {
          setCommentList(null);
        } else {
          setCommentList([]);
        }
      } catch (error) {
        console.error("ERROR in fetchComments useEffect:", error);
        setCommentList([]);
      }
    }
    fetchComments();
  }, [commentContentList, issue_id]);

  if (commentList === null) return null;

  return (
    <>
      <Accordion.Root
        className='m-2 w-fit'
        type='multiple'
        collapsible
        value={
          Array.isArray(commentList) ? commentList.map((c) => String(c.id)) : []
        }
        data-testid='accordion'
      >
        {Array.isArray(commentList) &&
          commentList.map((oneComment) => {
            const subtitleText =
              (oneComment.created_at === oneComment.updated_at
                ? ""
                : t("issue.last_update") +
                  ": " +
                  oneComment.updated_at.toString()) +
              " " +
              t("issue.created") +
              ": " +
              oneComment.created_at.toString();
            return (
              <Accordion.Item
                key={oneComment.id}
                value={String(oneComment.id)}
                data-testid='accordion-item'
                aria-label={String(oneComment.id)}
                className='transition-all duration-fast ease-out hover:shadow-glass hover:-translate-y-0.5 rounded-2xl glass-card'
              >
                <Accordion.Header>
                  <Accordion.Trigger
                    className='inline-flex m-4 items-center gap-3'
                    data-testid='accordion-trigger'
                  >
                    <Avatar
                      src={oneComment["user.avatar_url"]}
                      alt={oneComment["user.login"]}
                      fallback={(oneComment["user.login"] ||
                        "?")[0]?.toUpperCase()}
                      aria-label={t("comment.avatar", {
                        defaultValue: "Avatar",
                      })}
                    />
                    <i>{oneComment["user.login"]}</i>
                    <span className='ml-2 text-sm text-muted-foreground'>
                      {subtitleText}
                    </span>
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content>
                  <div className='prose prose-stone dark:prose-invert lg:prose-xl max-w-fit'>
                    <Markdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        img: SmartImage,
                      }}
                    >
                      {sanitizeMarkdown(oneComment.body)}
                    </Markdown>
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            );
          })}
      </Accordion.Root>
    </>
  );
});
