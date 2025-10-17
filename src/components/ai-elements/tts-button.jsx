import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { error } from '../../components/Notification';

export default function TTSButton({
  text,
  languageCode = 'en-US',
  name = 'en-US-Standard-C',
  className = ''
}) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const audioRef = useRef(null);

  const handlePlay = async () => {
    if (!text) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ text, languageCode, name });
      const res = await fetch(`/api/tts?${params.toString()}`);
      if (res.status === 401) {
        error(t('ai.login_required', { defaultValue: 'Login required to use TTS' }));
        setLoading(false);
        return;
      }
      if (!res.ok) {
        error(t('ai.tts_failed', { defaultValue: 'Text-to-speech failed' }));
        setLoading(false);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play();
      audio.addEventListener('ended', () => {
        URL.revokeObjectURL(url);
        audioRef.current = null;
      });
    } catch (e) {
      error(t('ai.tts_failed', { defaultValue: 'Text-to-speech failed' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handlePlay}
      disabled={loading}
      className={`rounded-md px-2 py-1 text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 hover:bg-neutral-200 ${className}`}
    >
      {loading ? t('ai.loading', { defaultValue: 'Loading…' }) : t('ai.play', { defaultValue: 'Play' })}
    </button>
  );
}