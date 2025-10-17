import React from "react";
import TTSPlayer from "./TTSPlayer";

/**
 * ChatTranscript
 * Renders a list of role-tagged messages and provides TTS for assistant replies.
 */
export default function ChatTranscript({ messages = [] }) {
  return (
    <div className='space-y-3'>
      {messages.length === 0 ? (
        <div className='text-sm text-gray-500 dark:text-gray-400'>
          No messages yet. Ask something above to start.
        </div>
      ) : (
        messages.map((m, idx) => (
          <div key={idx} className='flex w-full'>
            <div
              className={
                m.role === "user"
                  ? "ml-auto max-w-[80%] rounded-md bg-gray-100 px-3 py-2 text-sm dark:bg-gray-800"
                  : "mr-auto max-w-[80%] rounded-md bg-white px-3 py-2 text-sm shadow-sm dark:bg-gray-900"
              }
            >
              <div className='mb-1 text-[11px] uppercase tracking-wider text-gray-400'>
                {m.role}
              </div>
              <div className='whitespace-pre-wrap'>{m.content}</div>
              {m.role === "assistant" ? (
                <div className='mt-2'>
                  <TTSPlayer text={m.content} />
                </div>
              ) : null}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
