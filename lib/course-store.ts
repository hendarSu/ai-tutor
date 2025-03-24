import { create } from "zustand"
import { persist } from "zustand/middleware"

export type CourseSection = {
  title: string
  content: string
  subsections: {
    title: string
    content: string
  }[]
}

export type Course = {
  id: string
  title: string
  description: string
  level: string
  sections: CourseSection[]
  createdAt: string
  progress: number
  completedLessons: string[] // Array of lesson IDs that are completed
}

type CourseStore = {
  courses: Course[]
  addCourse: (course: Omit<Course, "id" | "createdAt" | "progress" | "completedLessons">) => string
  getCourse: (id: string) => Course | undefined
  updateCourseProgress: (id: string, progress: number) => void
  updateCourse: (id: string, updatedCourse: Course) => void
  markLessonAsCompleted: (courseId: string, lessonId: string, isCompleted: boolean) => void
  getCompletedLessons: (courseId: string) => string[]
}

export const useCourseStore = create<CourseStore>()(
  persist(
    (set, get) => ({
      courses: [],
      addCourse: (course) => {
        const id = Date.now().toString()
        set((state) => ({
          courses: [
            {
              ...course,
              id,
              createdAt: new Date().toISOString(),
              progress: 0,
              completedLessons: [],
            },
            ...state.courses,
          ],
        }))
        return id
      },
      getCourse: (id) => {
        return get().courses.find((course) => course.id === id)
      },
      updateCourseProgress: (id, progress) => {
        set((state) => ({
          courses: state.courses.map((course) => (course.id === id ? { ...course, progress } : course)),
        }))
      },
      updateCourse: (id, updatedCourse) => {
        set((state) => ({
          courses: state.courses.map((course) => (course.id === id ? updatedCourse : course)),
        }))
      },
      markLessonAsCompleted: (courseId, lessonId, isCompleted) => {
        set((state) => {
          const course = state.courses.find((c) => c.id === courseId)
          if (!course) return state

          let newCompletedLessons: string[]

          if (isCompleted) {
            // Add the lesson to completed lessons if not already there
            newCompletedLessons = [...course.completedLessons, lessonId].filter(
              (value, index, self) => self.indexOf(value) === index,
            )
          } else {
            // Remove the lesson from completed lessons
            newCompletedLessons = course.completedLessons.filter((id) => id !== lessonId)
          }

          // Calculate new progress
          const totalLessons = course.sections.reduce((acc, section) => acc + section.subsections.length + 1, 0)
          const progress = Math.round((newCompletedLessons.length / totalLessons) * 100)

          return {
            courses: state.courses.map((c) =>
              c.id === courseId ? { ...c, completedLessons: newCompletedLessons, progress } : c,
            ),
          }
        })
      },
      getCompletedLessons: (courseId) => {
        const course = get().courses.find((c) => c.id === courseId)
        return course?.completedLessons || []
      },
    }),
    {
      name: "course-storage",
    },
  ),
)

