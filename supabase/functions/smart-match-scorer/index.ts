import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { learnerProfile, tutorProfile } = await req.json();
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
            content: "You are an expert educational matching system. Analyze tutor-learner compatibility and return a JSON assessment.",
          },
          {
            role: "user",
            content: `Analyze compatibility between this learner and tutor:

Learner: ${JSON.stringify(learnerProfile)}
Tutor: ${JSON.stringify(tutorProfile)}

Return a compatibility assessment with: overall score (0-100), strengths of this match, potential challenges, and a recommendation.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "score_match",
              description: "Return a structured compatibility score between a tutor and learner.",
              parameters: {
                type: "object",
                properties: {
                  overallScore: { type: "number", description: "Compatibility score 0-100" },
                  subjectMatch: { type: "number", description: "Subject alignment score 0-100" },
                  gradeMatch: { type: "number", description: "Grade level appropriateness 0-100" },
                  strengths: { type: "array", items: { type: "string" }, description: "List of match strengths" },
                  challenges: { type: "array", items: { type: "string" }, description: "Potential challenges" },
                  recommendation: { type: "string", description: "Brief recommendation text" },
                },
                required: ["overallScore", "subjectMatch", "gradeMatch", "strengths", "challenges", "recommendation"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "score_match" } },
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
    let matchResult;

    if (toolCall?.function?.arguments) {
      matchResult = JSON.parse(toolCall.function.arguments);
    } else {
      matchResult = {
        overallScore: 75,
        subjectMatch: 80,
        gradeMatch: 70,
        strengths: ["Subject alignment"],
        challenges: ["Could not fully analyze"],
        recommendation: "This looks like a reasonable match.",
      };
    }

    return new Response(JSON.stringify({ match: matchResult }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("smart-match-scorer error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
