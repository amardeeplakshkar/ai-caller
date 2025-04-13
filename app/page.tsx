'use client'

import SpeechRecognizer from "@/components/SpeechRecognizer";
import { Send } from "lucide-react";
import { useState } from "react";

const ChatComponent = () => {
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'system'; content: string }[]>([]);

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
      scrollToBottom();  // Auto scroll to the bottom when a new message is added
    }
  };

  const handleScroll = () => {
    const messagesContainer = document.getElementById('messagesContainer');
    if (messagesContainer) {
      const isAtBottom = messagesContainer.scrollHeight - messagesContainer.scrollTop === messagesContainer.clientHeight;
      setIsAtBottom(isAtBottom);
    }
  };

  // Build system prompt using recent conversation history
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
        
        audio.play();
        console.log("🎧 Audio generated and playing.");
      } else {
        const errorText = await response.text();
        console.error("Expected audio, received:", response.headers.get("Content-Type"), errorText);
      }
    } catch (error) {
      console.error("Error generating audio:", error);
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

      {/* Floating Button to Scroll to Bottom */}
      {!isAtBottom && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full"
        >
          Scroll to Bottom
        </button>
      )}

      <div className="p-4 border-t gap-2 flex justify-center items-center">
        <SpeechRecognizer setInput={setInput} />
        <input
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="w-full p-2 border text-black rounded-lg"
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Send/>
        </button>
      </div>
    </div>
  );
};

export default ChatComponent;
