"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { Star } from "lucide-react"

export function StarRating({
  value,
  onChange,
}: {
  value: number
  onChange: (rating: number) => void
}) {
  const [hover, setHover] = useState(0)

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="flex items-center justify-center gap-2 sm:gap-3"
        onMouseLeave={() => setHover(0)}
        role="radiogroup"
        aria-label="Rate your experience from 1 to 5 stars"
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const active = (hover || value) >= star
          return (
            <motion.button
              key={star}
              type="button"
              role="radio"
              aria-checked={value === star}
              aria-label={`${star} star${star > 1 ? "s" : ""}`}
              onMouseEnter={() => setHover(star)}
              onClick={() => onChange(star)}
              whileTap={{ scale: 0.85 }}
              animate={
                value === star
                  ? { scale: [1, 1.35, 0.92, 1.12, 1] }
                  : { scale: 1 }
              }
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="grid h-[52px] w-[52px] place-items-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-gold sm:h-14 sm:w-14"
            >
              <Star
                className={
                  "h-9 w-9 transition-all duration-200 sm:h-10 sm:w-10 " +
                  (active
                    ? "fill-gold text-gold drop-shadow-[0_0_8px_rgba(201,168,76,0.6)]"
                    : "fill-transparent text-muted-foreground/50")
                }
                strokeWidth={1.5}
              />
            </motion.button>
          )
        })}
      </div>
      <p className="text-sm text-muted-foreground">
        {value ? "Tap another star to change" : "Tap a star to continue"}
      </p>
    </div>
  )
}
