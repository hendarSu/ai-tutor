"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Search, Book } from "lucide-react"
import { generateCourse } from "@/app/actions"
import { useCourseStore, type Course } from "@/lib/course-store"
import { Progress } from "@/components/ui/progress"

export default function CourseGenerator() {
  const router = useRouter()
  const [topic, setTopic] = useState("")
  const [level, setLevel] = useState("beginner")
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false)
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const { courses, addCourse } = useCourseStore()

  const filteredCourses = courses.filter((course) => course.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim() || isLoading) return

    setIsLoading(true)
    try {
      const generatedCourse = await generateCourse(topic, level, additionalInfo)
      const courseId = addCourse({
        ...generatedCourse,
        level,
      })

      // Navigate to the course detail page
      router.push(`/courses/${courseId}`)
    } catch (error) {
      console.error("Error generating course:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLevelChange = (newLevel: string) => {
    setLevel(newLevel)
  }

  const getTotalLessons = (course: Course) => {
    return course.sections.reduce((acc, section) => acc + section.subsections.length + 1, 0)
  }

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="topic">Course Topic</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="topic"
                placeholder="e.g., Algebra, JavaScript, Photography"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isLoading}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Difficulty Level</Label>
            <div className="flex gap-2">
              {["beginner", "intermediate", "advanced"].map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={level === option ? "default" : "outline"}
                  onClick={() => handleLevelChange(option)}
                  disabled={isLoading}
                  className="flex-1 capitalize"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="additionalInfo"
              checked={showAdditionalInfo}
              onCheckedChange={(checked) => setShowAdditionalInfo(checked === true)}
              disabled={isLoading}
            />
            <div className="flex items-center justify-between w-full">
              <Label htmlFor="additionalInfo" className="text-sm font-medium leading-none cursor-pointer">
                Tell us more to tailor the course (optional)
              </Label>
              <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">recommended</span>
            </div>
          </div>

          {showAdditionalInfo && (
            <Textarea
              placeholder="Any specific areas to focus on, target audience, etc."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              disabled={isLoading}
              className="min-h-[100px]"
            />
          )}

          <Button type="submit" disabled={isLoading} className="w-full bg-gray-400 hover:bg-gray-500">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Course...
              </>
            ) : (
              <>
                <span className="mr-2">✨</span>
                Generate Course
              </>
            )}
          </Button>
        </form>
      </Card>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Your Courses</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            No courses found. Generate your first course above!
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <button
                    onClick={() => router.push(`/courses/${course.id}`)}
                    className="w-full text-left p-6 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="text-sm text-green-600 font-medium capitalize">{course.level}</div>
                        <h3 className="text-xl font-semibold">{course.title}</h3>
                        <div className="flex items-center text-muted-foreground">
                          <span className="flex items-center">
                            <Book className="mr-1 h-4 w-4" />
                            {getTotalLessons(course)} lessons
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">{course.progress}%</div>
                    </div>
                    <Progress value={course.progress} className="h-1 mt-4" />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

