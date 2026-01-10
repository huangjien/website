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
      className={`shrink-0 inline-flex items-center justify-center rounded-md ring-1 ring-border bg-background/60 backdrop-blur-sm text-foreground hover:bg-accent/20 hover:scale-105 hover:shadow-sm active:scale-95 disabled:opacity-50 p-2 transition-all duration-fast ease-out ${className}`}
    >
      <BiCopyAlt size={18} />
    </button>
  );
}
