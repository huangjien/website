/**
 * Joke Component - Displays a random joke with a refresh button
 * Fetches jokes from an API and shows setup/delivery format
 * Uses NextUI components for styling and react-i18next for translation
 */
import { useTranslation } from "react-i18next";
import { useRequest } from "ahooks";
import { getJoke } from "@/lib/Requests";
import { useState } from "react";
import { BiRefresh } from "react-icons/bi";
import { Spacer } from "@nextui-org/spacer";

export const Joke = () => {
  const [title, setTitle] = useState(); // Stores the joke setup text
  const [content, setContent] = useState(); // Stores the joke delivery text

  // useRequest hook to fetch jokes from API
  const { refresh } = useRequest(getJoke, {
    onSuccess: (res) => {
      // Update state with new joke data
      setTitle(res["setup"]);
      setContent(res["delivery"]);
    },
  });

  return (
    <div class='z-50 flex justify-center items-center text-xs shadow-md m-2 px-2 rounded-full font-mono'>
      <BiRefresh size='2em' onClick={refresh} />
      <Spacer x={2} />

      <span className='inline-block italic'>{title}</span>
      <Spacer x={2} />

      <span className='inline-block '>
        <b>{content}</b>
      </span>
    </div>
  );
};
