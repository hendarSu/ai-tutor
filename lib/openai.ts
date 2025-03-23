import { createOpenAI } from "@ai-sdk/openai"

// Create a custom OpenAI provider instance with your API key
export const openaiClient = createOpenAI({
  //apiKey: process.env.OPENAI_API_KEY,
  // You can add other options here
  apiKey: "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"
  compatibility: "strict", // Use strict mode for the OpenAI API
})

