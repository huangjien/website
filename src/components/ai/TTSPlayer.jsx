import React, { useState } from "react";

/**
 * TTSPlayer
 * Simple Web Speech API wrapper to speak/cancel a given text.
 */
export default function TTSPlayer({
  text,
  lang = "en-US",
  rate = 1,
  pitch = 1,
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = () => {
    if (!text) return;
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = rate;
    utter.pitch = pitch;
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  const cancel = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className='flex items-center gap-2'>
      <button
        type='button'
        onClick={speak}
        disabled={!text || isSpeaking}
        className='inline-flex h-8 items-center justify-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-900 hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700'
      >
        Speak
      </button>
      <button
        type='button'
        onClick={cancel}
        disabled={!isSpeaking}
        className='inline-flex h-8 items-center justify-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-900 hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700'
      >
        Stop
      </button>
    </div>
  );
}
