"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  Building2,
  DoorOpen,
  Users,
  FileText,
  CreditCard,
  Wrench,
  Bot,
  MessageSquare,
  FolderOpen,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  X,
} from "lucide-react"

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Properties",
    href: "/properties",
    icon: Building2,
  },
  {
    label: "Units",
    href: "/dashboard/units",
    icon: DoorOpen,
  },
  {
    label: "Tenants",
    href: "/dashboard/tenants",
    icon: Users,
  },
  {
    label: "Leases",
    href: "/dashboard/leases",
    icon: FileText,
  },
  {
    label: "Payments",
    href: "/dashboard/payments",
    icon: CreditCard,
  },
  {
    label: "Maintenance",
    href: "/dashboard/maintenance",
    icon: Wrench,
  },
  {
    label: "AI Assistant",
    href: "/dashboard/assistant",
    icon: Bot,
  },
  {
    label: "Messages",
    href: "/dashboard/messages",
    icon: MessageSquare,
  },
  {
    label: "Documents",
    href: "/dashboard/documents",
    icon: FolderOpen,
  },
  {
    label: "Reports",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

type SidebarProps = {
  open: boolean
  onClose: () => void
  displayName: string
  email?: string | null
  initials: string
  onLogout: () => void
}

export default function Sidebar({
  open,
  onClose,
  displayName,
  email,
  initials,
  onLogout,
}: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* MOBILE OVERLAY */}

      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[250px] flex-col border-r border-black/10 bg-white transition-transform duration-300 ${
          open
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* LOGO */}

        <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-black/10 px-5">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#173d25] text-white">
              <Bot size={19} />
            </div>

            <div>
              <p className="text-[15px] font-bold tracking-tight">
                Greek Root AI
              </p>

              <p className="text-[9px] uppercase tracking-[0.15em] text-black/35">
                Property Manager
              </p>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-black/5 lg:hidden"
          >
            <X size={17} />
          </button>
        </div>

        {/* NAVIGATION */}

        <div className="flex-1 overflow-hidden px-3 py-3">
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon

              const active =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`relative flex items-center gap-3 rounded-xl px-3 py-[8px] text-[12px] font-medium transition ${
                    active
                      ? "bg-[#edf5ee] text-[#173d25]"
                      : "text-black/55 hover:bg-black/[0.04] hover:text-black"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 h-5 w-[3px] rounded-r-full bg-[#173d25]"
                    />
                  )}

                  <Icon size={16} />

                  <span>{item.label}</span>

                  {active && (
                    <ChevronRight
                      size={13}
                      className="ml-auto"
                    />
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        {/* USER */}

        <div className="shrink-0 border-t border-black/10 p-3">
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-[#f7f8f6] px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#173d25] text-[10px] font-bold text-white">
              {initials}
            </div>

            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold">
                {displayName}
              </p>

              <p className="truncate text-[9px] text-black/35">
                {email || "Account"}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[11px] font-medium text-black/50 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}