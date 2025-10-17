import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BiStop, BiSend, BiCog, BiXCircle } from "react-icons/bi";

export default function PromptInput({
  value,
  onChange,
  onSubmit,
  onStop,
  onToggleSettings,
  className = "",
}) {
  const { t } = useTranslation();
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef(null);
  const sendButtonRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 300)}px`;
    }
  }, [value]);

  const handleKeyDown = (e) => {
    if (isComposing) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (onSubmit) onSubmit();
    }
  };

  const clearInput = () => {
    if (onChange) onChange("");
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className='relative'>
        <textarea
          ref={textareaRef}
          className='w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 p-3 pr-56 focus:outline-none'
          rows={1}
          placeholder={t("ai.prompt_placeholder", {
            defaultValue: "Type your message…",
          })}
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
        />

        {/* Action bar */}
        <div className='absolute right-2 bottom-2 flex items-center gap-2'>
          <button
            type='button'
            onClick={clearInput}
            disabled={!value}
            title={t("ai.clear_input", { defaultValue: "Clear input" })}
            aria-label={t("ai.clear_input", { defaultValue: "Clear input" })}
            className='inline-flex items-center justify-center rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 disabled:opacity-50 p-2'
          >
            <BiXCircle size={18} />
          </button>

          {onStop && (
            <button
              type='button'
              onClick={onStop}
              title={t("ai.stop", { defaultValue: "Stop" })}
              aria-label={t("ai.stop", { defaultValue: "Stop" })}
              className='inline-flex items-center justify-center rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 p-2'
            >
              <BiStop size={18} />
            </button>
          )}

          <button
            ref={sendButtonRef}
            type='button'
            onClick={onSubmit}
            title={t("ai.send", { defaultValue: "Send" })}
            aria-label={t("ai.send", { defaultValue: "Send" })}
            className='inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 text-white p-2'
          >
            <BiSend size={18} />
          </button>

          {onToggleSettings && (
            <button
              type='button'
              onClick={onToggleSettings}
              title={t("ai.settings", { defaultValue: "Settings" })}
              aria-label={t("ai.settings", { defaultValue: "Settings" })}
              className='inline-flex items-center justify-center rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 p-2'
            >
              <BiCog size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
