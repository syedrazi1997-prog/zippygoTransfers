import { useState } from "react";
import { MessageSquare, X, Send, Zap } from "lucide-react";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Booking is easy! Select the 'Airport Transfers' tab, enter your pickup airport and destination hotel, choose a date and time, then pick a vehicle. You'll pay securely and receive an instant confirmation.",
    },
    {
      sender: "bot",
      text: "I'd be happy to help with that! For specific account or booking questions, please use the 'Manage My Booking' feature or call our 24/7 support at +91 9177902449.",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Thank you for getting in touch! For immediate assistance with bookings or driver updates, please call our 24/7 hotline at +91 9177902449.",
        },
      ]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-3 rounded-full shadow-xl transition-all"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-sm font-medium">help line</span>
        </button>
      ) : (
        <div className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[450px]">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" fill="white" />
              </div>
              <div>
                <h4 className="text-sm font-bold">ZippyGo Support</h4>
                <span className="text-[11px] text-sky-100 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Online now
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.sender === "user"
                      ? "bg-sky-500 text-white rounded-br-none"
                      : "bg-white text-slate-700 border border-slate-200 shadow-sm rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-sky-500"
            />
            <button
              onClick={handleSend}
              className="p-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="text-[10px] text-center text-slate-400 py-1 bg-slate-100 border-t border-slate-200">
            Powered by ZippyGo 24/7 Support
          </div>
        </div>
      )}
    </div>
  );
}
