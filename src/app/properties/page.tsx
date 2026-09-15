"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import {
  AlertCircle,
  ArrowUpRight,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  Globe2,
  Home,
  Loader2,
  MapPin,
  Menu,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import Sidebar from "@/components/sidebar"

const supabase = createClient()

type Property = {
  id: string
  user_id: string
  name: string
  property_type: string | null
  address: string | null
  city: string | null
  country: string | null
  total_units: number | null
  status: string | null
  created_at: string
}

type PropertyForm = {
  name: string
  property_type: string
  address: string
  city: string
  country: string
  total_units: string
  status: string
}

type Profile = {
  id: string
  full_name: string | null
  email: string | null
}

const PROPERTY_TYPES = [
  "Apartment",
  "House",
  "Villa",
  "Commercial",
  "Office",
  "Building",
  "Warehouse",
  "Other",
]

const STATUS_OPTIONS = [
  "Active",
  "Inactive",
]

const EMPTY_FORM: PropertyForm = {
  name: "",
  property_type: "Apartment",
  address: "",
  city: "",
  country: "",
  total_units: "",
  status: "Active",
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

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

export default function PropertiesPage() {
  const router = useRouter()

  const [sidebarOpen, setSidebarOpen] =
    useState(false)

  const [profileOpen, setProfileOpen] =
    useState(false)

  const [profile, setProfile] =
    useState<Profile | null>(null)

  const [properties, setProperties] =
    useState<Property[]>([])

  const [loading, setLoading] =
    useState(true)

  const [refreshing, setRefreshing] =
    useState(false)

  const [pageError, setPageError] =
    useState("")

  const [search, setSearch] =
    useState("")

  const [statusFilter, setStatusFilter] =
    useState("All")

  const [typeFilter, setTypeFilter] =
    useState("All")

  const [filterOpen, setFilterOpen] =
    useState(false)

  const [showModal, setShowModal] =
    useState(false)

  const [editingProperty, setEditingProperty] =
    useState<Property | null>(null)

  const [form, setForm] =
    useState<PropertyForm>(
      EMPTY_FORM
    )

  const [saving, setSaving] =
    useState(false)

  const [deletingId, setDeletingId] =
    useState<string | null>(null)

  const [successMessage, setSuccessMessage] =
    useState("")

  /*
   * LOAD PROFILE + PROPERTIES
   */

  const loadProperties = useCallback(
    async () => {
      try {
        setPageError("")

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

        const [
          profileResult,
          propertiesResult,
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select(
              "id, full_name, email"
            )
            .eq("id", user.id)
            .maybeSingle(),

          supabase
            .from("properties")
            .select(
              `
                id,
                user_id,
                name,
                property_type,
                address,
                city,
                country,
                total_units,
                status,
                created_at
              `
            )
            .eq("user_id", user.id)
            .order("created_at", {
              ascending: false,
            }),
        ])

        if (profileResult.error) {
          console.error(
            "Profile:",
            profileResult.error
          )
        }

        if (propertiesResult.error) {
          throw propertiesResult.error
        }

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

        setProperties(
          (propertiesResult.data ||
            []) as Property[]
        )
      } catch (error) {
        console.error(
          "Properties page error:",
          error
        )

        setPageError(
          error instanceof Error
            ? error.message
            : "Unable to load properties."
        )
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [router]
  )

  useEffect(() => {
    loadProperties()
  }, [loadProperties])

  /*
   * REFRESH
   */

  async function handleRefresh() {
    setRefreshing(true)
    await loadProperties()
  }

  /*
   * LOGOUT
   */

  async function handleLogout() {
    await supabase.auth.signOut()

    router.replace("/login")
    router.refresh()
  }

  /*
   * OPEN ADD MODAL
   */

  function openAddModal() {
    setEditingProperty(null)
    setForm(EMPTY_FORM)
    setPageError("")
    setSuccessMessage("")
    setShowModal(true)
  }

  /*
   * OPEN EDIT MODAL
   */

  function openEditModal(
    property: Property
  ) {
    setEditingProperty(property)

    setForm({
      name: property.name || "",
      property_type:
        property.property_type ||
        "Apartment",
      address:
        property.address || "",
      city:
        property.city || "",
      country:
        property.country || "",
      total_units:
        property.total_units !== null
          ? String(property.total_units)
          : "",
      status:
        property.status ||
        "Active",
    })

    setPageError("")
    setSuccessMessage("")
    setShowModal(true)
  }

  /*
   * CLOSE MODAL
   */

  function closeModal() {
    if (saving) return

    setShowModal(false)
    setEditingProperty(null)
    setForm(EMPTY_FORM)
  }

  /*
   * FORM CHANGE
   */

  function updateForm(
    field: keyof PropertyForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  /*
   * SAVE PROPERTY
   */

  async function handleSaveProperty(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (!form.name.trim()) {
      setPageError(
        "Property name is required."
      )
      return
    }

    const totalUnits =
      form.total_units.trim() === ""
        ? 0
        : Number(form.total_units)

    if (
      !Number.isInteger(totalUnits) ||
      totalUnits < 0
    ) {
      setPageError(
        "Total units must be a valid number."
      )
      return
    }

    try {
      setSaving(true)
      setPageError("")
      setSuccessMessage("")

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

      const propertyPayload = {
        name: form.name.trim(),
        property_type:
          form.property_type || null,
        address:
          form.address.trim() || null,
        city:
          form.city.trim() || null,
        country:
          form.country.trim() || null,
        total_units: totalUnits,
        status:
          form.status || "Active",
      }

      /*
       * EDIT
       */

      if (editingProperty) {
        const {
          data,
          error,
        } = await supabase
          .from("properties")
          .update(propertyPayload)
          .eq(
            "id",
            editingProperty.id
          )
          .eq(
            "user_id",
            user.id
          )
          .select(
            `
              id,
              user_id,
              name,
              property_type,
              address,
              city,
              country,
              total_units,
              status,
              created_at
            `
          )
          .single()

        if (error) {
          throw error
        }

        setProperties(
          (current) =>
            current.map((property) =>
              property.id ===
              editingProperty.id
                ? (data as Property)
                : property
            )
        )

        setSuccessMessage(
          "Property updated successfully."
        )
      }

      /*
       * CREATE
       */

      else {
        const {
          data,
          error,
        } = await supabase
          .from("properties")
          .insert({
            user_id: user.id,
            ...propertyPayload,
          })
          .select(
            `
              id,
              user_id,
              name,
              property_type,
              address,
              city,
              country,
              total_units,
              status,
              created_at
            `
          )
          .single()

        if (error) {
          throw error
        }

        setProperties(
          (current) => [
            data as Property,
            ...current,
          ]
        )

        setSuccessMessage(
          "Property created successfully."
        )
      }

      setShowModal(false)
      setEditingProperty(null)
      setForm(EMPTY_FORM)
    } catch (error) {
      console.error(
        "Save property error:",
        error
      )

      const errorCode =
        typeof error === "object" &&
        error !== null &&
        "code" in error
          ? String((error as { code?: unknown }).code)
          : ""

      const errorMessage =
        typeof error === "object" &&
        error !== null &&
        "message" in error
          ? String((error as { message?: unknown }).message)
          : error instanceof Error
            ? error.message
            : "Unable to save property."

      setPageError(
        errorCode === "42501"
          ? "Property could not be saved because Supabase Row Level Security is blocking this user. Add the properties INSERT policy in Supabase SQL Editor."
          : errorMessage
      )
    } finally {
      setSaving(false)
    }
  }

  /*
   * DELETE PROPERTY
   */

  async function handleDeleteProperty(
    property: Property
  ) {
    const confirmed = window.confirm(
      `Delete "${property.name}"? This action cannot be undone.`
    )

    if (!confirmed) {
      return
    }

    try {
      setDeletingId(property.id)
      setPageError("")
      setSuccessMessage("")

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

      const { error } =
        await supabase
          .from("properties")
          .delete()
          .eq(
            "id",
            property.id
          )
          .eq(
            "user_id",
            user.id
          )

      if (error) {
        throw error
      }

      setProperties(
        (current) =>
          current.filter(
            (item) =>
              item.id !== property.id
          )
      )

      setSuccessMessage(
        "Property deleted successfully."
      )
    } catch (error) {
      console.error(
        "Delete property error:",
        error
      )

      setPageError(
        error instanceof Error
          ? error.message
          : "Unable to delete property."
      )
    } finally {
      setDeletingId(null)
    }
  }

  /*
   * FILTER PROPERTIES
   */

  const filteredProperties =
    useMemo(() => {
      const query =
        search.trim().toLowerCase()

      return properties.filter(
        (property) => {
          const searchableText =
            [
              property.name,
              property.property_type,
              property.address,
              property.city,
              property.country,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()

          const matchesSearch =
            !query ||
            searchableText.includes(
              query
            )

          const matchesStatus =
            statusFilter === "All" ||
            (property.status ||
              "Active").toLowerCase() ===
              statusFilter.toLowerCase()

          const matchesType =
            typeFilter === "All" ||
            (property.property_type ||
              "").toLowerCase() ===
              typeFilter.toLowerCase()

          return (
            matchesSearch &&
            matchesStatus &&
            matchesType
          )
        }
      )
    }, [
      properties,
      search,
      statusFilter,
      typeFilter,
    ])

  /*
   * TOTAL UNITS
   */

  const totalUnits =
    properties.reduce(
      (sum, property) =>
        sum +
        Number(
          property.total_units || 0
        ),
      0
    )

  /*
   * ACTIVE PROPERTIES
   */

  const activeProperties =
    properties.filter(
      (property) =>
        !property.status ||
        property.status.toLowerCase() ===
          "active"
    ).length

  /*
   * PROFILE NAME
   */

  const displayName =
    profile?.full_name ||
    profile?.email?.split("@")[0] ||
    "User"

  return (
    <div className="min-h-screen bg-[#f7f8f6] text-[#111]">

      {/* SIDEBAR */}

      <Sidebar
        open={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
        displayName={displayName}
        email={profile?.email}
        initials={getInitials(
          profile?.full_name
        )}
        onLogout={handleLogout}
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
              className="rounded-xl p-2 text-black/50 transition hover:bg-black/5 hover:text-black lg:hidden"
            >
              <Menu size={19} />
            </button>

            <div className="hidden items-center gap-2 rounded-xl border border-black/10 bg-[#f8f9f7] px-3 py-2 sm:flex">

              <Search
                size={14}
                className="text-black/30"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search properties..."
                className="w-[200px] bg-transparent text-xs outline-none placeholder:text-black/30"
              />

            </div>

          </div>

          <div className="flex items-center gap-2">

            {/* REFRESH */}

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="rounded-xl p-2.5 text-black/45 transition hover:bg-black/5 hover:text-black disabled:opacity-50"
              title="Refresh"
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

            {/* PROFILE */}

            <div className="relative">

              <button
                onClick={() =>
                  setProfileOpen(
                    !profileOpen
                  )
                }
                className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-black/5"
              >

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#173d25] text-[9px] font-bold text-white">
                  {getInitials(
                    profile?.full_name
                  )}
                </div>

                <ChevronDown
                  size={13}
                  className={`hidden text-black/30 transition sm:block ${
                    profileOpen
                      ? "rotate-180"
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
                      className="mt-1 block rounded-xl px-3 py-2.5 text-xs text-black/60 transition hover:bg-black/5"
                      onClick={() =>
                        setProfileOpen(
                          false
                        )
                      }
                    >
                      Profile
                    </Link>

                    <Link
                      href="/dashboard/settings"
                      className="block rounded-xl px-3 py-2.5 text-xs text-black/60 transition hover:bg-black/5"
                      onClick={() =>
                        setProfileOpen(
                          false
                        )
                      }
                    >
                      Settings
                    </Link>

                    <button
                      onClick={
                        handleLogout
                      }
                      className="w-full rounded-xl px-3 py-2.5 text-left text-xs text-red-600 transition hover:bg-red-50"
                    >
                      Sign out
                    </button>

                  </motion.div>
                )}
              </AnimatePresence>

            </div>

          </div>

        </header>

        {/* CONTENT */}

        <main className="min-h-[calc(100vh-76px)]">

          <div className="mx-auto max-w-[1500px] px-5 py-7 lg:px-8 lg:py-9">

            {/* SUCCESS */}

            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -10,
                  }}
                  className="mb-5 flex items-center justify-between rounded-2xl border border-[#173d25]/10 bg-[#edf5ee] px-4 py-3 text-xs text-[#173d25]"
                >

                  <div className="flex items-center gap-2">

                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#173d25] text-white">
                      <Check size={13} />
                    </div>

                    <span>
                      {successMessage}
                    </span>

                  </div>

                  <button
                    onClick={() =>
                      setSuccessMessage("")
                    }
                    className="rounded-lg p-1 hover:bg-black/5"
                  >
                    <X size={14} />
                  </button>

                </motion.div>
              )}
            </AnimatePresence>

            {/* ERROR */}

            <AnimatePresence>
              {pageError && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -10,
                  }}
                  className="mb-5 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700"
                >

                  <div className="flex items-center gap-2">

                    <AlertCircle
                      size={15}
                    />

                    <span>
                      {pageError}
                    </span>

                  </div>

                  <button
                    onClick={() =>
                      setPageError("")
                    }
                    className="rounded-lg p-1 hover:bg-red-100"
                  >
                    <X size={14} />
                  </button>

                </motion.div>
              )}
            </AnimatePresence>

            {/* PAGE HEADER */}

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
                  <Building2 size={14} />
                  Property management
                </div>

                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Properties
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-black/45">
                  Manage every property from one
                  place. Add buildings, update
                  details, and keep your portfolio
                  organized.
                </p>

              </div>

              <button
                onClick={openAddModal}
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#173d25] px-4 py-3 text-xs font-semibold text-white shadow-lg shadow-[#173d25]/10 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <Plus size={15} />
                Add Property
              </button>

            </motion.div>

            {/* SUMMARY */}

            <div className="mb-6 grid gap-4 sm:grid-cols-3">

              {[
                {
                  label: "Total Properties",
                  value: properties.length,
                  icon: Building2,
                },
                {
                  label: "Active Properties",
                  value: activeProperties,
                  icon: Check,
                },
                {
                  label: "Total Units",
                  value: totalUnits,
                  icon: Home,
                },
              ].map(
                (item, index) => {
                  const Icon = item.icon

                  return (
                    <motion.div
                      key={item.label}
                      initial={{
                        opacity: 0,
                        y: 15,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay:
                          index * 0.06,
                      }}
                      className="rounded-2xl border border-black/10 bg-white p-5"
                    >

                      <div className="flex items-center justify-between">

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf5ee] text-[#173d25]">
                          <Icon size={16} />
                        </div>

                        <span className="text-[9px] uppercase tracking-[0.12em] text-black/30">
                          Overview
                        </span>

                      </div>

                      <p className="mt-5 text-[10px] font-medium uppercase tracking-[0.12em] text-black/35">
                        {item.label}
                      </p>

                      <p className="mt-1 text-2xl font-semibold tracking-tight">
                        {loading
                          ? "..."
                          : item.value}
                      </p>

                    </motion.div>
                  )
                }
              )}

            </div>

            {/* SEARCH / FILTER */}

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
                delay: 0.2,
              }}
              className="mb-5 rounded-2xl border border-black/10 bg-white p-3"
            >

              <div className="flex flex-col gap-3 md:flex-row">

                {/* SEARCH */}

                <div className="flex flex-1 items-center gap-2 rounded-xl bg-[#f7f8f6] px-3 py-2.5">

                  <Search
                    size={15}
                    className="text-black/30"
                  />

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    placeholder="Search by property, city, address..."
                    className="w-full bg-transparent text-xs outline-none placeholder:text-black/30"
                  />

                  {search && (
                    <button
                      onClick={() =>
                        setSearch("")
                      }
                      className="text-black/30 hover:text-black"
                    >
                      <X size={14} />
                    </button>
                  )}

                </div>

                {/* FILTER */}

                <div className="relative">

                  <button
                    onClick={() =>
                      setFilterOpen(
                        !filterOpen
                      )
                    }
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-black/10 px-4 py-2.5 text-xs font-medium md:w-[180px]"
                  >

                    <span>
                      Filters
                    </span>

                    <ChevronDown
                      size={14}
                      className={
                        filterOpen
                          ? "rotate-180 transition"
                          : "transition"
                      }
                    />

                  </button>

                  <AnimatePresence>
                    {filterOpen && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: -5,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                          y: -5,
                        }}
                        className="absolute right-0 top-12 z-20 w-[240px] rounded-2xl border border-black/10 bg-white p-3 shadow-xl"
                      >

                        <div className="mb-3">

                          <p className="mb-2 text-[9px] font-semibold uppercase tracking-wider text-black/35">
                            Status
                          </p>

                          <div className="grid grid-cols-3 gap-1">

                            {[
                              "All",
                              ...STATUS_OPTIONS,
                            ].map(
                              (status) => (
                                <button
                                  key={
                                    status
                                  }
                                  onClick={() =>
                                    setStatusFilter(
                                      status
                                    )
                                  }
                                  className={`rounded-lg px-2 py-2 text-[10px] transition ${
                                    statusFilter ===
                                    status
                                      ? "bg-[#173d25] font-semibold text-white"
                                      : "bg-[#f7f8f6] text-black/50 hover:bg-black/5"
                                  }`}
                                >
                                  {status}
                                </button>
                              )
                            )}

                          </div>

                        </div>

                        <div>

                          <p className="mb-2 text-[9px] font-semibold uppercase tracking-wider text-black/35">
                            Property Type
                          </p>

                          <select
                            value={typeFilter}
                            onChange={(event) =>
                              setTypeFilter(
                                event.target.value
                              )
                            }
                            className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-xs outline-none"
                          >

                            <option value="All">
                              All types
                            </option>

                            {PROPERTY_TYPES.map(
                              (type) => (
                                <option
                                  key={type}
                                  value={type}
                                >
                                  {type}
                                </option>
                              )
                            )}

                          </select>

                        </div>

                        <button
                          onClick={() => {
                            setStatusFilter(
                              "All"
                            )
                            setTypeFilter(
                              "All"
                            )
                            setFilterOpen(
                              false
                            )
                          }}
                          className="mt-3 w-full rounded-xl border border-black/10 py-2 text-[10px] font-semibold text-black/50 hover:bg-black/5"
                        >
                          Clear Filters
                        </button>

                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>

              </div>

            </motion.div>

            {/* PROPERTY LIST */}

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
              className="overflow-hidden rounded-2xl border border-black/10 bg-white"
            >

              {/* SECTION HEADER */}

              <div className="flex flex-col justify-between gap-3 border-b border-black/10 px-5 py-4 sm:flex-row sm:items-center">

                <div>

                  <h2 className="text-sm font-semibold">
                    Property Portfolio
                  </h2>

                  <p className="mt-1 text-[10px] text-black/40">
                    {filteredProperties.length}{" "}
                    {filteredProperties.length ===
                    1
                      ? "property"
                      : "properties"}{" "}
                    shown
                  </p>

                </div>

                {(search ||
                  statusFilter !== "All" ||
                  typeFilter !== "All") && (
                  <button
                    onClick={() => {
                      setSearch("")
                      setStatusFilter(
                        "All"
                      )
                      setTypeFilter(
                        "All"
                      )
                    }}
                    className="text-[10px] font-semibold text-[#173d25]"
                  >
                    Clear filters
                  </button>
                )}

              </div>

              {/* LOADING */}

              {loading ? (
                <div className="space-y-3 p-5">

                  {[1, 2, 3, 4].map(
                    (item) => (
                      <div
                        key={item}
                        className="h-[92px] animate-pulse rounded-xl bg-black/[0.035]"
                      />
                    )
                  )}

                </div>
              ) : filteredProperties.length ===
                0 ? (
                /* EMPTY */

                <div className="px-6 py-16 text-center">

                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf5ee] text-[#173d25]">
                    {properties.length ===
                    0 ? (
                      <Building2
                        size={23}
                      />
                    ) : (
                      <Search
                        size={21}
                      />
                    )}
                  </div>

                  <h3 className="text-sm font-semibold">
                    {properties.length ===
                    0
                      ? "No properties yet"
                      : "No properties found"}
                  </h3>

                  <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-black/40">

                    {properties.length ===
                    0
                      ? "Add your first property to start managing your portfolio."
                      : "Try changing your search or filters."}

                  </p>

                  {properties.length ===
                    0 && (
                    <button
                      onClick={
                        openAddModal
                      }
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#173d25] px-4 py-2.5 text-xs font-semibold text-white"
                    >
                      <Plus size={14} />
                      Add Property
                    </button>
                  )}

                </div>
              ) : (
                /* PROPERTY CARDS */

                <div className="divide-y divide-black/5">

                  {filteredProperties.map(
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
                          y: 10,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay:
                            index *
                            0.04,
                        }}
                        className="group p-4 transition hover:bg-[#fafbf9] sm:p-5"
                      >

                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

                          {/* ICON */}

                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#173d25] text-white">
                            <Building2
                              size={19}
                            />
                          </div>

                          {/* MAIN */}

                          <div className="min-w-0 flex-1">

                            <div className="flex flex-wrap items-center gap-2">

                              <Link
                                href={`/dashboard/properties/${property.id}`}
                                className="truncate text-sm font-semibold transition hover:text-[#173d25]"
                              >
                                {
                                  property.name
                                }
                              </Link>

                              <span
                                className={`rounded-full px-2 py-1 text-[8px] font-semibold uppercase tracking-wide ${
                                  !property.status ||
                                  property.status.toLowerCase() ===
                                    "active"
                                    ? "bg-[#edf5ee] text-[#173d25]"
                                    : "bg-black/5 text-black/40"
                                }`}
                              >
                                {property.status ||
                                  "Active"}
                              </span>

                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">

                              <div className="flex items-center gap-1.5 text-[10px] text-black/40">

                                <MapPin
                                  size={11}
                                />

                                <span>
                                  {[
                                    property.address,
                                    property.city,
                                    property.country,
                                  ]
                                    .filter(
                                      Boolean
                                    )
                                    .join(
                                      ", "
                                    ) ||
                                    "No location added"}
                                </span>

                              </div>

                              <div className="flex items-center gap-1.5 text-[10px] text-black/40">

                                <Home
                                  size={11}
                                />

                                <span>
                                  {property.total_units ??
                                    0}{" "}
                                  units
                                </span>

                              </div>

                              <div className="flex items-center gap-1.5 text-[10px] text-black/40">

                                <Building2
                                  size={11}
                                />

                                <span>
                                  {property.property_type ||
                                    "Property"}
                                </span>

                              </div>

                            </div>

                          </div>

                          {/* DATE */}

                          <div className="hidden min-w-[100px] text-right lg:block">

                            <p className="text-[9px] uppercase tracking-wider text-black/25">
                              Added
                            </p>

                            <p className="mt-1 text-[10px] font-medium text-black/50">
                              {formatDate(
                                property.created_at
                              )}
                            </p>

                          </div>

                          {/* ACTIONS */}

                          <div className="flex items-center gap-2">

                            <Link
                              href={`/dashboard/properties/${property.id}`}
                              className="flex h-9 items-center gap-2 rounded-xl border border-black/10 px-3 text-[10px] font-semibold text-black/55 transition hover:border-[#173d25]/20 hover:bg-[#edf5ee] hover:text-[#173d25]"
                            >
                              <span className="hidden sm:inline">
                                View
                              </span>
                              <ArrowUpRight
                                size={13}
                              />
                            </Link>

                            <button
                              onClick={() =>
                                openEditModal(
                                  property
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 text-black/45 transition hover:border-black/20 hover:bg-black/5 hover:text-black"
                              title="Edit property"
                            >
                              <Pencil
                                size={14}
                              />
                            </button>

                            <button
                              onClick={() =>
                                handleDeleteProperty(
                                  property
                                )
                              }
                              disabled={
                                deletingId ===
                                property.id
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 text-red-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                              title="Delete property"
                            >
                              {deletingId ===
                              property.id ? (
                                <Loader2
                                  size={14}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2
                                  size={14}
                                />
                              )}
                            </button>

                          </div>

                        </div>

                      </motion.div>
                    )
                  )}

                </div>
              )}

            </motion.section>

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
                  Property management
                </span>

              </div>

            </footer>

          </div>

        </main>

      </div>

      {/* ADD / EDIT MODAL */}

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeModal()
              }
            }}
          >

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.96,
                y: 15,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
                y: 15,
              }}
              transition={{
                duration: 0.2,
              }}
              className="max-h-[90vh] w-full max-w-[620px] overflow-y-auto rounded-3xl border border-black/10 bg-white shadow-2xl"
            >

              {/* MODAL HEADER */}

              <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf5ee] text-[#173d25]">
                    <Building2
                      size={18}
                    />
                  </div>

                  <div>

                    <h2 className="text-sm font-semibold">
                      {editingProperty
                        ? "Edit Property"
                        : "Add Property"}
                    </h2>

                    <p className="mt-1 text-[10px] text-black/40">
                      {editingProperty
                        ? "Update your property information."
                        : "Add a property to your portfolio."}
                    </p>

                  </div>

                </div>

                <button
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl p-2 text-black/35 transition hover:bg-black/5 hover:text-black disabled:opacity-50"
                >
                  <X size={17} />
                </button>

              </div>

              {/* FORM */}

              <form
                onSubmit={
                  handleSaveProperty
                }
                className="p-6"
              >

                {/* NAME */}

                <div className="mb-5">

                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-black/45">
                    Property Name
                  </label>

                  <input
                    required
                    value={form.name}
                    onChange={(event) =>
                      updateForm(
                        "name",
                        event.target.value
                      )
                    }
                    placeholder="e.g. Green Valley Apartments"
                    className="w-full rounded-xl border border-black/10 bg-[#fafbf9] px-4 py-3 text-xs outline-none transition placeholder:text-black/25 focus:border-[#173d25]/40 focus:bg-white"
                  />

                </div>

                {/* TYPE + STATUS */}

                <div className="mb-5 grid gap-4 sm:grid-cols-2">

                  <div>

                    <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-black/45">
                      Property Type
                    </label>

                    <select
                      value={
                        form.property_type
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "property_type",
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-black/10 bg-[#fafbf9] px-4 py-3 text-xs outline-none focus:border-[#173d25]/40 focus:bg-white"
                    >

                      {PROPERTY_TYPES.map(
                        (type) => (
                          <option
                            key={type}
                            value={type}
                          >
                            {type}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  <div>

                    <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-black/45">
                      Status
                    </label>

                    <select
                      value={
                        form.status
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "status",
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-black/10 bg-[#fafbf9] px-4 py-3 text-xs outline-none focus:border-[#173d25]/40 focus:bg-white"
                    >

                      {STATUS_OPTIONS.map(
                        (status) => (
                          <option
                            key={status}
                            value={status}
                          >
                            {status}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                </div>

                {/* TOTAL UNITS */}

                <div className="mb-5">

                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-black/45">
                    Total Units
                  </label>

                  <div className="relative">

                    <Home
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-black/25"
                    />

                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={
                        form.total_units
                      }
                      onChange={(event) =>
                        updateForm(
                          "total_units",
                          event.target.value
                        )
                      }
                      placeholder="e.g. 12"
                      className="w-full rounded-xl border border-black/10 bg-[#fafbf9] py-3 pl-10 pr-4 text-xs outline-none transition placeholder:text-black/25 focus:border-[#173d25]/40 focus:bg-white"
                    />

                  </div>

                  <p className="mt-1.5 text-[9px] text-black/30">
                    Enter the total number of
                    units in this property.
                  </p>

                </div>

                {/* ADDRESS */}

                <div className="mb-5">

                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-black/45">
                    Address
                  </label>

                  <div className="relative">

                    <MapPin
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-black/25"
                    />

                    <input
                      value={
                        form.address
                      }
                      onChange={(event) =>
                        updateForm(
                          "address",
                          event.target.value
                        )
                      }
                      placeholder="Street address"
                      className="w-full rounded-xl border border-black/10 bg-[#fafbf9] py-3 pl-10 pr-4 text-xs outline-none transition placeholder:text-black/25 focus:border-[#173d25]/40 focus:bg-white"
                    />

                  </div>

                </div>

                {/* CITY + COUNTRY */}

                <div className="mb-6 grid gap-4 sm:grid-cols-2">

                  <div>

                    <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-black/45">
                      City
                    </label>

                    <div className="relative">

                      <Globe2
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-black/25"
                      />

                      <input
                        value={
                          form.city
                        }
                        onChange={(
                          event
                        ) =>
                          updateForm(
                            "city",
                            event.target.value
                          )
                        }
                        placeholder="City"
                        className="w-full rounded-xl border border-black/10 bg-[#fafbf9] py-3 pl-10 pr-4 text-xs outline-none transition placeholder:text-black/25 focus:border-[#173d25]/40 focus:bg-white"
                      />

                    </div>

                  </div>

                  <div>

                    <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-black/45">
                      Country
                    </label>

                    <div className="relative">

                      <Globe2
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-black/25"
                      />

                      <input
                        value={
                          form.country
                        }
                        onChange={(
                          event
                        ) =>
                          updateForm(
                            "country",
                            event.target.value
                          )
                        }
                        placeholder="Country"
                        className="w-full rounded-xl border border-black/10 bg-[#fafbf9] py-3 pl-10 pr-4 text-xs outline-none transition placeholder:text-black/25 focus:border-[#173d25]/40 focus:bg-white"
                      />

                    </div>

                  </div>

                </div>

                {/* BUTTONS */}

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={
                      closeModal
                    }
                    disabled={saving}
                    className="rounded-xl border border-black/10 px-5 py-3 text-xs font-semibold text-black/50 transition hover:bg-black/5 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#173d25] px-5 py-3 text-xs font-semibold text-white shadow-lg shadow-[#173d25]/10 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {saving ? (
                      <>
                        <Loader2
                          size={14}
                          className="animate-spin"
                        />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check
                          size={14}
                        />
                        {editingProperty
                          ? "Save Changes"
                          : "Create Property"}
                      </>
                    )}

                  </button>

                </div>

              </form>

            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}