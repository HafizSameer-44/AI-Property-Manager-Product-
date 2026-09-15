"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { motion, useScroll, useSpring } from "framer-motion"
import {
  ArrowRight,
  Bot,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  FileText,
  Menu,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
  X,
  BarChart3,
  Zap,
  MessageSquare,
} from "lucide-react"

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 35,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
}

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)

  const { scrollYProgress } = useScroll()

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth"

    return () => {
      document.documentElement.style.scrollBehavior = "auto"
    }
  }, [])

  function goHome() {
    setMenuOpen(false)

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-black">

      {/* Scroll progress */}
      <motion.div
        style={{ scaleX }}
        className="fixed left-0 right-0 top-0 z-[100] h-[3px] origin-left bg-green-600"
      />

      {/* ================= NAVBAR ================= */}

      <header className="fixed left-0 right-0 top-0 z-50">

        <div className="mx-auto mt-3 max-w-7xl px-4 sm:px-6">

          <nav className="flex h-[68px] items-center justify-between rounded-2xl border border-gray-200/70 bg-white/85 px-4 shadow-sm backdrop-blur-xl sm:px-5">

            {/* Logo */}

            <button
              onClick={goHome}
              className="flex items-center gap-3"
            >

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-sm font-bold text-white shadow-sm">
                G
              </div>

              <div className="text-left">
                <p className="text-sm font-bold tracking-tight">
                  Greek Root AI
                </p>

                <p className="text-[9px] font-medium tracking-[0.15em] text-gray-400">
                  AI PROPERTY MANAGER
                </p>
              </div>

            </button>

            {/* Desktop Navigation */}

            <div className="hidden items-center gap-7 md:flex">

              <button
                onClick={goHome}
                className="text-sm font-medium text-black"
              >
                Home
              </button>

              <a
                href="#features"
                className="text-sm text-gray-500 transition hover:text-black"
              >
                Features
              </a>

              <a
                href="#ai"
                className="text-sm text-gray-500 transition hover:text-black"
              >
                AI Manager
              </a>

              <a
                href="#how-it-works"
                className="text-sm text-gray-500 transition hover:text-black"
              >
                How it works
              </a>

            </div>

            {/* Desktop actions */}

            <div className="hidden items-center gap-2 md:flex">

              <Link
                href="/login"
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-black"
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="group flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Get Started

                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>

            </div>

            {/* Mobile button */}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-xl p-2 md:hidden"
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <X size={22} />
              ) : (
                <Menu size={22} />
              )}
            </button>

          </nav>

          {/* Mobile menu */}

          {menuOpen && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="mt-2 rounded-2xl border border-gray-200 bg-white p-3 shadow-xl md:hidden"
            >

              <button
                onClick={goHome}
                className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium hover:bg-gray-50"
              >
                Home
              </button>

              <a
                href="#features"
                onClick={closeMenu}
                className="block rounded-xl px-4 py-3 text-sm text-gray-600 hover:bg-gray-50"
              >
                Features
              </a>

              <a
                href="#ai"
                onClick={closeMenu}
                className="block rounded-xl px-4 py-3 text-sm text-gray-600 hover:bg-gray-50"
              >
                AI Manager
              </a>

              <a
                href="#how-it-works"
                onClick={closeMenu}
                className="block rounded-xl px-4 py-3 text-sm text-gray-600 hover:bg-gray-50"
              >
                How it works
              </a>

              <div className="my-2 border-t border-gray-100" />

              <Link
                href="/login"
                onClick={closeMenu}
                className="block rounded-xl px-4 py-3 text-sm font-medium hover:bg-gray-50"
              >
                Login
              </Link>

              <Link
                href="/signup"
                onClick={closeMenu}
                className="block rounded-xl bg-black px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Get Started
              </Link>

            </motion.div>
          )}

        </div>

      </header>


      {/* ================= HERO ================= */}

      <section
        id="home"
        className="relative flex min-h-[100svh] items-center overflow-hidden pt-24"
      >

        {/* Background glow */}

        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[550px] w-[550px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-100/50 blur-[120px]" />

        <div className="pointer-events-none absolute -right-32 top-20 h-72 w-72 rounded-full bg-green-50 blur-3xl" />

        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 lg:py-8">

          {/* Left */}

          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="relative z-10"
          >

            <motion.div
              variants={fadeUp}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-xs font-semibold text-green-800"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-white">
                <Sparkles size={11} />
              </span>

              AI-powered property management
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="max-w-2xl text-[42px] font-bold leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-[68px]"
            >
              Your properties.
              <span className="block text-green-700">
                Managed intelligently.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-xl text-sm leading-6 text-gray-500 sm:text-base sm:leading-7"
            >
              Greek Root AI brings properties, tenants, rent,
              maintenance and leases into one intelligent
              platform — so you can spend less time managing
              tasks and more time growing your business.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-7 flex flex-col gap-3 sm:flex-row"
            >

              <Link
                href="/signup"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-gray-800"
              >
                Start for free

                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-semibold text-gray-700 transition hover:-translate-y-0.5 hover:bg-gray-50"
              >
                Explore platform
                <ChevronRight size={16} />
              </a>

            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-6 flex flex-wrap gap-x-5 gap-y-2.5"
            >

              {[
                "Simple setup",
                "AI-powered",
                "Built for teams",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-xs text-gray-500"
                >
                  <CheckCircle2
                    size={14}
                    className="text-green-600"
                  />

                  {item}
                </div>
              ))}

            </motion.div>

          </motion.div>


          {/* Right dashboard visual */}

          <motion.div
            initial={{
              opacity: 0,
              x: 50,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
            }}
            transition={{
              duration: 0.9,
              delay: 0.2,
            ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
            }}
            className="relative"
          >

            {/* Floating card */}

            <motion.div
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -left-4 top-20 z-20 hidden rounded-2xl border border-gray-200 bg-white p-3 shadow-xl sm:block"
            >

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100 text-green-700">
                  <Zap size={17} />
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-gray-400">
                    OCCUPANCY
                  </p>

                  <p className="text-sm font-bold">
                    +8.4%
                  </p>
                </div>

              </div>

            </motion.div>


            {/* Dashboard */}

            <div className="relative rounded-[28px] border border-gray-200 bg-white p-2.5 shadow-2xl shadow-gray-200/70">

              {/* Browser */}

              <div className="flex h-10 items-center gap-2 border-b border-gray-100 px-3">

                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-gray-200" />
                  <span className="h-2.5 w-2.5 rounded-full bg-gray-200" />
                  <span className="h-2.5 w-2.5 rounded-full bg-gray-200" />
                </div>

                <div className="mx-auto rounded-lg bg-gray-50 px-12 py-1.5 text-[8px] text-gray-400">
                  app.greekroot.ai
                </div>

              </div>


              <div className="rounded-2xl bg-[#f7faf8] p-3 sm:p-4">

                <div className="flex gap-3">

                  {/* Sidebar */}

                  <div className="hidden w-28 shrink-0 rounded-xl bg-black p-3 sm:block">

                    <div className="mb-6 flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[9px] font-bold">
                      G
                    </div>

                    <div className="space-y-4">

                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded bg-green-400" />
                        <div className="h-2 w-12 rounded bg-white/80" />
                      </div>

                      {[1, 2, 3, 4, 5].map((item) => (
                        <div
                          key={item}
                          className="h-2 w-14 rounded bg-white/15"
                        />
                      ))}

                    </div>

                  </div>


                  {/* Dashboard content */}

                  <div className="min-w-0 flex-1">

                    <div className="mb-4 flex items-center justify-between">

                      <div>
                        <p className="text-xs font-bold sm:text-sm">
                          Good morning 👋
                        </p>

                        <p className="mt-1 text-[8px] text-gray-400">
                          Here's what's happening today.
                        </p>
                      </div>

                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                        <div className="h-3 w-3 rounded-full bg-green-600" />
                      </div>

                    </div>


                    {/* Stats */}

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">

                      {[
                        ["12", "Properties"],
                        ["84", "Units"],
                        ["71", "Occupied"],
                        ["$42.8K", "Revenue"],
                      ].map(([value, label]) => (
                        <motion.div
                          key={label}
                          whileHover={{
                            y: -3,
                          }}
                          className="rounded-xl border border-gray-100 bg-white p-3"
                        >
                          <p className="text-sm font-bold sm:text-base">
                            {value}
                          </p>

                          <p className="mt-1 text-[8px] text-gray-400">
                            {label}
                          </p>
                        </motion.div>
                      ))}

                    </div>


                    {/* Charts */}

                    <div className="mt-2.5 grid gap-2.5 sm:grid-cols-5">

                      <div className="rounded-xl border border-gray-100 bg-white p-3 sm:col-span-3">

                        <div className="flex items-center justify-between">

                          <div>
                            <p className="text-[9px] font-bold">
                              Revenue overview
                            </p>

                            <p className="mt-1 text-[7px] text-gray-400">
                              Monthly performance
                            </p>
                          </div>

                          <BarChart3
                            size={15}
                            className="text-gray-300"
                          />

                        </div>

                        <div className="mt-5 flex h-24 items-end gap-1.5 sm:h-28">

                          {[35, 48, 42, 63, 52, 78, 69, 88].map(
                            (height, index) => (
                              <motion.div
                                key={index}
                                initial={{
                                  height: 0,
                                }}
                                animate={{
                                  height: `${height}%`,
                                }}
                                transition={{
                                  duration: 0.7,
                                  delay: 0.5 + index * 0.06,
                                }}
                                className="flex-1 rounded-t-md bg-green-200"
                              />
                            )
                          )}

                        </div>

                      </div>


                      {/* Occupancy */}

                      <div className="rounded-xl border border-gray-100 bg-white p-3 sm:col-span-2">

                        <p className="text-[9px] font-bold">
                          Occupancy
                        </p>

                        <div className="mt-3 flex justify-center">

                          <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-[11px] border-green-100 border-r-green-600 border-t-green-600">

                            <div className="text-center">
                              <p className="text-lg font-bold">
                                84%
                              </p>

                              <p className="text-[7px] text-gray-400">
                                Occupied
                              </p>
                            </div>

                          </div>

                        </div>

                      </div>

                    </div>


                    {/* AI card */}

                    <motion.div
                      animate={{
                        y: [0, -2, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="mt-2.5 flex items-center gap-3 rounded-xl bg-black p-3.5 text-white"
                    >

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-800">
                        <Bot size={17} />
                      </div>

                      <div className="min-w-0">

                        <p className="text-[8px] font-semibold tracking-wide text-green-400">
                          AI PROPERTY MANAGER
                        </p>

                        <p className="mt-1 truncate text-[10px] text-gray-200">
                          4 tenants have overdue rent.
                        </p>

                      </div>

                      <ArrowRight
                        size={14}
                        className="ml-auto text-gray-500"
                      />

                    </motion.div>

                  </div>

                </div>

              </div>

            </div>

          </motion.div>

        </div>


        {/* Scroll indicator */}

        <motion.div
          animate={{
            y: [0, 7, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-gray-400 lg:flex"
        >
          Scroll to explore

          <div className="h-7 w-px bg-gray-300" />
        </motion.div>

      </section>


      {/* ================= TRUST BAR ================= */}

      <section className="border-y border-gray-100 bg-white">

        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-5 py-7 sm:px-8">

          {[
            "Properties",
            "Tenants",
            "Payments",
            "Maintenance",
            "AI Assistant",
          ].map((item) => (
            <div
              key={item}
              className="flex items-center gap-2 text-xs font-medium text-gray-400"
            >
              <CheckCircle2
                size={14}
                className="text-green-600"
              />

              {item}
            </div>
          ))}

        </div>

      </section>


      {/* ================= FEATURES ================= */}

      <section
        id="features"
        className="bg-[#f7faf8] py-24 sm:py-28"
      >

        <div className="mx-auto max-w-7xl px-5 sm:px-8">

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.2,
            }}
            className="max-w-2xl"
          >

            <p className="text-xs font-bold tracking-[0.15em] text-green-700">
              ONE PLATFORM
            </p>

            <h2 className="mt-3 text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
              Everything your property operation needs.
            </h2>

            <p className="mt-5 text-sm leading-7 text-gray-500 sm:text-base">
              Replace scattered spreadsheets and disconnected
              tools with one clean workspace for your entire
              property operation.
            </p>

          </motion.div>


          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.1,
            }}
            className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >

            <Feature
              icon={Building2}
              title="Property management"
              text="Organize properties, units, addresses, owners and important details."
            />

            <Feature
              icon={Users}
              title="Tenant management"
              text="Manage tenant profiles, leases, communication and activity."
            />

            <Feature
              icon={CircleDollarSign}
              title="Rent & payments"
              text="Track payments, overdue balances, due dates and collection history."
            />

            <Feature
              icon={Wrench}
              title="Maintenance"
              text="Manage requests, priorities, assignments and maintenance costs."
            />

            <Feature
              icon={FileText}
              title="Leases & documents"
              text="Keep leases, invoices and important property documents organized."
            />

            <Feature
              icon={ShieldCheck}
              title="Secure workspace"
              text="Built with authentication, permissions and controlled data access."
            />

          </motion.div>

        </div>

      </section>


      {/* ================= AI ================= */}

      <section
        id="ai"
        className="relative overflow-hidden bg-black py-24 text-white sm:py-28"
      >

        <div className="pointer-events-none absolute left-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-green-900/20 blur-[100px]" />

        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2">

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.2,
            }}
          >

            <motion.div
              variants={fadeUp}
              className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-800"
            >
              <Bot size={24} />
            </motion.div>

            <motion.p
              variants={fadeUp}
              className="text-xs font-bold tracking-[0.15em] text-green-400"
            >
              YOUR AI PROPERTY MANAGER
            </motion.p>

            <motion.h2
              variants={fadeUp}
              className="mt-3 max-w-xl text-4xl font-bold tracking-[-0.035em] sm:text-5xl"
            >
              Ask your property data anything.
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="mt-5 max-w-xl text-sm leading-7 text-gray-400 sm:text-base"
            >
              Stop searching through spreadsheets and records.
              Ask your AI assistant questions about properties,
              tenants, payments and maintenance.
            </motion.p>


            <motion.div
              variants={fadeUp}
              className="mt-8 space-y-3"
            >

              {[
                "Which tenants have overdue rent?",
                "Which leases expire this month?",
                "Show today's maintenance requests.",
                "How much rent did we collect?",
              ].map((question) => (
                <div
                  key={question}
                  className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3.5 transition hover:border-green-500/30 hover:bg-white/[0.07]"
                >

                  <div className="h-1.5 w-1.5 rounded-full bg-green-400" />

                  <span className="text-sm text-gray-300">
                    {question}
                  </span>

                  <ArrowRight
                    size={14}
                    className="ml-auto text-gray-600 transition group-hover:translate-x-1 group-hover:text-green-400"
                  />

                </div>
              ))}

            </motion.div>

          </motion.div>


          {/* AI interface */}

          <motion.div
            initial={{
              opacity: 0,
              x: 50,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
              amount: 0.2,
            }}
            transition={{
              duration: 0.8,
            }}
          >

            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-3 shadow-2xl">

              <div className="rounded-2xl bg-white p-5 text-black sm:p-6">

                <div className="flex items-center gap-3 border-b border-gray-100 pb-5">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-800">
                    <Bot size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-bold">
                      Greek Root AI
                    </p>

                    <p className="text-xs text-gray-400">
                      Property Assistant
                    </p>
                  </div>

                  <div className="ml-auto flex items-center gap-1.5 text-xs text-green-700">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    Online
                  </div>

                </div>


                <div className="space-y-4 py-6">

                  <div className="ml-auto max-w-xs rounded-2xl rounded-br-md bg-black px-4 py-3 text-sm text-white">
                    Which tenants have overdue rent?
                  </div>


                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      delay: 0.3,
                    }}
                    className="max-w-sm rounded-2xl rounded-bl-md bg-gray-50 p-4"
                  >

                    <p className="text-sm leading-6 text-gray-700">
                      There are{" "}
                      <strong>4 tenants</strong> with overdue
                      payments totaling{" "}
                      <strong>$6,240</strong>.
                    </p>

                    <div className="mt-4 space-y-2">

                      {[
                        ["Sarah Johnson", "$1,450"],
                        ["Michael Brown", "$1,200"],
                        ["David Wilson", "$1,890"],
                      ].map(([name, amount]) => (
                        <div
                          key={name}
                          className="flex items-center justify-between rounded-lg bg-white p-3 text-xs shadow-sm"
                        >
                          <span>{name}</span>

                          <span className="font-semibold text-red-500">
                            {amount}
                          </span>
                        </div>
                      ))}

                    </div>

                  </motion.div>

                </div>


                <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-3">

                  <MessageSquare
                    size={14}
                    className="text-gray-400"
                  />

                  <span className="flex-1 text-xs text-gray-400">
                    Ask your property manager...
                  </span>

                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-black text-white">
                    <ArrowRight size={13} />
                  </div>

                </div>

              </div>

            </div>

          </motion.div>

        </div>

      </section>


      {/* ================= HOW IT WORKS ================= */}

      <section
        id="how-it-works"
        className="border-b border-gray-100 bg-white py-24 sm:py-28"
      >

        <div className="mx-auto max-w-7xl px-5 sm:px-8">

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
            }}
            className="text-center"
          >

            <p className="text-xs font-bold tracking-[0.15em] text-green-700">
              SIMPLE WORKFLOW
            </p>

            <h2 className="mt-3 text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
              Start managing smarter.
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-gray-500">
              Get your property operation organized without
              complicated setup.
            </p>

          </motion.div>


          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.2,
            }}
            className="mt-14 grid gap-5 md:grid-cols-3"
          >

            <Step
              number="01"
              icon={Users}
              title="Create your workspace"
              text="Create your account and set up your property management workspace."
            />

            <Step
              number="02"
              icon={Building2}
              title="Add your properties"
              text="Add properties, units, tenants, leases and payment information."
            />

            <Step
              number="03"
              icon={Bot}
              title="Let AI help"
              text="Ask questions, understand your data and manage daily operations faster."
            />

          </motion.div>

        </div>

      </section>


      {/* ================= CTA ================= */}

      <section className="relative overflow-hidden bg-[#f7faf8] py-24 sm:py-28">

        <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-100 blur-[100px]" />

        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.7,
          }}
          className="relative mx-auto max-w-3xl px-5 text-center"
        >

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white shadow-lg">
            <Sparkles size={23} />
          </div>

          <h2 className="mt-7 text-4xl font-bold tracking-[-0.035em] sm:text-5xl">
            Ready to manage properties smarter?
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-gray-500 sm:text-base">
            Bring your properties, tenants and operations
            together in one intelligent workspace.
          </p>

          <Link
            href="/signup"
            className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-black px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-gray-800"
          >
            Get started for free

            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>

        </motion.div>

      </section>


      {/* ================= FOOTER ================= */}

      <footer className="border-t border-gray-200 bg-white">

        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">

          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">

            <button
              onClick={goHome}
              className="flex items-center gap-3 text-left"
            >

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-xs font-bold text-white">
                G
              </div>

              <div>
                <p className="text-sm font-bold">
                  Greek Root AI
                </p>

                <p className="text-[10px] text-gray-400">
                  Building the future with AI.
                </p>
              </div>

            </button>


            <div className="flex flex-wrap gap-6 text-xs text-gray-500">

              <button
                onClick={goHome}
                className="transition hover:text-black"
              >
                Home
              </button>

              <a
                href="#features"
                className="transition hover:text-black"
              >
                Features
              </a>

              <a
                href="#ai"
                className="transition hover:text-black"
              >
                AI Manager
              </a>

              <a
                href="#how-it-works"
                className="transition hover:text-black"
              >
                How it works
              </a>

              <Link
                href="/login"
                className="transition hover:text-black"
              >
                Login
              </Link>

            </div>

          </div>


          <div className="mt-8 border-t border-gray-100 pt-6 text-xs text-gray-400">
            © 2026 Greek Root AI. All rights reserved.
          </div>

        </div>

      </footer>

    </main>
  )
}


/* ================= FEATURE ================= */

function Feature({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ElementType
  title: string
  text: string
}) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{
        y: -6,
      }}
      transition={{
        duration: 0.25,
      }}
      className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-xl hover:shadow-gray-200/50"
    >

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f5ec] text-green-700 transition duration-300 group-hover:bg-green-700 group-hover:text-white">
        <Icon size={20} />
      </div>

      <h3 className="mt-5 font-bold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-gray-500">
        {text}
      </p>

    </motion.div>
  )
}


/* ================= STEP ================= */

function Step({
  number,
  icon: Icon,
  title,
  text,
}: {
  number: string
  icon: React.ElementType
  title: string
  text: string
}) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{
        y: -5,
      }}
      className="group rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition hover:shadow-xl"
    >

      <div className="flex items-center justify-between">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
          <Icon size={19} />
        </div>

        <span className="text-sm font-bold text-green-700">
          {number}
        </span>

      </div>

      <h3 className="mt-6 text-xl font-bold">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-gray-500">
        {text}
      </p>

    </motion.div>
  )
}