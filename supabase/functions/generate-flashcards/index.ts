import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { topic, subject, numCards = 10, gradeLevel, difficulty = "medium" } = await req.json();
    if (!topic && !subject) {
      return new Response(JSON.stringify({ error: "Topic or subject is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "You are an expert educator creating flashcards for spaced repetition study. Create clear, concise flashcards with a question/prompt on the front and the answer on the back. Include a difficulty rating and a helpful hint for each card.",
          },
          {
            role: "user",
            content: `Generate ${numCards} ${difficulty}-difficulty flashcards for ${gradeLevel ? `grade ${gradeLevel}` : "general"} students on the topic "${topic || subject}". Each flashcard should have a clear front (question/prompt) and back (answer/explanation). Include a hint and difficulty level for each.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_flashcards",
              description: "Return structured flashcard data.",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Deck title" },
                  cards: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        front: { type: "string", description: "Question or prompt" },
                        back: { type: "string", description: "Answer or explanation" },
                        hint: { type: "string", description: "A helpful hint" },
                        difficulty: { type: "string", enum: ["easy", "medium", "hard"], description: "Card difficulty" },
                      },
                      required: ["front", "back", "hint", "difficulty"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["title", "cards"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_flashcards" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let deck;

    if (toolCall?.function?.arguments) {
      try {
        deck = JSON.parse(toolCall.function.arguments);
      } catch {
        deck = { title: `${topic || subject} Flashcards`, cards: [] };
      }
    } else {
      deck = { title: `${topic || subject} Flashcards`, cards: [] };
    }

    return new Response(JSON.stringify({ deck }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-flashcards error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
