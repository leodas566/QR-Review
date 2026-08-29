"use client"

import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "motion/react"
import { RefreshCw, Copy, Check, Pencil } from "lucide-react"
import { StarRating } from "@/components/star-rating"
import { seedIfEmpty, getItem } from "@/lib/store"
import { generateReview } from "@/lib/message-engine"
import { trackScan, trackCopy } from "@/lib/supabase"

const BUSINESS_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"

export function LandingPage() {
  const [barName, setBarName]           = useState("House of Paloma Bandra")
  const [barLocation, setBarLocation]   = useState("Bandra West, Mumbai")
  const [reviewUrl, setReviewUrl]       = useState(
    "https://search.google.com/local/writereview?placeid=ChIJ4TflFcvJ5zsRWP5VIdUk9Qg",
  )
  const [rating, setRating]             = useState(0)
  const [message, setMessage]           = useState("")
  const [copied, setCopied]             = useState(false)
  const [currentScanId, setCurrentScanId] = useState<string | null>(null)

  useEffect(() => {
    seedIfEmpty()
    setBarName(getItem("barName", "House of Paloma Bandra"))
    setBarLocation(getItem("barLocation", "Bandra West, Mumbai"))
    setReviewUrl(
      getItem(
        "googleReviewURL",
        "https://search.google.com/local/writereview?placeid=ChIJ4TflFcvJ5zsRWP5VIdUk9Qg",
      ),
    )
  }, [])

  const buildMessage = useCallback(
    (r: number) => {
      const override = getItem<string>("customMessage", "")
      if (override?.trim()) return override.replace(/\{BAR_NAME\}/g, barName)
      return generateReview(r, barName)
    },
    [barName],
  )

  const handleRate = async (r: number) => {
    setRating(r)
    setMessage(buildMessage(r))
    setCopied(false)

    // Track scan in Supabase — this is the single source of truth
    try {
      const scan = await trackScan(BUSINESS_ID, r)
      if (scan) setCurrentScanId(scan.id)
    } catch (err) {
      console.error("Failed to track scan:", err)
    }
  }

  const reshuffle = () => {
    setMessage(buildMessage(rating))
    setCopied(false)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message)
    } catch {
      // clipboard may be blocked; still proceed
    }

    setCopied(true)

    // Mark this scan as copied in Supabase
    if (currentScanId) {
      try {
        await trackCopy(currentScanId)
      } catch (err) {
        console.error("Failed to track copy:", err)
      }
    }

    setTimeout(() => {
      window.location.href = reviewUrl
    }, 1800)
  }

  return (
    <main className="relative mx-auto flex min-h-svh w-full max-w-md flex-col items-center px-5 pb-12 pt-14">
      {/* ambient gold glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-gold/10 blur-3xl"
      />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="flex flex-col items-center text-center"
      >
        <div className="gold-glow relative grid h-24 w-24 place-items-center overflow-hidden rounded-full border border-gold/40">
          <Image src="/bar-logo.png" alt={`${barName} logo`} fill className="object-cover" priority />
        </div>
        <h1 className="mt-6 bg-[length:200%_auto] font-serif text-4xl font-bold leading-tight text-gradient-gold shimmer text-balance">
          {barName}
        </h1>
        <p className="mt-2 text-sm uppercase tracking-[0.2em] text-muted-foreground">{barLocation}</p>
        <p className="mt-5 font-serif text-xl text-foreground/90 text-pretty">
          {"Loved your experience tonight?"}
        </p>
      </motion.div>

      {/* Star Rating */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
        className="mt-12 w-full"
      >
        <StarRating value={rating} onChange={handleRate} />
      </motion.div>

      {/* Review Message Box */}
      <AnimatePresence>
        {rating > 0 && (
          <motion.section
            key="msgbox"
            initial={{ opacity: 0, y: 24, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mt-10 w-full overflow-hidden"
          >
            <div className="glass-card gold-glow rounded-2xl p-5">
              <label htmlFor="review" className="sr-only">
                Your review message
              </label>
              <textarea
                id="review"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full resize-none rounded-xl border border-gold/30 bg-black/40 p-4 text-[15px] leading-relaxed text-foreground outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/40"
              />
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Pencil className="h-3.5 w-3.5" /> Feel free to edit this
                </span>
                <button
                  type="button"
                  onClick={reshuffle}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 px-3 py-1.5 text-gold transition hover:border-gold hover:bg-gold/10"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Try a different message
                </button>
              </div>
            </div>

            <motion.button
              type="button"
              onClick={handleCopy}
              whileTap={{ scale: 0.98 }}
              className="gold-glow-strong mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gold px-6 py-4 text-base font-semibold text-primary-foreground transition hover:bg-gold-light disabled:opacity-80"
              disabled={copied}
            >
              {copied ? (
                <>
                  <Check className="h-5 w-5" /> Copied! Opening Google…
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5" /> Copy &amp; Open Google Review
                </>
              )}
            </motion.button>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-auto pt-16 text-center">
        <p className="text-sm text-muted-foreground">Thank you for visiting us 🙏</p>
        <p className="mt-2 text-xs text-gold/70">Powered by ReviewBoost</p>
      </footer>
    </main>
  )
}
