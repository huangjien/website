import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import Avatar from "./ui/avatar";
import * as Accordion from "./ui/accordion";
import { useTranslation } from "react-i18next";
import { BiSend, BiCheck, BiX } from "react-icons/bi";
import { useSettings } from "../lib/useSettings";
import { extractContentAccordingContentList } from "../lib/useGithubContent";
import { sanitizeMarkdown } from "../lib/markdown-utils";
import {
  getMutationErrorMessage,
  parseMutationErrorPayload,
} from "../lib/mutationError";
import { MarkdownContent } from "./MarkdownContent";
import Button from "./ui/button";
import Textarea from "./ui/textarea";

export const Comment = React.memo(function Comment({
  issue_id,
  list,
  onRefresh,
}) {
  const { t } = useTranslation();
  const { getSetting } = useSettings();
  const commentContent = getSetting("comment.content");
  const commentContentList = commentContent?.split(",");
  const [commentList, setCommentList] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const submitInFlightRef = useRef(false);
  const successTimeoutRef = useRef(null);
  const normalizedList = useMemo(() => {
    if (!Array.isArray(list)) {
      return null;
    }
    return list.map((oneComment) =>
      extractContentAccordingContentList(commentContentList, oneComment),
    );
  }, [list, commentContentList]);

  const fetchComments = useCallback(async () => {
    if (!issue_id) {
      setCommentList([]);
      return;
    }
    try {
      const res = await fetch("/api/comments?issue_number=" + issue_id, {
        method: "GET",
      });
      const comment = await res.json();
      if (comment && Array.isArray(comment)) {
        const temp_array = [];
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
      console.error("ERROR in fetchComments:", error);
      setCommentList([]);
    }
  }, [commentContentList, issue_id]);

  useEffect(() => {
    if (normalizedList !== null) {
      setCommentList(normalizedList);
      return;
    }
    fetchComments();
  }, [normalizedList, fetchComments]);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmitComment = async () => {
    if (loading || submitInFlightRef.current || !newComment.trim()) {
      return;
    }

    submitInFlightRef.current = true;
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/comments?issue_number=${issue_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: newComment }),
      });

      if (res.ok) {
        setNewComment("");
        setSuccess(true);
        if (successTimeoutRef.current) {
          clearTimeout(successTimeoutRef.current);
        }
        successTimeoutRef.current = setTimeout(() => {
          setSuccess(false);
          successTimeoutRef.current = null;
        }, 3000);
        await fetchComments();
        if (onRefresh) {
          onRefresh();
        }
      } else {
        const payload = await parseMutationErrorPayload(res);
        setError(
          getMutationErrorMessage({
            response: res,
            payload,
            t,
            authKey: "comment.error_auth_required",
            validationKey: "comment.error_validation",
            rateLimitKey: "comment.error_rate_limited",
            timeoutKey: "comment.error_timeout",
            serverKey: "comment.error_server",
            fallbackKey: "comment.create_failed",
            fallbackDefaultValue: "Failed to add comment",
          }),
        );
      }
    } catch (err) {
      setError(
        t("comment.create_error", { defaultValue: "An error occurred" }),
      );
    } finally {
      submitInFlightRef.current = false;
      setLoading(false);
    }
  };

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
                    <MarkdownContent>
                      {sanitizeMarkdown(oneComment.body)}
                    </MarkdownContent>
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            );
          })}
      </Accordion.Root>

      <div className='m-4 p-4 border-t border-border'>
        <h4 className='text-sm font-medium mb-2'>
          {t("comment.add", { defaultValue: "Add a comment" })}
        </h4>

        {error && (
          <div className='mb-3 p-3 bg-destructive/10 border border-destructive rounded-md flex items-center gap-2'>
            <BiX className='h-5 w-5 text-destructive flex-shrink-0' />
            <span className='text-destructive text-sm'>{error}</span>
          </div>
        )}

        {success && (
          <div className='mb-3 p-3 bg-green-500/10 border border-green-500 rounded-md flex items-center gap-2'>
            <BiCheck className='h-5 w-5 text-green-600 flex-shrink-0' />
            <span className='text-green-600 text-sm'>
              {t("comment.added", {
                defaultValue: "Comment added successfully",
              })}
            </span>
          </div>
        )}

        <div className='flex gap-2'>
          <Textarea
            className='flex-1 resize-none'
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t("comment.placeholder", {
              defaultValue: "Write a comment...",
            })}
            disabled={loading}
            minRows={2}
            maxRows={6}
          />
          <Button
            onClick={handleSubmitComment}
            disabled={loading || !newComment.trim()}
            className='self-end'
          >
            {loading ? (
              t("global.sending", { defaultValue: "Sending..." })
            ) : (
              <>
                <BiSend className='mr-1 h-4 w-4' />
                {t("global.send", { defaultValue: "Send" })}
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
});
