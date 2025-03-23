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
}

type CourseStore = {
  courses: Course[]
  addCourse: (course: Omit<Course, "id" | "createdAt" | "progress">) => void
  getCourse: (id: string) => Course | undefined
  updateCourseProgress: (id: string, progress: number) => void
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
    }),
    {
      name: "course-storage",
    },
  ),
)

