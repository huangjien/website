"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useTitle } from "ahooks";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useChat } from "@ai-sdk/react";
import { BiExpand, BiCollapse } from "react-icons/bi";
import dynamic from "next/dynamic";

import {
  Conversation,
  ConversationContent,
} from "../components/ai-elements/conversation";
import { Message, MessageContent } from "../components/ai-elements/message";
import PromptInput from "../components/ai-elements/prompt-input";
import SettingsPanel from "../components/ai-elements/settings-panel";
import TTSButton from "../components/ai-elements/tts-button";
import CopyButton from "../components/ai-elements/copy-button";
import { DEFAULT_AI_MODEL, isAllowedAiModel } from "../config/ai-models";

import { useAiSettings } from "../lib/ai/useAiSettings";
import { useAiThread } from "../lib/ai/useAiThread";
import { useAiMigration } from "../lib/ai/useAiMigration";
import { useAiModelCatalog } from "../lib/ai/useAiModelCatalog";
import { createChatTransport, transportDeps } from "../lib/ai/chatTransport";
import { formatMessageTimestamp } from "../lib/ai/formatTimestamp";
import { uiMessageText, hydrateMessages } from "../lib/ai/serializeMessages";

// react-markdown + rehype-highlight are heavy; load Response client-side only.
const Response = dynamic(() => import("../components/ai-elements/response"), {
  ssr: false,
});

// Stable empty array for useChat initial messages.
// Passing `[]` inline resets useChat on every render in dev (HMR loop).
const EMPTY_MESSAGES = [];

