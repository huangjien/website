import { useState, useRef, useEffect } from "react";
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
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);
  const sendButtonRef = useRef(null);
  const containerRef = useRef(null);
  const { startRecording, stopRecording } = useAudioRecording();
  const trimmedValue = (value || "").trim();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(
        Math.max(textareaRef.current.scrollHeight, 120),
        400,
      );
      textareaRef.current.style.height = `${newHeight}px`;
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
          if (onChange) onChange(transcribedText || "");
          setRecording(false);
          textareaRef.current?.focus();
        });
      }
    } catch (err) {
      console.error("Mic toggle failed:", err);
      setRecording(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`w-full ${className} transition-shadow duration-normal ease-out`}
    >
      <div
        className={`
        relative rounded-3xl glass-card transition-all duration-normal ease-out
        ${isFocused ? "ring-2 ring-primary/30 shadow-glass" : "shadow-glass"}
      `}
      >
        {/* Main input area */}
        <div className='flex items-end gap-3 p-5'>
          {/* Textarea container */}
          <div className='flex-1 relative'>
            <textarea
              ref={textareaRef}
              className={`
                w-full bg-transparent border-0 text-foreground resize-none
                focus:outline-none placeholder:text-muted-foreground/50
                transition-all duration-200 ease-out
                ${isFocused ? "text-base" : "text-base"}
              `}
              style={{
                minHeight: "80px",
                maxHeight: "400px",
                lineHeight: "1.6",
              }}
              placeholder={t("ai.prompt_placeholder", {
                defaultValue: "Type your message…",
              })}
              value={value}
              onChange={(e) => onChange && onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
            />
          </div>

          {/* Action buttons container */}
          <div className='flex items-center gap-2 pb-1'>
            {/* Clear button - only show when has text */}
            {trimmedValue && (
              <button
                type='button'
                onClick={clearInput}
                title={t("ai.clear_input", { defaultValue: "Clear input" })}
                aria-label={t("ai.clear_input", {
                  defaultValue: "Clear input",
                })}
                className='
                  inline-flex items-center justify-center w-10 h-10
                  rounded-xl glass text-foreground
                  hover:bg-[hsla(var(--glass-bg-hover))]
                  hover:-translate-y-px hover:shadow-glass
                  active:translate-y-0
                  disabled:opacity-40 disabled:cursor-not-allowed
                  transition-all duration-normal ease-out cursor-pointer
                  group
                '
              >
                <BiXCircle
                  size={18}
                  className='group-hover:rotate-90 transition-transform duration-normal'
                />
              </button>
            )}

            {/* Divider between clear and action buttons */}
            {trimmedValue && <div className='w-px h-6 bg-border/40' />}

            {/* Mic recording button */}
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
              className={`
                inline-flex items-center justify-center w-10 h-10
                rounded-xl p-0 transition-all duration-normal ease-out cursor-pointer
                ${
                  recording
                    ? "bg-destructive text-destructive-foreground shadow-[0_8px_20px_-10px_hsl(var(--destructive)/0.55)] animate-pulse"
                    : "glass text-foreground hover:bg-[hsla(var(--glass-bg-hover))] hover:-translate-y-px hover:shadow-glass"
                }
                ${!!trimmedValue && !recording ? "opacity-40 cursor-not-allowed" : ""}
              `}
            >
              <BiMicrophone size={18} />
            </button>

            {/* Stop button - only show when streaming */}
            {onStop && (
              <button
                type='button'
                onClick={onStop}
                title={t("ai.stop", { defaultValue: "Stop" })}
                aria-label={t("ai.stop", { defaultValue: "Stop" })}
                className='
                  inline-flex items-center justify-center w-10 h-10
                  rounded-xl glass text-foreground
                  hover:bg-destructive/10 hover:text-destructive
                  hover:-translate-y-px hover:shadow-glass
                  active:translate-y-0
                  transition-all duration-normal ease-out cursor-pointer
                '
              >
                <BiStop size={18} />
              </button>
            )}

            {/* Send button - primary action */}
            <button
              ref={sendButtonRef}
              type='button'
              onClick={onSubmit}
              disabled={!trimmedValue}
              title={t("ai.send", { defaultValue: "Send" })}
              aria-label={t("ai.send", { defaultValue: "Send" })}
              className={`
                inline-flex items-center justify-center w-10 h-10
                rounded-xl bg-primary text-primary-foreground
                shadow-[inset_0_1px_0_hsl(var(--primary-foreground)/0.15),0_6px_16px_-8px_hsl(var(--primary)/0.5)]
                transition-all duration-normal ease-out cursor-pointer
                ${
                  trimmedValue
                    ? "hover:brightness-110 hover:-translate-y-px active:translate-y-0 active:brightness-95"
                    : "opacity-40 cursor-not-allowed"
                }
              `}
            >
              <BiSend size={18} />
            </button>

            {/* Settings button */}
            {onToggleSettings && (
              <button
                type='button'
                onClick={onToggleSettings}
                title={t("ai.settings", { defaultValue: "Settings" })}
                aria-label={t("ai.settings", { defaultValue: "Settings" })}
                data-testid='settings-button'
                className='
                  inline-flex items-center justify-center w-10 h-10
                  rounded-xl glass text-foreground
                  hover:bg-[hsla(var(--glass-bg-hover))]
                  hover:-translate-y-px hover:shadow-glass
                  active:translate-y-0
                  transition-all duration-normal ease-out cursor-pointer
                '
              >
                <BiCog size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Bottom hint bar */}
        <div className='px-5 pb-3 pt-0'>
          <div className='flex items-center justify-between text-xs text-muted-foreground/60'>
            <span>
              {isComposing
                ? t("ai.composing") || "Composing..."
                : t("ai.hint_enter_to_send", {
                    defaultValue:
                      "Press Enter to send, Shift+Enter for new line",
                  })}
            </span>
            {value && (
              <span className='tabular-nums'>
                {value.length} {t("ai.characters") || "chars"}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
