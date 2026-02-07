import React, { useState } from "react";
import { BiEdit, BiListPlus } from "react-icons/bi";
import { useTranslation } from "react-i18next";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

import { Dialog, DialogContent, DialogBody, DialogFooter } from "./ui/dialog";
import Button from "./ui/button";
import Input from "./ui/input";
import Textarea from "./ui/textarea";
import { CheckboxGroup, Checkbox } from "./ui/checkbox";
import Divider from "./ui/divider";

export function IssueModal({ issue, action }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(issue ? issue?.title : "");
  const [content, setContent] = useState(issue ? issue?.body : "");

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

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
          <DialogBody>
            <div>
              <div className='lg:inline-flex align-middle w-full justify-evenly gap-4 m-2'>
                <Input
                  required
                  label={t("issue.title", { defaultValue: "Title" })}
                  className=' w-1/2 m-2'
                  aria-label={t("issue.title", { defaultValue: "Title" })}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t("issue.issue_id_error_message_placeholder", {
                    defaultValue: "Please input issue title here...",
                  })}
                />
                <CheckboxGroup
                  label={t("global.select", { defaultValue: "Select Tags" })}
                  className='m2 w-1/2'
                  orientation='horizontal'
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
                  placeholder={t("issue.description", {
                    defaultValue:
                      "Please input issue content here, in markdown format ...",
                  })}
                />

                <div className='hidden lg:block m-2'>
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                  >
                    {content}
                  </Markdown>
                </div>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant='secondary' onClick={handleClose}>
              {t("global.close", { defaultValue: "Close" })}
            </Button>
            <Button onClick={handleClose}>
              {t("global.save", { defaultValue: "Save" })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
