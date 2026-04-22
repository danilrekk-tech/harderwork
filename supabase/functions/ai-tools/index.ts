import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

async function callAI(messages: any[], tool?: any) {
  const body: any = {
    model: "google/gemini-3-flash-preview",
    messages,
    stream: false,
  };
  if (tool) {
    body.tools = [tool];
    body.tool_choice = { type: "function", function: { name: tool.function.name } };
  }
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`AI ${r.status}: ${t}`);
  }
  return r.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { task, payload } = await req.json();
    const auth = req.headers.get("Authorization") ?? "";
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    if (task === "lead_score") {
      const { client } = payload;
      const sys = "Ты опытный сейлз-аналитик. Оцени вероятность закрытия сделки от 0 до 100 и дай рекомендацию.";
      const user_msg = `Клиент: ${JSON.stringify(client)}`;
      const res = await callAI([{ role: "system", content: sys }, { role: "user", content: user_msg }], {
        type: "function",
        function: {
          name: "score_lead",
          description: "Оценка лида",
          parameters: {
            type: "object",
            properties: {
              score: { type: "number" },
              reasoning: { type: "string" },
              recommendation: { type: "string" },
              next_action: { type: "string" },
            },
            required: ["score", "reasoning", "recommendation", "next_action"],
          },
        },
      });
      const args = JSON.parse(res.choices[0].message.tool_calls[0].function.arguments);
      return new Response(JSON.stringify(args), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (task === "morning_coach") {
      const { stats } = payload;
      const sys = "Ты AI-коуч для менеджера по продажам. Дай короткий мотивирующий план на день из 3-х пунктов с конкретными действиями.";
      const res = await callAI([{ role: "system", content: sys }, { role: "user", content: `Статистика: ${JSON.stringify(stats)}` }]);
      return new Response(JSON.stringify({ plan: res.choices[0].message.content }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (task === "day_summary") {
      const { events } = payload;
      const sys = "Ты — личный ассистент. Сделай краткую сводку дня менеджера: что сделано, что важно завтра. Формат markdown, не более 8 строк.";
      const res = await callAI([{ role: "system", content: sys }, { role: "user", content: `События: ${JSON.stringify(events)}` }]);
      return new Response(JSON.stringify({ summary: res.choices[0].message.content }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (task === "forecast") {
      const { history } = payload;
      const sys = "Ты финансовый аналитик. На основе истории дай прогноз выручки на следующий месяц.";
      const res = await callAI([{ role: "system", content: sys }, { role: "user", content: JSON.stringify(history) }], {
        type: "function",
        function: {
          name: "forecast",
          description: "Прогноз выручки",
          parameters: {
            type: "object",
            properties: {
              predicted_amount: { type: "number" },
              confidence: { type: "number" },
              factors: { type: "array", items: { type: "string" } },
            },
            required: ["predicted_amount", "confidence", "factors"],
          },
        },
      });
      const args = JSON.parse(res.choices[0].message.tool_calls[0].function.arguments);
      return new Response(JSON.stringify(args), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (task === "call_analyze") {
      const { transcript } = payload;
      const sys = "Ты разбираешь звонки менеджера. Выдели ключевые моменты, возражения и зоны роста.";
      const res = await callAI([{ role: "system", content: sys }, { role: "user", content: transcript }]);
      return new Response(JSON.stringify({ analysis: res.choices[0].message.content }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "unknown task" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
