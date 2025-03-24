import { create } from "zustand"
import { persist } from "zustand/middleware"

type SettingsStore = {
  openaiApiKey: string
  setOpenaiApiKey: (key: string) => void
  isApiKeyValid: boolean
  setApiKeyValid: (valid: boolean) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      openaiApiKey: "",
      setOpenaiApiKey: (key) => set({ openaiApiKey: key }),
      isApiKeyValid: false,
      setApiKeyValid: (valid) => set({ isApiKeyValid: valid }),
    }),
    {
      name: "settings-storage",
    },
  ),
)

