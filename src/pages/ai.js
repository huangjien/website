"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useLocalStorageState, useTitle, useDebounceEffect } from "ahooks";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  BiChevronDown,
  BiChevronUp,
  BiExpand,
  BiCollapse,
} from "react-icons/bi";

import {
  Conversation,
  ConversationContent,
} from "../components/ai-elements/conversation";
import { Message, MessageContent } from "../components/ai-elements/message";
import Response from "../components/ai-elements/response";
import PromptInput from "../components/ai-elements/prompt-input";
import SettingsPanel from "../components/ai-elements/settings-panel";
import TTSButton from "../components/ai-elements/tts-button";
import CopyButton from "../components/ai-elements/copy-button";

// Helpers to serialize/hydrate UI messages for localStorage
function uiMessageText(message) {
  // Attempt to get text from parts for AI SDK v5
  if (Array.isArray(message?.parts)) {
    return message.parts
      .map((p) => (p?.type === "text" ? p.text : ""))
      .join("");
  }
  // Fallbacks
  if (typeof message?.content === "string") return message.content;
  if (typeof message?.text === "string") return message.text;
  return "";
}

function serializeMessages(messages) {
  return (messages || []).map((m) => ({
    id: m.id,
    role: m.role,
    content: uiMessageText(m),
    timestamp: Date.now(),
  }));
}

function hydrateMessages(serialized) {
  return (serialized || []).map((m) => ({
    id: m.id || Math.random().toString(36).slice(2),
    role: m.role,
    parts: [{ type: "text", text: String(m.content || "") }],
  }));
}

