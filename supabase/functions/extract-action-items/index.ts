import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcript } = await req.json();

    if (!transcript) {
      throw new Error("No transcript provided");
    }

    console.log("Processing transcript of length:", transcript.length);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Call Lovable AI to extract action items using structured output
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an AI assistant that extracts action items from meeting transcripts. 
            
Extract all tasks, commitments, and action items mentioned in the transcript. For each action item:
- Identify the specific action/task
- Determine who is responsible (owner)
- Extract or infer the deadline/due date
- Assess the priority level (high, medium, or low)

Be thorough and extract all actionable items, even if some information is implicit.`
          },
          {
            role: "user",
            content: transcript
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_action_items",
              description: "Extract action items from a meeting transcript",
              parameters: {
                type: "object",
                properties: {
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        action: {
                          type: "string",
                          description: "The specific action or task to be completed"
                        },
                        owner: {
                          type: "string",
                          description: "The person responsible for the action"
                        },
                        deadline: {
                          type: "string",
                          description: "When the action should be completed (e.g., 'Friday', 'Next week', 'By EOD')"
                        },
                        priority: {
                          type: "string",
                          enum: ["high", "medium", "low"],
                          description: "The priority level of the action item"
                        }
                      },
                      required: ["action", "owner", "deadline", "priority"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["items"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: {
          type: "function",
          function: { name: "extract_action_items" }
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");

    // Extract the function call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || !toolCall.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(data));
      throw new Error("Failed to extract action items from AI response");
    }

    const result = JSON.parse(toolCall.function.arguments);
    console.log("Extracted items:", result.items?.length || 0);

    // Add IDs to each item
    const itemsWithIds = result.items.map((item: any, index: number) => ({
      ...item,
      id: `item-${Date.now()}-${index}`,
    }));

    return new Response(JSON.stringify({ items: itemsWithIds }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in extract-action-items function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
