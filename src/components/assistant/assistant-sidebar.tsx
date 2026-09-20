"use client"

import {
  useEffect,
  useState,
} from "react"

import {
  AnimatePresence,
  motion,
} from "framer-motion"

import {
  Bot,
  ChevronLeft,
  MessageSquare,
  Plus,
  Trash2,
} from "lucide-react"

import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

type Chat = {
  id: string
  title: string
  created_at: string
  updated_at: string
}

type Props = {
  open: boolean
  onToggle: () => void
}

export default function AssistantSidebar({
  open,
  onToggle,
}: Props) {
  const [chats, setChats] =
    useState<Chat[]>([])

  const [activeChat, setActiveChat] =
    useState<string | null>(null)

  async function loadChats() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } =
      await supabase
        .from("assistant_chats")
        .select(
          "id, title, created_at, updated_at"
        )
        .eq(
          "user_id",
          user.id
        )
        .order(
          "updated_at",
          {
            ascending: false,
          }
        )

    if (!error) {
      setChats(
        (data || []) as Chat[]
      )
    }
  }

  useEffect(() => {
    loadChats()

    const handler = () => {
      loadChats()
    }

    window.addEventListener(
      "assistant-chat-updated",
      handler
    )

    return () => {
      window.removeEventListener(
        "assistant-chat-updated",
        handler
      )
    }
  }, [])

  function newChat() {
    setActiveChat(null)

    window.dispatchEvent(
      new CustomEvent(
        "assistant-new-chat"
      )
    )
  }

  function selectChat(id: string) {
    setActiveChat(id)

    window.dispatchEvent(
      new CustomEvent(
        "assistant-open-chat",
        {
          detail: {
            chatId: id,
          },
        }
      )
    )
  }

  async function deleteChat(
    id: string
  ) {
    const { error } =
      await supabase
        .from("assistant_chats")
        .delete()
        .eq("id", id)

    if (error) {
      console.error(error)
      return
    }

    setChats((current) =>
      current.filter(
        (chat) =>
          chat.id !== id
      )
    )

    if (activeChat === id) {
      newChat()
    }
  }

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.aside
          initial={{
            width: 0,
            opacity: 0,
          }}
          animate={{
            width: 270,
            opacity: 1,
          }}
          exit={{
            width: 0,
            opacity: 0,
          }}
          transition={{
            duration: 0.25,
          }}
          className="hidden shrink-0 overflow-hidden border-r border-black/10 bg-white md:block"
        >
          <div className="flex h-full w-[270px] flex-col">

            {/* HEADER */}

            <div className="flex h-[68px] items-center justify-between border-b border-black/10 px-4">

              <div className="flex items-center gap-2.5">

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#173d25] text-white">
                  <Bot size={15} />
                </div>

                <div>
                  <p className="text-xs font-bold">
                    AI Assistant
                  </p>

                  <p className="text-[8px] uppercase tracking-[0.14em] text-black/30">
                    Property intelligence
                  </p>
                </div>

              </div>

              <button
                onClick={onToggle}
                className="rounded-lg p-2 text-black/35 hover:bg-black/5 hover:text-black"
              >
                <ChevronLeft
                  size={15}
                />
              </button>

            </div>

            {/* NEW CHAT */}

            <div className="p-3">

              <button
                onClick={newChat}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#173d25] px-4 py-3 text-[11px] font-semibold text-white shadow-lg shadow-[#173d25]/10 transition hover:-translate-y-0.5"
              >
                <Plus size={14} />
                New conversation
              </button>

            </div>

            {/* HISTORY */}

            <div className="px-4 pb-2">

              <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-black/25">
                Conversations
              </p>

            </div>

            <div className="flex-1 overflow-y-auto px-2 pb-4">

              {chats.length === 0 ? (
                <div className="px-4 py-10 text-center">

                  <MessageSquare
                    size={20}
                    className="mx-auto mb-2 text-black/15"
                  />

                  <p className="text-[10px] font-medium text-black/40">
                    No conversations yet
                  </p>

                </div>
              ) : (
                <div className="space-y-1">

                  {chats.map(
                    (chat) => (
                      <div
                        key={
                          chat.id
                        }
                        className={`group flex items-center rounded-xl transition ${
                          activeChat ===
                          chat.id
                            ? "bg-[#edf5ee]"
                            : "hover:bg-black/[0.035]"
                        }`}
                      >

                        <button
                          onClick={() =>
                            selectChat(
                              chat.id
                            )
                          }
                          className="min-w-0 flex-1 px-3 py-2.5 text-left"
                        >

                          <div className="flex items-center gap-2">

                            <MessageSquare
                              size={13}
                              className={
                                activeChat ===
                                chat.id
                                  ? "text-[#173d25]"
                                  : "text-black/25"
                              }
                            />

                            <p className="truncate text-[10px] font-medium">
                              {chat.title}
                            </p>

                          </div>

                          <p className="mt-1 pl-5 text-[8px] text-black/25">
                            {new Date(
                              chat.updated_at
                            ).toLocaleDateString()}
                          </p>

                        </button>

                        <button
                          onClick={() =>
                            deleteChat(
                              chat.id
                            )
                          }
                          className="mr-2 rounded-lg p-1.5 text-black/20 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                        >
                          <Trash2
                            size={12}
                          />
                        </button>

                      </div>
                    )
                  )}

                </div>
              )}

            </div>

          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}