import React from "react";
import { useTranslation } from "react-i18next";
import { success, error } from "../../components/Notification";
import { BiCopyAlt } from "react-icons/bi";

export default function CopyButton({ text = "", className = "" }) {
  const { t } = useTranslation();

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      success(t("ai.copied", { defaultValue: "Copied to clipboard" }));
    } catch (e) {
      error(t("ai.copy_failed", { defaultValue: "Failed to copy" }));
    }
  };

  return (
    <button
      type='button'
      onClick={handleCopy}
      aria-label={t("ai.copy", { defaultValue: "Copy" })}
      title={t("ai.copy", { defaultValue: "Copy" })}
      className={`shrink-0 inline-flex items-center justify-center rounded-xl glass text-foreground hover:bg-[hsla(var(--glass-bg-hover))] hover:-translate-y-px hover:shadow-glass active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none p-2 transition-all duration-normal ease-out ${className}`}
    >
      <BiCopyAlt size={18} />
    </button>
  );
}
