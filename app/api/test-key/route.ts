import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function GET() {
  try {
    // Test the API key with a simple request
    const { text } = await generateText({
      model: openai("gpt-3.5-turbo"),
      prompt: 'Say "API key is working correctly"',
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: "API key is valid",
        response: text,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error: any) {
    console.error("Error testing API key:", error)

    // Check for specific OpenAI API errors
    let errorMessage = "Unknown error occurred"

    if (error.message?.includes("API key")) {
      errorMessage = "Invalid API key"
    } else if (error.message?.includes("rate limit")) {
      errorMessage = "Rate limit exceeded"
    }

    return new Response(
      JSON.stringify({
        success: false,
        message: errorMessage,
        error: error.message,
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

