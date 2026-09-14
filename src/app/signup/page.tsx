"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Bot,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleSignup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError("")
    setSuccess("")

    // Name validation
    if (name.trim().length < 2) {
      setError("Please enter your full name.")
      return
    }

    // Email validation
    if (!email.trim()) {
      setError("Please enter your email address.")
      return
    }

    // Password validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    // Confirm password
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)

    try {
      // ============================================
      // CREATE SUPABASE AUTH USER
      // ============================================

      const { data, error: signupError } =
        await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: name.trim(),
            },
          },
        })

      if (signupError) {
        throw signupError
      }

      if (!data.user) {
        throw new Error("Account could not be created.")
      }

      // ============================================
      // SUCCESS
      // ============================================

      setSuccess(
        "Account created successfully. Opening your dashboard..."
      )

      // ============================================
      // DIRECT DASHBOARD
      // ============================================

      setTimeout(() => {
        router.push("/dashboard")
        router.refresh()
      }, 1000)
    } catch (err) {
      console.error("Signup error:", err)

      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong while creating your account."

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    "h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-black placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-green-600 focus:ring-4 focus:ring-green-50"

  return (
    <main className="relative h-screen overflow-hidden bg-[#f8faf9] text-black">

      {/* ================================================= */}
      {/* BACKGROUND GLOW */}
      {/* ================================================= */}

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

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <header className="relative z-30 px-4 pt-3 sm:px-6">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between rounded-2xl border border-gray-200/70 bg-white/90 px-4 shadow-sm backdrop-blur-xl">

          {/* LOGO */}

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

          {/* LOGIN */}

          <div className="text-xs text-gray-500 sm:text-sm">
            Already have an account?

            <Link
              href="/login"
              className="ml-2 font-semibold text-black transition hover:text-green-700"
            >
              Login
            </Link>
          </div>

        </div>
      </header>

      {/* ================================================= */}
      {/* MAIN */}
      {/* ================================================= */}

      <section className="relative z-10 mx-auto grid h-[calc(100vh-76px)] max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_410px] lg:gap-20">

        {/* ================================================= */}
        {/* LEFT SIDE */}
        {/* ================================================= */}

        <div className="relative hidden h-full lg:flex lg:flex-col lg:items-center lg:justify-center">

          {/* TEXT */}

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
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative z-20 w-full max-w-xl text-center"
          >

            {/* Small label */}

            <div className="mb-5 flex items-center justify-center gap-2">

              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                Intelligent property management
              </span>

            </div>

            {/* Heading */}

            <h1 className="text-[54px] font-bold leading-[0.98] tracking-[-0.055em] xl:text-[64px]">

              Manage your

              <br />

              <span className="text-green-700">
                properties smarter.
              </span>

            </h1>

            {/* Description */}

            <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-gray-500">
              One intelligent workspace for properties,
              tenants, rent and maintenance — powered
              by AI.
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
              ease: [0.22, 1, 0.36, 1],
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

            {/* ================================================= */}
            {/* BUILDING */}
            {/* ================================================= */}

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

                  {/* Online status */}

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

                {/* Bottom */}

                <div className="absolute bottom-0 left-0 right-0 flex h-7 items-center justify-center border-t border-gray-100">

                  <div className="h-1 w-14 rounded-full bg-gray-100" />

                </div>

              </div>

            </motion.div>

            {/* ================================================= */}
            {/* AI ORB */}
            {/* ================================================= */}

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
        {/* SIGNUP CARD */}
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
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mx-auto w-full max-w-[410px]"
        >

          <div className="rounded-[26px] border border-gray-200 bg-white p-5 shadow-[0_25px_80px_rgba(0,0,0,0.09)] sm:p-6">

            {/* CARD HEADING */}

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
                Create your account
              </h2>

              <p className="mt-1.5 text-xs text-gray-500">
                Start managing your properties smarter.
              </p>

            </div>

            {/* ================================================= */}
            {/* FORM */}
            {/* ================================================= */}

            <form
              onSubmit={handleSignup}
              className="space-y-3"
            >

              {/* NAME */}

              <div>

                <label className="mb-1.5 block text-[11px] font-semibold text-gray-700">
                  Full name
                </label>

                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="John Doe"
                  className={inputClass}
                />

              </div>

              {/* EMAIL */}

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

              {/* PASSWORD */}

              <div>

                <label className="mb-1.5 block text-[11px] font-semibold text-gray-700">
                  Password
                </label>

                <div className="relative">

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Minimum 6 characters"
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

              {/* CONFIRM PASSWORD */}

              <div>

                <label className="mb-1.5 block text-[11px] font-semibold text-gray-700">
                  Confirm password
                </label>

                <div className="relative">

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    placeholder="Repeat your password"
                    className={`${inputClass} pr-11`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-black"
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>

                </div>

              </div>

              {/* SECURITY */}

              <div className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-[#f8faf9] px-3 py-2.5">

                <ShieldCheck
                  size={16}
                  className="shrink-0 text-green-700"
                />

                <p className="text-[10px] leading-4 text-gray-500">
                  Secure authentication and controlled access.
                </p>

              </div>

              {/* ERROR */}

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

              {/* SUCCESS */}

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
                  className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2.5 text-xs text-green-700"
                >
                  <CheckCircle2
                    size={15}
                    className="shrink-0"
                  />

                  {success}
                </motion.div>
              )}

              {/* CREATE ACCOUNT */}

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

                    Creating account...
                  </>
                ) : (
                  <>
                    Create account

                    <ArrowRight
                      size={16}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </>
                )}

              </motion.button>

            </form>

            {/* ================================================= */}
            {/* LOGIN LINK */}
            {/* ================================================= */}

            <div className="mt-4 border-t border-gray-100 pt-4 text-center">

              <p className="text-xs text-gray-500">

                Already have an account?{" "}

                <Link
                  href="/login"
                  className="font-semibold text-green-700 transition hover:text-green-800"
                >
                  Login
                </Link>

              </p>

            </div>

          </div>

          {/* FOOTER */}

          <p className="mt-3 text-center text-[9px] text-gray-400">
            © 2026 Greek Root AI · AI Property Manager
          </p>

        </motion.div>

      </section>
    </main>
  )
}