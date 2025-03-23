"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { Loader2, LogOut } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"

export function ProfileContent() {
  const { user, updateProfile, logout, isLoading } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    } else if (user) {
      setName(user.name)
      setEmail(user.email)
    }
  }, [user, isLoading, router])

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    updateProfile({ name })
    setIsEditing(false)
    setIsSaving(false)
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-muted/40 py-12 px-4">
        <div className="container max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-muted-foreground">Manage your account settings</p>
          </div>

          <div className="grid gap-8 md:grid-cols-[1fr_3fr]">
            <Card>
              <CardContent className="p-6 flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.avatar || "/placeholder.svg?height=96&width=96"} />
                  <AvatarFallback className="text-2xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h2 className="text-xl font-semibold">{user.name}</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="w-full pt-4">
                  <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={!isEditing || isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={email} disabled={true} />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Type</Label>
                    <div className="flex items-center space-x-2 h-10 px-3 border rounded-md bg-muted/50">
                      <span className="capitalize">{user.role}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Member Since</Label>
                    <div className="flex items-center space-x-2 h-10 px-3 border rounded-md bg-muted/50">
                      {new Date(user.joinedAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  {isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false)
                          setName(user.name)
                        }}
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                  )}
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Learning Statistics</CardTitle>
                  <CardDescription>Your learning progress and achievements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{user.courses?.length || 0}</div>
                      <div className="text-sm text-muted-foreground">Courses</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-2xl font-bold">0</div>
                      <div className="text-sm text-muted-foreground">Completed</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-2xl font-bold">0 hrs</div>
                      <div className="text-sm text-muted-foreground">Learning Time</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-2xl font-bold">0</div>
                      <div className="text-sm text-muted-foreground">Achievements</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

