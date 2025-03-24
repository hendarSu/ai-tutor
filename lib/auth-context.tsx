"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

type User = {
  id: string
  name: string
  email: string
  avatar?: string
  role: "student" | "teacher"
  joinedAt: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  loginWithGoogle: () => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { data: session, status } = useSession()
  const router = useRouter()

  // Load user from session or localStorage on initial render
  useEffect(() => {
    if (status === "loading") {
      setIsLoading(true)
      return
    }

    if (session?.user) {
      // User is authenticated with NextAuth
      const nextAuthUser: User = {
        id: session.user.id || session.user.email || "",
        name: session.user.name || "",
        email: session.user.email || "",
        avatar: session.user.image || undefined,
        role: "student",
        joinedAt: new Date().toISOString(),
      }
      setUser(nextAuthUser)
      localStorage.setItem("user", JSON.stringify(nextAuthUser))
      setIsLoading(false)
    } else {
      // Check localStorage as fallback
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
      setIsLoading(false)
    }
  }, [session, status])

  // Login with credentials
  const login = async (email: string, password: string) => {
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setIsLoading(false)
        return false
      }

      // The session will be updated automatically
      router.push("/")
      return true
    } catch (error) {
      console.error("Login error:", error)
      setIsLoading(false)
      return false
    }
  }

  // Login with Google
  const loginWithGoogle = async () => {
    await signIn("google", { callbackUrl: "/" })
  }

  const logout = async () => {
    await signOut({ redirect: false })
    setUser(null)
    localStorage.removeItem("user")
    router.push("/login")
  }

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data }
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginWithGoogle, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

