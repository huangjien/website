import React from "react";
import { useAudioRecording } from "../../hooks/useAudioRecording";

/**
 * AudioRecorder
 * Records audio using the existing hook and returns transcribed text via onTranscribed.
 */
export default function AudioRecorder({ onTranscribed }) {
  const { startRecording, stopRecording, audioSrc, isRecording } = useAudioRecording();

  const handleStop = async () => {
    await stopRecording(onTranscribed);
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={startRecording}
        disabled={isRecording}
        className="inline-flex h-9 items-center justify-center rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-900 hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
      >
        Record
      </button>
      <button
        type="button"
        onClick={handleStop}
        disabled={!isRecording}
        className="inline-flex h-9 items-center justify-center rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-900 hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
      >
        Stop & Transcribe
      </button>
      {audioSrc ? (
        <audio controls src={audioSrc} className="ml-2 h-9" />
      ) : null}
    </div>
  );
}