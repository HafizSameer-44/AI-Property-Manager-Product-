"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
  Wallet,
  Settings,
  ChevronRight,
  X,
} from "lucide-react"

type NavItem = {
  label: string
  href: string
  icon: React.ElementType
  ai?: boolean
}

type NavSection = {
  label: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    label: "MAIN",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "AI Assistant",
        href: "/dashboard/assistant",
        icon: Bot,
        ai: true,
      },
    ],
  },

  {
    label: "PROPERTY",
    items: [
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
    ],
  },

  {
    label: "FINANCIAL",
    items: [
      {
        label: "Payments",
        href: "/dashboard/payments",
        icon: CreditCard,
      },
      {
        label: "Expenses",
        href: "/dashboard/expenses",
        icon: Wallet,
      },
    ],
  },

  {
    label: "OPERATIONS",
    items: [
      {
        label: "Maintenance",
        href: "/dashboard/maintenance",
        icon: Wrench,
      },
    ],
  },
]

type SidebarProps = {
  open: boolean
  onClose: () => void
}

export default function Sidebar({
  open,
  onClose,
}: SidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard"
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    )
  }

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-[100dvh] w-[250px] flex-col overflow-hidden border-r border-black/[0.08] bg-white transition-transform duration-300 ease-out ${
          open
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* ================= HEADER ================= */}
        <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-black/[0.08] px-4">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-3"
          >
            {/* Logo */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#173d25] text-white shadow-sm">
              <Bot
                size={18}
                strokeWidth={2}
              />
            </div>

            {/* Brand */}
            <div className="min-w-0 leading-none">
              <p className="truncate text-[14px] font-bold tracking-[-0.02em] text-black">
                Greek Root AI
              </p>

              <p className="mt-1 text-[8px] font-semibold uppercase tracking-[0.16em] text-black/35">
                Property Manager
              </p>
            </div>
          </Link>

          {/* Mobile Close */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-black/45 transition hover:bg-black/5 hover:text-black lg:hidden"
          >
            <X size={17} />
          </button>
        </div>

        {/* ================= NAVIGATION ================= */}
        <nav className="flex-1 overflow-hidden px-3 py-4">
          <div className="space-y-4">
            {navSections.map((section) => (
              <div key={section.label}>
                {/* Section Label */}
                <div className="mb-1.5 px-3">
                  <p className="text-[7px] font-bold uppercase tracking-[0.18em] text-black/30">
                    {section.label}
                  </p>
                </div>

                {/* Section Items */}
                <div className="space-y-[2px]">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.href)

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={`group relative flex h-[35px] items-center gap-3 rounded-[10px] px-3 text-[11px] font-medium transition-all duration-200 ${
                          active
                            ? "bg-[#edf5ee] text-[#173d25]"
                            : "text-black/55 hover:bg-black/[0.035] hover:text-black"
                        }`}
                      >
                        {/* Active Indicator */}
                        {active && (
                          <motion.div
                            layoutId="sidebar-active"
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 35,
                            }}
                            className="absolute left-0 top-1/2 h-[17px] w-[3px] -translate-y-1/2 rounded-r-full bg-[#173d25]"
                          />
                        )}

                        {/* Icon */}
                        <Icon
                          size={15}
                          strokeWidth={
                            active ? 2.2 : 1.9
                          }
                          className={
                            active
                              ? "text-[#173d25]"
                              : "text-black/45 transition-colors group-hover:text-black/70"
                          }
                        />

                        {/* Label */}
                        <span className="truncate">
                          {item.label}
                        </span>

                        {/* AI Badge */}
                        {item.ai && !active && (
                          <span className="ml-auto rounded-md bg-[#edf5ee] px-1.5 py-[2px] text-[7px] font-bold uppercase tracking-wide text-[#173d25]">
                            AI
                          </span>
                        )}

                        {/* Active Arrow */}
                        {active && (
                          <ChevronRight
                            size={12}
                            strokeWidth={2}
                            className="ml-auto text-[#173d25]/60"
                          />
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* ================= SETTINGS ================= */}
        <div className="shrink-0 border-t border-black/[0.08] bg-white px-3 py-4">
          {(() => {
            const active = isActive(
              "/dashboard/settings"
            )

            return (
              <Link
                href="/dashboard/settings"
                onClick={onClose}
                className={`group relative flex h-[35px] items-center gap-3 rounded-[10px] px-3 text-[11px] font-medium transition-all duration-200 ${
                  active
                    ? "bg-[#edf5ee] text-[#173d25]"
                    : "text-black/55 hover:bg-black/[0.035] hover:text-black"
                }`}
              >
                {/* Active Indicator */}
                {active && (
                  <motion.div
                    layoutId="sidebar-settings-active"
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 35,
                    }}
                    className="absolute left-0 top-1/2 h-[17px] w-[3px] -translate-y-1/2 rounded-r-full bg-[#173d25]"
                  />
                )}

                {/* Settings Icon */}
                <Settings
                  size={15}
                  strokeWidth={
                    active ? 2.2 : 1.9
                  }
                  className={
                    active
                      ? "text-[#173d25]"
                      : "text-black/45 transition-colors group-hover:text-black/70"
                  }
                />

                {/* Label */}
                <span>Settings</span>

                {/* Active Arrow */}
                {active && (
                  <ChevronRight
                    size={12}
                    strokeWidth={2}
                    className="ml-auto text-[#173d25]/60"
                  />
                )}
              </Link>
            )
          })()}
        </div>
      </aside>
    </>
  )
}