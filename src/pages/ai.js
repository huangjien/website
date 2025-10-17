"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useLocalStorageState, useTitle, useDebounceEffect } from "ahooks";
import { useTranslation } from "react-i18next";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

import {
  Conversation,
  ConversationContent,
} from "../components/ai-elements/conversation";
import { Message, MessageContent } from "../components/ai-elements/message";
import Response from "../components/ai-elements/response";
import PromptInput from "../components/ai-elements/prompt-input";
import SettingsPanel from "../components/ai-elements/settings-panel";
import TTSButton from "../components/ai-elements/tts-button";

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
    { defaultValue: [] }
  );

  // Controlled prompt input (AI SDK v5 does not manage input state)
  const [prompt, setPrompt] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  // Migrate legacy keys to ai:* per spec
  useEffect(() => {
    try {
      // Migrate from ai-elements/conversations (previous iteration)
      const legacyConvs = JSON.parse(
        localStorage.getItem("ai-elements/conversations") || "null"
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
          }))
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
  const { id, messages, sendMessage, stop, status, clearError } = useChat({
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
    messages: hydrateMessages(savedMessages),
    experimental_throttle: settings?.trackSpeed || undefined,
    onError: (err) => {
      console.error("useChat error:", err);
    },
    onFinish: ({ messages: finalMessages }) => {
      setSavedMessages(serializeMessages(finalMessages));
    },
  });

  // Persist messages on changes (debounced)
  useDebounceEffect(
    () => {
      setSavedMessages(serializeMessages(messages));
    },
    [messages],
    { wait: 500 }
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

  const handleSend = async () => {
    const question = prompt.trim();
    if (!question) return;
    // Include last answer in the prompt optionally (kept for parity with previous behavior)
    const composed = lastAnswer ? `${question}\n\n${lastAnswer}` : question;
    try {
      // Vercel AI SDK v5 expects a UI message with parts when not passing a raw string.
      // Passing a string can cause internal checks like `'text' in message` to throw on primitives.
      const userMessage = {
        role: "user",
        parts: [{ type: "text", text: composed }],
      };
      await sendMessage(userMessage);
      setPrompt("");
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
          now.getTime() - 1000 * 60 * 60 * 24 * 30
        ).getTime();
        const oneMonthTimestamp = Math.round(oneMonthAgo / 1000);
        const filtered = list.filter(
          (item) => (item.timestamp || 0) > oneMonthTimestamp
        );
        setSavedMessages(filtered);
      }
    },
    [savedMessages],
    { wait: 200000 }
  );

  return (
    <div
      className='min-h-max w-auto text-lg lg:gap-4 lg:m-4'
      data-testid='ai-container'
    >
      <div className='mx-auto w-[90vw]'>
        <Conversation>
          <ConversationContent>
            {(messages || []).map((m) => {
              const text = uiMessageText(m);
              return (
                <Message key={m.id} role={m.role}>
                  <MessageContent>
                    {m.role === "assistant" ? (
                      <Response>{text}</Response>
                    ) : (
                      text
                    )}
                    {m.role === "assistant" ? (
                      <div className='mt-2'>
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
          </ConversationContent>
        </Conversation>
      </div>

      <div className='mx-auto w-[90vw] mt-6'>
        <PromptInput
          value={prompt}
          onChange={setPrompt}
          onSubmit={handleSend}
          onStop={handleStop}
          onToggleSettings={() => setShowSettings((s) => !s)}
          className='max-w-none px-0 sm:px-0 lg:px-0'
        />
      </div>

      {showSettings ? (
        <div className='mx-auto w-[90vw] mt-2'>
          <SettingsPanel settings={settings} setSettings={setSettings} />
        </div>
      ) : null}
    </div>
  );
}
