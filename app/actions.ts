"use server"

import { generateText, streamText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { z } from "zod"
import { useSettingsStore } from "@/lib/settings-store"
import { openaiClient } from "@/lib/openai"

// AI Tutor function
export async function askTutor(question: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: openaiClient("gpt-4o-turbo"),
      system:
        "You are a helpful, knowledgeable tutor. Provide clear, concise, and accurate information. Include examples where appropriate. Be encouraging and supportive.",
      prompt: question,
    })

    return text
  } catch (error) {
    console.error("Error in askTutor:", error)
    return "Sorry, I encountered an error while processing your question. Please try again."
  }
}

// Streaming AI Tutor function
export async function streamTutorResponse(question: string) {
  try {
    const result = streamText({
      model: openaiClient("gpt-4o"),
      system:
        "You are a helpful, knowledgeable tutor. Provide clear, concise, and accurate information. Include examples where appropriate. Be encouraging and supportive.",
      prompt: question,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in streamTutorResponse:", error)
    throw new Error("Failed to stream response")
  }
}
