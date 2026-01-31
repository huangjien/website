import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BiStop, BiSend, BiCog, BiXCircle, BiMicrophone } from "react-icons/bi";
import { useAudioRecording } from "../../hooks/useAudioRecording";

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
  const [recording, setRecording] = useState(false);
  const textareaRef = useRef(null);
  const sendButtonRef = useRef(null);
  const { startRecording, stopRecording } = useAudioRecording();
  const trimmedValue = (value || "").trim();

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
      if (trimmedValue && onSubmit) onSubmit();
    }
  };

  const clearInput = () => {
    if (onChange) onChange("");
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleMicToggle = async () => {
    try {
      if (!recording) {
        await startRecording();
        setRecording(true);
      } else {
        await stopRecording((transcribedText) => {
          // Replace current input with transcribed text
          if (onChange) onChange(transcribedText || "");
          setRecording(false);
          // Focus textarea after transcription for quick edits
          textareaRef.current?.focus();
        });
      }
    } catch (err) {
      console.error("Mic toggle failed:", err);
      setRecording(false);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className='relative'>
        <textarea
          ref={textareaRef}
          className='w-full rounded-2xl ring-1 ring-border/50 border-0 glass-input text-foreground p-4 pr-56 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:shadow-glass-glow transition-all duration-fast ease-out placeholder:text-muted-foreground/70'
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
            disabled={!trimmedValue}
            title={t("ai.clear_input", { defaultValue: "Clear input" })}
            aria-label={t("ai.clear_input", { defaultValue: "Clear input" })}
            className='inline-flex items-center justify-center rounded-xl glass text-foreground hover:bg-[hsla(var(--glass-bg-hover))] hover:scale-105 hover:shadow-glass disabled:opacity-50 disabled:cursor-not-allowed p-2 transition-all duration-fast ease-out cursor-pointer'
          >
            <BiXCircle size={18} />
          </button>

          {/* Mic recording toggle */}
          <button
            type='button'
            onClick={handleMicToggle}
            disabled={!!trimmedValue && !recording}
            title={
              recording
                ? t("ai.stop_recording", { defaultValue: "Stop Recording" })
                : t("ai.start_recording", { defaultValue: "Start Recording" })
            }
            aria-label={
              recording
                ? t("ai.stop_recording", { defaultValue: "Stop Recording" })
                : t("ai.start_recording", { defaultValue: "Start Recording" })
            }
            className={`inline-flex items-center justify-center rounded-xl p-2 transition-all duration-fast ease-out cursor-pointer ${
              recording
                ? "bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse hover:scale-110 shadow-lg"
                : "glass text-foreground hover:bg-[hsla(var(--glass-bg-hover))] hover:scale-105 hover:shadow-glass disabled:opacity-50 disabled:cursor-not-allowed"
            }`}
          >
            <BiMicrophone size={18} />
          </button>

          {onStop && (
            <button
              type='button'
              onClick={onStop}
              title={t("ai.stop", { defaultValue: "Stop" })}
              aria-label={t("ai.stop", { defaultValue: "Stop" })}
              className='inline-flex items-center justify-center rounded-xl glass text-foreground hover:bg-[hsla(var(--glass-bg-hover))] hover:scale-105 hover:shadow-glass p-2 transition-all duration-fast ease-out cursor-pointer'
            >
              <BiStop size={18} />
            </button>
          )}

          <button
            ref={sendButtonRef}
            type='button'
            onClick={onSubmit}
            disabled={!trimmedValue}
            title={t("ai.send", { defaultValue: "Send" })}
            aria-label={t("ai.send", { defaultValue: "Send" })}
            className='inline-flex items-center justify-center rounded-xl glass-button text-white hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed p-2 transition-all duration-fast ease-out cursor-pointer'
          >
            <BiSend size={18} />
          </button>

          {onToggleSettings && (
            <button
              type='button'
              onClick={onToggleSettings}
              title={t("ai.settings", { defaultValue: "Settings" })}
              aria-label={t("ai.settings", { defaultValue: "Settings" })}
              className='inline-flex items-center justify-center rounded-xl glass text-foreground hover:bg-[hsla(var(--glass-bg-hover))] hover:scale-105 hover:shadow-glass p-2 transition-all duration-fast ease-out cursor-pointer'
            >
              <BiCog size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
