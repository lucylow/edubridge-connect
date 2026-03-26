import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface ChatMessage {
  id: string;
  session_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender_name?: string;
}

export function useSessionChat(sessionId: string | undefined) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Load existing messages
  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);
    supabase
      .from("messages" as any)
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })
      .then(({ data }: any) => {
        setMessages(data || []);
        setLoading(false);
      });
  }, [sessionId]);

  // Subscribe to realtime messages
  useEffect(() => {
    if (!sessionId) return;
    const channel = supabase
      .channel(`chat-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload: any) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!sessionId || !user || !content.trim()) return;
      await (supabase.from("messages" as any) as any).insert({
        session_id: sessionId,
        sender_id: user.id,
        content: content.trim(),
      });
    },
    [sessionId, user]
  );

  return { messages, loading, sendMessage, userId: user?.id };
}
