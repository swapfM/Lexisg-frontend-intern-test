"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "./components/ui/button";
import { Textarea } from "./components/ui/textarea";
import { Card } from "./components/ui/card";
import { Send } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: {
    source: string;
    text: string;
    url: string;
  }[];
}

export default function LexiLegalChat() {
  const BASE_URL = "http://localhost:8000";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm Lexi, your legal assistant. I can help you with legal questions, document analysis, and provide guidance on various legal matters. How can I assist you today?",
      citations: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: userMessage.content }),
      });

      const data = await res.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer,
        citations: data.citations.map((c: any) => ({
          text: c.text,
          source: c.source,
          url: `${BASE_URL}/files/${encodeURIComponent(c.source)}${
            c.page ? `#page=${c.page}` : ""
          }`,
        })),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    } catch (err) {
      console.error("Error:", err);
     
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content:
              "There was a problem connecting to the backend. Please try again later.",
          },
        ]);
        setIsLoading(false); 
      }, 2000);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-800 text-center">
            Lexi Legal Assistant
          </h1>
        </div>
      </header>

      <main className="flex-1 pt-20 pb-32 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] ${
                    message.role === "user" ? "order-2" : "order-1"
                  }`}
                >
                  <Card
                    className={`p-4 ${
                      message.role === "user"
                        ? "bg-blue-100 border-blue-200"
                        : "bg-gray-100 border-gray-200"
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                      {message.content}
                    </div>

                    {message.role === "assistant" &&
                      message.citations &&
                      message.citations.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-300">
                          <div className="text-xs text-gray-600 mb-2 font-medium">
                            Sources:
                          </div>
                          <div className="space-y-1">
                            {message.citations.map((citation, index) => (
                              <div
                                key={index}
                                className="text-xs bg-gray-50 p-2 rounded border-l-2 border-blue-400"
                              >
                                <div className="text-gray-700 mb-1">
                                  {citation.text}
                                </div>
                                <div className="text-gray-500 italic">
                                  Source:{" "}
                                  <a
                                    href={citation.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline hover:text-blue-800"
                                  >
                                    {citation.source}
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </Card>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%]">
                  <Card className="p-4 bg-gray-100 border-gray-200">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        Lexi is thinking...
                      </span>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-4xl mx-auto p-4">
          <Card className="p-4 shadow-md">
            <div className="space-y-3">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your legal question here..."
                className="min-h-[60px] max-h-[120px] resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                disabled={isLoading}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                  onClick={handleSubmit}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Ask
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
