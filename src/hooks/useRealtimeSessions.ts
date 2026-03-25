import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@/services/api";

/**
 * Subscribe to realtime changes on the sessions table for a given user.
 * Calls `onUpdate` whenever a session row is inserted, updated, or deleted.
 */
export function useRealtimeSessions(
  userId: string | undefined,
  onUpdate: () => void
) {
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("dashboard-sessions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sessions" },
        (payload) => {
          const row = (payload.new || payload.old) as Record<string, unknown>;
          // Only refresh if this user is involved
          if (row?.tutor_id === userId || row?.learner_id === userId) {
            onUpdate();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, onUpdate]);
}
