import { Accordion, AccordionItem, Chip } from "@nextui-org/react";
import { useTranslation } from "react-i18next";
import { Comment } from "./Comment";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { IssueModal } from "./IssueModal";
import { useRequest } from "ahooks";
import { getJoke } from "@/lib/Requests";
import { useState } from "react";
import { BiRefresh } from "react-icons/bi";
import { Spacer } from "@nextui-org/spacer";

export const Joke = () => {
  const { t } = useTranslation();
  const [title, setTitle] = useState();
  const [content, setContent] = useState();

  const { refresh } = useRequest(getJoke, {
    onSuccess: res => {
      setTitle(res["setup"]);
      setContent(res["delivery"]);
    },
  });

  return (
    <div class="z-50 flex justify-center items-center text-xs shadow-md m-2 px-2 rounded-full font-mono">
      <BiRefresh size="2em" onClick={refresh} />
      <Spacer x={2} />
      <span className="inline-block italic">{title}</span>
      <Spacer x={2} />
      <span className="inline-block ">
        <b>{content}</b>
      </span>
    </div>
  );
};
