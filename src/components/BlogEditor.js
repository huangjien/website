import { useEffect, useMemo, useRef, useState } from "react";
import { BiCheck, BiLinkExternal, BiPlus, BiTrash, BiX } from "react-icons/bi";
import { MarkdownContent } from "./MarkdownContent";
import Button from "./ui/button";
import Input from "./ui/input";
import Textarea from "./ui/textarea";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  getMutationErrorMessage,
  parseMutationErrorPayload,
} from "../lib/mutationError";

export const BLOG_DRAFT_KEY = "blog_draft_v1";
const MAX_TITLE_LENGTH = 200;
const MAX_BODY_LENGTH = 65536;

export function BlogEditor() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [labels, setLabels] = useState([]);
  const [labelInput, setLabelInput] = useState("");
  const [draftStatus, setDraftStatus] = useState("Not saved yet");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [publishedIssue, setPublishedIssue] = useState(null);
  const submitInFlightRef = useRef(false);

  useEffect(() => {
    try {
      const savedDraft = JSON.parse(localStorage.getItem(BLOG_DRAFT_KEY));
      if (!savedDraft) return;
      setTitle(savedDraft.title || "");
      setBody(savedDraft.body || "");
      setLabels(Array.isArray(savedDraft.labels) ? savedDraft.labels : []);
      if (savedDraft.savedAt) {
        setDraftStatus(`Draft restored from ${formatTime(savedDraft.savedAt)}`);
      }
    } catch {
      localStorage.removeItem(BLOG_DRAFT_KEY);
    }
  }, []);

  const canPublish = Boolean(title.trim() && body.trim()) && !publishing;
  const bodyLength = body.length;
  const preview = useMemo(
    () => body || "Start writing to see your Markdown preview.",
    [body],
  );

  const saveDraft = () => {
    const savedAt = new Date().toISOString();
    localStorage.setItem(
      BLOG_DRAFT_KEY,
      JSON.stringify({ title, body, labels, savedAt }),
    );
    setDraftStatus(`Saved at ${formatTime(savedAt)}`);
  };

  const addLabel = () => {
    const label = labelInput.trim();
    if (!label || label.toLowerCase() === "blog") {
      setLabelInput("");
      return;
    }
    setLabels((current) =>
      current.some((value) => value.toLowerCase() === label.toLowerCase())
        ? current
        : [...current, label],
    );
    setLabelInput("");
  };

  const removeLabel = (label) => {
    setLabels((current) => current.filter((value) => value !== label));
  };

  const handleLabelKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addLabel();
    }
  };

  const publish = async () => {
    if (!canPublish || submitInFlightRef.current) return;

    submitInFlightRef.current = true;
    setPublishing(true);
    setError("");

    try {
      const response = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body,
          labels,
        }),
      });

      if (!response.ok) {
        const payload = await parseMutationErrorPayload(response);
        setError(
          getMutationErrorMessage({
            response,
            payload,
            t: (_key, options) => options?.defaultValue || payload?.error,
            authKey: "blog.auth",
            validationKey: "blog.validation",
            rateLimitKey: "blog.rate_limit",
            timeoutKey: "blog.timeout",
            serverKey: "blog.server",
            fallbackKey: "blog.failure",
            fallbackDefaultValue: "The article could not be published.",
          }),
        );
        return;
      }

      const issue = await response.json();
      setPublishedIssue(issue);
      localStorage.removeItem(BLOG_DRAFT_KEY);
      setDraftStatus("Published");
      setConfirmOpen(false);
    } catch {
      setError("The article could not be published. Your draft is still here.");
    } finally {
      submitInFlightRef.current = false;
      setPublishing(false);
    }
  };

  const resetEditor = () => {
    setTitle("");
    setBody("");
    setLabels([]);
    setPublishedIssue(null);
    setError("");
    localStorage.removeItem(BLOG_DRAFT_KEY);
    setDraftStatus("Not saved yet");
  };

  if (publishedIssue) {
    return (
      <section className='glass-card mx-auto max-w-2xl rounded-2xl p-8 text-center animate-scale-in'>
        <span className='mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow'>
          <BiCheck size='1.8rem' aria-hidden='true' />
        </span>
        <p className='mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-primary'>
          Issue #{publishedIssue.number}
        </p>
        <h1 className='display mt-2 text-3xl font-medium text-foreground'>
          Article published
        </h1>
        <p className='mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground'>
          Your new post is now stored as a GitHub Issue with the blog label.
        </p>
        <div className='mt-7 flex flex-wrap justify-center gap-3'>
          <Button variant='secondary' onClick={resetEditor}>
            Write another
          </Button>
          <a
            href={publishedIssue.html_url}
            target='_blank'
            rel='noreferrer'
            className='inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-all hover:-translate-y-px hover:brightness-110'
          >
            Open in GitHub <BiLinkExternal aria-hidden='true' />
          </a>
        </div>
      </section>
    );
  }

  return (
    <section
      className='animate-fade-in space-y-5'
      aria-labelledby='blog-studio-title'
    >
      <header className='glass-card flex flex-col gap-5 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-[0.18em] text-primary'>
            Private studio
          </p>
          <h1
            id='blog-studio-title'
            className='display mt-1 text-3xl font-medium tracking-tight text-foreground'
          >
            New blog article
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>{draftStatus}</p>
        </div>
        <div className='flex flex-wrap gap-3'>
          <Button variant='secondary' onClick={saveDraft}>
            Save draft
          </Button>
          <Button
            onClick={() => setConfirmOpen(true)}
            disabled={!canPublish}
            loading={publishing}
          >
            Publish
          </Button>
        </div>
      </header>

      {error && (
        <div
          role='alert'
          className='flex items-start gap-3 rounded-2xl border border-destructive/25 bg-destructive/10 p-4 text-sm text-destructive'
        >
          <BiX className='mt-0.5 shrink-0' aria-hidden='true' />
          <span>{error}</span>
        </div>
      )}

      <div className='grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'>
        <div className='glass-card space-y-6 rounded-2xl p-5 sm:p-6'>
          <Input
            label='Title'
            value={title}
            maxLength={MAX_TITLE_LENGTH}
            onChange={(event) => setTitle(event.target.value)}
            placeholder='A clear, specific title'
          />

          <div className='space-y-3'>
            <div className='flex items-center justify-between gap-3'>
              <label htmlFor='blog-label-input' className='text-sm font-medium'>
                Labels
              </label>
              <span className='rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground'>
                <span className='sr-only'>Required label: </span>blog
              </span>
            </div>
            <div className='flex gap-2'>
              <Input
                id='blog-label-input'
                aria-label='Add label'
                value={labelInput}
                onChange={(event) => setLabelInput(event.target.value)}
                onKeyDown={handleLabelKeyDown}
                placeholder='Type a label and press Enter'
                className='flex-1'
              />
              <Button
                type='button'
                variant='secondary'
                size='icon'
                onClick={addLabel}
                aria-label='Add label to article'
              >
                <BiPlus aria-hidden='true' />
              </Button>
            </div>
            {labels.length > 0 && (
              <div
                className='flex flex-wrap gap-2'
                aria-label='Selected labels'
              >
                {labels.map((label) => (
                  <span
                    key={label}
                    className='inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/50 px-3 py-1.5 text-xs font-medium text-foreground'
                  >
                    {label}
                    <button
                      type='button'
                      onClick={() => removeLabel(label)}
                      aria-label={`Remove ${label} label`}
                      className='rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive'
                    >
                      <BiX aria-hidden='true' />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className='space-y-2'>
            <div className='flex items-center justify-between gap-3'>
              <label htmlFor='blog-body' className='text-sm font-medium'>
                Markdown body
              </label>
              <span className='num-tabular text-xs text-muted-foreground'>
                {bodyLength.toLocaleString()} /{" "}
                {MAX_BODY_LENGTH.toLocaleString()}
              </span>
            </div>
            <Textarea
              id='blog-body'
              aria-label='Markdown body'
              value={body}
              maxLength={MAX_BODY_LENGTH}
              onChange={(event) => setBody(event.target.value)}
              minRows={22}
              className='font-mono'
              placeholder={
                "Start with your idea…\n\n## A section\n\nWrite in Markdown."
              }
            />
          </div>

          <button
            type='button'
            onClick={resetEditor}
            className='inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-destructive'
          >
            <BiTrash aria-hidden='true' /> Clear editor
          </button>
        </div>

        <aside
          className='glass-card min-h-[40rem] rounded-2xl p-5 sm:p-7'
          aria-label='Preview'
        >
          <div className='mb-6 flex items-center justify-between border-b border-border/60 pb-4'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.18em] text-primary'>
                Preview
              </p>
              <p className='mt-1 text-xs text-muted-foreground'>
                The article as readers will see it
              </p>
            </div>
            <span
              className='h-2.5 w-2.5 rounded-full bg-primary shadow-glow'
              aria-hidden='true'
            />
          </div>
          {title ? (
            <h2 className='display mb-6 text-3xl font-medium leading-tight text-foreground'>
              {title}
            </h2>
          ) : (
            <p className='display mb-6 text-3xl text-muted-foreground/50'>
              Untitled article
            </p>
          )}
          <MarkdownContent className='prose prose-stone dark:prose-invert max-w-none'>
            {preview}
          </MarkdownContent>
        </aside>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>Publish this article?</DialogTitle>
            <DialogDescription>
              This creates a public GitHub Issue and adds the blog label.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className='space-y-4'>
            <div className='rounded-xl bg-muted/70 p-4'>
              <p className='font-medium text-foreground'>{title}</p>
              <p className='mt-2 text-xs text-muted-foreground'>
                Labels: {["blog", ...labels].join(", ")}
              </p>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant='secondary' onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={publish} loading={publishing}>
              Confirm publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

const formatTime = (date) =>
  new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
