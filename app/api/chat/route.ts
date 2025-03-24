import { getSettings, openaiClient } from "@/lib/openai"
import { createOpenAI } from "@ai-sdk/openai"
import {  streamText } from "ai"


export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()

  try {

    const openai = createOpenAI({
      apiKey: getSettings().apiKey
    })

    const data = streamText({
      model: openai("gpt-4o"),
      system:
        "You are a helpful, knowledgeable tutor. Provide clear, concise, and accurate information. Include examples where appropriate. Be encouraging and supportive.",
      messages,
    })

    const response = data.toDataStreamResponse();
    return response;
  } catch (error) {
    console.error("Error in chat API:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to process your request. Please check your API key and try again.",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}

