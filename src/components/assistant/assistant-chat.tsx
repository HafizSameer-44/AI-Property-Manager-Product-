"use client"

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowUp,
  Bot,
  Building2,
  Check,
  ChevronDown,
  Copy,
  DoorOpen,
  Loader2,
  Menu,
  MessageSquare,
  Plus,
  Sparkles,
  User,
  Users,
  Wrench,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type AssistantChatProps = {
  onOpenMainSidebar?: () => void
}

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  created_at?: string
}

type Property = {
  id: string
  name: string
  address: string | null
  city: string | null
  total_units: number | null
  status: string | null
}

type Unit = {
  id: string
  property_id: string
  status: string | null
}

type Tenant = {
  id: string
  unit_id: string | null
  status: string | null
}

type Payment = {
  amount: number | null
  paid_date: string | null
  status: string | null
}

type Maintenance = {
  id: string
  property_id: string
  title: string
  description: string | null
  priority: string | null
  status: string | null
}

type WorkspaceData = {
  properties: Property[]
  units: Unit[]
  tenants: Tenant[]
  payments: Payment[]
  maintenance: Maintenance[]
}

const suggestions = [
  "How many properties do I have?",
  "Meri properties kitni hain?",
  "What is my monthly revenue?",
  "Do I have any vacant units?",
  "Show my open maintenance requests.",
  "Give me a workspace overview.",
]

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[?!.:,;]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

function getMonthlyRevenue(payments: Payment[]) {
  const now = new Date()

  return payments.reduce((total, payment) => {
    if (!payment.amount || !payment.paid_date) {
      return total
    }

    const date = new Date(payment.paid_date)

    if (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    ) {
      return total + Number(payment.amount)
    }

    return total
  }, 0)
}

function isAvailableUnit(unit: Unit) {
  const status = normalizeText(unit.status || "")

  return [
    "vacant",
    "available",
    "empty",
    "unoccupied",
  ].some((word) => status.includes(word))
}

function isOccupiedUnit(unit: Unit) {
  const status = normalizeText(unit.status || "")

  return [
    "occupied",
    "rented",
    "leased",
    "active",
  ].some((word) => status.includes(word))
}

function isOpenMaintenance(item: Maintenance) {
  const status = normalizeText(item.status || "")

  return ![
    "completed",
    "complete",
    "closed",
    "resolved",
    "cancelled",
    "canceled",
  ].some((word) => status.includes(word))
}

function getPropertyName(
  propertyId: string,
  properties: Property[]
) {
  return (
    properties.find(
      (property) => property.id === propertyId
    )?.name || "Unknown property"
  )
}

