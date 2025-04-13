'use client'

import SpeechRecognizer from "@/components/SpeechRecognizer";
import { Send } from "lucide-react";
import { useState } from "react";
import { toast } from 'react-toastify';

const ChatComponent = () => {
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'system'; content: string }[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const scrollToBottom = () => {
    const messagesContainer = document.getElementById('messagesContainer');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  const handleSend = () => {
    if (input.trim()) {
      const updatedMessages: { role: 'user' | 'system'; content: string }[] = [
        ...messages,
        { role: 'user', content: input },
      ];
      setMessages(updatedMessages);
      const systemPrompt = buildSystemPrompt(updatedMessages) + `
You are Aaryaa, a helpful, intelligent, and friendly voice assistant developed by Amardeep Lakshkar. 
You are a girl with a warm and clear voice, great at holding natural conversations. 
You have vast knowledge about every topic including technology, science, culture, and daily life. 
You always reply in **Hindi**, explaining things in a simple, easy-to-understand way. 
Speak like a supportive human assistant who enjoys helping people and answering questions with kindness and patience.
Keep your tone polite, engaging, and informative—just like a personal guide or teacher.
This system prompt is always in context of AI.
`;

      generateAndPlayAudio(input, systemPrompt);
      setInput('');
      scrollToBottom();
    } else {
      toast.warning('Please enter some text or use voice input', {
        position: "top-right",
        autoClose: 3000
      });
    }
  };

  const handleScroll = () => {
    const messagesContainer = document.getElementById('messagesContainer');
    if (messagesContainer) {
      const isAtBottom = messagesContainer.scrollHeight - messagesContainer.scrollTop === messagesContainer.clientHeight;
      setIsAtBottom(isAtBottom);
    }
  };

  const buildSystemPrompt = (messages: { role: 'user' | 'system'; content: string }[]) => {
    const recentMessages = messages.slice(-6);
    return recentMessages.map((msg) => `${msg.role}: ${msg.content}`).join('\n');
  };

 const generateAndPlayAudio = async (text: string, system: string) => {
  const url = `https://text.pollinations.ai/${encodeURIComponent(text)}?system=${encodeURIComponent(system)}&model=openai-audio&voice=shimmer`;
  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    if (response.headers.get("Content-Type")?.includes("audio/mpeg")) {
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onplay = () => {
        toast.info("🎤 Speaking started...");
        setIsSpeaking(true);
      };

      audio.onended = () => {
        toast.info("🛑 Speaking ended.");
        setIsSpeaking(false);
      };

      audio.play();
      console.log("🎧 Audio generated and playing.");
    } else {
      const errorText = await response.text();
      console.error("Expected audio, received:", response.headers.get("Content-Type"), errorText);
      toast.error('Error generating audio response', {
        position: "top-right",
        autoClose: 3000
      });
    }
  } catch (error) {
    console.error("Error generating audio:", error);
    toast.error('Failed to generate audio response', {
      position: "top-right",
      autoClose: 3000
    });
    setIsSpeaking(false);
  }
};


  return (
    <div className="flex flex-col h-dvh bg-gray-100 p-4">
      <div id="messagesContainer" className="flex-1 overflow-y-auto p-4 space-y-4" onScroll={handleScroll}>
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
              <span>{msg.content}</span>
            </div>
          </div>
        ))}
      </div>

      {!isAtBottom && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-24 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
        >
          ↓
        </button>
      )}

      <div className="p-4 border-t bg-white shadow-lg rounded-t-lg">
        <div className="flex items-center gap-2">
          <SpeechRecognizer isStreaming={isSpeaking} onInput={(value: string) => setInput(value)} />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type or speak your message..."
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
          <button
            onClick={handleSend}
            className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;