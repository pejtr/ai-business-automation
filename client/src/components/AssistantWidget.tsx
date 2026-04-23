import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Send, X, Minimize2, Sparkles, RotateCcw } from "lucide-react";
import { Streamdown } from "streamdown";
import { cn } from "@/lib/utils";

const AVATAR_URL = "/manus-storage/assistant-avatar_4d9e8bf4.jpg";

type Message = { role: "user" | "assistant"; content: string };

const QUICK_PROMPTS = [
  "How do I generate leads?",
  "How does email tracking work?",
  "What is the Deliver module?",
  "How do I export my data?",
];

const PAGE_LABELS: Record<string, string> = {
  "/": "Dashboard",
  "/attract": "Attract — Lead Generation",
  "/convert": "Convert — Outreach Emails",
  "/deliver": "Deliver — Brand Research",
  "/automate": "Automate — Workflows",
  "/human-element": "Human Element",
  "/saved": "Saved Projects",
};

export default function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [location] = useLocation();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [hasGreeted, setHasGreeted] = useState(false);

  const chat = trpc.assistant.chat.useMutation({
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    },
    onError: () => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I ran into an issue. Please try again.",
      }]);
    },
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chat.isPending]);

  // Greeting when first opened
  useEffect(() => {
    if (open && !hasGreeted) {
      setHasGreeted(true);
      const pageName = PAGE_LABELS[location] ?? "the platform";
      setMessages([{
        role: "assistant",
        content: `Hi! I'm **Aria**, your Agency AI assistant. 👋\n\nI see you're on **${pageName}**. How can I help you today?`,
      }]);
    }
  }, [open, hasGreeted, location]);

  const sendMessage = (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || chat.isPending) return;
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: msg }];
    setMessages(newMessages);
    chat.mutate({
      message: msg,
      history: newMessages.slice(-12).map(m => ({ role: m.role, content: m.content })),
      currentPage: PAGE_LABELS[location] ?? location,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const reset = () => {
    setMessages([]);
    setHasGreeted(false);
    setInput("");
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 group"
          aria-label="Open AI Assistant"
        >
          {/* Glow ring */}
          <div
            className="absolute inset-0 rounded-full blur-lg transition-all duration-300 group-hover:blur-xl"
            style={{ background: "oklch(0.78 0.22 195 / 0.4)", transform: "scale(1.2)" }}
          />
          {/* Avatar circle */}
          <div
            className="relative w-14 h-14 rounded-full overflow-hidden transition-transform duration-200 group-hover:scale-105"
            style={{ border: "2px solid oklch(0.78 0.22 195 / 0.7)", boxShadow: "0 0 20px oklch(0.78 0.22 195 / 0.5), 0 4px 20px oklch(0 0 0 / 0.4)" }}
          >
            <img
              src={AVATAR_URL}
              alt="Aria — AI Assistant"
              className="w-full h-full object-cover object-top"
            />
          </div>
          {/* Pulse dot */}
          <span
            className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background"
            style={{ background: "oklch(0.78 0.22 145)", boxShadow: "0 0 8px oklch(0.78 0.22 145)" }}
          />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl overflow-hidden transition-all duration-300",
            minimized ? "w-72 h-14" : "w-[360px] h-[520px]"
          )}
          style={{
            background: "oklch(0.085 0.014 260)",
            border: "1px solid oklch(0.78 0.22 195 / 0.3)",
            boxShadow: "0 0 40px oklch(0.78 0.22 195 / 0.15), 0 20px 60px oklch(0 0 0 / 0.5)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
            style={{ background: "oklch(0.10 0.016 260)", borderBottom: "1px solid oklch(0.78 0.22 195 / 0.2)" }}
          >
            {/* Avatar */}
            <div
              className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0"
              style={{ border: "1.5px solid oklch(0.78 0.22 195 / 0.5)", boxShadow: "0 0 12px oklch(0.78 0.22 195 / 0.3)" }}
            >
              <img src={AVATAR_URL} alt="Aria" className="w-full h-full object-cover object-top" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-foreground tracking-tight">Aria</p>
                <Sparkles className="w-3 h-3" style={{ color: "oklch(0.78 0.22 195)", filter: "drop-shadow(0 0 4px oklch(0.78 0.22 195))" }} />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "oklch(0.78 0.22 145)", boxShadow: "0 0 6px oklch(0.78 0.22 145)" }} />
                <p className="text-[10px] font-mono" style={{ color: "oklch(0.50 0.02 260)" }}>Agency AI Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={reset}
                className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
                style={{ color: "oklch(0.40 0.02 260)" }}
                title="Clear chat"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setMinimized(!minimized)}
                className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
                style={{ color: "oklch(0.40 0.02 260)" }}
                title={minimized ? "Expand" : "Minimize"}
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { setOpen(false); setMinimized(false); }}
                className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
                style={{ color: "oklch(0.40 0.02 260)" }}
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Body — hidden when minimized */}
          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center py-6">
                    <div
                      className="w-14 h-14 rounded-full overflow-hidden mx-auto mb-3"
                      style={{ border: "2px solid oklch(0.78 0.22 195 / 0.4)", boxShadow: "0 0 20px oklch(0.78 0.22 195 / 0.2)" }}
                    >
                      <img src={AVATAR_URL} alt="Aria" className="w-full h-full object-cover object-top" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">Ask Aria anything</p>
                    <p className="text-xs text-muted-foreground mt-1">Your Agency AI guide</p>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div key={i} className={cn("flex gap-2.5", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                    {msg.role === "assistant" && (
                      <div
                        className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mt-0.5"
                        style={{ border: "1px solid oklch(0.78 0.22 195 / 0.4)" }}
                      >
                        <img src={AVATAR_URL} alt="Aria" className="w-full h-full object-cover object-top" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                        msg.role === "user"
                          ? "rounded-tr-sm"
                          : "rounded-tl-sm"
                      )}
                      style={msg.role === "user" ? {
                        background: "linear-gradient(135deg, oklch(0.78 0.22 195 / 0.25), oklch(0.68 0.26 295 / 0.2))",
                        border: "1px solid oklch(0.78 0.22 195 / 0.3)",
                        color: "oklch(0.92 0.01 260)",
                      } : {
                        background: "oklch(0.12 0.018 260)",
                        border: "1px solid oklch(0.20 0.022 260)",
                        color: "oklch(0.85 0.01 260)",
                      }}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-invert prose-sm max-w-none [&>p]:mb-1.5 [&>p:last-child]:mb-0 [&>ul]:mt-1 [&>ul]:mb-1">
                          <Streamdown>{msg.content}</Streamdown>
                        </div>
                      ) : (
                        <p>{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {chat.isPending && (
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0" style={{ border: "1px solid oklch(0.78 0.22 195 / 0.4)" }}>
                      <img src={AVATAR_URL} alt="Aria" className="w-full h-full object-cover object-top" />
                    </div>
                    <div
                      className="rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5"
                      style={{ background: "oklch(0.12 0.018 260)", border: "1px solid oklch(0.20 0.022 260)" }}
                    >
                      {[0, 1, 2].map(i => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full animate-bounce"
                          style={{ background: "oklch(0.78 0.22 195 / 0.7)", animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* Quick prompts — show only when no messages or just greeting */}
              {messages.length <= 1 && !chat.isPending && (
                <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => sendMessage(p)}
                      className="text-[11px] px-2.5 py-1 rounded-full transition-all duration-150"
                      style={{ background: "oklch(0.78 0.22 195 / 0.08)", border: "1px solid oklch(0.78 0.22 195 / 0.2)", color: "oklch(0.78 0.22 195 / 0.8)" }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.78 0.22 195 / 0.15)";
                        (e.currentTarget as HTMLButtonElement).style.color = "oklch(0.78 0.22 195)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.78 0.22 195 / 0.08)";
                        (e.currentTarget as HTMLButtonElement).style.color = "oklch(0.78 0.22 195 / 0.8)";
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div
                className="px-3 pb-3 pt-2 flex-shrink-0"
                style={{ borderTop: "1px solid oklch(0.18 0.02 260)" }}
              >
                <div
                  className="flex items-end gap-2 rounded-xl px-3 py-2"
                  style={{ background: "oklch(0.11 0.016 260)", border: "1px solid oklch(0.22 0.022 260)" }}
                >
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Aria anything..."
                    rows={1}
                    className="flex-1 bg-transparent resize-none text-sm text-foreground placeholder:text-muted-foreground/40 outline-none leading-relaxed max-h-24 overflow-y-auto"
                    style={{ minHeight: "24px" }}
                    onInput={e => {
                      const el = e.currentTarget;
                      el.style.height = "auto";
                      el.style.height = Math.min(el.scrollHeight, 96) + "px";
                    }}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || chat.isPending}
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-150 disabled:opacity-30"
                    style={{ background: "linear-gradient(135deg, oklch(0.78 0.22 195), oklch(0.68 0.26 295))", boxShadow: input.trim() ? "0 0 12px oklch(0.78 0.22 195 / 0.4)" : "none" }}
                  >
                    <Send className="w-3.5 h-3.5" style={{ color: "oklch(0.07 0.012 260)" }} />
                  </button>
                </div>
                <p className="text-center text-[9px] font-mono mt-1.5" style={{ color: "oklch(0.30 0.02 260)" }}>
                  ARIA · AGENCY AI ASSISTANT
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
