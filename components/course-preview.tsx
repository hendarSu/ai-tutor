import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

type CoursePreviewProps = {
  course: {
    title: string
    description: string
    sections: {
      title: string
      content: string
      subsections: {
        title: string
        content: string
      }[]
    }[]
  }
}

export function CoursePreview({ course }: CoursePreviewProps) {
  const totalSections = course.sections.length
  const totalLessons = course.sections.reduce((acc, section) => acc + section.subsections.length + 1, 0)

  const estimatedHours = Math.round(totalLessons * 0.5)

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
        <h2 className="text-2xl font-bold mb-2">{course.title}</h2>
        <p className="opacity-90">{course.description}</p>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center">
            <div className="text-3xl font-bold">{totalSections}</div>
            <div className="text-sm opacity-80">Sections</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{totalLessons}</div>
            <div className="text-sm opacity-80">Lessons</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{estimatedHours}</div>
            <div className="text-sm opacity-80">Hours</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {course.sections.map((section, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-600" />
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-2">{section.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{section.content}</p>

              <div className="space-y-3 mt-4">
                {section.subsections.map((subsection, subIndex) => (
                  <div key={subIndex} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                      {subIndex + 1}
                    </div>
                    <div>
                      <h4 className="font-medium">{subsection.title}</h4>
                      <p className="text-sm text-muted-foreground">{subsection.content.substring(0, 100)}...</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Course Completion</span>
          <span className="text-sm font-medium">0%</span>
        </div>
        <Progress value={0} className="h-2" />
      </div>
    </div>
  )
}

