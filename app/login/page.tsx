"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { Lock } from "lucide-react"
import { seedIfEmpty, getItem, setItem } from "@/lib/store"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)

  useEffect(() => {
    seedIfEmpty()
    if (getItem("isLoggedIn", false)) router.replace("/dashboard")
  }, [router])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const validEmail = getItem("ownerEmail", "owner@thebandrabar.com")
    const validPassword = getItem("ownerPassword", "admin123")
    if (email.trim() === validEmail && password === validPassword) {
      setItem("isLoggedIn", true)
      router.push("/dashboard")
    } else {
      setError(true)
      setTimeout(() => setError(false), 600)
    }
  }

  return (
    <main className="grid min-h-svh place-items-center px-5">
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gold/10 blur-3xl"
      />
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 16 }}
        animate={
          error
            ? { x: [0, -10, 10, -8, 8, 0], opacity: 1, y: 0 }
            : { opacity: 1, y: 0 }
        }
        transition={{ duration: error ? 0.5 : 0.6 }}
        className="glass-card gold-glow relative z-10 w-full max-w-sm rounded-2xl p-8"
      >
        <div className="flex flex-col items-center text-center">
          <div className="grid h-14 w-14 place-items-center rounded-full border border-gold/40 bg-gold/10">
            <Lock className="h-6 w-6 text-gold" />
          </div>
          <h1 className="mt-4 font-serif text-2xl font-bold text-foreground">Owner Login</h1>
          <p className="mt-1 text-sm text-muted-foreground">ReviewBoost Dashboard</p>
        </div>

        <div className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gold/20 bg-black/40 px-4 py-3 text-sm text-foreground outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/40"
              placeholder="owner@thebandrabar.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gold/20 bg-black/40 px-4 py-3 text-sm text-foreground outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/40"
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 text-center text-sm text-destructive">
            Incorrect email or password. Please try again.
          </p>
        )}

        <button
          type="submit"
          className="gold-glow mt-6 w-full rounded-xl bg-gold py-3 text-sm font-semibold text-primary-foreground transition hover:bg-gold-light"
        >
          Sign In
        </button>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Demo: owner@thebandrabar.com / admin123
        </p>
      </motion.form>
    </main>
  )
}