export default function AI() {
  const { t } = useTranslation();
  useTitle(t("header.ai"));

  // ---- Settings (persisted, SSR-safe) ----------------------------------
  const { settings, setSettings } = useAiSettings();

  // ---- Model catalog (live with curated fallback) -----------------------
  const modelOptions = useAiModelCatalog();

  // ---- Auto-fallback if current model is no longer in catalog ----------
  useEffect(() => {
    const currentModel = settings?.model;
    if (!currentModel) return;
    const isInCatalog = modelOptions.some((item) => item.id === currentModel);
    if (!isAllowedAiModel(currentModel) || !isInCatalog) {
      const fallbackModel =
        modelOptions.find((item) => item.id === DEFAULT_AI_MODEL)?.id ||
        modelOptions[0]?.id ||
        DEFAULT_AI_MODEL;
      setSettings((prev) => ({ ...prev, model: fallbackModel }));
      toast.info(
        t("ai.model_auto_fallback", {
          defaultValue: "Model updated to default option.",
        }),
      );
    }
  }, [modelOptions, settings?.model, setSettings, t]);

  // ---- Failover notice: server swaps models on usage limits ----------
  // Ref keeps the transport-stable callback from closing over stale `t`.
  const fallbackHandlerRef = useRef(null);
  fallbackHandlerRef.current = (info) => {
    toast.info(t("ai.fallback_toast", { from: info.from, to: info.servedBy }), {
      toastId: "ai-fallback",
    });
  };

  // ---- Transport: memoized so it only rebuilds on real settings change -
  const transport = useMemo(
    () =>
      createChatTransport(settings, (info) =>
        fallbackHandlerRef.current?.(info),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [transportDeps(settings)],
  );

  // ---- useChat: only construct once; settings drive transport updates --
  const { messages, sendMessage, stop, status, clearError, setMessages } =
    useChat({
      id: "ai-page",
      messages: EMPTY_MESSAGES,
      transport,
      throttle: settings?.trackSpeed || undefined,
      onError: (err) => {
        console.error("useChat error:", err);
        toast.error(t("ai.error_message"), {
          position: "top-center",
          autoClose: 5000,
        });
      },
    });

  // ---- Thread persistence (single source of truth for localStorage) ----
  const {
    thread: storedThread,
    setThread: setStoredThread,
    mounted: threadMounted,
  } = useAiThread({ messages, status });

  // ---- One-time legacy key migration ------------------------------------
  useAiMigration({
    ready: threadMounted,
    thread: storedThread,
    setThread: setStoredThread,
  });

  // ---- Local UI state ---------------------------------------------------
  const [prompt, setPrompt] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [isInputCollapsed, setIsInputCollapsed] = useState(false);
  const settingsPanelRef = useRef(null);
  const initialHydratedRef = useRef(false);

  // ---- Hydrate saved thread into useChat once --------------------------
  useEffect(() => {
    if (!threadMounted) return;
    if (initialHydratedRef.current) return;
    if (!storedThread?.length) {
      initialHydratedRef.current = true;
      return;
    }
    setMessages(hydrateMessages(storedThread));
    initialHydratedRef.current = true;
  }, [threadMounted, storedThread, setMessages]);

  // ---- Auto-scroll ------------------------------------------------------
  const bottomRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const scrollToBottom = useCallback((behavior = "smooth") => {
    try {
      bottomRef.current?.scrollIntoView({ behavior });
    } catch (err) {
      console.debug("Auto-scroll failed:", err);
    }
  }, []);

  const isNearBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return true;
    const remaining =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    return remaining < 180;
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;
    if (isNearBottom()) {
      scrollToBottom(messages.length <= 2 ? "auto" : "smooth");
    }
  }, [messages.length, isNearBottom, scrollToBottom]);

  // ---- ESC to close settings panel --------------------------------------
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showSettings) setShowSettings(false);
    };
    if (showSettings) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [showSettings]);

  // ---- Click-outside to close settings panel ----------------------------
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        showSettings &&
        settingsPanelRef.current &&
        !settingsPanelRef.current.contains(e.target) &&
        !e.target.closest('[data-testid="settings-button"]')
      ) {
        setShowSettings(false);
      }
    };
    if (showSettings) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchstart", handleClickOutside);
      };
    }
  }, [showSettings]);

  // ---- Send / stop handlers --------------------------------------------
  const handleSend = async () => {
    const question = prompt.trim();
    if (!question) return;
    try {
      await sendMessage({
        role: "user",
        parts: [{ type: "text", text: question }],
      });
      setPrompt("");
      scrollToBottom("smooth");
    } catch (err) {
      console.error("sendMessage failed:", err);
      clearError?.();
    }
  };

  const handleStop = () => {
    try {
      stop();
    } catch (err) {
      console.warn("Stop failed:", err);
    }
  };

  // ---- Visibility: cap rendered messages for UI snappiness -------------
  const visibleMessages = useMemo(() => {
    const all = messages || [];
    const N = 300;
    return all.length > N ? all.slice(all.length - N) : all;
  }, [messages]);

  const formatTimestamp = useCallback(
    (message) => formatMessageTimestamp(message, t),
    [t],
  );

  return (
    <div className='hallmark-page' data-theme='cobalt'>
      <div
        className='min-h-screen w-full overflow-x-hidden'
        data-testid='ai-container'
      >
        <div className='hallmark-app-header-wrap'>
          <p className='hallmark-app-header'>AI ·</p>
        </div>
        <div
          ref={messagesContainerRef}
          className={`
        mx-auto w-full max-w-5xl px-4 pt-4 transition-all duration-300 ease-in-out
        ${isInputCollapsed ? "pb-20" : "pb-48"}
      `}
        >
          <Conversation>
            <ConversationContent>
              {(visibleMessages || []).map((m) => {
                const text = uiMessageText(m);
                return (
                  <Message key={m.id} role={m.role}>
                    <MessageContent>
                      <div className='flex items-start gap-3'>
                        <div className='flex-1 min-w-0'>
                          {m.role === "assistant" ? (
                            <Response>{text}</Response>
                          ) : (
                            text
                          )}
                        </div>
                        <div className='text-xs text-muted-foreground whitespace-nowrap flex-shrink-0'>
                          {formatTimestamp(m)}
                        </div>
                      </div>
                      {m.role === "assistant" ? (
                        <div className='mt-2 flex gap-2 flex-wrap'>
                          <CopyButton text={text} />
                          <TTSButton
                            text={text}
                            voice={settings?.ttsVoice || "alloy"}
                          />
                        </div>
                      ) : null}
                    </MessageContent>
                  </Message>
                );
              })}
              <div ref={bottomRef} />
            </ConversationContent>
          </Conversation>
        </div>

        <div
          className={`
          fixed left-0 right-0 glass-nav border-t border-border/50 backdrop-blur-xl
          transition-all duration-300 ease-in-out
          ${isInputCollapsed ? "bottom-0" : "bottom-0"}
        `}
          style={{
            height: isInputCollapsed ? "auto" : "auto",
          }}
        >
          <button
            onClick={() => setIsInputCollapsed(!isInputCollapsed)}
            className='fixed bottom-4 left-4 z-[60] inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground ring-1 ring-border/60 hover:brightness-110 hover:-translate-y-px active:translate-y-0 active:brightness-95 shadow-[inset_0_1px_0_hsl(var(--primary-foreground)/0.15),0_10px_24px_-10px_hsl(var(--primary)/0.55)] transition-all duration-normal ease-out'
            title={
              isInputCollapsed
                ? t("ai.show_input_panel", { defaultValue: "Show input panel" })
                : t("ai.hide_input_panel", { defaultValue: "Hide input panel" })
            }
            aria-label={
              isInputCollapsed
                ? t("ai.expand_input_panel", {
                    defaultValue: "Expand input panel",
                  })
                : t("ai.collapse_input_panel", {
                    defaultValue: "Collapse input panel",
                  })
            }
          >
            {isInputCollapsed ? (
              <BiExpand size={24} />
            ) : (
              <BiCollapse size={24} />
            )}
          </button>

          <div
            className={`
            mx-auto w-full max-w-5xl px-4
            transition-all duration-300 ease-in-out overflow-hidden
            ${isInputCollapsed ? "max-h-0 opacity-0 py-0" : "max-h-[600px] opacity-100 py-6"}
          `}
          >
            <PromptInput
              value={prompt}
              onChange={setPrompt}
              onSubmit={handleSend}
              onStop={handleStop}
              onToggleSettings={() => setShowSettings((s) => !s)}
            />
          </div>
        </div>

        {showSettings ? (
          <>
            <div
              className='fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-fade-in'
              onClick={() => setShowSettings(false)}
            />
            <div
              className={`
            fixed left-0 right-0 z-50 px-4 transition-all duration-300 ease-in-out
            ${isInputCollapsed ? "bottom-20" : "bottom-24"}
          `}
            >
              <div className='mx-auto w-full max-w-2xl' ref={settingsPanelRef}>
                <SettingsPanel
                  settings={settings}
                  models={modelOptions}
                  setSettings={setSettings}
                  onClose={() => setShowSettings(false)}
                />
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
