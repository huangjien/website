import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAudioRecording } from '../../hooks/useAudioRecording';

export default function AudioRecorder({ onTranscribed }) {
  const { t } = useTranslation();
  const { startRecording, stopRecording, audioSrc, isRecording } = useAudioRecording();

  return (
    <div className="w-full mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 mt-2" data-testid="audio-recorder">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => (isRecording ? stopRecording(onTranscribed) : startRecording())}
          className={`rounded-md px-3 py-2 text-sm font-medium ${
            isRecording
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 hover:bg-neutral-200'
          }`}
        >
          {isRecording
            ? t('ai.stop', { defaultValue: 'Stop' })
            : t('ai.mic', { defaultValue: 'Mic' })}
        </button>
        {isRecording && (
          <span className="text-xs text-red-600" aria-live="polite">
            {t('ai.recording', { defaultValue: 'Recording…' })}
          </span>
        )}
      </div>
      {audioSrc ? (
        <audio className="mt-2 w-full" controls src={audioSrc} />
      ) : null}
    </div>
  );
}