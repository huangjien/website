import Avatar from "./ui/avatar";
import * as Accordion from "./ui/accordion";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "../lib/useSettings";
import { extractContentAccordingContentList } from "../lib/useGithubContent";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

export const Comment = ({ issue_id }) => {
  /**
   * Fetches and displays comments related to a specific issue.
   *
   * @param {number} issue_id - The ID of the issue for which comments should be fetched.
   * @returns {JSX.Element} - The rendered component.
   */
  const { t } = useTranslation();
  const { getSetting } = useSettings();
  const commentContent = getSetting("comment.content");
  const commentContentList = commentContent?.split(",");
  const [commentList, setCommentList] = useState([]);

  useEffect(() => {
    const temp_array = [];
    console.log(
      "DEBUG useEffect start, issue_id:",
      issue_id,
      "commentContentList:",
      commentContentList
    );
    async function fetchComments() {
      try {
        console.log("DEBUG before fetch call");
        const res = await fetch("/api/comments?issue_number=" + issue_id, {
          method: "GET",
        });
        console.log("DEBUG after fetch call, res.ok:", res?.ok);
        const comment = await res.json();
        console.log("DEBUG after res.json, comment:", comment);
        if (comment && Array.isArray(comment)) {
          for (const oneComment of comment) {
            const oneCommentContent = extractContentAccordingContentList(
              commentContentList,
              oneComment
            );
            temp_array.push(oneCommentContent);
          }
          setCommentList(temp_array);
          console.log("DEBUG setCommentList:", temp_array);
        } else if (comment === null) {
          // Explicitly set null to allow tests to assert no rendering
          setCommentList(null);
        } else {
          // Non-array truthy values -> treat as empty list
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

  console.log("DEBUG render Comment, commentList:", commentList);
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
          (console.log(
            "DEBUG render mapping, commentList length:",
            commentList.length
          ),
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
                      aria-label='avatar'
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
                    >
                      {oneComment.body}
                    </Markdown>
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            );
          }))}
      </Accordion.Root>
    </>
  );
};
