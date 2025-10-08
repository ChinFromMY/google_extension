// Deploy this as a Supabase Edge Function
// This handles embeddings securely on the server side

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const openaiApiKey = Deno.env.get("OPENAI_API_KEY")

interface RequestBody {
  text: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "authorization, x-client-info, content-type",
      },
    })
  }

  try {
    const { text } = (await req.json()) as RequestBody

    if (!text) {
      return new Response(
        JSON.stringify({ error: "Text is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Call OpenAI API (OpenAI key stays secret on server)
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("OpenAI error:", error)
      return new Response(
        JSON.stringify({ error: "Failed to generate embedding" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    const data = await response.json()

    return new Response(
      JSON.stringify({ embedding: data.data[0].embedding }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    )
  } catch (error) {
    console.error("Error:", error)
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})