import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { error } from "../../components/Notification";
import { useSession } from "next-auth/react";
import { BiPlay } from "react-icons/bi";

export default function TTSButton({
  text,
  voice = "alloy",
  languageCode = "en-US",
  name = "en-US-Standard-C",
  className = "",
}) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const audioRef = useRef(null);
  const { status } = useSession();

  // Hide when not logged in
  if (status !== "authenticated") return null;

  const handlePlay = async () => {
    if (!text) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ text, languageCode, name, voice });
      const res = await fetch(`/api/tts?${params.toString()}`);
      if (!res.ok) {
        if (res.status !== 401)
          error(t("ai.tts_failed", { defaultValue: "Text-to-speech failed" }));
        setLoading(false);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play();
      audio.addEventListener("ended", () => {
        URL.revokeObjectURL(url);
        audioRef.current = null;
      });
    } catch (e) {
      error(t("ai.tts_failed", { defaultValue: "Text-to-speech failed" }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type='button'
      onClick={handlePlay}
      disabled={loading}
      aria-label={
        loading
          ? t("ai.loading", { defaultValue: "Loading…" })
          : t("ai.play", { defaultValue: "Play" })
      }
      className={`shrink-0 inline-flex items-center justify-center rounded-md border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-900 hover:bg-neutral-100 disabled:opacity-50 p-2 ${className}`}
    >
      <BiPlay size={18} />
    </button>
  );
}
