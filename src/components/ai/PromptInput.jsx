import React, { useState, useEffect } from "react";

/**
 * PromptInput
 * Basic text input + send button. Calls onSend(prompt) when submitted.
 */
export default function PromptInput({
  onSend,
  disabled = false,
  placeholder = "Ask anything...",
  value,
  onChange,
}) {
  const [internalPrompt, setInternalPrompt] = useState("");

  const isControlled =
    typeof value === "string" && typeof onChange === "function";
  const prompt = isControlled ? value : internalPrompt;

  useEffect(() => {
    if (!isControlled) return;
    // no-op; controlled value comes via props
  }, [isControlled, value]);

  const setPrompt = (v) => {
    if (isControlled) onChange?.(v);
    else setInternalPrompt(v);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = (prompt || "").trim();
    if (!trimmed || disabled) return;
    onSend?.(trimmed);
    setPrompt("");
  };

  return (
    <form onSubmit={handleSubmit} className='w-full flex gap-2 items-end'>
      <div className='flex-1'>
        <label htmlFor='prompt' className='sr-only'>
          Prompt
        </label>
        <textarea
          id='prompt'
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className='w-full min-h-24 rounded-md border border-gray-300 bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-black dark:border-gray-700'
          placeholder={placeholder}
          disabled={disabled}
          data-testid='textarea'
        />
      </div>
      <button
        type='submit'
        aria-label='send'
        disabled={disabled || !(prompt || "").trim()}
        className='inline-flex h-10 items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50 disabled:pointer-events-none dark:bg-white dark:text-black dark:hover:bg-gray-200'
      >
        Send
      </button>
    </form>
  );
}
