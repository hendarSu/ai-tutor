"use server"

import { generateText, streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import { useSettingsStore } from "@/lib/settings-store"

// AI Tutor function
export async function askTutor(question: string): Promise<string> {
  try {
    const { openaiApiKey } = useSettingsStore.getState()

    if (!openaiApiKey) {
      return "Please set your OpenAI API key in the settings first."
    }

    const { text } = await generateText({
      model: openai("gpt-4o", { apiKey: openaiApiKey }),
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
    const { openaiApiKey } = useSettingsStore.getState();

    const result = streamText({
      model: openai("gpt-4o", { apiKey : openaiApiKey }),
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

// Course Generator function
export async function generateCourse(topic: string, level: string, additionalInfo: string) {
  try {
    const { openaiApiKey } = useSettingsStore.getState()

    const courseSchema = z.object({
      title: z.string(),
      description: z.string(),
      sections: z.array(
        z.object({
          title: z.string(),
          subsections: z.array(
            z.object({
              title: z.string(),
              content: z.string(),
            }),
          ),
        }),
      ),
    })

    const prompt = `
      Create a comprehensive online course about "${topic}" for ${level} level students.
      ${additionalInfo ? `Additional requirements: ${additionalInfo}` : ""}
      
      The course should include:
      1. A catchy title
      2. A detailed description
      3. 5-7 main sections
      4. Each section should have 2-3 subsections
      
      Make the content educational, engaging, and practical.
    `

    const { text } = await generateText({
      model: openai("gpt-4o", { apiKey : openaiApiKey }),
      system:
        "You are an expert course creator with experience in instructional design. Create well-structured, engaging, and educational course content. Return ONLY valid JSON that matches the schema.",
      prompt,
    })

    const textToJSON = text.replace(/```json|```/g, "").trim()

    // Parse the JSON response
    const jsonResponse = JSON.parse(textToJSON)
    return courseSchema.parse(jsonResponse)
  } catch (error) {
    console.error("Error in generateCourse:", error)
    throw new Error("Failed to generate course content")
  }
}

