import { AuthWrapper } from "@/components/auth-wrapper"
import { CourseDetailContent } from "@/components/course-detail-content"

export default function CourseDetailPage() {
  return (
    <AuthWrapper>
      <CourseDetailContent />
    </AuthWrapper>
  )
}

