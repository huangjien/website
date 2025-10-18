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
  const [audio, setAudio] = useState([]);
  const mimeTypeRef = useRef("");

  const pickSupportedMimeType = () => {
    const candidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/ogg",
    ];
    if (typeof MediaRecorder?.isTypeSupported === "function") {
      for (const t of candidates) {
        try {
          if (MediaRecorder.isTypeSupported(t)) return t;
        } catch {}
      }
    }
    return ""; // Let the browser choose default
  };

  const startRecording = async () => {
    if (!navigator?.mediaDevices?.getUserMedia) {
      warn("getUserMedia not supported on your browser!");
      return;
    }

    // First call remains to preserve existing behavior
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((s) => {
        setStream(s);
      })
      .catch((err) => {
        error(`The following getUserMedia error occurred: ${err}`);
      });

    // Second call initializes the recorder
    try {
      const s2 = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(s2);

      // Choose a supported mimeType if available
      mimeTypeRef.current = pickSupportedMimeType();

      try {
        mediaRecorder.current = mimeTypeRef.current
          ? new MediaRecorder(s2, { mimeType: mimeTypeRef.current })
          : new MediaRecorder(s2);
      } catch (err) {
        error(err?.message || "MediaRecorder initialization failed");
        return;
      }

      mediaRecorder.current.start();
      const localAudioChunks = [];
      mediaRecorder.current.ondataavailable = (event) => {
        if (typeof event.data === "undefined") return;
        if (event.data.size === 0) return;
        localAudioChunks.push(event.data);
      };
      // Store reference to chunks for use on stop
      setAudio(localAudioChunks);
    } catch (err) {
      error(`The following getUserMedia error occurred: ${err}`);
    }
  };

  const stopRecording = async (onTranscriptionComplete) => {
    if (!mediaRecorder.current) {
      console.warn("MediaRecorder not initialized");
      return;
    }
    mediaRecorder.current.stop();
    mediaRecorder.current.onstop = async () => {
      const mime = mimeTypeRef.current || "audio/webm";
      const audioBlob = new Blob(audio, { type: mime });
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
