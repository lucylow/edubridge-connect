import { useState, useCallback } from "react";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tutor-chat`;

export function useAITutorChat(subject?: string, gradeLevel?: number) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const send = useCallback(
    async (input: string) => {
      const userMsg: Msg = { role: "user", content: input };
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setIsLoading(true);

      try {
        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: updatedMessages, subject, gradeLevel }),
        });

        if (resp.status === 429) {
          toast.error("AI rate limit reached. Please wait a moment.");
          setIsLoading(false);
          return;
        }
        if (resp.status === 402) {
          toast.error("AI credits exhausted. Please add funds.");
          setIsLoading(false);
          return;
        }
        if (!resp.ok || !resp.body) throw new Error("Failed to start AI stream");

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";
        let assistantSoFar = "";
        let streamDone = false;

        while (!streamDone) {
          const { done, value } = await reader.read();
          if (done) break;
          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") { streamDone = true; break; }
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (content) {
                assistantSoFar += content;
                const snapshot = assistantSoFar;
                setMessages((prev) => {
                  const last = prev[prev.length - 1];
                  if (last?.role === "assistant") {
                    return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: snapshot } : m);
                  }
                  return [...prev, { role: "assistant", content: snapshot }];
                });
              }
            } catch {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }
      } catch (e) {
        console.error("AI chat error:", e);
        toast.error("Failed to get AI response");
      } finally {
        setIsLoading(false);
      }
    },
    [messages, subject, gradeLevel]
  );

  const clearChat = useCallback(() => setMessages([]), []);

  return { messages, isLoading, send, clearChat };
}
