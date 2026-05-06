"use client";

import { useCallback, useRef, useState } from "react";

export interface RecorderState {
  recording:     boolean;
  audioBlob:     Blob | null;
  audioUrl:      string | null;
  startRecording: () => Promise<void>;
  stopRecording:  () => void;
  reset:          () => void;
}

/**
 * MediaRecorder wrapper.
 * Captures microphone audio as audio/webm.
 * Returns a blob + object URL once recording stops.
 */
export function useRecorder(): RecorderState {
  const [recording, setRecording]  = useState(false);
  const [audioBlob, setAudioBlob]  = useState<Blob | null>(null);
  const [audioUrl,  setAudioUrl]   = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef        = useRef<BlobPart[]>([]);
  const streamRef        = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    // Clean up any previous recording URL
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    chunksRef.current = [];

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const url  = URL.createObjectURL(blob);
      setAudioBlob(blob);
      setAudioUrl(url);
      stream.getTracks().forEach((t) => t.stop());
    };

    mediaRecorder.start();
    setRecording(true);
  }, [audioUrl]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }, [recording]);

  const reset = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecording(false);
  }, [audioUrl]);

  return { recording, audioBlob, audioUrl, startRecording, stopRecording, reset };
}
