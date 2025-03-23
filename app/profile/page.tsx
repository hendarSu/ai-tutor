import { AuthWrapper } from "@/components/auth-wrapper"
import { ProfileContent } from "@/components/profile-content"

export default function ProfilePage() {
  return (
    <AuthWrapper>
      <ProfileContent />
    </AuthWrapper>
  )
}

