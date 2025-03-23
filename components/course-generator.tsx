"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { generateCourse } from "@/app/actions"
import { CoursePreview } from "./course-preview"

type CourseSection = {
  title: string
  content: string
  subsections: {
    title: string
    content: string
  }[]
}

type Course = {
  title: string
  description: string
  sections: CourseSection[]
}

export default function CourseGenerator() {
  const [topic, setTopic] = useState("")
  const [level, setLevel] = useState("beginner")
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [course, setCourse] = useState<Course | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim() || isLoading) return

    setIsLoading(true)
    try {
      const generatedCourse = await generateCourse(topic, level, additionalInfo)
      setCourse(generatedCourse)
    } catch (error) {
      console.error("Error generating course:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Online Course</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Course Topic</Label>
              <Input
                id="topic"
                placeholder="e.g., JavaScript Fundamentals, Machine Learning Basics"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Difficulty Level</Label>
              <select
                id="level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                disabled={isLoading}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
              <Textarea
                id="additionalInfo"
                placeholder="Any specific areas to focus on, target audience, etc."
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                disabled={isLoading}
                className="min-h-[100px]"
              />
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Course...
              </>
            ) : (
              "Generate Course"
            )}
          </Button>
        </CardFooter>
      </Card>

      {course && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Generated Course</h2>
            <Button variant="outline">Export Course</Button>
          </div>
          <CoursePreview course={course} />
        </div>
      )}
    </div>
  )
}

