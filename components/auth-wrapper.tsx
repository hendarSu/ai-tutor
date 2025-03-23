"use client"

import type React from "react"

import { AuthProvider } from "@/lib/auth-context"
import { Header } from "@/components/header"

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
      </div>
    </AuthProvider>
  )
}

