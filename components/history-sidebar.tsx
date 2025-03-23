"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LucideBookOpen, LucideChevronLeft, LucideChevronRight } from "lucide-react"
import { useState } from "react"

type HistoryItem = {
  id: string
  title: string
  date: string
  type: "course" | "chat"
}

type HistorySidebarProps = {
  onSelectItem: (id: string) => void
}

export function HistorySidebar({ onSelectItem }: HistorySidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Mock history data - in a real app, this would come from a database
  const historyItems: HistoryItem[] = [
    {
      id: "1",
      title: "JavaScript Fundamentals",
      date: "2023-03-15",
      type: "course",
    },
    {
      id: "2",
      title: "Machine Learning Basics",
      date: "2023-03-10",
      type: "course",
    },
    {
      id: "3",
      title: "Chat about Python",
      date: "2023-03-05",
      type: "chat",
    },
  ]

  return (
    <div
      className={`fixed top-0 bottom-0 left-0 z-40 transition-all duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="relative h-full">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
          <Button variant="outline" size="icon" className="rounded-l-none shadow-md" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <LucideChevronLeft /> : <LucideChevronRight />}
          </Button>
        </div>

        <div className="h-full w-64 bg-card border-r shadow-lg">
          <div className="p-4 border-b">
            <h2 className="font-semibold">History</h2>
          </div>

          <ScrollArea className="h-[calc(100vh-57px)]">
            <div className="p-2">
              {historyItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className="w-full justify-start mb-1 text-left"
                  onClick={() => onSelectItem(item.id)}
                >
                  <div className="mr-2">
                    {item.type === "course" ? (
                      <LucideBookOpen className="h-4 w-4" />
                    ) : (
                      <div className="h-4 w-4 rounded-full bg-primary" />
                    )}
                  </div>
                  <div className="truncate">
                    <div className="font-medium truncate">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.date}</div>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

