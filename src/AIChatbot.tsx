import { useState } from "react";
import { Send, Bot, X, MessageCircle, ShoppingCart, PackageSearch, Truck, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const quickPrompts = [
  { label: "Find products", text: "Help me find the best products for my budget." , icon: PackageSearch},
  { label: "My cart", text: "Can you review my cart and suggest useful complementary products?", icon: ShoppingCart},
  { label: "Track order", text: "I want to track my order.", icon: Truck},
  { label: "Refund help", text: "I need help with a refund.", icon: RotateCcw},
];

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const { items: cartItems, subtotal } = useCart();

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Assalamu Alaikum! 👋 I'm Miskat International's AI Shopping Copilot. I can help you find products, compare options, review your cart, suggest bundles, help with bulk orders, track eligible orders, and guide you through refund requests.",
    },
  ]);

  const sendMessage = async (messageText?: string) => {
    const text = (messageText ?? input).trim();

    if (!text || loading) return;

    const userMessage: Message = {
      role: "user",
      content: text,
    };

    const history = messages.slice(-10);
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          message: text,
          history,
          cart: {
            items: cartItems.map((item) => ({
              id: item.id,
              name_bn: item.name_bn,
              name_en: item.name_en,
              price: item.price,
              quantity: item.quantity,
              stock: item.stock,
              unit: item.unit,
            })),
            subtotal,
            total_items: cartItems.reduce((sum, item) => sum + item.quantity, 0),
          },
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content:
            data?.reply ||
            "Sorry, I couldn't generate a response right now.",
        },
      ]);
    } catch (error) {
      console.error("AI Chat Error:", error);

      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content:
            "Sorry! Something went wrong while connecting to the shopping assistant. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition hover:scale-105"
          aria-label="Open AI Shopping Copilot"
        >
          <MessageCircle size={26} />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[680px] w-[420px] max-w-[calc(100vw-1rem)] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl">
          <div className="flex items-center justify-between bg-primary px-4 py-4 text-primary-foreground">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <Bot size={22} />
              </div>

              <div>
                <h3 className="font-semibold">Miskat AI Assistant</h3>
                <p className="text-xs opacity-80">Shopping Copilot</p>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-2 hover:bg-white/20"
              aria-label="Close AI Assistant"
            >
              <X size={20} />
            </button>
          </div>

          <div className="border-b bg-background px-3 py-2">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {quickPrompts.map(({ label, text, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  disabled={loading}
                  onClick={() => sendMessage(text)}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs hover:bg-muted disabled:opacity-50"
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-5 ${
                    message.role === "user"
                      ? "rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md bg-muted"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-3 text-sm">
                  AI is thinking...
                </div>
              </div>
            )}
          </div>

          <div className="border-t p-3">
            {cartItems.length > 0 && (
              <p className="mb-2 text-xs text-muted-foreground">
                Cart: {cartItems.length} product type(s) · ৳{subtotal.toLocaleString("en-BD")}
              </p>
            )}

            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about products, cart, orders..."
                disabled={loading}
                className="flex-1 rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              />

              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-50"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}