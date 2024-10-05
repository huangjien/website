import {
  Tab,
  Tabs,
  Card,
  CardBody,
  Button,
  Textarea,
  Tooltip,
  RadioGroup,
  Radio,
  Input,
  Progress,
} from '@nextui-org/react';
import { useState, useRef } from 'react';
import {
  BiMessageRoundedDetail,
  BiMicrophone,
  BiSolidThermometer,
  BiTimer,
} from 'react-icons/bi';
import { error, success, warn } from '../components/Notification';
import { useGithubContent } from '../lib/useGithubContent';
import { useSettings } from '../lib/useSettings';
import { useLocalStorageState } from 'ahooks';
import { useTranslation } from 'react-i18next';

const getAnswer = async (
  question,
  lastAnswer,
  model = 'gpt-4o-mini',
  temperature = 0.5
) => {
  var questionArray = [{ role: 'user', content: question }];
  // if lastAnser too long or too long ago, then we don't add it.
  if (lastAnswer && lastAnswer.length < 1024) {
    questionArray.unshift({ role: 'assistant', content: lastAnswer });
  }
  const requestBody = {
    model: model,
    messages: questionArray,
    temperature: temperature,
  };

  return await fetch('/api/ai', {
    method: 'POST',
    body: JSON.stringify(requestBody),
  })
    .then((res) => res.json())
    .then((data) => {
      return data;
    });
  // .catch(err => {
  // console.log(err)
  // err.message += '\n' + requestBody
  //   throw err;
  // })
  // .catch(err => {
  //   console.log(err)
  //   error("Error Code: " + err.code + "  \n  " + err.message)
  // });
};

