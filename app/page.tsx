import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AITutor from "@/components/ai-tutor"
import CourseGenerator from "@/components/course-generator"
import { LucideBookOpen, LucideMessageSquare } from "lucide-react"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">AI Tutor & Course Generator</h1>
          <p className="text-muted-foreground">
            Learn with an AI tutor or generate complete online courses with OpenAI
          </p>
        </div>

        <Tabs defaultValue="tutor" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tutor" className="flex items-center gap-2">
              <LucideMessageSquare className="h-4 w-4" />
              <span>AI Tutor</span>
            </TabsTrigger>
            <TabsTrigger value="generator" className="flex items-center gap-2">
              <LucideBookOpen className="h-4 w-4" />
              <span>Course Generator</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tutor" className="mt-6">
            <AITutor />
          </TabsContent>
          <TabsContent value="generator" className="mt-6">
            <CourseGenerator />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

