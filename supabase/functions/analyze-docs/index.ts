import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

if (!OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY secret");
}

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const content: string = body?.content || (Array.isArray(body?.texts) ? body.texts.join("\n\n") : "");

    if (!content || typeof content !== "string") {
      return new Response(JSON.stringify({ error: "No content provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are an AI for an Intelligent Document Processing (IDP) platform focused on goods inspections.
Extract key fields (structured) and a concise findings summary (unstructured) from provided document text (e.g., Bill of Lading, Invoice).
Return ONLY a single JSON object with these optional keys:
{
  "supplier": string,
  "buyer": string,
  "inspectionCompany": string,
  "inspectorName": string,
  "invoiceNumber": string,
  "purchaseOrderNumber": string,
  "containerNo": string,
  "billOfLadingNo": string,
  "portOfLoading": string,
  "portOfDischarge": string,
  "modeOfTransport": string,
  "incoterms": string,
  "product": string,
  "hsCode": string,
  "quantityDeclared": string,
  "packaging": string,
  "weight": string,
  "packagingCondition": string,
  "labeling": string,
  "physicalCondition": string,
  "sampleTesting": string,
  "compliance": string,
  "findings": string
}
- If a field is missing in the text, omit it.
- Normalize simple values (e.g., trim, keep original codes).
- findings should be 1-2 sentences summarizing status and issues.
- Do not include any explanation outside the JSON.`;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5-nano-2025-08-07",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content }
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 500,
      }),
    });

    if (!openaiRes.ok) {
      const msg = await openaiRes.text();
      console.error("OpenAI error:", msg);
      return new Response(JSON.stringify({ error: "OpenAI API error", detail: msg }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await openaiRes.json();
    const contentText: string = data?.choices?.[0]?.message?.content ?? "{}";

    let extracted: Record<string, unknown> = {};
    try {
      extracted = JSON.parse(contentText);
    } catch (e) {
      // Try to salvage JSON from text
      const match = contentText.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          extracted = JSON.parse(match[0]);
        } catch (_) {
          extracted = {};
        }
      }
    }

    const responseBody = {
      extracted,
      raw: data,
    };

    return new Response(JSON.stringify(responseBody), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-docs error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
