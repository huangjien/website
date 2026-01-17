import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { success, error } from "./Notification";
import { useLocalStorageState } from "ahooks";
import { getAnswer } from "../lib/aiService";
import ConversationTab from "./ConversationTab";
import ConfigurationTab from "./ConfigurationTab";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";

export const QuestionTabs = ({ append }) => {
  // append is the method add Q and A to parent content list
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { t } = useTranslation();
  const [questionText, setQuestionText] = useState("");
  const [lastAnswer, setLastAnswer] = useLocalStorageState("LastAnswer", {
    defaultValue: "",
  });
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useLocalStorageState("ai-model", {
    defaultValue: "gpt-4.1-mini",
  });
  const [temperature, setTemperature] = useLocalStorageState("ai-temperature", {
    defaultValue: 0.5,
  });
  const [trackSpeed, setTrackSpeed] = useLocalStorageState("track-speed", {
    defaultValue: 300,
  });

  const handleSubmit = async (question) => {
    if (!question.trim()) return;

    setLoading(true);
    try {
      const data = await getAnswer(
        question,
        lastAnswer,
        model,
        parseFloat(temperature)
      );
      if (data.error) {
        error(
          t("ai.return_error") +
            ":\n" +
            data.error.code +
            "\n" +
            data.error.message
        );
        throw new Error(t("ai.return_error") + ":\n" + data.error.message);
      }
      // add question and answer to content
      var newQandA = {
        question: question,
        answer: data.choices[0].message.content,
        key: data.id,
        id: data.id,
        temperature: temperature,
        timestamp: data.created,
        model: data.model,
        question_tokens: data.usage.prompt_tokens,
        answer_tokens: data.usage.completion_tokens,
        total_tokens: data.usage.total_tokens,
      };
      setLastAnswer(newQandA.answer);
      success(t("ai.return_length") + ": " + data.usage.completion_tokens);
      append(newQandA);
      setQuestionText("");
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      error("Request failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearText = () => {
    setQuestionText("");
  };

  return (
    <Tabs defaultValue='conversation' className='w-auto m-2'>
      <TabsList className='justify-evenly w-full rounded-md bg-muted p-1'>
        <TabsTrigger value='conversation' className='h-12'>
          <h2 className='font-semibold' size={"2em"}>
            {t("ai.conversation")}
          </h2>
        </TabsTrigger>
        <TabsTrigger value='configuration' className='h-12'>
          <h2 className='font-semibold' size={"2em"}>
            {t("ai.configuration")}
          </h2>
        </TabsTrigger>
      </TabsList>
      <TabsContent value='conversation' className='mt-2'>
        <div className='rounded-md bg-background p-4 shadow-sm'>
          <ConversationTab
            questionText={questionText}
            setQuestionText={setQuestionText}
            loading={loading}
            onSubmit={handleSubmit}
            onClear={clearText}
            trackSpeed={mounted ? trackSpeed : 300}
          />
        </div>
      </TabsContent>
      <TabsContent value='configuration' className='mt-2'>
        <div className='rounded-md bg-background p-4 shadow-sm'>
          <ConfigurationTab
            model={mounted ? model : "gpt-4.1-mini"}
            setModel={setModel}
            temperature={mounted ? temperature : 0.5}
            setTemperature={setTemperature}
            trackSpeed={mounted ? trackSpeed : 300}
            setTrackSpeed={setTrackSpeed}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
};
