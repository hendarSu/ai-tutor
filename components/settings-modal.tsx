"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Settings, Check, X, Loader2 } from "lucide-react"
import { useSettingsStore } from "@/lib/settings-store"

export function SettingsModal() {
  const { openaiApiKey, setOpenaiApiKey, isApiKeyValid, setApiKeyValid } = useSettingsStore()
  const [apiKey, setApiKey] = useState(openaiApiKey)
  const [isOpen, setIsOpen] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState("")

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setValidationError("API key is required")
      return
    }

    setIsValidating(true)
    setValidationError("")

    try {
      const response = await fetch("/api/test-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey }),
      })

      const data = await response.json()

      if (data.success) {
        setOpenaiApiKey(apiKey)
        setApiKeyValid(true)
        setIsOpen(false)
      } else {
        setValidationError(data.message || "Invalid API key")
        setApiKeyValid(false)
      }
    } catch (error) {
      console.error("Error validating API key:", error)
      setValidationError("Error validating API key. Please try again.")
      setApiKeyValid(false)
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Settings className="h-4 w-4" />
          {!isApiKeyValid && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"></span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Configure your API keys and preferences.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="openai-api-key" className="flex items-center gap-2">
              OpenAI API Key
              {isApiKeyValid ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
            </Label>
            <Input
              id="openai-api-key"
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            {validationError && <p className="text-sm text-red-500">{validationError}</p>}
            <p className="text-xs text-muted-foreground">
              Your API key is stored locally in your browser and never sent to our servers.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isValidating}>
            {isValidating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

