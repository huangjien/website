import { useState, useRef } from "react";
import { error, warn } from "../components/Notification";
import { transcribeAudio } from "../lib/aiService";

/**
 * Custom hook for handling audio recording functionality
 */
export const useAudioRecording = () => {
  const mediaRecorder = useRef(null);
  const [stream, setStream] = useState(null);
  const [audioSrc, setAudioSrc] = useState("");
  const [audio, setAudio] = useState(true);
  const mimeType = "audio/mp3";

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
      warn("getUserMedia not supported on your browser!");
      return; // Exit early if getUserMedia is not supported
    }

    // Second getUserMedia call with proper error handling
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      await navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          setStream(stream);
          mediaRecorder.current = new MediaRecorder(stream, { type: mimeType });
          mediaRecorder.current.start();
          const localAudioChunks = [];
          mediaRecorder.current.ondataavailable = (event) => {
            if (typeof event.data == "undefined") return;
            if (event.data.size == 0) return;
            localAudioChunks.push(event.data);
          };
          setAudio(localAudioChunks);
        })
        .catch((err) => {
          error(`The following getUserMedia error occurred: ${err}`);
        });
    }
  };

  const stopRecording = async (onTranscriptionComplete) => {
    if (!mediaRecorder.current) {
      console.warn("MediaRecorder not initialized");
      return;
    }
    mediaRecorder.current.stop();
    mediaRecorder.current.onstop = async () => {
      const audioBlob = new Blob(audio, { type: mimeType });
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioSrc(audioUrl);
      setAudio([]);

      // clear the browser status, without this line, the browser tab will indicate that it is recording
      stream.getTracks().forEach((track) => track.stop());

      try {
        const transcribedText = await transcribeAudio(audioBlob);
        if (onTranscriptionComplete) {
          onTranscriptionComplete(transcribedText);
        }
      } catch (err) {
        error(err.message);
      }
    };
  };

  return {
    startRecording,
    stopRecording,
    audioSrc,
    isRecording: !!mediaRecorder.current,
  };
};
