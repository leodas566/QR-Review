"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { Lock, Mail, Eye, EyeOff, Loader2 } from "lucide-react"
import { adminLogin } from "@/lib/supabase"

export function AdminLogin() {
  const router = useRouter()
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError(false)

    const ok = await adminLogin(email.trim(), password)
    if (ok) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("admin_auth", "true")
      }
      router.replace("/admin/dashboard")
    } else {
      setError(true)
      setLoading(false)
    }
  }

  return (
    <main className="grid min-h-svh place-items-center px-5">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #c9a84c 0%, transparent 70%)" }}
      />

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={error
          ? { x: [-10, 10, -8, 8, 0], opacity: 1, y: 0 }
          : { opacity: 1, y: 0 }
        }
        transition={{ duration: error ? 0.4 : 0.5 }}
        className="glass-card gold-glow relative z-10 w-full max-w-sm rounded-2xl p-8"
        style={{ borderColor: "rgba(201,168,76,0.2)" }}
      >
        {/* Icon */}
        <div className="flex flex-col items-center text-center mb-8">
          <div
            className="grid h-16 w-16 place-items-center rounded-full mb-4"
            style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)" }}
          >
            <Lock className="h-7 w-7" style={{ color: "#c9a84c" }} />
          </div>
          <h1 className="font-serif text-2xl font-bold" style={{ color: "#f5f0e8" }}>Admin Login</h1>
          <p className="mt-1 text-sm" style={{ color: "#888880" }}>Cafe Management Dashboard</p>
        </div>

        <div className="space-y-4">
          {/* Email */}
          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: "#888880" }}>Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "#888880" }} />
              <input
                type="email"
                className="input-base pl-10"
                placeholder="admin@cafe.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: "#888880" }}>Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "#888880" }} />
              <input
                type={showPass ? "text" : "password"}
                className="input-base pl-10 pr-10"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "#888880" }}
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center text-sm"
            style={{ color: "#e05555" }}
          >
            Incorrect email or password
          </motion.p>
        )}

        <button
          type="submit"
          className="btn-gold mt-6"
          disabled={loading || !email || !password}
        >
          {loading
            ? <Loader2 className="h-5 w-5 animate-spin" />
            : "Sign In"
          }
        </button>
      </motion.form>
    </main>
  )
}