export const QuestionTabs = ({ append }) => {
  // append is the method add Q and A to parent content list
  const [hold, setHold] = useState(false);
  const [longPressDetected, setLongPressDetected] = useState(false);
  let pressTimer = null;
  const mediaRecorder = useRef(null);
  const [questionText, setQuestionText] = useState('');
  const [lastAnswer, setLastAnswer] = useLocalStorageState('LastAnswer', {
    defaultValue: '',
  });
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [audioSrc, setAudioSrc] = useState('');
  const [audio, setAudio] = useState(true);
  const mimeType = 'audio/mp3';
  const [trackSpeed, setTrackSpeed] = useState(300);
  const [model, setModel] = useState('gpt-4o-mini');
  const [temperature, setTemperature] = useState(0.5);

  const [stream, setStream] = useState(null);

  const startRecording = async () => {
    if (navigator?.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
        })
        .then((stream) => {
          setStream(stream);
        })
        .catch((err) => {
          error(`The following getUserMedia error occurred: ${err}`);
        });
    } else {
      warn('getUserMedia not supported on your browser!');
    }
    await navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        setStream(stream);
        mediaRecorder.current = new MediaRecorder(stream, { type: mimeType });
        mediaRecorder.current.start();
        const localAudioChunks = [];
        mediaRecorder.current.ondataavailable = (event) => {
          if (typeof event.data == 'undefined') return;
          if (event.data.size == 0) return;
          localAudioChunks.push(event.data);
        };
        setAudio(localAudioChunks);
      });
  };
  const stopRecording = async () => {
    mediaRecorder.current.stop();
    mediaRecorder.current.onstop = () => {
      const audioBlob = new Blob(audio, { type: mimeType });

      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioSrc(audioUrl);

      setAudio([]);
      // clear the browser status, without this line, the browser tab wil indicate that it is recording
      stream.getTracks().forEach((track) => track.stop());

      const file = new File([audioBlob], 'audio.mp3', { type: mimeType });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('model', 'whisper-1');

      fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })
        .then((res) => res.json())
        .then((response) => {
          if (response?.error) {
            error(response.error.message);
          } else {
            // setQuestionText(response.text)
            setQuestionText(response.text);
            // console.log(response);
          }
        })
        .catch((err) => {
          error(err.code + '\n' + err.message);
        });
    };
  };

  const startPress = () => {
    setLongPressDetected(false);
    pressTimer = setTimeout(() => {
      console.log('Long Press Triggered');
      setHold(true);
      setLongPressDetected(true);
      startRecording();
    }, trackSpeed);
  };

  const endPress = () => {
    clearTimeout(pressTimer);
    if (longPressDetected) {
      console.log('Long Press Released');
      stopRecording();
    } else {
      console.log('Short Press Triggered', questionText);
      if (questionText === undefined || questionText?.length < 5) {
        warn('Please input a meaningful question');
      } else {
        request2AI();
      }
    }
    setHold(false);
    setLongPressDetected(false);
  };

  function request2AI() {
    setLoading(true);
    getAnswer(questionText, lastAnswer, model, parseFloat(temperature))
      .then((data) => {
        if (data.error) {
          error(
            t('ai.return_error') +
              ':\n' +
              data.error.code +
              '\n' +
              data.error.message
          );
          setLoading(false);
          throw new Error(t('ai.return_error') + ':\n' + data.error.message);
        }
        // add question and answer to content
        var newQandA = {
          question: questionText,
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
        setLastAnswer(newQandA.answer); // store last answer so that we can compare it later.  If the user answers the wrong way, it will be the last correct
        success(t('ai.return_length') + ': ' + data.usage.completion_tokens);
        return newQandA;
      })
      .then((qAndA) => {
        append(qAndA);
        setQuestionText('');
        setLoading(false);
      });
  }

  return (
    <Tabs
      radius="md w-auto m-2"
      size="lg"
      classNames={{
        tabList: ' justify-evenly w-full relative rounded m-0 ',
        cursor: 'w-full ',
        tab: 'w-fit  h-12',
      }}
    >
      <Tab
        title={
          <h2 className=" font-semibold" size={'2em'}>
            {t('ai.conversation')}
          </h2>
        }
      >
        <Card>
          <CardBody>
            {loading && (
              <Progress
                size="sm"
                isIndeterminate
                aria-label="Loading..."
                className="max-w-full"
              />
            )}
            <div className=" inline-flex justify-items-stretch items-stretch justify-between">
              <Textarea
                type="text"
                size="xl"
                aria-label="question text area"
                className=" inline-flex m-1 lg:w-10/12 sm:w-8/12 max-h-full"
                isDisabled={loading}
                value={questionText}
                placeholder={t('ai.input_placeholder')}
                onValueChange={(e) => setQuestionText(e)}
              />
              <Tooltip
                placement="bottom"
                color="primary"
                content={
                  <div className="px-1 py-2">
                    <div>{t('ai.send_tooltip')}</div>
                    <div>{t('ai.hold')}</div>
                  </div>
                }
              >
                <Button
                  size="lg"
                  type="button"
                  aria-label="send"
                  onPressStart={startPress}
                  onPressEnd={endPress}
                  isDisabled={loading}
                  className=" justify-center text-primary items-center flex flex-col m-3 lg:w-2/12 sm:w-4/12 max-h-full"
                >
                  {hold && (
                    <BiMicrophone
                      className=" text-red-500 animate-ping"
                      size={'2em'}
                    />
                  )}
                  {!hold && <BiMessageRoundedDetail size={'2em'} />}
                </Button>
              </Tooltip>
            </div>
          </CardBody>
        </Card>
      </Tab>
      <Tab
        title={
          <h2 className=" font-semibold" size={'2em'}>
            {t('ai.configuration')}
          </h2>
        }
      >
        <Card>
          <CardBody>
            <div className="  min-h-unit-20 lg:inline-flex  items-stretch justify-between sm:overflow-auto">
              <Card shadow="none">
                <CardBody>
                  <RadioGroup
                    label={
                      <h3 className=" text-xl font-bold">
                        {t('ai.select_model')}
                      </h3>
                    }
                    value={model}
                    onValueChange={setModel}
                    orientation="horizontal"
                    defaultValue="gpt-4o-mini"
                  >
                    <Radio value="gpt-4o-mini">GPT-4o-Mini</Radio>
                    <Radio value="gpt-4o">GPT-4o</Radio>
                    <Radio value="gpt-4-turbo">GPT-4-Turbo</Radio>
                  </RadioGroup>
                </CardBody>
              </Card>

              <Card shadow="none">
                <CardBody>
                  <Input
                    size="lg"
                    defaultValue={0.5}
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    type="number"
                    label={
                      <h3 className=" text-xl font-bold">
                        {t('ai.temperature')}
                      </h3>
                    }
                    placeholder={t('ai.value_range_0_1')}
                    labelPlacement="outside"
                    startContent={
                      <BiSolidThermometer className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                    }
                  />
                </CardBody>
              </Card>
              <Card shadow="none">
                <CardBody>
                  <Input
                    size="lg"
                    defaultValue={trackSpeed}
                    value={trackSpeed}
                    onChange={(e) => {
                      setTrackSpeed(e.target.value);
                    }}
                    type="number"
                    label={
                      <h3 className=" text-xl font-bold">
                        {t('ai.track_speed')}
                      </h3>
                    }
                    placeholder={t('ai.value_range_50_500')}
                    labelPlacement="outside"
                    startContent={
                      <BiTimer className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                    }
                  />
                </CardBody>
              </Card>
              <Card shadow="none">
                <CardBody>
                  <h3 className=" text-xl font-bold">{t('ai.audio_player')}</h3>
                  <audio
                    disabled={!audioSrc}
                    controls
                    autoPlay
                    src={audioSrc}
                  />
                </CardBody>
              </Card>
            </div>
          </CardBody>
        </Card>
      </Tab>
    </Tabs>
  );
};
