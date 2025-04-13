/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Mic } from 'lucide-react'; // Use the Mic icon

type SpeechRecognition = typeof window.SpeechRecognition;

interface SpeechRecognizerProps {
  setInput: (input: string) => void;
}

const SpeechRecognizer: React.FC<SpeechRecognizerProps> = ({ setInput }) => {
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'hi-IN'; // Set the language for Hindi
      setRecognition(recognitionInstance);

      recognitionInstance.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      return () => {
        recognitionInstance.stop();
      };
    } else {
      console.error('SpeechRecognition not supported in this browser.');
    }
  }, [setInput]);

  const startListening = () => {
    if (recognition) {
      recognition.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
  };

  return (
    <div>
      <button
        onClick={isListening ? stopListening : startListening}
        className={`flex items-center px-4 py-2 ${isListening ? 'bg-red-500' : 'bg-green-500'} text-white rounded-lg hover:bg-${isListening ? 'red' : 'green'}-600 transition-colors`}
      >
        <Mic />
      </button>
    </div>
  );
};

export default SpeechRecognizer;