export default function AI() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { t } = useTranslation();
  useTitle(t("header.ai"));

  // Settings persisted under ai:* per spec
  const [settings, setSettings] = useLocalStorageState("ai:settings", {
    defaultValue: {
      model: "gpt-4o-mini",
      temperature: 1,
      trackSpeed: 300,
      ttsVoice: "alloy",
    },
  });

  // Persisted message thread under ai:* per spec
  const [savedMessages, setSavedMessages] = useLocalStorageState(
    "ai:conversations",
    { defaultValue: [] },
  );

  // Controlled prompt input (AI SDK v5 does not manage input state)
  const [prompt, setPrompt] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [isInputCollapsed, setIsInputCollapsed] = useState(false);
  const settingsPanelRef = useRef(null);

  // Scroll anchor to keep recent info visible
  const bottomRef = useRef(null);

  // Migrate legacy keys to ai:* per spec
  useEffect(() => {
    try {
      // Migrate from ai-elements/conversations (previous iteration)
      const legacyConvs = JSON.parse(
        localStorage.getItem("ai-elements/conversations") || "null",
      );
      if (
        Array.isArray(legacyConvs) &&
        legacyConvs.length &&
        savedMessages?.length === 0
      ) {
        // Take the latest conversation's messages if available
        const latest = legacyConvs[0]?.messages || [];
        setSavedMessages(
          latest.map((m) => ({
            id: m.id || Math.random().toString(36).slice(2),
            role: m.role,
            content: m.content,
            timestamp: Date.now(),
          })),
        );
      }
    } catch {}

    try {
      // Migrate from QandA/LastAnswer (very old schema)
      const legacyQandA = JSON.parse(localStorage.getItem("QandA") || "null");
      if (
        Array.isArray(legacyQandA) &&
        legacyQandA.length &&
        savedMessages?.length === 0
      ) {
        const migrated = legacyQandA.flatMap((item) => [
          {
            id: item.id || Math.random().toString(36).slice(2),
            role: "user",
            content: item.question,
            timestamp: item.timestamp || Date.now(),
          },
          {
            id: Math.random().toString(36).slice(2),
            role: "assistant",
            content: item.answer,
            timestamp: item.timestamp || Date.now(),
          },
        ]);
        setSavedMessages(migrated);
      }
    } catch {}

    // Remove legacy keys regardless
    localStorage.removeItem("QandA");
    localStorage.removeItem("LastAnswer");
    localStorage.removeItem("ai-model");
    localStorage.removeItem("ai-temperature");
    localStorage.removeItem("ai-elements/conversations");
    localStorage.removeItem("ai-elements/settings");
  }, []);

  // Initialize useChat with initial messages and backend API
  const { id, messages, sendMessage, stop, status, clearError, setMessages } =
    useChat({
      transport: new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ messages: outgoing }) => {
          return {
            body: {
              messages: outgoing,
              model: settings?.model,
              temperature: parseFloat(settings?.temperature ?? 1),
              system: settings?.systemPrompt || undefined,
            },
          };
        },
      }),
      id: "ai-page",
      messages: [], // Start empty to match server SSR
      experimental_throttle: settings?.trackSpeed || undefined,
      onError: (err) => {
        console.error("useChat error:", err);
        toast.error(t("ai.error_message"), {
          position: "top-center",
          autoClose: 5000,
        });
      },
      onFinish: ({ messages: finalMessages }) => {
        setSavedMessages(serializeMessages(finalMessages));
      },
    });

  // Load saved messages on mount
  const [initialLoaded, setInitialLoaded] = useState(false);
  useEffect(() => {
    if (mounted && !initialLoaded && savedMessages?.length > 0) {
      setMessages(hydrateMessages(savedMessages));
      setInitialLoaded(true);
    }
  }, [mounted, initialLoaded, savedMessages, setMessages]);

  // Persist messages on changes (debounced)
  useDebounceEffect(
    () => {
      setSavedMessages(serializeMessages(messages));
    },
    [messages],
    { wait: 500 },
  );

  // Keep last assistant answer under 1024 chars for optional context in future
  const lastAnswer = useMemo(() => {
    const latest = [...(messages || [])]
      .reverse()
      .find((m) => m.role === "assistant");
    const content = uiMessageText(latest || {});
    return content.length < 1024 ? content : "";
  }, [messages]);

  const loading = status === "streaming" || status === "submitted";

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return t("ai.timestamp_now") || "Just now";
    if (diffMins < 60)
      return `${diffMins} ${t("ai.timestamp_mins_ago") || "min(s) ago"}`;
    if (diffHours < 24)
      return `${diffHours} ${t("ai.timestamp_hours_ago") || "h(s) ago"}`;
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Auto-scroll to bottom to show recent info
  useEffect(() => {
    try {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch {}
  }, [messages, status]);

  // Close settings panel on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showSettings) {
        setShowSettings(false);
      }
    };

    if (showSettings) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [showSettings]);

  // Close settings panel when clicking outside
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

  const handleSend = async () => {
    const question = prompt.trim();
    if (!question) return;
    try {
      // Send ONLY the current prompt as the user's message.
      // The conversation history (including any previous assistant answers) is already maintained by useChat.
      const userMessage = {
        role: "user",
        parts: [{ type: "text", text: question }],
      };
      await sendMessage(userMessage);
      setPrompt("");
      // Scroll down after sending
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      console.error("sendMessage failed:", err);
      clearError?.();
    }
  };

  const handleStop = () => {
    try {
      stop();
    } catch {}
  };

  const handleClear = () => {
    // Clear the message thread
    setSavedMessages([]);
    // Reset useChat by reloading the page or clearing persisted initial messages
    // Minimal approach: update local storage; useChat will reflect on next load
  };

  // Cleanup policy: if more than 2000 messages, keep last month
  useDebounceEffect(
    () => {
      const list = savedMessages || [];
      if (list.length > 2000) {
        const now = new Date();
        const oneMonthAgo = new Date(
          now.getTime() - 1000 * 60 * 60 * 24 * 30,
        ).getTime();
        const oneMonthTimestamp = Math.round(oneMonthAgo / 1000);
        const filtered = list.filter(
          (item) => (item.timestamp || 0) > oneMonthTimestamp,
        );
        setSavedMessages(filtered);
      }
    },
    [savedMessages],
    { wait: 200000 },
  );

  // Optionally limit rendering to recent N messages to keep UI snappy
  const visibleMessages = useMemo(() => {
    const all = messages || [];
    const N = 300; // show up to latest 300 messages
    return all.length > N ? all.slice(all.length - N) : all;
  }, [messages]);

  return (
    <div
      className='min-h-screen w-full text-lg overflow-x-hidden'
      data-testid='ai-container'
    >
      {/* Messages area with bottom padding to avoid overlap with fixed input */}
      <div
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
                        {formatTimestamp(m.createdAt)}
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
            {/* Scroll anchor */}
            <div ref={bottomRef} />
          </ConversationContent>
        </Conversation>
      </div>

      {/* Fixed bottom input bar */}
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
        {/* Collapse/Expand toggle button - positioned on LEFT to avoid conflict with scroll-to-top button */}
        <button
          onClick={() => setIsInputCollapsed(!isInputCollapsed)}
          className='fixed bottom-4 left-4 z-[60] inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent text-white hover:scale-110 active:scale-95 shadow-glow border-2 border-white/20 transition-all duration-200 ease-out'
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
          {isInputCollapsed ? <BiExpand size={24} /> : <BiCollapse size={24} />}
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
          {/* Backdrop overlay */}
          <div
            className='fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-fade-in'
            onClick={() => setShowSettings(false)}
          />
          {/* Settings panel */}
          <div
            className={`
            fixed left-0 right-0 z-50 px-4 transition-all duration-300 ease-in-out
            ${isInputCollapsed ? "bottom-20" : "bottom-24"}
          `}
          >
            <div className='mx-auto w-full max-w-2xl' ref={settingsPanelRef}>
              <SettingsPanel
                settings={
                  mounted
                    ? settings
                    : {
                        model: "gpt-4o-mini",
                        temperature: 1,
                        trackSpeed: 300,
                        ttsVoice: "alloy",
                      }
                }
                setSettings={setSettings}
                onClose={() => setShowSettings(false)}
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
