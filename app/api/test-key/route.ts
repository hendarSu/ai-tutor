import { OpenAI } from "openai"

export async function POST(req: Request) {
  try {
    const { apiKey } = await req.json()

    if (!apiKey || !apiKey.startsWith("sk-")) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid API key format",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    // Test the API key with a simple request
    const openai = new OpenAI({ apiKey })

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: 'Say "API key is working correctly"' }],
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: "API key is valid",
        response: response.choices[0]?.message?.content,
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

