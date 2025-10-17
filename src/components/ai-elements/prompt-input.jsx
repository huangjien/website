import React, { forwardRef } from 'react';
import { BiMicrophone, BiSend, BiStop, BiTrash } from 'react-icons/bi';
import { useAudioRecording } from '../../hooks/useAudioRecording';
import { useTranslation } from 'react-i18next';

export function PromptInput({ value, onChange, onSubmit, onStop, onClear, onTranscribed, streaming = false, disabled = false, placeholder = '', className = '' }) {
  const { t } = useTranslation();
  const { startRecording, stopRecording, isRecording } = useAudioRecording();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!disabled && onSubmit) onSubmit();
      }}
      className={`w-full mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 ${className}`}
      data-testid="prompt-input"
    >
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <div className="relative rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900">
            <PromptInputTextarea
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full border-0 rounded-none bg-transparent focus:ring-0 outline-none pr-28 pb-12"
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-1">
              <button
                type="button"
                title={isRecording ? t('ai.stop', { defaultValue: 'Stop' }) : t('ai.mic', { defaultValue: 'Mic' })}
                aria-label={isRecording ? t('ai.stop', { defaultValue: 'Stop' }) : t('ai.mic', { defaultValue: 'Mic' })}
                onClick={() => (isRecording ? stopRecording(onTranscribed) : startRecording())}
                className={`shrink-0 inline-flex items-center justify-center rounded-md border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-900 hover:bg-neutral-100 disabled:opacity-50 p-2 ${isRecording ? 'text-red-600 border-red-600' : ''}`}
              >
                <BiMicrophone size={18} />
              </button>

              <button
                type="submit"
                title={t('ai.send', { defaultValue: 'Send' })}
                aria-label={t('ai.send', { defaultValue: 'Send' })}
                disabled={disabled}
                className="shrink-0 inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white p-2"
                data-testid="prompt-submit"
              >
                <BiSend size={18} />
              </button>

              <button
                type="button"
                title={t('ai.stop', { defaultValue: 'Stop' })}
                aria-label={t('ai.stop', { defaultValue: 'Stop' })}
                disabled={!streaming}
                onClick={onStop}
                className="shrink-0 inline-flex items-center justify-center rounded-md border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-900 hover:bg-neutral-100 disabled:opacity-50 p-2"
              >
                <BiStop size={18} />
              </button>

              <button
                type="button"
                title={t('ai.clear', { defaultValue: 'Clear' })}
                aria-label={t('ai.clear', { defaultValue: 'Clear' })}
                onClick={onClear}
                className="shrink-0 inline-flex items-center justify-center rounded-md border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-900 hover:bg-neutral-100 p-2"
              >
                <BiTrash size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

export const PromptInputTextarea = forwardRef(function PromptInputTextarea(
  { value, onChange, disabled = false, placeholder = '', className = '' },
  ref
) {
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      rows={3}
      className={`flex-1 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-2 text-sm resize-y min-h-[48px] ${className}`}
      aria-label={placeholder || 'Prompt'}
    />
  );
});

export default PromptInput;