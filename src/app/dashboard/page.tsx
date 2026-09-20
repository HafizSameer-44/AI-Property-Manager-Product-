"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Building2,
  DoorOpen,
  Users,
  CreditCard,
  Wrench,
  Bot,
  Settings,
  Menu,
  Bell,
  Search,
  RefreshCw,
  Plus,
  ArrowUpRight,
  ChevronRight,
  AlertCircle,
  Clock,
  Home,
  ShieldCheck,
} from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import Sidebar from "@/components/sidebar"

const supabase = createClient()

type Property = {
  id: string
  name: string
  address: string | null
  city: string | null
  total_units: number | null
  created_at: string
}

type Maintenance = {
  id: string
  title: string
  description: string | null
  priority: string | null
  status: string | null
  created_at: string
}

type Notification = {
  id: string
  title: string
  message: string | null
  type: string | null
  read: boolean
  created_at: string
}

type Profile = {
  id: string
  full_name: string | null
  email: string | null
}

type Tenant = {
  id: string
  unit_id: string | null
  status: string | null
  created_at: string
}

type Unit = {
  id: string
  property_id: string
  status: string | null
}

type Payment = {
  amount: number | null
  paid_date: string | null
  status: string | null
  created_at: string
}

function getGreeting() {
  const hour = new Date().getHours()

  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"

  return "Good evening"
}

function getInitials(
  name: string | null | undefined
) {
  if (!name) return "U"

  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function formatTime(date: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date))
}

