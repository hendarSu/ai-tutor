"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useCourseStore } from "@/lib/course-store"
import {
  ChevronLeft,
  ChevronRight,
  Check,
  ChevronDown,
  ChevronUp,
  Edit,
  Save,
  X,
  Sparkles,
  Plus,
  Loader2,
  Eye,
  Code,
  FileText,
} from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import ReactMarkdown from "react-markdown"
import { useSettingsStore } from "@/lib/settings-store"

export function CourseDetailContent() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const { getCourse, updateCourseProgress, updateCourse, markLessonAsCompleted } = useCourseStore()
  const course = getCourse(courseId)

  const [activeSection, setActiveSection] = useState(0)
  const [activeSubsection, setActiveSubsection] = useState(-1)
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set())
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Editing states
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState("")
  const [editedContent, setEditedContent] = useState("")
  const [isImproving, setIsImproving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [editMode, setEditMode] = useState<"edit" | "preview">("edit")

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newSubsectionTitle, setNewSubsectionTitle] = useState("")
  const [newSubsectionPrompt, setNewSubsectionPrompt] = useState("")
  const [contentFormat, setContentFormat] = useState<"text" | "markdown">("text")

  // Add these state variables
  const [showImproveDialog, setShowImproveDialog] = useState(false)
  const [customPrompt, setCustomPrompt] = useState("")

  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!course) {
      router.push("/")
    }
  }, [course, router])

  useEffect(() => {
    if (course) {
      const currentLesson = getCurrentLessonContent()
      setEditedTitle(currentLesson.title)
      setEditedContent(currentLesson.content)

      // Detect if content is markdown
      const hasMarkdownIndicators =
        currentLesson.content.includes("#") ||
        currentLesson.content.includes("```") ||
        currentLesson.content.includes("**") ||
        currentLesson.content.includes("- ") ||
        (currentLesson.content.includes("[") && currentLesson.content.includes("]("))

      setContentFormat(hasMarkdownIndicators ? "markdown" : "text")
    }
  }, [activeSection, activeSubsection, course])

  // Initialize all sections as collapsed except the active one
  useEffect(() => {
    // Initialize all sections as collapsed except the active one
    if (course) {
      const initialCollapsedSections = new Set<number>()
      course.sections.forEach((_, idx) => {
        if (idx !== activeSection) {
          initialCollapsedSections.add(idx)
        }
      })
      setCollapsedSections(initialCollapsedSections)
    }
  }, [course]) // Only run on initial load when course is available

  // Update the useEffect hook to load completed lessons from the store
  useEffect(() => {
    if (course) {
      // Load completed lessons from the store
      const completedLessonIds = course.completedLessons || []
      setCompletedLessons(new Set(completedLessonIds))
    }
  }, [course])

  if (!course) {
    return <div>Loading...</div>
  }

  const totalLessons = course.sections.reduce((acc, section) => acc + section.subsections.length + 1, 0)

  // Update the handleMarkAsDone function
  const handleMarkAsDone = () => {
    const currentLessonId =
      activeSubsection === -1 ? `section-${activeSection}` : `section-${activeSection}-subsection-${activeSubsection}`

    const isCompleted = completedLessons.has(currentLessonId)

    // Update the local state
    const newCompletedLessons = new Set(completedLessons)
    if (isCompleted) {
      newCompletedLessons.delete(currentLessonId)
    } else {
      newCompletedLessons.add(currentLessonId)
    }
    setCompletedLessons(newCompletedLessons)

    // Update the store
    markLessonAsCompleted(courseId, currentLessonId, !isCompleted)
  }

  // Update the toggleSection function to make it also handle section selection
  const toggleSection = (sectionIndex: number) => {
    // If clicking on the currently active section, just toggle its collapsed state
    if (activeSection === sectionIndex) {
      const newCollapsedSections = new Set(collapsedSections)
      if (collapsedSections.has(sectionIndex)) {
        newCollapsedSections.delete(sectionIndex)
      } else {
        newCollapsedSections.add(sectionIndex)
      }
      setCollapsedSections(newCollapsedSections)
    } else {
      // If clicking on a different section, make it active and expand it
      setActiveSection(sectionIndex)
      setActiveSubsection(-1)
      setIsEditing(false)
      setEditMode("edit")

      // Collapse all sections except the newly active one
      const newCollapsedSections = new Set<number>()
      course.sections.forEach((_, idx) => {
        if (idx !== sectionIndex) {
          newCollapsedSections.add(idx)
        }
      })
      setCollapsedSections(newCollapsedSections)
    }
  }

  const getCurrentLessonContent = () => {
    if (activeSubsection === -1) {
      return {
        title: course.sections[activeSection].title,
        content: course.sections[activeSection].content || "",
        lessonNumber: getLessonNumber(activeSection, -1),
        totalLessons: course.sections[activeSection].subsections.length + 1,
      }
    } else {
      return {
        title: course.sections[activeSection].subsections[activeSubsection].title,
        content: course.sections[activeSection].subsections[activeSubsection].content,
        lessonNumber: getLessonNumber(activeSection, activeSubsection),
        totalLessons: course.sections[activeSection].subsections.length + 1,
      }
    }
  }

  const getLessonNumber = (sectionIndex: number, subsectionIndex: number) => {
    if (subsectionIndex === -1) return 1
    return subsectionIndex + 2 // +2 because we start at 1 and the section itself is lesson 1
  }

  const currentLessonId =
    activeSubsection === -1 ? `section-${activeSection}` : `section-${activeSection}-subsection-${activeSubsection}`

  const isCurrentLessonCompleted = completedLessons.has(currentLessonId)
  const currentLesson = getCurrentLessonContent()

  const handleSaveEdit = () => {
    const updatedCourse = { ...course }

    if (activeSubsection === -1) {
      // Editing a section
      updatedCourse.sections[activeSection].title = editedTitle
      updatedCourse.sections[activeSection].content = editedContent
    } else {
      // Editing a subsection
      updatedCourse.sections[activeSection].subsections[activeSubsection].title = editedTitle
      updatedCourse.sections[activeSection].subsections[activeSubsection].content = editedContent
    }

    updateCourse(courseId, updatedCourse)
    setIsEditing(false)
    setEditMode("edit")
  }

  const handleCancelEdit = () => {
    const currentLesson = getCurrentLessonContent()
    setEditedTitle(currentLesson.title)
    setEditedContent(currentLesson.content)
    setIsEditing(false)
    setEditMode("edit")
  }

  // Update the handleImproveContent function
  const handleImproveContent = async (customInstructions?: string) => {
    setIsImproving(true)
    setShowImproveDialog(false)

    try {
      const { openaiApiKey } = useSettingsStore.getState()

      if (!openaiApiKey) {
        throw new Error("OpenAI API key is not set")
      }

      const promptInstructions =
        customInstructions || "Make it more engaging, clear, and educational. Add examples where appropriate."

      const { text } = await generateText({
        model: openai("gpt-4", { apiKey: openaiApiKey }), // Ensure API key is passed
        system: `You are an expert educational content creator. Improve the given content based on the following instructions: ${promptInstructions}. Keep the same general topic and learning objectives. Format the content in ${contentFormat === "markdown" ? "Markdown" : "plain text"}.`,
        prompt: `Improve the following educational content:\n\n${editedContent}`,
      })

      setEditedContent(text)
      setCustomPrompt("")
    } catch (error) {
      console.error("Error improving content:", error)
      alert("Error: " + (error instanceof Error ? error.message : "Failed to improve content"))
    } finally {
      setIsImproving(false)
    }
  }

  const handleConvertToMarkdown = async () => {
    setIsImproving(true)
    try {
      const { openaiApiKey } = useSettingsStore.getState()

      if (!openaiApiKey) {
        throw new Error("OpenAI API key is not set")
      }

      const { text } = await generateText({
        model: openai("gpt-4", { apiKey: openaiApiKey }), // Ensure API key is passed
        system:
          "You are an expert at converting plain text to well-formatted Markdown. Convert the given content to Markdown format, adding appropriate headers, lists, code blocks, emphasis, and other Markdown features to improve readability and structure.",
        prompt: `Convert this plain text educational content to well-formatted Markdown:\n\n${editedContent}`,
      })

      setEditedContent(text)
      setContentFormat("markdown")
    } catch (error) {
      console.error("Error converting to Markdown:", error)
      alert("Error: " + (error instanceof Error ? error.message : "Failed to convert to Markdown"))
    } finally {
      setIsImproving(false)
    }
  }

  const handleAddNewSubsection = async () => {
    if (!newSubsectionTitle.trim()) return

    setIsGenerating(true)
    try {
      const { openaiApiKey } = useSettingsStore.getState()

      if (!openaiApiKey) {
        throw new Error("OpenAI API key is not set")
      }

      const { text } = await generateText({
        model: openai("gpt-4", { apiKey: openaiApiKey }), // Ensure API key is passed
        system: `You are an expert educational content creator. Create engaging, clear, and educational content for the given topic. Include examples and explanations. Format the content in ${contentFormat === "markdown" ? "Markdown with proper headers, lists, code blocks, and formatting" : "plain text"}.`,
        prompt: `Create educational content for a subsection titled "${newSubsectionTitle}" in a course about "${course.title}". ${newSubsectionPrompt ? `Additional context: ${newSubsectionPrompt}` : ""}`,
      })

      const updatedCourse = { ...course }
      updatedCourse.sections[activeSection].subsections.push({
        title: newSubsectionTitle,
        content: text,
      })

      updateCourse(courseId, updatedCourse)
      setIsAddDialogOpen(false)
      setNewSubsectionTitle("")
      setNewSubsectionPrompt("")
    } catch (error) {
      console.error("Error generating content:", error)
      alert("Error: " + (error instanceof Error ? error.message : "Failed to generate content"))
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-background">
        <div className="border-b">
          <div className="container py-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="flex items-center text-muted-foreground"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Outline
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div
            className={`border-r flex-shrink-0 transition-all duration-300 ${
              sidebarOpen ? "w-80" : "w-0"
            } overflow-hidden`}
          >
            <div className="h-full flex flex-col">
              <div className="p-4 border-b bg-muted/50 flex justify-between items-center">
                <h2 className="font-medium">Course Content</h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                {course.sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="border-b last:border-b-0">
                    {/* Update the section rendering in the sidebar to use the new toggleSection behavior */}
                    {/* Replace the section button and toggle button with this: */}
                    <div className="flex items-center">
                      <button
                        className={`flex-1 text-left p-4 hover:bg-muted/50 flex items-center ${
                          activeSection === sectionIndex && activeSubsection === -1 ? "bg-muted" : ""
                        }`}
                        onClick={() => {
                          setActiveSection(sectionIndex)
                          setActiveSubsection(-1)
                          setIsEditing(false)
                          setEditMode("edit")
                        }}
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted mr-3 text-sm">
                          {sectionIndex + 1}
                        </div>
                        <span className="flex-1 font-medium">{section.title}</span>
                        {completedLessons.has(`section-${sectionIndex}`) && (
                          <Check className="h-4 w-4 text-green-500 ml-2" />
                        )}
                      </button>
                      <button
                        className="p-4 text-muted-foreground hover:bg-muted/50"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleSection(sectionIndex)
                        }}
                      >
                        {collapsedSections.has(sectionIndex) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronUp className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {!collapsedSections.has(sectionIndex) && (
                      <div>
                        {section.subsections.map((subsection, subsectionIndex) => (
                          <button
                            key={subsectionIndex}
                            className={`w-full text-left p-4 pl-16 hover:bg-muted/50 flex items-center ${
                              activeSection === sectionIndex && activeSubsection === subsectionIndex ? "bg-muted" : ""
                            }`}
                            onClick={() => {
                              setActiveSection(sectionIndex)
                              setActiveSubsection(subsectionIndex)
                              setIsEditing(false)
                              setEditMode("edit")
                            }}
                          >
                            <span className="flex-1">{subsection.title}</span>
                            {completedLessons.has(`section-${sectionIndex}-subsection-${subsectionIndex}`) && (
                              <Check className="h-4 w-4 text-green-500" />
                            )}
                          </button>
                        ))}

                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              className="w-full justify-start pl-16 text-muted-foreground hover:text-foreground"
                              onClick={() => {
                                setActiveSection(sectionIndex)
                                setIsAddDialogOpen(true)
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              <span>Add new subsection</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add New Subsection</DialogTitle>
                              <DialogDescription>Create a new subsection for {section.title}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="title">Subsection Title</Label>
                                <Input
                                  id="title"
                                  placeholder="Enter subsection title"
                                  value={newSubsectionTitle}
                                  onChange={(e) => setNewSubsectionTitle(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="format">Content Format</Label>
                                <div className="flex space-x-4">
                                  <div className="flex items-center">
                                    <input
                                      type="radio"
                                      id="format-text"
                                      name="format"
                                      className="mr-2"
                                      checked={contentFormat === "text"}
                                      onChange={() => setContentFormat("text")}
                                    />
                                    <label htmlFor="format-text">Plain Text</label>
                                  </div>
                                  <div className="flex items-center">
                                    <input
                                      type="radio"
                                      id="format-markdown"
                                      name="format"
                                      className="mr-2"
                                      checked={contentFormat === "markdown"}
                                      onChange={() => setContentFormat("markdown")}
                                    />
                                    <label htmlFor="format-markdown">Markdown</label>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="prompt">Content Prompt (Optional)</Label>
                                <Textarea
                                  id="prompt"
                                  placeholder="Describe what you want this subsection to cover"
                                  value={newSubsectionPrompt}
                                  onChange={(e) => setNewSubsectionPrompt(e.target.value)}
                                  rows={4}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button
                                onClick={handleAddNewSubsection}
                                disabled={!newSubsectionTitle.trim() || isGenerating}
                              >
                                {isGenerating ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                  </>
                                ) : (
                                  <>Generate Content</>
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Toggle sidebar button */}
          <button
            className="fixed left-0 top-1/2 transform -translate-y-1/2 bg-primary text-primary-foreground p-1 rounded-r-md shadow-md z-10"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>

          {/* Main content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Lesson {currentLesson.lessonNumber} of {currentLesson.totalLessons}
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <div className="flex border rounded-md overflow-hidden">
                      <Button
                        variant={editMode === "edit" ? "default" : "ghost"}
                        size="sm"
                        className="rounded-none"
                        onClick={() => setEditMode("edit")}
                      >
                        <Code className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant={editMode === "preview" ? "default" : "ghost"}
                        size="sm"
                        className="rounded-none"
                        onClick={() => setEditMode("preview")}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    {contentFormat === "text" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleConvertToMarkdown}
                        disabled={isImproving}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        {isImproving ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <FileText className="mr-2 h-4 w-4" />
                        )}
                        Convert to Markdown
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowImproveDialog(true)}
                      disabled={isImproving}
                      className="text-amber-600 border-amber-200 hover:bg-amber-50"
                    >
                      {isImproving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                      )}
                      Improve Content
                    </Button>
                    <Button size="sm" onClick={handleSaveEdit}>
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant={isCurrentLessonCompleted ? "outline" : "default"}
                      size="sm"
                      className={
                        isCurrentLessonCompleted
                          ? "bg-green-500/10 text-green-600 border-green-200 hover:bg-green-500/20"
                          : ""
                      }
                      onClick={handleMarkAsDone}
                    >
                      {isCurrentLessonCompleted ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Marked as Done
                        </>
                      ) : (
                        "Mark as Done"
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6" ref={contentRef}>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="text-2xl font-bold mt-2"
                    />
                  </div>

                  {editMode === "edit" ? (
                    <div>
                      <div className="flex justify-between items-center">
                        <Label htmlFor="content">Content {contentFormat === "markdown" && "(Markdown)"}</Label>
                        {contentFormat === "markdown" && (
                          <a
                            href="https://www.markdownguide.org/cheat-sheet/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline"
                          >
                            Markdown Cheat Sheet
                          </a>
                        )}
                      </div>
                      <Textarea
                        id="content"
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="min-h-[400px] mt-2 font-normal font-mono"
                      />
                    </div>
                  ) : (
                    <div>
                      <Label>Preview</Label>
                      <div className="border rounded-md p-4 mt-2 min-h-[400px] bg-white">
                        {contentFormat === "markdown" ? (
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown>{editedContent}</ReactMarkdown>
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap">
                            {editedContent.split("\n\n").map((paragraph, index) => (
                              <p key={index} className="mb-4">
                                {paragraph}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-6">{currentLesson.title}</h2>
                  {contentFormat === "markdown" ? (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{currentLesson.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="prose max-w-none">
                      {currentLesson.content.split("\n\n").map((paragraph, index) => (
                        <p key={index} className="mb-4">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Dialog open={showImproveDialog} onOpenChange={setShowImproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Improve Content</DialogTitle>
            <DialogDescription>Provide custom instructions for the AI to improve your content</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="custom-prompt">Custom Instructions</Label>
              <Textarea
                id="custom-prompt"
                placeholder="e.g., Make it more concise, add more examples, explain in simpler terms..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImproveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleImproveContent(customPrompt)} disabled={isImproving}>
              {isImproving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Improving...
                </>
              ) : (
                <>Improve Content</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  )
}