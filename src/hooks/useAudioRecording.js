import { useState, useRef } from "react";
import { error, warn } from "../components/Notification";

/**
 * Transcribe audio by sending it to the /api/transcribe endpoint.
 * @param {Blob} audioBlob - The recorded audio blob
 * @returns {Promise<string>} The transcribed text
 */
const transcribeAudio = async (audioBlob) => {
  const file = new File([audioBlob], "audio.mp3", { type: "audio/mp3" });
  const formData = new FormData();
  formData.append("file", file);
  formData.append("model", "whisper-1");

  return fetch("/api/transcribe", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((response) => {
      if (response?.error) {
        throw new Error(response.error.message);
      }
      return response.text;
    });
};

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
        } catch (err) {
          console.debug("isTypeSupported check failed for:", t, err);
        }
      }
    }
    return ""; // Let the browser choose default
  };

  const startRecording = async () => {
    if (!navigator?.mediaDevices?.getUserMedia) {
      warn("getUserMedia not supported on your browser!");
      return;
    }

    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(s);

      // Choose a supported mimeType if available
      mimeTypeRef.current = pickSupportedMimeType();

      try {
        mediaRecorder.current = mimeTypeRef.current
          ? new MediaRecorder(s, { mimeType: mimeTypeRef.current })
          : new MediaRecorder(s);
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
