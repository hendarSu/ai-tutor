import { AuthWrapper } from "@/components/auth-wrapper"
import { ClientPageContent } from "@/components/client-page-content"

export default function Home() {
  return (
    <AuthWrapper>
      <ClientPageContent />
    </AuthWrapper>
  )
}

