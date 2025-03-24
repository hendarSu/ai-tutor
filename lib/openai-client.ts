import { OpenAI } from "openai"
import { useSettingsStore } from "@/lib/settings-store"

export function getOpenAIClient() {
  const { openaiApiKey } = useSettingsStore.getState()

  if (!openaiApiKey) {
    throw new Error("OpenAI API key is not set. Please configure it in settings.")
  }

  return new OpenAI({ apiKey: openaiApiKey })
}

