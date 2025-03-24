"use client"

import { useEffect, useState } from "react"
import { useSettingsStore } from "@/lib/settings-store"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ApiKeyCheck() {
  const { openaiApiKey, isApiKeyValid } = useSettingsStore()
  const [showAlert, setShowAlert] = useState(false)

  useEffect(() => {
    // Show alert if API key is not set or invalid
    setShowAlert(!openaiApiKey || !isApiKeyValid)
  }, [openaiApiKey, isApiKeyValid])

  if (!showAlert) return null

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>API Key Required</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>
          {!openaiApiKey
            ? "Please set your OpenAI API key to use this application."
            : "Your OpenAI API key is invalid. Please update it in settings."}
        </p>
        <div>
          <Button variant="outline" size="sm" className="mt-2" asChild>
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
              Get API Key
            </a>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}

