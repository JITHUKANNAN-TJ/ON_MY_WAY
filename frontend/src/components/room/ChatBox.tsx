import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/types";
import { Button } from "@/components/ui/Button";

interface ChatBoxProps {
  messages: ChatMessage[];
  myId: string | null;
  onSend: (text: string) => void;
}

export function ChatBox({ messages, myId, onSend }: ChatBoxProps) {
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInput("");
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full">
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto space-y-2 px-1 scrollbar-thin"
      >
        {messages.length === 0 && (
          <p className="text-xs text-text-secondary text-center py-8">
            No messages yet. Say hello!
          </p>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.member_id === myId;
          return (
            <div
              key={i}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${
                  isMe
                    ? "bg-primary text-white rounded-br-md"
                    : "bg-white/[0.06] text-text rounded-bl-md"
                }`}
              >
                {!isMe && (
                  <p className="text-[11px] font-medium text-primary mb-0.5">
                    {msg.display_name}
                  </p>
                )}
                <p className="text-sm leading-snug break-words">{msg.text}</p>
                <p
                  className={`text-[10px] mt-0.5 ${
                    isMe ? "text-white/60" : "text-text-secondary"
                  }`}
                >
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSend} className="flex gap-2 pt-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          maxLength={500}
          className="input-field flex-1 text-sm"
        />
        <Button
          type="submit"
          size="sm"
          disabled={!input.trim()}
          className="shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </Button>
      </form>
    </div>
  );
}