function generateAnswer(
  question: string,
  data: WorkspaceData
): string {
  const q = normalizeText(question)

  const {
    properties,
    units,
    tenants,
    payments,
    maintenance,
  } = data

  /*
   * ----------------------------------------------------
   * PROPERTY COUNT
   * ----------------------------------------------------
   */

  if (
    q.includes("how many propert") ||
    q.includes("number of propert") ||
    q.includes("properties kitni") ||
    q.includes("property kitni") ||
    q.includes("kitni properties") ||
    q.includes("kitne property")
  ) {
    if (properties.length === 0) {
      return "You currently have no properties in your workspace."
    }

    return `You currently have **${properties.length} ${properties.length === 1 ? "property" : "properties"}** in your workspace.`
  }

  /*
   * ----------------------------------------------------
   * PROPERTY LIST
   * ----------------------------------------------------
   */

  if (
    q.includes("list propert") ||
    q.includes("show propert") ||
    q.includes("meri properties") ||
    q.includes("property names") ||
    q.includes("properties ke naam")
  ) {
    if (properties.length === 0) {
      return "There are no properties in your workspace yet."
    }

    const list = properties
      .map((property) => {
        const location = [
          property.city,
          property.address,
        ]
          .filter(Boolean)
          .join(", ")

        return `• **${property.name}**${location ? ` — ${location}` : ""}`
      })
      .join("\n")

    return `Here are your properties:\n\n${list}`
  }

  /*
   * ----------------------------------------------------
   * UNIT COUNT
   * ----------------------------------------------------
   */

  if (
    q.includes("how many unit") ||
    q.includes("number of unit") ||
    q.includes("total unit") ||
    q.includes("units kitni") ||
    q.includes("kitne units")
  ) {
    return `Your workspace currently has **${units.length} units**.`
  }

  /*
   * ----------------------------------------------------
   * TENANT COUNT
   * ----------------------------------------------------
   */

  if (
    q.includes("how many tenant") ||
    q.includes("number of tenant") ||
    q.includes("total tenant") ||
    q.includes("tenants kitne") ||
    q.includes("kitne tenants") ||
    q.includes("tenant kitne")
  ) {
    return `You currently have **${tenants.length} tenants** in your workspace.`
  }

  /*
   * ----------------------------------------------------
   * REVENUE
   * ----------------------------------------------------
   */

  if (
    q.includes("revenue") ||
    q.includes("monthly income") ||
    q.includes("income") ||
    q.includes("earning") ||
    q.includes("earnings") ||
    q.includes("revenue kitni") ||
    q.includes("monthly revenue")
  ) {
    const revenue = getMonthlyRevenue(payments)

    return `Your recorded revenue for the current month is **${formatCurrency(
      revenue
    )}** based on payments with a paid date in the current month.`
  }

  /*
   * ----------------------------------------------------
   * PAYMENTS
   * ----------------------------------------------------
   */

  if (
    q.includes("payment") ||
    q.includes("payments") ||
    q.includes("rent collected") ||
    q.includes("rent collection") ||
    q.includes("paid")
  ) {
    const total = payments.reduce(
      (sum, payment) =>
        sum + Number(payment.amount || 0),
      0
    )

    const monthly = getMonthlyRevenue(payments)

    return `You have **${payments.length} recorded payments** in the workspace.\n\nTotal recorded payment value: **${formatCurrency(
      total
    )}**\n\nCurrent-month recorded payments: **${formatCurrency(
      monthly
    )}**`
  }

  /*
   * ----------------------------------------------------
   * VACANCIES
   * ----------------------------------------------------
   */

  if (
    q.includes("vacant") ||
    q.includes("vacancy") ||
    q.includes("vacancies") ||
    q.includes("available unit") ||
    q.includes("empty unit") ||
    q.includes("khali unit") ||
    q.includes("khali units")
  ) {
    const vacantUnits = units.filter(
      isAvailableUnit
    )

    if (vacantUnits.length === 0) {
      return "I don't currently see any units marked as vacant or available."
    }

    const list = vacantUnits
      .map(
        (unit) =>
          `• Unit **${unit.id.slice(0, 8)}** — ${getPropertyName(
            unit.property_id,
            properties
          )}`
      )
      .join("\n")

    return `I found **${vacantUnits.length} vacant/available units**:\n\n${list}`
  }

  /*
   * ----------------------------------------------------
   * OCCUPANCY
   * ----------------------------------------------------
   */

  if (
    q.includes("occupancy") ||
    q.includes("occupied") ||
    q.includes("occupancy rate") ||
    q.includes("kitna occupied")
  ) {
    if (units.length === 0) {
      return "There are no units available to calculate occupancy yet."
    }

    const occupied = units.filter(
      isOccupiedUnit
    ).length

    const vacancy = units.filter(
      isAvailableUnit
    ).length

    const percentage = Math.round(
      (occupied / units.length) * 100
    )

    return `Current unit occupancy is approximately **${percentage}%**.\n\n• Total units: **${units.length}**\n• Occupied/active: **${occupied}**\n• Vacant/available: **${vacancy}**`
  }

  /*
   * ----------------------------------------------------
   * MAINTENANCE
   * ----------------------------------------------------
   */

  if (
    q.includes("maintenance") ||
    q.includes("repair") ||
    q.includes("repairs") ||
    q.includes("maintenance request") ||
    q.includes("maintenance requests") ||
    q.includes("repair request")
  ) {
    const openRequests =
      maintenance.filter(isOpenMaintenance)

    if (openRequests.length === 0) {
      return "You currently have no open maintenance requests in the workspace."
    }

    const list = openRequests
      .slice(0, 10)
      .map((item) => {
        const propertyName =
          getPropertyName(
            item.property_id,
            properties
          )

        const priority = item.priority
          ? ` · ${item.priority}`
          : ""

        return `• **${item.title}** — ${propertyName}${priority}`
      })
      .join("\n")

    const extra =
      openRequests.length > 10
        ? `\n\nShowing the first 10 of ${openRequests.length} open requests.`
        : ""

    return `You currently have **${openRequests.length} open maintenance requests**.\n\n${list}${extra}`
  }

  /*
   * ----------------------------------------------------
   * PROPERTY-SPECIFIC QUESTIONS
   * ----------------------------------------------------
   */

  const matchedProperty =
    properties.find((property) => {
      const name = normalizeText(
        property.name
      )

      return (
        name.length > 2 &&
        q.includes(name)
      )
    })

  if (matchedProperty) {
    const propertyUnits = units.filter(
      (unit) =>
        unit.property_id ===
        matchedProperty.id
    )

    const propertyTenants =
      tenants.filter((tenant) =>
        propertyUnits.some(
          (unit) =>
            unit.id === tenant.unit_id
        )
      )

    const propertyMaintenance =
      maintenance.filter(
        (item) =>
          item.property_id ===
          matchedProperty.id
      )

    const vacant = propertyUnits.filter(
      isAvailableUnit
    ).length

    const occupied = propertyUnits.filter(
      isOccupiedUnit
    ).length

    return `Here is the current information for **${matchedProperty.name}**:\n\n• Units: **${propertyUnits.length}**\n• Occupied/active: **${occupied}**\n• Vacant/available: **${vacant}**\n• Tenants linked to its units: **${propertyTenants.length}**\n• Maintenance records: **${propertyMaintenance.length}**\n• Status: **${matchedProperty.status || "Not specified"}**`
  }

  /*
   * ----------------------------------------------------
   * WORKSPACE OVERVIEW
   * ----------------------------------------------------
   */

  if (
    q.includes("overview") ||
    q.includes("workspace") ||
    q.includes("summary") ||
    q.includes("summarize") ||
    q.includes("dashboard summary") ||
    q.includes("give me everything") ||
    q.includes("meri sari information") ||
    q.includes("poora overview")
  ) {
    const revenue =
      getMonthlyRevenue(payments)

    const vacant = units.filter(
      isAvailableUnit
    ).length

    const occupied = units.filter(
      isOccupiedUnit
    ).length

    const openMaintenance =
      maintenance.filter(
        isOpenMaintenance
      ).length

    return `### Workspace overview

• **Properties:** ${properties.length}
• **Units:** ${units.length}
• **Tenants:** ${tenants.length}
• **Occupied units:** ${occupied}
• **Vacant/available units:** ${vacant}
• **Current-month recorded revenue:** ${formatCurrency(
      revenue
    )}
• **Open maintenance requests:** ${openMaintenance}

This overview is based on the data currently available in your workspace.`
  }

  /*
   * ----------------------------------------------------
   * HELP
   * ----------------------------------------------------
   */

  if (
    q === "help" ||
    q.includes("what can you do") ||
    q.includes("what do you do") ||
    q.includes("kya kar sakte") ||
    q.includes("help me")
  ) {
    return `I can help you understand the data in your property workspace.

You can ask things like:

• How many properties do I have?
• How many units are there?
• What is my monthly revenue?
• Do I have vacant units?
• What is my occupancy rate?
• Show my maintenance requests.
• Give me a workspace overview.
• Ask about a specific property.

I currently work from your connected workspace data and do not use an external AI model.`
  }

  /*
   * ----------------------------------------------------
   * DEFAULT
   * ----------------------------------------------------
   */

  return `I can help with your property workspace data.

Try asking:

• **How many properties do I have?**
• **What is my monthly revenue?**
• **Do I have any vacant units?**
• **Show my open maintenance requests.**
• **What is my occupancy rate?**
• **Give me a workspace overview.**

You can also ask these questions in Roman Urdu/Hinglish.`
}

