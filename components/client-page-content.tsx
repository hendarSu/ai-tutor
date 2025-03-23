"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AITutor from "@/components/ai-tutor"
import CourseGenerator from "@/components/course-generator"
import { LucideBookOpen, LucideMessageSquare } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export function ClientPageContent() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("generator")

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab === "generator" || tab === "tutor") {
      setActiveTab(tab)
    }
  }, [searchParams])

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Course Generator</h1>
            <p className="text-muted-foreground">
              Learn with an AI tutor or generate complete online courses with OpenAI
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tutor" className="flex items-center gap-2">
                <LucideMessageSquare className="h-4 w-4" />
                <span>AI Tutor</span>
              </TabsTrigger>
              <TabsTrigger value="generator" className="flex items-center gap-2">
                <LucideBookOpen className="h-4 w-4" />
                <span>Course Generator</span>
              </TabsTrigger>
            </TabsList> */}
            {/* <TabsContent value="tutor" className="mt-6">
              <AITutor />
            </TabsContent> */}
            <TabsContent value="generator" className="mt-6">
              <CourseGenerator />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  )
}

