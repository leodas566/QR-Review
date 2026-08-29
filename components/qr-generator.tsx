"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { QRCodeCanvas } from "qrcode.react"
import { ChevronLeft, Download, ChevronDown } from "lucide-react"
import { seedIfEmpty, getItem } from "@/lib/store"

const inputCls =
  "w-full rounded-xl border border-gold/20 bg-black/40 px-4 py-3 text-sm text-foreground outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/40"

export function QrGenerator() {
  const [url, setUrl] = useState("https://g.page/r/PLACE_ID_HERE/review")
  const [barName, setBarName] = useState("The Bandra Bar")
  const [style, setStyle] = useState<"square" | "rounded">("rounded")
  const [color, setColor] = useState("#c9a84c")
  const [howToOpen, setHowToOpen] = useState(true)
  const canvasWrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    seedIfEmpty()
    setUrl(getItem("googleReviewURL", "https://g.page/r/PLACE_ID_HERE/review"))
    setBarName(getItem("barName", "The Bandra Bar"))
  }, [])

  const download = () => {
    const source = canvasWrapRef.current?.querySelector("canvas")
    if (!source) return

    const pad = 64
    const labelH = 80
    const size = source.width
    const out = document.createElement("canvas")
    out.width = size + pad * 2
    out.height = size + pad * 2 + labelH
    const ctx = out.getContext("2d")
    if (!ctx) return

    // background
    ctx.fillStyle = "#0a0a0a"
    if (style === "rounded") {
      const r = 40
      ctx.beginPath()
      ctx.moveTo(r, 0)
      ctx.arcTo(out.width, 0, out.width, out.height, r)
      ctx.arcTo(out.width, out.height, 0, out.height, r)
      ctx.arcTo(0, out.height, 0, 0, r)
      ctx.arcTo(0, 0, out.width, 0, r)
      ctx.closePath()
      ctx.fill()
    } else {
      ctx.fillRect(0, 0, out.width, out.height)
    }

    // gold border frame
    ctx.strokeStyle = color
    ctx.lineWidth = 4
    ctx.strokeRect(24, 24, out.width - 48, out.height - 48)

    // QR
    ctx.drawImage(source, pad, pad, size, size)

    // label
    ctx.fillStyle = color
    ctx.font = "600 34px Georgia, serif"
    ctx.textAlign = "center"
    ctx.fillText(barName, out.width / 2, size + pad + 50)

    const link = document.createElement("a")
    link.download = `${barName.replace(/\s+/g, "-").toLowerCase()}-review-qr.png`
    link.href = out.toDataURL("image/png")
    link.click()
  }

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <Link
        href="/dashboard"
        className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-gold"
      >
        <ChevronLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <header className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">QR Code Generator</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a branded QR code that sends customers straight to your review page.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Controls */}
        <div className="glass-card space-y-5 rounded-2xl border-t-2 border-t-gold/60 p-6">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Google Review URL
            </label>
            <input className={inputCls} value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Bar Name</label>
            <input className={inputCls} value={barName} onChange={(e) => setBarName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Frame Style</label>
              <div className="relative">
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value as "square" | "rounded")}
                  className={inputCls + " appearance-none pr-9"}
                >
                  <option value="rounded">Rounded</option>
                  <option value="square">Square</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">QR Color</label>
              <div className="flex items-center gap-2 rounded-xl border border-gold/20 bg-black/40 px-3 py-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-8 w-10 cursor-pointer rounded border-none bg-transparent"
                  aria-label="QR foreground color"
                />
                <span className="text-sm text-foreground">{color.toUpperCase()}</span>
              </div>
            </div>
          </div>

          <button
            onClick={download}
            className="gold-glow flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-3 text-sm font-semibold text-primary-foreground transition hover:bg-gold-light"
          >
            <Download className="h-4 w-4" /> Download QR as PNG
          </button>
        </div>

        {/* Live preview */}
        <div className="flex flex-col items-center justify-center gap-4">
          <div
            ref={canvasWrapRef}
            className={
              "gold-glow flex flex-col items-center gap-4 border border-gold/40 bg-background p-8 " +
              (style === "rounded" ? "rounded-3xl" : "rounded-none")
            }
          >
            <QRCodeCanvas
              value={url || " "}
              size={220}
              bgColor="#0a0a0a"
              fgColor={color}
              level="H"
              marginSize={2}
            />
            <p className="font-serif text-lg font-semibold text-gold">{barName}</p>
          </div>
          <p className="text-xs text-muted-foreground">Live preview</p>
        </div>
      </div>

      {/* How to use */}
      <div className="glass-card mt-8 overflow-hidden rounded-2xl">
        <button
          onClick={() => setHowToOpen((o) => !o)}
          className="flex w-full items-center justify-between px-6 py-4 text-left"
        >
          <span className="font-serif text-lg font-semibold text-foreground">
            How to use this QR code
          </span>
          <ChevronDown
            className={"h-5 w-5 text-gold transition-transform " + (howToOpen ? "rotate-180" : "")}
          />
        </button>
        {howToOpen && (
          <ul className="space-y-3 px-6 pb-6 text-sm text-muted-foreground">
            {[
              "Print it and place it on every table",
              "Frame it at the bar counter for easy scanning",
              "Add it to your bill folders",
              "Put it on your menu or drinks list",
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                {tip}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