function renderMarkdown(text: string) {
  const lines = text.split("\n")

  return (
    <div className="space-y-1.5">
      {lines.map((line, index) => {
        if (!line.trim()) {
          return (
            <div
              key={index}
              className="h-1"
            />
          )
        }

        if (line.startsWith("### ")) {
          return (
            <h3
              key={index}
              className="mb-2 mt-1 text-[13px] font-bold text-black"
            >
              {line.replace("### ", "")}
            </h3>
          )
        }

        const parts = line.split(
          /(\*\*.*?\*\*)/g
        )

        return (
          <p
            key={index}
            className="text-[12px] leading-[1.65] text-black/70"
          >
            {parts.map((part, partIndex) => {
              if (
                part.startsWith("**") &&
                part.endsWith("**")
              ) {
                return (
                  <strong
                    key={partIndex}
                    className="font-semibold text-black"
                  >
                    {part.slice(2, -2)}
                  </strong>
                )
              }

              return (
                <span key={partIndex}>
                  {part}
                </span>
              )
            })}
          </p>
        )
      })}
    </div>
  )
}

export default function AssistantChat({
  onOpenMainSidebar,
}: AssistantChatProps) {
  const supabase = useMemo(
    () => createClient(),
    []
  )

  const [messages, setMessages] =
    useState<Message[]>([])

  const [question, setQuestion] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  const [chatId, setChatId] =
    useState<string | null>(null)

  const [copiedId, setCopiedId] =
    useState<string | null>(null)

  const [userName, setUserName] =
    useState("there")

  const textareaRef =
    useRef<HTMLTextAreaElement>(null)

  const bottomRef =
    useRef<HTMLDivElement>(null)

  /*
   * ----------------------------------------------------
   * GET USER
   * ----------------------------------------------------
   */

  useEffect(() => {
    let mounted = true

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!mounted || !user) {
        return
      }

      const metadata =
        user.user_metadata || {}

      const name =
        metadata.full_name ||
        metadata.name ||
        user.email?.split("@")[0] ||
        "there"

      setUserName(
        String(name).split(" ")[0]
      )
    }

    loadUser()

    return () => {
      mounted = false
    }
  }, [supabase])

  /*
   * ----------------------------------------------------
   * LOAD CHAT
   * ----------------------------------------------------
   */

  async function loadChat(
    selectedChatId: string
  ) {
    setLoading(true)

    try {
      const {
        data,
        error,
      } = await supabase
        .from("assistant_messages")
        .select(
          "id, role, content, created_at"
        )
        .eq(
          "chat_id",
          selectedChatId
        )
        .order("created_at", {
          ascending: true,
        })

      if (error) {
        console.error(
          "Load assistant messages:",
          error
        )
        return
      }

      setChatId(selectedChatId)
      setMessages(
        (data || []) as Message[]
      )
    } finally {
      setLoading(false)
    }
  }

  /*
   * ----------------------------------------------------
   * CHAT EVENTS
   * ----------------------------------------------------
   */

  useEffect(() => {
    const handleChatSelected = (
      event: Event
    ) => {
      const customEvent =
        event as CustomEvent<{
          chatId?: string
        }>

      if (
        customEvent.detail?.chatId
      ) {
        loadChat(
          customEvent.detail.chatId
        )
      }
    }

    const handleNewChat = () => {
      setChatId(null)
      setMessages([])
      setQuestion("")

      setTimeout(() => {
        textareaRef.current?.focus()
      }, 100)
    }

    window.addEventListener(
      "assistant-chat-selected",
      handleChatSelected
    )

    window.addEventListener(
      "assistant-new-chat",
      handleNewChat
    )

    return () => {
      window.removeEventListener(
        "assistant-chat-selected",
        handleChatSelected
      )

      window.removeEventListener(
        "assistant-new-chat",
        handleNewChat
      )
    }
  }, [])

  /*
   * ----------------------------------------------------
   * AUTO SCROLL
   * ----------------------------------------------------
   */

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    })
  }, [messages, loading])

  /*
   * ----------------------------------------------------
   * TEXTAREA
   * ----------------------------------------------------
   */

  function handleQuestionChange(
    value: string
  ) {
    setQuestion(value)

    const textarea =
      textareaRef.current

    if (!textarea) {
      return
    }

    textarea.style.height = "auto"

    textarea.style.height = `${Math.min(
      textarea.scrollHeight,
      140
    )}px`
  }

  /*
   * ----------------------------------------------------
   * CREATE CHAT
   * ----------------------------------------------------
   */

  async function ensureChat(
    firstQuestion: string
  ) {
    if (chatId) {
      return chatId
    }

    const title =
      firstQuestion.length > 50
        ? `${firstQuestion.slice(
            0,
            50
          )}...`
        : firstQuestion

    const {
      data: {
        user,
      },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error(
        "You are not logged in."
      )
    }

    const {
      data,
      error,
    } = await supabase
      .from("assistant_chats")
      .insert({
        user_id: user.id,
        title,
      })
      .select("id")
      .single()

    if (error) {
      throw error
    }

    setChatId(data.id)

    window.dispatchEvent(
      new CustomEvent(
        "assistant-chat-updated"
      )
    )

    return data.id
  }

  /*
   * ----------------------------------------------------
   * SAVE MESSAGE
   * ----------------------------------------------------
   */

  async function saveMessage(
    selectedChatId: string,
    role: "user" | "assistant",
    content: string
  ) {
    const {
      data: {
        user,
      },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error(
        "You are not logged in."
      )
    }

    const {
      error,
    } = await supabase
      .from("assistant_messages")
      .insert({
        chat_id: selectedChatId,
        user_id: user.id,
        role,
        content,
      })

    if (error) {
      throw error
    }

    await supabase
      .from("assistant_chats")
      .update({
        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        selectedChatId
      )

    window.dispatchEvent(
      new CustomEvent(
        "assistant-chat-updated"
      )
    )
  }

  /*
   * ----------------------------------------------------
   * SEND QUESTION
   * ----------------------------------------------------
   */

  async function sendQuestion(
    customQuestion?: string
  ) {
    const value = (
      customQuestion ?? question
    ).trim()

    if (!value || loading) {
      return
    }

    setQuestion("")

    if (textareaRef.current) {
      textareaRef.current.style.height =
        "auto"
    }

    const temporaryUserId =
      `user-${Date.now()}`

    const userMessage: Message = {
      id: temporaryUserId,
      role: "user",
      content: value,
      created_at:
        new Date().toISOString(),
    }

    setMessages((current) => [
      ...current,
      userMessage,
    ])

    setLoading(true)

    try {
      const selectedChatId =
        await ensureChat(value)

      await saveMessage(
        selectedChatId,
        "user",
        value
      )

      /*
       * IMPORTANT:
       *
       * We do NOT import workspace.ts here.
       *
       * The browser calls the API route.
       *
       * API route -> workspace.ts -> server.ts -> Supabase
       */

      const response =
        await fetch(
          "/api/assistant",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              question: value,
            }),
          }
        )

      const result =
        await response.json()

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Assistant request failed."
        )
      }

      const workspace =
        result.workspace as WorkspaceData

      const answer =
        generateAnswer(
          value,
          workspace
        )

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: answer,
        created_at:
          new Date().toISOString(),
      }

      setMessages((current) => [
        ...current,
        assistantMessage,
      ])

      await saveMessage(
        selectedChatId,
        "assistant",
        answer
      )
    } catch (error) {
      console.error(
        "Assistant error:",
        error
      )

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content:
          "I couldn't load your workspace data right now. Please check your Supabase connection and try again.",
        created_at:
          new Date().toISOString(),
      }

      setMessages((current) => [
        ...current,
        errorMessage,
      ])
    } finally {
      setLoading(false)

      setTimeout(() => {
        textareaRef.current?.focus()
      }, 100)
    }
  }

  /*
   * ----------------------------------------------------
   * NEW CHAT
   * ----------------------------------------------------
   */

  function startNewChat() {
    setChatId(null)
    setMessages([])
    setQuestion("")

    window.dispatchEvent(
      new CustomEvent(
        "assistant-new-chat"
      )
    )

    setTimeout(() => {
      textareaRef.current?.focus()
    }, 100)
  }

  /*
   * ----------------------------------------------------
   * COPY
   * ----------------------------------------------------
   */

  async function copyMessage(
    message: Message
  ) {
    try {
      await navigator.clipboard.writeText(
        message.content
      )

      setCopiedId(message.id)

      setTimeout(() => {
        setCopiedId(null)
      }, 1500)
    } catch (error) {
      console.error(
        "Copy failed:",
        error
      )
    }
  }

  /*
   * ----------------------------------------------------
   * ENTER KEY
   * ----------------------------------------------------
   */

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault()

      sendQuestion()
    }
  }

  const hasMessages =
    messages.length > 0

  return (
    <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-[#f7f8f6]">
      {/* TOP BAR */}

      <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-black/[0.08] bg-white/90 px-4 backdrop-blur-xl lg:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={
              onOpenMainSidebar
            }
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/[0.08] bg-white text-black/60 transition hover:bg-black/[0.035] hover:text-black lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu size={17} />
          </button>

          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#173d25] text-white shadow-sm">
              <Bot
                size={17}
                strokeWidth={2}
              />

              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#75b985]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[13px] font-bold tracking-[-0.02em] text-black">
                  AI Assistant
                </h1>

                <span className="rounded-full bg-[#edf5ee] px-2 py-0.5 text-[7px] font-bold uppercase tracking-[0.12em] text-[#173d25]">
                  Workspace AI
                </span>
              </div>

              <p className="mt-0.5 text-[9px] text-black/40">
                Ask questions about your properties
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={startNewChat}
            className="hidden h-9 items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-3 text-[10px] font-semibold text-black/65 transition hover:bg-black/[0.035] hover:text-black sm:flex"
          >
            <Plus size={14} />
            New chat
          </button>

          <button
            type="button"
            className="flex h-9 items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-3 text-[10px] font-medium text-black/50 transition hover:bg-black/[0.035] hover:text-black"
          >
            <Sparkles
              size={13}
              className="text-[#173d25]"
            />
            Local intelligence
            <ChevronDown
              size={12}
              className="text-black/30"
            />
          </button>
        </div>
      </header>

      {/* CHAT AREA */}

      <div className="min-h-0 flex-1 overflow-y-auto">
        {!hasMessages ? (
          <div className="mx-auto flex min-h-full w-full max-w-[900px] flex-col justify-center px-5 py-10">
            <motion.div
              initial={{
                opacity: 0,
                y: 12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.4,
              }}
              className="mx-auto w-full max-w-[700px]"
            >
              <div className="mb-7 text-center">
                <motion.div
                  initial={{
                    scale: 0.9,
                    opacity: 0,
                  }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                  }}
                  transition={{
                    delay: 0.05,
                    duration: 0.35,
                  }}
                  className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#173d25] text-white shadow-[0_12px_30px_rgba(23,61,37,0.15)]"
                >
                  <Bot
                    size={25}
                    strokeWidth={1.8}
                  />
                </motion.div>

                <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-[#173d25]/60">
                  Greek Root AI
                </p>

                <h2 className="text-[25px] font-bold tracking-[-0.04em] text-black sm:text-[30px]">
                  Good to see you,{" "}
                  {userName}.
                </h2>

                <p className="mx-auto mt-3 max-w-[500px] text-[12px] leading-6 text-black/45">
                  Ask me about your properties,
                  units, tenants, payments,
                  vacancies, or maintenance.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {suggestions.map(
                  (suggestion, index) => (
                    <motion.button
                      key={suggestion}
                      type="button"
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay:
                          0.1 +
                          index * 0.04,
                      }}
                      onClick={() =>
                        sendQuestion(
                          suggestion
                        )
                      }
                      className="group flex min-h-[54px] items-center justify-between rounded-2xl border border-black/[0.08] bg-white px-4 text-left shadow-[0_4px_18px_rgba(0,0,0,0.025)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#173d25]/20 hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)]"
                    >
                      <span className="pr-3 text-[11px] font-medium leading-5 text-black/60 transition group-hover:text-black">
                        {suggestion}
                      </span>

                      <ArrowUp
                        size={14}
                        className="rotate-45 shrink-0 text-black/25 transition group-hover:text-[#173d25]"
                      />
                    </motion.button>
                  )
                )}
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-[900px] px-4 py-7 sm:px-6 lg:px-8">
            <AnimatePresence initial={false}>
              {messages.map(
                (message) => {
                  const isUser =
                    message.role ===
                    "user"

                  return (
                    <motion.div
                      key={message.id}
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        duration: 0.25,
                      }}
                      className={`mb-6 flex gap-3 ${
                        isUser
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {!isUser && (
                        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#173d25] text-white">
                          <Bot
                            size={14}
                          />
                        </div>
                      )}

                      <div
                        className={`group max-w-[82%] ${
                          isUser
                            ? "flex flex-col items-end"
                            : ""
                        }`}
                      >
                        <div
                          className={`rounded-2xl px-4 py-3 ${
                            isUser
                              ? "rounded-br-md bg-[#173d25] text-white shadow-sm"
                              : "rounded-bl-md border border-black/[0.07] bg-white shadow-[0_3px_14px_rgba(0,0,0,0.025)]"
                          }`}
                        >
                          {isUser ? (
                            <p className="whitespace-pre-wrap text-[12px] leading-6 text-white">
                              {
                                message.content
                              }
                            </p>
                          ) : (
                            renderMarkdown(
                              message.content
                            )
                          )}
                        </div>

                        {!isUser && (
                          <button
                            type="button"
                            onClick={() =>
                              copyMessage(
                                message
                              )
                            }
                            className="mt-1.5 flex items-center gap-1 rounded-md px-1.5 py-1 text-[8px] font-medium text-black/25 opacity-0 transition hover:bg-black/[0.035] hover:text-black/55 group-hover:opacity-100"
                          >
                            {copiedId ===
                            message.id ? (
                              <>
                                <Check
                                  size={
                                    10
                                  }
                                />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy
                                  size={
                                    10
                                  }
                                />
                                Copy
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {isUser && (
                        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-black/[0.08] bg-white text-black/45">
                          <User
                            size={14}
                          />
                        </div>
                      )}
                    </motion.div>
                  )
                }
              )}
            </AnimatePresence>

            {loading && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 5,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="mb-5 flex gap-3"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#173d25] text-white">
                  <Bot size={14} />
                </div>

                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-black/[0.07] bg-white px-4 py-3 shadow-[0_3px_14px_rgba(0,0,0,0.025)]">
                  <motion.span
                    animate={{
                      y: [0, -3, 0],
                    }}
                    transition={{
                      duration: 0.7,
                      repeat: Infinity,
                      delay: 0,
                    }}
                    className="h-1.5 w-1.5 rounded-full bg-[#173d25]/60"
                  />

                  <motion.span
                    animate={{
                      y: [0, -3, 0],
                    }}
                    transition={{
                      duration: 0.7,
                      repeat: Infinity,
                      delay: 0.12,
                    }}
                    className="h-1.5 w-1.5 rounded-full bg-[#173d25]/60"
                  />

                  <motion.span
                    animate={{
                      y: [0, -3, 0],
                    }}
                    transition={{
                      duration: 0.7,
                      repeat: Infinity,
                      delay: 0.24,
                    }}
                    className="h-1.5 w-1.5 rounded-full bg-[#173d25]/60"
                  />
                </div>
              </motion.div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* INPUT */}

      <div className="shrink-0 border-t border-black/[0.08] bg-white/90 px-4 pb-4 pt-3 backdrop-blur-xl sm:px-6">
        <div className="mx-auto w-full max-w-[900px]">
          <div className="relative rounded-2xl border border-black/[0.09] bg-white shadow-[0_5px_25px_rgba(0,0,0,0.04)] transition focus-within:border-[#173d25]/30 focus-within:shadow-[0_8px_30px_rgba(23,61,37,0.07)]">
            <textarea
              ref={textareaRef}
              value={question}
              onChange={(event) =>
                handleQuestionChange(
                  event.target.value
                )
              }
              onKeyDown={
                handleKeyDown
              }
              disabled={loading}
              rows={1}
              placeholder="Ask about your property workspace..."
              className="max-h-[140px] min-h-[52px] w-full resize-none bg-transparent px-4 pb-12 pt-4 pr-14 text-[12px] leading-5 text-black outline-none placeholder:text-black/30 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-[8px] font-medium text-black/30">
                  <Sparkles
                    size={11}
                    className="text-[#173d25]/60"
                  />
                  Uses your workspace data
                </div>

                <span className="hidden text-[8px] text-black/20 sm:inline">
                  Enter to send · Shift + Enter
                  for new line
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  sendQuestion()
                }
                disabled={
                  !question.trim() ||
                  loading
                }
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#173d25] text-white shadow-sm transition-all hover:bg-[#102c1a] disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-black/25"
                aria-label="Send message"
              >
                {loading ? (
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />
                ) : (
                  <ArrowUp
                    size={15}
                    strokeWidth={2.2}
                  />
                )}
              </button>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-center gap-1 text-center text-[7px] text-black/25">
            <MessageSquare size={9} />
            Greek Root AI Assistant · Workspace
            data only
          </div>
        </div>
      </div>
    </main>
  )
}