export default function DashboardPage() {
  const router = useRouter()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] =
    useState(false)

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")

  const [profile, setProfile] =
    useState<Profile | null>(null)

  const [properties, setProperties] =
    useState<Property[]>([])

  const [maintenance, setMaintenance] =
    useState<Maintenance[]>([])

  const [notifications, setNotifications] =
    useState<Notification[]>([])

  const [totalUnits, setTotalUnits] = useState(0)
  const [occupiedUnits, setOccupiedUnits] = useState(0)
  const [monthlyRevenue, setMonthlyRevenue] =
    useState(0)

  const unreadNotifications =
    notifications.filter(
      (item) => !item.read
    ).length

  const occupancy =
    totalUnits > 0
      ? Math.min(
          Math.round(
            (occupiedUnits / totalUnits) * 100
          ),
          100
        )
      : 0

  const loadDashboard = useCallback(
    async () => {
      try {
        setError("")

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError) {
          throw authError
        }

        if (!user) {
          router.replace("/login")
          return
        }

        /*
          PROFILE
        */

        const profilePromise =
          supabase
            .from("profiles")
            .select(
              "id, full_name, email"
            )
            .eq("id", user.id)
            .maybeSingle()

        /*
          PROPERTIES

          Correct schema:
          properties.user_id
          properties.total_units
        */

        const propertiesPromise =
          supabase
            .from("properties")
            .select(
              "id, name, address, city, total_units, created_at"
            )
            .eq("user_id", user.id)
            .order("created_at", {
              ascending: false,
            })

        /*
          TENANTS

          Correct schema:
          tenants.user_id
          tenants.unit_id
          tenants.status
        */

        const tenantsPromise =
          supabase
            .from("tenants")
            .select(
              "id, unit_id, status, created_at"
            )
            .eq("user_id", user.id)

        /*
          NOTIFICATIONS
        */

        const notificationsPromise =
          supabase
            .from("notifications")
            .select(
              "id, title, message, type, read, created_at"
            )
            .eq("user_id", user.id)
            .order("created_at", {
              ascending: false,
            })
            .limit(10)

        const [
          profileResult,
          propertiesResult,
          tenantsResult,
          notificationsResult,
        ] = await Promise.all([
          profilePromise,
          propertiesPromise,
          tenantsPromise,
          notificationsPromise,
        ])

        /*
          LOG ERRORS
        */

        if (profileResult.error) {
          console.error(
            "Profile:",
            profileResult.error
          )
        }

        if (propertiesResult.error) {
          console.error(
            "Properties:",
            propertiesResult.error
          )
        }

        if (tenantsResult.error) {
          console.error(
            "Tenants:",
            tenantsResult.error
          )
        }

        if (notificationsResult.error) {
          console.error(
            "Notifications:",
            notificationsResult.error
          )
        }

        /*
          SAFE DATA
        */

        const propertyData =
          (propertiesResult.data ||
            []) as Property[]

        const tenantData =
          (tenantsResult.data ||
            []) as Tenant[]

        const notificationData =
          (notificationsResult.data ||
            []) as Notification[]

        /*
          PROPERTY IDS
        */

        const propertyIds =
          propertyData.map(
            (property) => property.id
          )

        /*
          UNITS

          units DOES NOT have user_id.

          It belongs to properties through:
          units.property_id
        */

        let unitData: Unit[] = []

        if (propertyIds.length > 0) {
          const {
            data,
            error,
          } = await supabase
            .from("units")
            .select(
              "id, property_id, status"
            )
            .in(
              "property_id",
              propertyIds
            )

          if (error) {
            console.error(
              "Units:",
              error
            )
          } else {
            unitData =
              (data || []) as Unit[]
          }
        }

        /*
          PAYMENTS

          payments DOES NOT have user_id.

          It belongs to tenants through:
          payments.tenant_id
        */

        const tenantIds =
          tenantData.map(
            (tenant) => tenant.id
          )

        let paymentData: Payment[] = []

        if (tenantIds.length > 0) {
          const {
            data,
            error,
          } = await supabase
            .from("payments")
            .select(
              "amount, paid_date, status, created_at"
            )
            .in(
              "tenant_id",
              tenantIds
            )

          if (error) {
            console.error(
              "Payments:",
              error
            )
          } else {
            paymentData =
              (data || []) as Payment[]
          }
        }

        /*
          MAINTENANCE

          maintenance_requests DOES NOT have
          user_id.

          It belongs to properties through:
          maintenance_requests.property_id
        */

        let maintenanceData: Maintenance[] =
          []

        if (propertyIds.length > 0) {
          const {
            data,
            error,
          } = await supabase
            .from("maintenance_requests")
            .select(
              "id, title, description, priority, status, created_at"
            )
            .in(
              "property_id",
              propertyIds
            )
            .order("created_at", {
              ascending: false,
            })
            .limit(5)

          if (error) {
            console.error(
              "Maintenance:",
              error
            )
          } else {
            maintenanceData =
              (data || []) as Maintenance[]
          }
        }

        /*
          PROFILE
        */

        setProfile(
          (profileResult.data as Profile | null) ||
            {
              id: user.id,
              full_name:
                user.user_metadata
                  ?.full_name || null,
              email:
                user.email || null,
            }
        )

        /*
          DASHBOARD DATA
        */

        setProperties(propertyData)

        setMaintenance(
          maintenanceData
        )

        setNotifications(
          notificationData
        )

        /*
          TOTAL UNITS

          Count the actual units belonging
          to the user's properties.
        */

        const unitsCount =
          unitData.length

        /*
          OCCUPIED UNITS

          Count unique unit IDs belonging
          to active/current tenants.

          This prevents multiple tenant
          records for the same unit from
          inflating occupancy.
        */

        const occupiedUnitIds =
          new Set(
            tenantData
              .filter((tenant) => {
                if (!tenant.unit_id) {
                  return false
                }

                if (!tenant.status) {
                  return true
                }

                const status =
                  tenant.status.toLowerCase()

                return [
                  "active",
                  "current",
                  "occupied",
                  "approved",
                ].includes(status)
              })
              .map(
                (tenant) =>
                  tenant.unit_id
              )
          )

        const occupiedCount =
          occupiedUnitIds.size

        /*
          MONTHLY REVENUE

          Payments are connected through
          tenant_id.

          Use paid_date for revenue.
        */

        const now = new Date()

        const revenue =
          paymentData.reduce(
            (
              sum,
              payment
            ) => {
              if (!payment.paid_date) {
                return sum
              }

              const paymentDate =
                new Date(
                  payment.paid_date
                )

              const sameMonth =
                paymentDate.getMonth() ===
                  now.getMonth() &&
                paymentDate.getFullYear() ===
                  now.getFullYear()

              if (!sameMonth) {
                return sum
              }

              if (
                payment.status
              ) {
                const status =
                  payment.status.toLowerCase()

                if (
                  ![
                    "paid",
                    "completed",
                    "success",
                    "successful",
                  ].includes(
                    status
                  )
                ) {
                  return sum
                }
              }

              return (
                sum +
                Number(
                  payment.amount || 0
                )
              )
            },
            0
          )

        setTotalUnits(
          unitsCount
        )

        setOccupiedUnits(
          Math.min(
            occupiedCount,
            unitsCount
          )
        )

        setMonthlyRevenue(
          revenue
        )
      } catch (err) {
        console.error(
          "Dashboard error:",
          err
        )

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard."
        )
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [router]
  )

  /*
    LOAD ONCE
  */

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  async function handleRefresh() {
    setRefreshing(true)
    await loadDashboard()
  }

  async function markNotificationRead(
    id: string
  ) {
    const { error } =
      await supabase
        .from("notifications")
        .update({
          read: true,
        })
        .eq("id", id)

    if (error) {
      console.error(
        "Notification error:",
        error
      )
      return
    }

    setNotifications((current) =>
      current.map(
        (notification) =>
          notification.id === id
            ? {
                ...notification,
                read: true,
              }
            : notification
      )
    )
  }

  async function markAllNotificationsRead() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { error } =
      await supabase
        .from("notifications")
        .update({
          read: true,
        })
        .eq("user_id", user.id)
        .eq("read", false)

    if (error) {
      console.error(
        "Mark all read error:",
        error
      )
      return
    }

    setNotifications((current) =>
      current.map(
        (notification) => ({
          ...notification,
          read: true,
        })
      )
    )
  }

  async function handleLogout() {
    await supabase.auth.signOut()

    router.replace("/login")
    router.refresh()
  }

  const displayName =
    profile?.full_name ||
    profile?.email?.split("@")[0] ||
    "User"

  const recentActivity = [
    ...properties.map(
      (property) => ({
        id: `property-${property.id}`,
        title: "Property added",
        description:
          property.name,
        created_at:
          property.created_at,
        icon: Building2,
      })
    ),

    ...maintenance.map(
      (item) => ({
        id: `maintenance-${item.id}`,
        title:
          "Maintenance request",
        description:
          item.title,
        created_at:
          item.created_at,
        icon: Wrench,
      })
    ),
  ]
    .sort(
      (a, b) =>
        new Date(
          b.created_at
        ).getTime() -
        new Date(
          a.created_at
        ).getTime()
    )
    .slice(0, 6)

  return (
    <div className="min-h-screen bg-[#f7f8f6] text-[#111]">

      {/* SHARED SIDEBAR */}

      <Sidebar
        open={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
        
      
      />

      {/* MAIN */}

      <div className="lg:pl-[250px]">

        {/* TOP BAR */}

        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-black/10 bg-white/90 px-5 backdrop-blur-xl lg:px-8">

          <div className="flex items-center gap-3">

            <button
              onClick={() =>
                setSidebarOpen(true)
              }
              className="rounded-xl p-2 hover:bg-black/5 lg:hidden"
            >
              <Menu size={19} />
            </button>

            <div className="hidden items-center gap-2 rounded-xl border border-black/10 bg-[#f8f9f7] px-3 py-2 sm:flex">
              <Search
                size={14}
                className="text-black/30"
              />

              <input
                placeholder="Search..."
                className="w-[180px] bg-transparent text-xs outline-none placeholder:text-black/30"
              />
            </div>
          </div>

          <div className="flex items-center gap-1">

            {/* REFRESH */}

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="rounded-xl p-2.5 text-black/45 transition hover:bg-black/5 hover:text-black"
            >
              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />
            </button>

            {/* NOTIFICATIONS */}

            <div className="relative">

              <button
                onClick={() => {
                  setNotificationsOpen(
                    !notificationsOpen
                  )
                  setProfileOpen(false)
                }}
                className="relative rounded-xl p-2.5 text-black/45 hover:bg-black/5 hover:text-black"
              >
                <Bell size={18} />

                {unreadNotifications >
                  0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#173d25] px-1 text-[8px] font-bold text-white">
                    {unreadNotifications >
                    9
                      ? "9+"
                      : unreadNotifications}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                    }}
                    className="absolute right-0 top-12 w-[330px] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl"
                  >

                    <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">

                      <div>
                        <p className="text-sm font-semibold">
                          Notifications
                        </p>

                        <p className="mt-0.5 text-[9px] text-black/35">
                          {
                            unreadNotifications
                          }{" "}
                          unread
                        </p>
                      </div>

                      {unreadNotifications >
                        0 && (
                        <button
                          onClick={
                            markAllNotificationsRead
                          }
                          className="text-[10px] font-semibold text-[#173d25]"
                        >
                          Mark all read
                        </button>
                      )}

                    </div>

                    <div className="max-h-[350px] overflow-y-auto">

                      {notifications.length ===
                      0 ? (
                        <div className="px-5 py-10 text-center">

                          <Bell
                            size={20}
                            className="mx-auto mb-2 text-black/20"
                          />

                          <p className="text-xs font-medium">
                            No notifications
                          </p>

                          <p className="mt-1 text-[10px] text-black/35">
                            You're all caught
                            up.
                          </p>

                        </div>
                      ) : (
                        notifications.map(
                          (notification) => (
                            <button
                              key={
                                notification.id
                              }
                              onClick={() =>
                                markNotificationRead(
                                  notification.id
                                )
                              }
                              className={`flex w-full gap-3 border-b border-black/5 px-4 py-3 text-left hover:bg-black/[0.025] ${
                                !notification.read
                                  ? "bg-[#f4f8f4]"
                                  : ""
                              }`}
                            >

                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#edf5ee] text-[#173d25]">
                                {notification.type ===
                                "maintenance" ? (
                                  <Wrench
                                    size={13}
                                  />
                                ) : (
                                  <Bell
                                    size={13}
                                  />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">

                                <div className="flex items-start justify-between gap-2">

                                  <p className="text-xs font-semibold">
                                    {
                                      notification.title
                                    }
                                  </p>

                                  {!notification.read && (
                                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#173d25]" />
                                  )}

                                </div>

                                {notification.message && (
                                  <p className="mt-1 text-[10px] leading-4 text-black/40">
                                    {
                                      notification.message
                                    }
                                  </p>
                                )}

                                <p className="mt-1 text-[9px] text-black/25">
                                  {formatTime(
                                    notification.created_at
                                  )}
                                </p>

                              </div>

                            </button>
                          )
                        )
                      )}

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* PROFILE */}

            <div className="relative">

              <button
                onClick={() => {
                  setProfileOpen(
                    !profileOpen
                  )
                  setNotificationsOpen(
                    false
                  )
                }}
                className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-black/5"
              >

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#173d25] text-[9px] font-bold text-white">
                  {getInitials(
                    profile?.full_name
                  )}
                </div>

                <ChevronRight
                  size={13}
                  className={`hidden text-black/30 transition sm:block ${
                    profileOpen
                      ? "rotate-90"
                      : ""
                  }`}
                />

              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                    }}
                    className="absolute right-0 top-12 w-[220px] overflow-hidden rounded-2xl border border-black/10 bg-white p-2 shadow-2xl"
                  >

                    <div className="border-b border-black/10 px-3 py-3">

                      <p className="truncate text-xs font-semibold">
                        {displayName}
                      </p>

                      <p className="truncate text-[10px] text-black/35">
                        {profile?.email}
                      </p>

                    </div>

                    <Link
                      href="/dashboard/profile"
                      onClick={() =>
                        setProfileOpen(
                          false
                        )
                      }
                      className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs text-black/60 hover:bg-black/5"
                    >
                      <Users size={15} />
                      Profile
                    </Link>

                    <Link
                      href="/dashboard/settings"
                      onClick={() =>
                        setProfileOpen(
                          false
                        )
                      }
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs text-black/60 hover:bg-black/5"
                    >
                      <Settings size={15} />
                      Settings
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs text-red-600 hover:bg-red-50"
                    >
                      <LogOutIcon />
                      Sign out
                    </button>

                  </motion.div>
                )}
              </AnimatePresence>

            </div>

          </div>
        </header>

        {/* MAIN CONTENT */}

        <main className="min-h-[calc(100vh-76px)] overflow-y-auto">

          <div className="mx-auto max-w-[1500px] px-5 py-7 lg:px-8 lg:py-9">

            {/* ERROR */}

            {error && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700"
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </motion.div>
            )}

            {/* HEADER */}

            <motion.div
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.5,
              }}
              className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end"
            >

              <div>

                <div className="mb-2 flex items-center gap-2 text-xs font-medium text-[#173d25]">
                  <ShieldCheck size={14} />
                  Property management workspace
                </div>

                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  {getGreeting()},{" "}
                  {displayName}
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-black/45">
                  Manage your properties,
                  tenants, payments and
                  maintenance from one
                  intelligent workspace.
                </p>

              </div>

              <Link
                href="/properties"
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#173d25] px-4 py-3 text-xs font-semibold text-white shadow-lg shadow-[#173d25]/10 transition hover:-translate-y-0.5"
              >
                <Plus size={15} />
                Add Property
              </Link>

            </motion.div>

            {/* STATS */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              {[
                {
                  title: "Properties",
                  value:
                    properties.length,
                  icon: Building2,
                  href: "/properties",
                },
                {
                  title: "Total Units",
                  value: totalUnits,
                  icon: DoorOpen,
                  href: "/dashboard/units",
                },
                {
                  title: "Occupancy",
                  value: `${occupancy}%`,
                  icon: Home,
                  href: "/dashboard/tenants",
                },
                {
                  title: "Monthly Revenue",
                  value: `$${monthlyRevenue.toLocaleString()}`,
                  icon: CreditCard,
                  href: "/dashboard/payments",
                },
              ].map(
                (item, index) => {
                  const Icon = item.icon

                  return (
                    <motion.div
                      key={item.title}
                      initial={{
                        opacity: 0,
                        y: 20,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay:
                          index * 0.06,
                      }}
                    >

                      <Link
                        href={item.href}
                        className="group block rounded-2xl border border-black/10 bg-white p-5 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-black/[0.04]"
                      >

                        <div className="mb-5 flex items-center justify-between">

                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf5ee] text-[#173d25]">
                            <Icon size={17} />
                          </div>

                          <ArrowUpRight
                            size={15}
                            className="text-black/20 group-hover:text-black/60"
                          />

                        </div>

                        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-black/35">
                          {item.title}
                        </p>

                        <p className="mt-2 text-2xl font-semibold tracking-tight">
                          {loading
                            ? "..."
                            : item.value}
                        </p>

                      </Link>

                    </motion.div>
                  )
                }
              )}

            </div>

            {/* PROPERTIES + OCCUPANCY */}

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">

              {/* PROPERTIES */}

              <motion.section
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.2,
                }}
                className="rounded-2xl border border-black/10 bg-white"
              >

                <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">

                  <div>
                    <h2 className="text-sm font-semibold">
                      Your Properties
                    </h2>

                    <p className="mt-1 text-[10px] text-black/40">
                      Recently added properties
                    </p>
                  </div>

                  <Link
                    href="/properties"
                    className="text-[10px] font-semibold text-[#173d25]"
                  >
                    View all
                  </Link>

                </div>

                <div className="p-5">

                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(
                        (item) => (
                          <div
                            key={item}
                            className="h-16 animate-pulse rounded-xl bg-black/[0.04]"
                          />
                        )
                      )}
                    </div>
                  ) : properties.length ===
                    0 ? (
                    <div className="rounded-2xl border border-dashed border-black/10 px-6 py-12 text-center">

                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf5ee] text-[#173d25]">
                        <Building2 size={21} />
                      </div>

                      <h3 className="text-sm font-semibold">
                        No properties yet
                      </h3>

                      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-black/40">
                        Add your first property
                        and it will appear here.
                      </p>

                      <Link
                        href="/properties"
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#173d25] px-4 py-2.5 text-xs font-semibold text-white"
                      >
                        <Plus size={14} />
                        Add Property
                      </Link>

                    </div>
                  ) : (
                    <div className="space-y-3">

                      {properties
                        .slice(0, 5)
                        .map(
                          (
                            property,
                            index
                          ) => (
                            <motion.div
                              key={
                                property.id
                              }
                              initial={{
                                opacity: 0,
                                x: -10,
                              }}
                              animate={{
                                opacity: 1,
                                x: 0,
                              }}
                              transition={{
                                delay:
                                  index *
                                  0.05,
                              }}
                            >

                              <Link
                                href={`/dashboard/properties/${property.id}`}
                                className="group flex items-center gap-4 rounded-xl border border-black/5 bg-[#fafbf9] p-3 transition hover:border-black/10 hover:bg-white hover:shadow-sm"
                              >

                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#173d25] text-white">
                                  <Building2 size={18} />
                                </div>

                                <div className="min-w-0 flex-1">

                                  <p className="truncate text-xs font-semibold">
                                    {
                                      property.name
                                    }
                                  </p>

                                  <p className="mt-1 truncate text-[10px] text-black/40">
                                    {[
                                      property.address,
                                      property.city,
                                    ]
                                      .filter(
                                        Boolean
                                      )
                                      .join(
                                        ", "
                                      ) ||
                                      "No address added"}
                                  </p>

                                </div>

                                <div className="text-right">

                                  <p className="text-xs font-semibold">
                                    {property.total_units ??
                                      0}
                                  </p>

                                  <p className="text-[9px] text-black/35">
                                    units
                                  </p>

                                </div>

                                <ChevronRight
                                  size={15}
                                  className="text-black/20 group-hover:text-black/60"
                                />

                              </Link>

                            </motion.div>
                          )
                        )}

                    </div>
                  )}

                </div>

              </motion.section>

              {/* OCCUPANCY */}

              <motion.section
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.25,
                }}
                className="rounded-2xl border border-black/10 bg-white p-5"
              >

                <div className="flex items-center justify-between">

                  <div>
                    <h2 className="text-sm font-semibold">
                      Occupancy
                    </h2>

                    <p className="mt-1 text-[10px] text-black/40">
                      Current occupancy
                    </p>
                  </div>

                  <Link
                    href="/dashboard/tenants"
                    className="text-[10px] font-semibold text-[#173d25]"
                  >
                    Manage
                  </Link>

                </div>

                <div className="flex flex-col items-center justify-center py-8">

                  <div className="relative flex h-44 w-44 items-center justify-center rounded-full border-[12px] border-[#edf0ec]">

                    <motion.div
                      initial={{
                        rotate: -90,
                        scale: 0.8,
                        opacity: 0,
                      }}
                      animate={{
                        rotate: 0,
                        scale: 1,
                        opacity: 1,
                      }}
                      transition={{
                        duration: 0.8,
                      }}
                      className="absolute inset-[-12px] rounded-full border-[12px] border-transparent border-t-[#173d25]"
                    />

                    <div className="text-center">

                      <p className="text-4xl font-semibold tracking-tight">
                        {loading
                          ? "..."
                          : `${occupancy}%`}
                      </p>

                      <p className="mt-1 text-[10px] text-black/35">
                        occupancy
                      </p>

                    </div>

                  </div>

                  <div className="mt-7 grid w-full grid-cols-2 gap-3">

                    <div className="rounded-xl bg-[#f7f8f6] p-3 text-center">

                      <p className="text-lg font-semibold">
                        {occupiedUnits}
                      </p>

                      <p className="text-[9px] uppercase tracking-wider text-black/35">
                        Occupied
                      </p>

                    </div>

                    <div className="rounded-xl bg-[#f7f8f6] p-3 text-center">

                      <p className="text-lg font-semibold">
                        {Math.max(
                          totalUnits -
                            occupiedUnits,
                          0
                        )}
                      </p>

                      <p className="text-[9px] uppercase tracking-wider text-black/35">
                        Available
                      </p>

                    </div>

                  </div>

                </div>

              </motion.section>

            </div>

            {/* REVENUE + MAINTENANCE */}

            <div className="mt-6 grid gap-6 xl:grid-cols-2">

              {/* REVENUE */}

              <motion.section
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.3,
                }}
                className="rounded-2xl border border-black/10 bg-white"
              >

                <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">

                  <div>
                    <h2 className="text-sm font-semibold">
                      Monthly Revenue
                    </h2>

                    <p className="mt-1 text-[10px] text-black/40">
                      Payments received this month
                    </p>
                  </div>

                  <Link
                    href="/dashboard/payments"
                    className="text-[10px] font-semibold text-[#173d25]"
                  >
                    Payments
                  </Link>

                </div>

                <div className="p-5">

                  <div className="flex items-end justify-between">

                    <div>

                      <p className="text-3xl font-semibold tracking-tight">
                        $
                        {monthlyRevenue.toLocaleString()}
                      </p>

                      <p className="mt-1 text-[10px] text-black/35">
                        Current month
                      </p>

                    </div>

                    <div className="rounded-lg bg-[#edf5ee] px-2 py-1 text-[9px] font-semibold text-[#173d25]">
                      Live data
                    </div>

                  </div>

                  {monthlyRevenue ===
                  0 ? (
                    <div className="mt-6 flex h-[130px] items-center justify-center rounded-xl border border-dashed border-black/10 bg-[#fafbf9]">

                      <div className="text-center">

                        <CreditCard
                          size={20}
                          className="mx-auto mb-2 text-black/20"
                        />

                        <p className="text-xs font-medium">
                          No payments yet
                        </p>

                        <p className="mt-1 text-[10px] text-black/35">
                          Revenue will appear
                          when payments are
                          recorded.
                        </p>

                      </div>

                    </div>
                  ) : (
                    <div className="mt-6 flex h-[130px] items-end gap-2 rounded-xl bg-[#fafbf9] px-4 py-4">

                      {Array.from({
                        length: 12,
                      }).map(
                        (_, index) => (
                          <motion.div
                            key={index}
                            initial={{
                              height: 0,
                            }}
                            animate={{
                              height: `${
                                30 +
                                ((index *
                                  19) %
                                  60)
                              }%`,
                            }}
                            transition={{
                              delay:
                                index *
                                0.04,
                            }}
                            className="flex-1 rounded-t-md bg-[#173d25]/20"
                          />
                        )
                      )}

                    </div>
                  )}

                </div>

              </motion.section>

              {/* MAINTENANCE */}

              <motion.section
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.35,
                }}
                className="rounded-2xl border border-black/10 bg-white"
              >

                <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">

                  <div>
                    <h2 className="text-sm font-semibold">
                      Maintenance
                    </h2>

                    <p className="mt-1 text-[10px] text-black/40">
                      Recent maintenance requests
                    </p>
                  </div>

                  <Link
                    href="/dashboard/maintenance"
                    className="text-[10px] font-semibold text-[#173d25]"
                  >
                    View all
                  </Link>

                </div>

                <div className="p-5">

                  {maintenance.length ===
                  0 ? (
                    <div className="flex min-h-[190px] items-center justify-center rounded-xl border border-dashed border-black/10 bg-[#fafbf9]">

                      <div className="text-center">

                        <Wrench
                          size={20}
                          className="mx-auto mb-2 text-black/20"
                        />

                        <p className="text-xs font-medium">
                          No maintenance requests
                        </p>

                        <p className="mt-1 text-[10px] text-black/35">
                          New requests will
                          appear here.
                        </p>

                      </div>

                    </div>
                  ) : (
                    <div className="space-y-2">

                      {maintenance.map(
                        (item) => (
                          <Link
                            key={item.id}
                            href={`/dashboard/maintenance/${item.id}`}
                            className="flex items-center gap-3 rounded-xl border border-black/5 p-3 transition hover:bg-[#fafbf9]"
                          >

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f2f3f0]">
                              <Wrench
                                size={15}
                                className="text-black/50"
                              />
                            </div>

                            <div className="min-w-0 flex-1">

                              <p className="truncate text-xs font-semibold">
                                {
                                  item.title
                                }
                              </p>

                              <p className="mt-1 truncate text-[9px] text-black/35">
                                {item.description ||
                                  "No description"}
                              </p>

                            </div>

                            <span className="rounded-full bg-[#f2f3f0] px-2 py-1 text-[8px] font-semibold uppercase text-black/50">
                              {item.status ||
                                "Pending"}
                            </span>

                          </Link>
                        )
                      )}

                    </div>
                  )}

                </div>

              </motion.section>

            </div>

            {/* ACTIVITY + QUICK ACTIONS */}

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">

              {/* ACTIVITY */}

              <motion.section
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.4,
                }}
                className="rounded-2xl border border-black/10 bg-white"
              >

                <div className="border-b border-black/10 px-5 py-4">

                  <h2 className="text-sm font-semibold">
                    Recent Activity
                  </h2>

                  <p className="mt-1 text-[10px] text-black/40">
                    Latest workspace activity
                  </p>

                </div>

                <div className="p-5">

                  {recentActivity.length ===
                  0 ? (
                    <div className="py-10 text-center">

                      <Clock
                        size={21}
                        className="mx-auto mb-2 text-black/20"
                      />

                      <p className="text-xs font-medium">
                        No recent activity
                      </p>

                      <p className="mt-1 text-[10px] text-black/35">
                        Activity will appear as
                        you use the platform.
                      </p>

                    </div>
                  ) : (
                    <div className="space-y-4">

                      {recentActivity.map(
                        (
                          activity,
                          index
                        ) => {
                          const Icon =
                            activity.icon

                          return (
                            <motion.div
                              key={
                                activity.id
                              }
                              initial={{
                                opacity: 0,
                                x: -10,
                              }}
                              animate={{
                                opacity: 1,
                                x: 0,
                              }}
                              transition={{
                                delay:
                                  index *
                                  0.05,
                              }}
                              className="flex gap-3"
                            >

                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf5ee] text-[#173d25]">
                                <Icon size={14} />
                              </div>

                              <div className="min-w-0 flex-1">

                                <p className="text-xs font-semibold">
                                  {
                                    activity.title
                                  }
                                </p>

                                <p className="mt-1 truncate text-[10px] text-black/40">
                                  {
                                    activity.description
                                  }
                                </p>

                              </div>

                              <span className="text-[9px] text-black/30">
                                {formatTime(
                                  activity.created_at
                                )}
                              </span>

                            </motion.div>
                          )
                        }
                      )}

                    </div>
                  )}

                </div>

              </motion.section>

              {/* QUICK ACTIONS */}

              <motion.section
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.45,
                }}
                className="rounded-2xl border border-black/10 bg-white p-5"
              >

                <div className="mb-5">

                  <h2 className="text-sm font-semibold">
                    Quick Actions
                  </h2>

                  <p className="mt-1 text-[10px] text-black/40">
                    Jump into your workflow
                  </p>

                </div>

                <div className="grid grid-cols-2 gap-2">

                  {[
                    {
                      label: "Property",
                      href: "/properties",
                      icon: Building2,
                    },
                    {
                      label: "Tenant",
                      href: "/dashboard/tenants",
                      icon: Users,
                    },
                    {
                      label: "Payment",
                      href: "/dashboard/payments",
                      icon: CreditCard,
                    },
                    {
                      label: "Maintenance",
                      href: "/dashboard/maintenance",
                      icon: Wrench,
                    },
                  ].map(
                    (action) => {
                      const Icon =
                        action.icon

                      return (
                        <Link
                          key={
                            action.label
                          }
                          href={
                            action.href
                          }
                          className="group rounded-xl border border-black/5 bg-[#fafbf9] p-4 transition hover:border-black/10 hover:bg-white hover:shadow-sm"
                        >

                          <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf5ee] text-[#173d25]">
                            <Icon size={15} />
                          </div>

                          <p className="text-[11px] font-semibold">
                            Add{" "}
                            {
                              action.label
                            }
                          </p>

                          <div className="mt-2 flex items-center gap-1 text-[9px] text-black/35 group-hover:text-[#173d25]">
                            Open
                            <ArrowUpRight
                              size={11}
                            />
                          </div>

                        </Link>
                      )
                    }
                  )}

                </div>

                {/* AI */}

                <Link
                  href="/dashboard/assistant"
                  className="mt-3 flex items-center gap-3 rounded-xl bg-[#173d25] p-4 text-white transition hover:-translate-y-0.5"
                >

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                    <Bot size={17} />
                  </div>

                  <div className="flex-1">

                    <p className="text-xs font-semibold">
                      Ask AI Assistant
                    </p>

                    <p className="mt-1 text-[9px] text-white/50">
                      Get help managing your
                      properties
                    </p>

                  </div>

                  <ArrowUpRight size={15} />

                </Link>

              </motion.section>

            </div>

            {/* FOOTER */}

            <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-black/10 py-5 text-[9px] text-black/30 sm:flex-row">

              <p>
                ©{" "}
                {new Date().getFullYear()}{" "}
                Greek Root AI. All rights
                reserved.
              </p>

              <div className="flex gap-4">

                <span>
                  Secure workspace
                </span>

                <span>
                  AI-powered management
                </span>

              </div>

            </footer>

          </div>

        </main>

      </div>

    </div>
  )
}

/*
  Small helper so we don't need to import
  LogOut separately again.
*/

function LogOutIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line
        x1="21"
        y1="12"
        x2="9"
        y2="12"
      />
    </svg>
  )
}