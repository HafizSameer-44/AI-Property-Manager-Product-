"use client"

import { useEffect, useState } from "react"
import Sidebar from "@/components/sidebar"
import AssistantSidebar from "@/components/assistant/assistant-sidebar"
import AssistantChat from "@/components/assistant/assistant-chat"

export default function AssistantPage() {
  const [sidebarOpen, setSidebarOpen] =
    useState(false)

  const [assistantSidebarOpen, setAssistantSidebarOpen] =
    useState(true)

  return (
    <div className="min-h-screen bg-[#f7f8f6] text-[#111]">

      <Sidebar
        open={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      <div className="lg:pl-[250px]">

        <div className="flex h-screen overflow-hidden">

          <AssistantSidebar
            open={assistantSidebarOpen}
            onToggle={() =>
              setAssistantSidebarOpen(
                !assistantSidebarOpen
              )
            }
          />

          <AssistantChat
            onOpenMainSidebar={() =>
              setSidebarOpen(true)
            }
          />

        </div>

      </div>
    </div>
  )
}