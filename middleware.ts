import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Check if the settings-storage cookie exists in local storage
  const settingsStorage = request.cookies.get("settings-storage")?.value

  if (settingsStorage) {
    try {
      // Try to parse the settings from the cookie
      const decodedSettings = decodeURIComponent(settingsStorage)
      const parsedSettings = JSON.parse(decodedSettings)
      const apiKey = parsedSettings.state?.openaiApiKey

      console.log("API key:", apiKey)

      if (apiKey) {
        // Set the API key in a separate cookie for server components
        response.cookies.set("openai-api-key", apiKey, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
        })
      }
    } catch (e) {
      console.error("Error parsing settings:", e)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}

