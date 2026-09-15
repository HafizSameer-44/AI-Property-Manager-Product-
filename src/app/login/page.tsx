"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Bot,
  Building2,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError("")
    setSuccess("")

    if (!email.trim() || !password) {
      setError("Please enter your email and password.")
      return
    }

    setLoading(true)

    try {
      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

      if (loginError) {
        throw loginError
      }

      setSuccess("Login successful. Opening your dashboard...")

      setTimeout(() => {
        router.push("/dashboard")
        router.refresh()
      }, 900)
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to login. Please try again."

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    "h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-black placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-green-600 focus:ring-4 focus:ring-green-50"

  return (
    <main className="relative h-screen overflow-hidden bg-[#f8faf9] text-black">

      {/* ================= BACKGROUND GLOW ================= */}

      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-green-200/40 blur-[130px]"
      />

      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-green-100 blur-[130px]"
      />

      {/* ================= HEADER ================= */}

      <header className="relative z-30 px-4 pt-3 sm:px-6">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between rounded-2xl border border-gray-200/70 bg-white/90 px-4 shadow-sm backdrop-blur-xl">

          {/* Logo */}

          <Link
            href="/"
            className="flex items-center gap-2.5"
          >
            <motion.div
              whileHover={{
                scale: 1.05,
                rotate: -4,
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-sm font-bold text-white"
            >
              G
            </motion.div>

            <div>
              <p className="text-sm font-bold tracking-tight">
                Greek Root AI
              </p>

              <p className="text-[8px] font-semibold tracking-[0.16em] text-gray-400">
                AI PROPERTY MANAGER
              </p>
            </div>
          </Link>

          {/* Signup */}

          <div className="text-xs text-gray-500 sm:text-sm">
            Don't have an account?

            <Link
              href="/signup"
              className="ml-2 font-semibold text-black transition hover:text-green-700"
            >
              Sign up
            </Link>
          </div>

        </div>
      </header>

      {/* ================= MAIN ================= */}

      <section className="relative z-10 mx-auto grid h-[calc(100vh-76px)] max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_410px] lg:gap-20">

        {/* ================================================= */}
        {/* LEFT SIDE */}
        {/* ================================================= */}

        <div className="relative hidden h-full lg:flex lg:flex-col lg:items-center lg:justify-center">

          {/* Text */}

          <motion.div
            initial={{
              opacity: 0,
              y: 25,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.8,
             ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
            }}
            className="relative z-20 w-full max-w-xl text-center"
          >

            <div className="mb-5 flex items-center justify-center gap-2">

              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                Welcome back
              </span>

            </div>

            <h1 className="text-[54px] font-bold leading-[0.98] tracking-[-0.055em] xl:text-[64px]">

              Your properties,

              <br />

              <span className="text-green-700">
                always in control.
              </span>

            </h1>

            <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-gray-500">
              Sign in to your intelligent workspace and
              manage your properties, tenants, rent and
              maintenance from one place.
            </p>

          </motion.div>

          {/* ================================================= */}
          {/* 3D PROPERTY VISUAL */}
          {/* ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: 35,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              duration: 1,
              delay: 0.2,
             ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
            }}
            className="relative mt-5 h-[270px] w-[440px]"
          >

            {/* Green glow */}

            <div className="absolute bottom-4 left-1/2 h-20 w-64 -translate-x-1/2 rounded-full bg-green-300/25 blur-3xl" />

            {/* Rotating ring */}

            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 35,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute left-1/2 top-1/2 h-[245px] w-[245px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-green-200/60"
            />

            {/* Inner glow */}

            <div className="absolute left-1/2 top-1/2 h-[185px] w-[185px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-100/30 blur-2xl" />

            {/* Building shadow */}

            <div className="absolute bottom-8 left-1/2 h-8 w-64 -translate-x-1/2 rounded-full bg-black/10 blur-xl" />

            {/* ================= BUILDING ================= */}

            <motion.div
              animate={{
                y: [0, -8, 0],
                rotateY: [-2, 2, -2],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute bottom-8 left-1/2 h-[175px] w-[235px] -translate-x-1/2 [transform-style:preserve-3d]"
            >

              <div className="relative h-full w-full rounded-[26px] border border-gray-200 bg-white shadow-[0_30px_70px_rgba(0,0,0,0.14)]">

                {/* Roof */}

                <div className="absolute -top-6 left-1/2 h-8 w-[195px] -translate-x-1/2 rounded-t-2xl bg-black shadow-lg" />

                {/* Building header */}

                <div className="flex h-11 items-center justify-between border-b border-gray-100 px-4">

                  <div className="flex items-center gap-2">

                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-black text-white">
                      <Building2 size={13} />
                    </div>

                    <div>
                      <p className="text-[9px] font-bold">
                        Property OS
                      </p>

                      <p className="text-[7px] text-gray-400">
                        Smart workspace
                      </p>
                    </div>

                  </div>

                  <motion.div
                    animate={{
                      opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                    className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.8)]"
                  />

                </div>

                {/* Windows */}

                <div className="grid grid-cols-4 gap-3 px-5 py-5">

                  {Array.from({
                    length: 8,
                  }).map((_, i) => (

                    <motion.div
                      key={i}
                      animate={{
                        opacity:
                          i % 3 === 0
                            ? [0.35, 1, 0.35]
                            : 0.8,
                      }}
                      transition={{
                        duration: 2.5,
                        delay: i * 0.12,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="h-7 rounded-md border border-green-100 bg-green-50"
                    />

                  ))}

                </div>

                {/* Bottom line */}

                <div className="absolute bottom-0 left-0 right-0 flex h-7 items-center justify-center border-t border-gray-100">

                  <div className="h-1 w-14 rounded-full bg-gray-100" />

                </div>

              </div>

            </motion.div>

            {/* ================= AI ORB ================= */}

            <motion.div
              animate={{
                y: [-8, 8, -8],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute right-[65px] top-[15px] flex h-14 w-14 items-center justify-center rounded-2xl border border-green-200 bg-white/90 shadow-xl backdrop-blur-xl"
            >

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-green-400">
                <Bot size={18} />
              </div>

              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-green-500 ring-4 ring-white" />

            </motion.div>

          </motion.div>

        </div>

        {/* ================================================= */}
        {/* LOGIN CARD */}
        {/* ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            x: 35,
            scale: 0.97,
          }}
          animate={{
            opacity: 1,
            x: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
          }}
          className="mx-auto w-full max-w-[410px]"
        >

          <div className="rounded-[26px] border border-gray-200 bg-white p-5 shadow-[0_25px_80px_rgba(0,0,0,0.09)] sm:p-6">

            {/* Heading */}

            <div className="mb-5">

              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.7,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  duration: 0.5,
                  delay: 0.25,
                  type: "spring",
                }}
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white"
              >
                <Building2 size={18} />
              </motion.div>

              <h2 className="text-2xl font-bold tracking-tight">
                Welcome back
              </h2>

              <p className="mt-1.5 text-xs text-gray-500">
                Sign in to your property workspace.
              </p>

            </div>

            {/* ================= FORM ================= */}

            <form
              onSubmit={handleLogin}
              className="space-y-3"
            >

              {/* Email */}

              <div>

                <label className="mb-1.5 block text-[11px] font-semibold text-gray-700">
                  Email address
                </label>

                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="john@company.com"
                  className={inputClass}
                />

              </div>

              {/* Password */}

              <div>

                <div className="mb-1.5 flex items-center justify-between">

                  <label className="block text-[11px] font-semibold text-gray-700">
                    Password
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-[10px] font-semibold text-green-700 transition hover:text-green-800"
                  >
                    Forgot password?
                  </Link>

                </div>

                <div className="relative">

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Enter your password"
                    className={`${inputClass} pr-11`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-black"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>

                </div>

              </div>

              {/* Security */}

              <div className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-[#f8faf9] px-3 py-2.5">

                <ShieldCheck
                  size={16}
                  className="shrink-0 text-green-700"
                />

                <p className="text-[10px] leading-4 text-gray-500">
                  Your account and workspace are protected.
                </p>

              </div>

              {/* Error */}

              {error && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -5,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-600"
                >
                  {error}
                </motion.div>
              )}

              {/* Success */}

              {success && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -5,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="rounded-xl border border-green-200 bg-green-50 px-3 py-2.5 text-xs text-green-700"
                >
                  {success}
                </motion.div>
              )}

              {/* Login Button */}

              <motion.button
                whileHover={{
                  y: -2,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                type="submit"
                disabled={loading}
                className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-black text-sm font-semibold text-white shadow-lg shadow-black/10 transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    Signing in...
                  </>
                ) : (
                  <>
                    Login

                    <ArrowRight
                      size={16}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </>
                )}

              </motion.button>

            </form>

            {/* Signup */}

            <div className="mt-4 border-t border-gray-100 pt-4 text-center">

              <p className="text-xs text-gray-500">

                Don't have an account?{" "}

                <Link
                  href="/signup"
                  className="font-semibold text-green-700 transition hover:text-green-800"
                >
                  Create one
                </Link>

              </p>

            </div>

          </div>

          {/* Footer */}

          <p className="mt-3 text-center text-[9px] text-gray-400">
            © 2026 Greek Root AI · AI Property Manager
          </p>

        </motion.div>

      </section>
    </main>
  )
}