import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Zap, Headphones } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
}

interface ChatWidgetProps {
  onManageBooking: () => void;
}

export function ChatWidget({ onManageBooking }: ChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "bot",
      text: "Hi there! Welcome to ZippyGo support. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const quickReplies = [
    "How do I book a transfer?",
    "What vehicles are available?",
    "Can I cancel my booking?",
    "Manage my booking",
  ];

  const botResponses: Record<string, string> = {
    "How do I book a transfer?":
      "Booking is easy! Select the 'Airport Transfers' tab, enter your pickup airport and destination hotel, choose a date and time, then pick a vehicle. You'll pay securely via Razorpay and receive an instant confirmation.",
    "What vehicles are available?":
      "We offer 6 vehicle classes: Economy Sedan (3 pax), Executive Sedan (3 pax), Luxury Mercedes S-Class (3 pax), Premium SUV (5 pax), Mercedes V-Class Van (7 pax), and Minibus Coach (16 pax). All come with professional drivers.",
    "Can I cancel my booking?":
      "Yes! All bookings come with free cancellation up to 24 hours before your pickup time. Just go to 'Manage My Booking', enter your reference number and email, and you can cancel from there.",
    "Manage my booking":
      "__MANAGE_BOOKING__",
  };

  const handleSend = (text?: string) => {
    const message = text || input.trim();
    if (!message) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), sender: "user", text: message };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const response = botResponses[message];
      if (response === "__MANAGE_BOOKING__") {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "bot",
            text: "I'll open the Manage My Booking page for you. You can look up your booking using your reference number and email.",
          },
        ]);
        setTyping(false);
        setTimeout(() => {
          onManageBooking();
          setOpen(false);
        }, 800);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: response || "I'd be happy to help with that! For specific account or booking questions, please use the 'Manage My Booking' feature or call our 24/7 support at +1 800 599 1234.",
        },
      ]);
      setTyping(false);
    }, 800);
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-xl shadow-sky-500/30 hover:scale-105 transition-transform group"
        >
          <MessageCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">Chat with us</span>
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-white" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] sm:w-96 h-[32rem] max-h-[80vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" fill="white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">ZippyGo Support</p>
                <p className="text-sky-100 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  Online now
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm ${
                    msg.sender === "user"
                      ? "bg-sky-500 text-white rounded-br-md"
                      : "bg-white text-slate-700 border border-slate-200 rounded-bl-md"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl bg-white border border-slate-200 rounded-bl-md">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {messages.length <= 2 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2 bg-slate-50">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  onClick={() => handleSend(reply)}
                  className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs text-slate-600 hover:border-sky-300 hover:text-sky-700 transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          <div className="p-3 border-t border-slate-200 bg-white">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none text-sm text-slate-900 placeholder-slate-400 focus:border-sky-400"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="w-10 h-10 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center flex items-center justify-center gap-1">
              <Headphones className="w-3 h-3" />
              Powered by ZippyGo 24/7 Support
            </p>
          </div>
        </div>
      )}
    </>
  );
}
