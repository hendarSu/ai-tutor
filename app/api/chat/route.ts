import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = await streamText({
    model: openai("gpt-4o"),
    system:
      "You are a helpful, knowledgeable tutor. Provide clear, concise, and accurate information. Include examples where appropriate. Be encouraging and supportive.",
    messages,
  })

  return result.toDataStreamResponse()
}

