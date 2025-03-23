import { createOpenAI } from "@ai-sdk/openai"

// Create a custom OpenAI provider instance with your API key
export const openaiClient = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // You can add other options here
  compatibility: "strict", // Use strict mode for the OpenAI API
})

