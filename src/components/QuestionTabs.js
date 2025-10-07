import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, Tab, Card, CardBody } from "@heroui/react";
import { success, error } from "./Notification";
import { useLocalStorageState } from "ahooks";
import { getAnswer } from "../lib/aiService";
import ConversationTab from "./ConversationTab";
import ConfigurationTab from "./ConfigurationTab";

export const QuestionTabs = ({ append }) => {
  // append is the method add Q and A to parent content list
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
    <Tabs
      radius='md w-auto m-2'
      size='lg'
      className={{
        tabList: " justify-evenly w-full relative rounded m-0 ",
        cursor: "w-full ",
        tab: "w-fit  h-12",
      }}
    >
      <Tab
        title={
          <h2 className=' font-semibold' size={"2em"}>
            {t("ai.conversation")}
          </h2>
        }
      >
        <Card>
          <CardBody>
            <ConversationTab
              questionText={questionText}
              setQuestionText={setQuestionText}
              loading={loading}
              onSubmit={handleSubmit}
              onClear={clearText}
              trackSpeed={trackSpeed}
            />
          </CardBody>
        </Card>
      </Tab>
      <Tab
        title={
          <h2 className=' font-semibold' size={"2em"}>
            {t("ai.configuration")}
          </h2>
        }
      >
        <Card>
          <CardBody>
            <ConfigurationTab
              model={model}
              setModel={setModel}
              temperature={temperature}
              setTemperature={setTemperature}
              trackSpeed={trackSpeed}
              setTrackSpeed={setTrackSpeed}
            />
          </CardBody>
        </Card>
      </Tab>
    </Tabs>
  );
};
