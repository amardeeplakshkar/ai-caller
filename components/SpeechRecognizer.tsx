/* eslint-disable @typescript-eslint/no-explicit-any */
import { Mic, Send, XIcon } from 'lucide-react';
import React, { useRef, useState } from 'react'
import { toast } from 'react-toastify';
interface SpeechRecognizerProps {
  onInput: (value: string) => void;
}

const SpeechRecognizer: React.FC<SpeechRecognizerProps> = ({ onInput }) => {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const lastFinalTranscriptRef = useRef<string>("");

  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {

        const results = event.results;
        const lastResultIndex = results.length - 1;
        const lastResult = results[lastResultIndex];


        if (lastResult.isFinal) {
          const finalTranscript = lastResult[0].transcript.trim();


          if (finalTranscript !== lastFinalTranscriptRef.current) {
            lastFinalTranscriptRef.current = finalTranscript;
            setTranscript(finalTranscript);
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error(`Speech recognition error: ${event.error} `);
      };


      lastFinalTranscriptRef.current = "";
      recognitionRef.current.start();
      setIsListening(true);
    } else {
      toast.error('Speech recognition not supported in this browser');
    }
  };

  const stopListening = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);

      if (transcript.trim()) {
        try {
          const combinedText = `${transcript}`;
          onInput(combinedText.trim());
        } catch (error) {
          toast.error(`${error} : Failed to check the limit. Please try again.`);
        }
      }
    }
  };

  const clearTranscript = () => {
    setTranscript("");
    lastFinalTranscriptRef.current = "";
  };

  return (
    <div className="flex flex-row gap-5 my-3">
      {/* Speech Recognition Section */}
      <div className="flex-1 p-5 flex flex-col">
        <div className="flex-1 flex justify-center items-center overflow-y-auto break-words mb-3">
          {transcript ? transcript : "Transcription will appear here..."}
        </div>
        <div className="flex justify-center items-center space-x-3">
          {!isListening ? (
            <button
              onClick={startListening}
              className="rounded-full bg-green-500  text-white p-2 shadow-md hover:bg-green-600 transition"
            >
              <Mic />
            </button>
          ) : (
              <button
                onClick={stopListening}
                className="rounded-full bg-blue-500 text-white p-2 shadow-md hover:bg-blue-600 transition"
              >
                <Send />
              </button>
          )}
            <button
              onClick={clearTranscript}
              className="rounded-full bg-red-500 text-white p-2 shadow-md hover:bg-red-600 transition"
            >
              <XIcon />
            </button>
        </div>
      </div>
    </div>
  )
}

export default SpeechRecognizer
