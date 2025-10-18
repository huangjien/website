import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Textarea from "./ui/textarea";
import Button from "./ui/button";
import Tooltip from "./ui/tooltip";
import Progress from "./ui/progress";
import { BiMessageRoundedDetail, BiMicrophone } from "react-icons/bi";
import { useAudioRecording } from "../hooks/useAudioRecording";
import { warn } from "./Notification";

/**
 * Conversation tab component for text input and audio recording
 */
const ConversationTab = ({
  questionText,
  setQuestionText,
  loading,
  onSubmit,
  onClear,
  trackSpeed = 300,
}) => {
  const { t } = useTranslation();
  const { startRecording, stopRecording, audioSrc, isRecording } =
    useAudioRecording();
  const [hold, setHold] = useState(false);
  const [longPressDetected, setLongPressDetected] = useState(false);
  let pressTimer = null;

  const startPress = () => {
    setLongPressDetected(false);
    pressTimer = setTimeout(async () => {
      setHold(true);
      setLongPressDetected(true);
      await startRecording();
    }, trackSpeed);
  };

  const endPress = () => {
    clearTimeout(pressTimer);
    if (longPressDetected) {
      stopRecording((transcribedText) => {
        setQuestionText(transcribedText);
      });
    } else {
      if (questionText === undefined || questionText?.length < 5) {
        warn("Please input a meaningful question");
      } else {
        onSubmit(questionText);
      }
    }
    setHold(false);
    setLongPressDetected(false);
  };

  return (
    <div className='flex flex-col gap-4'>
      {loading && (
        <Progress
          size='sm'
          isIndeterminate
          aria-label='Loading...'
          className='max-w-full'
        />
      )}

      <div className='inline-flex justify-items-stretch items-stretch justify-between'>
        <Textarea
          aria-label='question text area'
          className='inline-flex m-1 lg:w-10/12 sm:w-8/12 max-h-full'
          disabled={loading}
          value={questionText}
          placeholder={t("ai.input_placeholder")}
          onChange={(e) => setQuestionText(e.target.value)}
          minRows={3}
        />

        <Tooltip
          content={
            <div className='px-1 py-2'>
              <div>{t("ai.send_tooltip")}</div>
              <div>{t("ai.hold")}</div>
            </div>
          }
        >
          <Button
            size='lg'
            type='button'
            aria-label='send'
            onMouseDown={startPress}
            onMouseUp={endPress}
            onTouchStart={startPress}
            onTouchEnd={endPress}
            disabled={loading}
            className='justify-center text-primary items-center flex flex-col m-3 lg:w-2/12 sm:w-4/12 max-h-full'
          >
            {hold && (
              <BiMicrophone
                className='text-red-500 animate-ping'
                size={"2em"}
              />
            )}
            {!hold && <BiMessageRoundedDetail size={"2em"} />}
          </Button>
        </Tooltip>
      </div>

      {audioSrc && (
        <div className='mt-4'>
          <h3 className='text-xl font-bold'>{t("ai.audio_player")}</h3>
          <audio controls autoPlay src={audioSrc} className='w-full' />
        </div>
      )}
    </div>
  );
};

export default ConversationTab;
