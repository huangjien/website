import React, { useState } from "react";
import { BiEdit, BiListPlus, BiCheck, BiX } from "react-icons/bi";
import { useTranslation } from "react-i18next";
import { MarkdownContent } from "./MarkdownContent";

import {
  Dialog,
  DialogContent,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import Button from "./ui/button";
import Input from "./ui/input";
import Textarea from "./ui/textarea";
import { CheckboxGroup, Checkbox } from "./ui/checkbox";
import Divider from "./ui/divider";

export function IssueModal({ issue, action, onSuccess }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(issue ? issue?.title : "");
  const [content, setContent] = useState(issue ? issue?.body : "");
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleOpen = () => {
    setError(null);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setError(null);
    setTitle(issue ? issue?.title : "");
    setContent(issue ? issue?.body : "");
    setLabels([]);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError(
        t("issue.title_required", { defaultValue: "Title is required" }),
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body: content,
          labels: labels.length > 0 ? labels : undefined,
        }),
      });

      if (res.ok) {
        handleClose();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        const data = await res.json();
        setError(
          data.error ||
            t("issue.create_failed", {
              defaultValue: "Failed to create issue",
            }),
        );
      }
    } catch (err) {
      setError(t("issue.create_error", { defaultValue: "An error occurred" }));
    } finally {
      setLoading(false);
    }
  };

  const handleLabelChange = (selectedLabels) => {
    setLabels(selectedLabels);
  };

  return (
    <>
      {action === "edit" && (
        <Button className='bg-transparent' onClick={handleOpen}>
          <BiEdit
            data-testid='edit-icon'
            className='h-8 w-8 bg-transparent text-primary'
          />
        </Button>
      )}
      {action === "new" && (
        <Button className='bg-transparent' onClick={handleOpen}>
          <BiListPlus
            data-testid='list-plus-icon'
            className='h-8 w-8 bg-transparent text-primary'
          />
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='m-2'>
          <DialogHeader>
            <DialogTitle>
              {action === "edit"
                ? t("issue.edit_title", { defaultValue: "Edit Issue" })
                : t("issue.new_title", { defaultValue: "New Issue" })}
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div>
              {error && (
                <div className='mb-4 p-3 bg-destructive/10 border border-destructive rounded-md flex items-center gap-2'>
                  <BiX className='h-5 w-5 text-destructive' />
                  <span className='text-destructive text-sm'>{error}</span>
                </div>
              )}
              <div className='lg:inline-flex align-middle w-full justify-evenly gap-4 m-2'>
                <Input
                  required
                  label={t("issue.title", { defaultValue: "Title" })}
                  className=' w-1/2 m-2'
                  aria-label={t("issue.title", { defaultValue: "Title" })}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading}
                  placeholder={t("issue.issue_id_error_message_placeholder", {
                    defaultValue: "Please input issue title here...",
                  })}
                />
                <CheckboxGroup
                  label={t("global.select", { defaultValue: "Select Tags" })}
                  className='m2 w-1/2'
                  orientation='horizontal'
                  onValueChange={handleLabelChange}
                >
                  <Checkbox value='blog'>blog</Checkbox>
                  <Checkbox value='programming'>programming</Checkbox>
                  <Checkbox value='devops'>devops</Checkbox>
                  <Checkbox value='testing'>testing</Checkbox>
                  <Checkbox value='novel'>novel</Checkbox>
                </CheckboxGroup>
              </div>
              <Divider />
              <div className='grid grid-cols-1 lg:grid-cols-2 w-full h-full m-2 gap-4 overflow-auto space-x-3 justify-evenly '>
                <Textarea
                  className='m-2 h-full w-full resize-none '
                  value={content}
                  minRows={16}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={loading}
                  placeholder={t("issue.description", {
                    defaultValue:
                      "Please input issue content here, in markdown format ...",
                  })}
                />

                <div className='hidden lg:block m-2'>
                  <MarkdownContent>{content}</MarkdownContent>
                </div>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant='secondary'
              onClick={handleClose}
              disabled={loading}
            >
              {t("global.close", { defaultValue: "Close" })}
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                t("global.saving", { defaultValue: "Saving..." })
              ) : (
                <>
                  <BiCheck className='mr-1 h-4 w-4' />
                  {t("global.save", { defaultValue: "Save" })}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
