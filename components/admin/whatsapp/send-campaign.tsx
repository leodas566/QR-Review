"use client"

import { useEffect, useState } from "react"
import { Send, Users, FileText, Calendar, Loader2, Check } from "lucide-react"
import { getCustomers, getTemplates, insertCampaign, type Template, type Customer } from "@/lib/supabase"
import { fillTemplate, daysSince } from "@/lib/utils"

const SEGMENTS = [
  { id: "all",         label: "All Customers",       desc: "Everyone" },
  { id: "inactive15",  label: "Inactive 15+ days",   desc: "Haven't visited in 15 days" },
  { id: "inactive30",  label: "Inactive 30+ days",   desc: "Haven't visited in 30 days" },
  { id: "new",         label: "Never Returned",       desc: "Only 1 visit" },
]

type Step = 1 | 2 | 3

export function SendCampaign() {
  const [step, setStep]             = useState<Step>(1)
  const [customers, setCustomers]   = useState<Customer[]>([])
  const [templates, setTemplates]   = useState<Template[]>([])
  const [segment, setSegment]       = useState("all")
  const [templateId, setTemplateId] = useState<string | null>(null)
  const [scheduleDate, setScheduleDate] = useState("")
  const [scheduleTime, setScheduleTime] = useState("")
  const [sending, setSending]       = useState(false)
  const [sent, setSent]             = useState(false)

  useEffect(() => {
    getCustomers().then(setCustomers)
    getTemplates().then(setTemplates)
  }, [])

  const filteredCustomers = customers.filter(c => {
    if (segment === "all")        return true
    if (segment === "inactive15") return daysSince(c.last_visit) >= 15
    if (segment === "inactive30") return daysSince(c.last_visit) >= 30
    if (segment === "new")        return c.visit_count === 1
    return true
  })

  const selectedTemplate = templates.find(t => t.id === templateId)

  const previewMessage = selectedTemplate
    ? fillTemplate(selectedTemplate.message, {
        name: "Customer",
        cafe_name: "House of Paloma",
        offer: "10% off",
        date: "this weekend",
        phone: "",
      })
    : ""

  const handleSend = async () => {
    if (!templateId || filteredCustomers.length === 0) return
    setSending(true)

    const scheduledAt = scheduleDate && scheduleTime
      ? new Date(`${scheduleDate}T${scheduleTime}`).toISOString()
      : undefined

    await insertCampaign({
      template_id: templateId,
      template_name: selectedTemplate?.name,
      segment,
      total_sent: filteredCustomers.length,
      scheduled_at: scheduledAt,
    })

    setSending(false)
    setSent(true)
    setTimeout(() => { setSent(false); setStep(1); setSegment("all"); setTemplateId(null) }, 3000)
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div
          className="grid h-16 w-16 place-items-center rounded-full"
          style={{ background: "rgba(76,175,125,0.15)", border: "1px solid rgba(76,175,125,0.3)" }}
        >
          <Check className="h-8 w-8" style={{ color: "#4caf7d" }} />
        </div>
        <p className="text-lg font-semibold" style={{ color: "#f5f0e8" }}>Campaign Created!</p>
        <p className="text-sm" style={{ color: "#888880" }}>
          {filteredCustomers.length} recipients queued
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[1,2,3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div
              className="grid h-7 w-7 place-items-center rounded-full text-xs font-bold"
              style={{
                background: step >= s ? "#c9a84c" : "rgba(255,255,255,0.05)",
                color: step >= s ? "#0a0a0a" : "#888880",
              }}
            >
              {s}
            </div>
            {s < 3 && <div className="h-px w-8" style={{ background: step > s ? "#c9a84c" : "rgba(201,168,76,0.2)" }} />}
          </div>
        ))}
        <p className="ml-2 text-sm" style={{ color: "#888880" }}>
          {step === 1 ? "Select Segment" : step === 2 ? "Choose Template" : "Preview & Send"}
        </p>
      </div>

      {/* STEP 1: Segment */}
      {step === 1 && (
        <div className="space-y-3">
          {SEGMENTS.map(s => (
            <button
              key={s.id}
              onClick={() => setSegment(s.id)}
              className="w-full glass-card rounded-xl p-4 text-left transition-all"
              style={{
                borderColor: segment === s.id ? "rgba(201,168,76,0.4)" : "rgba(201,168,76,0.1)",
                background: segment === s.id ? "rgba(201,168,76,0.08)" : "rgba(255,255,255,0.02)",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm" style={{ color: "#f5f0e8" }}>{s.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#888880" }}>{s.desc}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" style={{ color: "#888880" }} />
                  <span className="font-bold text-sm" style={{ color: "#c9a84c" }}>
                    {segment === s.id ? filteredCustomers.length : "–"}
                  </span>
                </div>
              </div>
            </button>
          ))}
          <p className="text-sm text-center py-2" style={{ color: "#c9a84c" }}>
            <strong>{filteredCustomers.length}</strong> customers selected
          </p>
          <button className="btn-gold" onClick={() => setStep(2)}>
            Next <FileText className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* STEP 2: Template */}
      {step === 2 && (
        <div className="space-y-3">
          {templates.length === 0 ? (
            <p className="text-center py-10" style={{ color: "#888880" }}>No templates yet. Create one first.</p>
          ) : (
            templates.map(t => (
              <button
                key={t.id}
                onClick={() => setTemplateId(t.id)}
                className="w-full glass-card rounded-xl p-4 text-left transition-all"
                style={{
                  borderColor: templateId === t.id ? "rgba(201,168,76,0.4)" : "rgba(201,168,76,0.1)",
                  background: templateId === t.id ? "rgba(201,168,76,0.08)" : "rgba(255,255,255,0.02)",
                }}
              >
                <p className="font-medium text-sm" style={{ color: "#f5f0e8" }}>{t.name}</p>
                <p className="text-xs mt-1 line-clamp-2" style={{ color: "#888880" }}>{t.message}</p>
              </button>
            ))
          )}
          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="rounded-xl px-4 py-3 text-sm flex-1"
              style={{ color: "#888880", border: "1px solid rgba(201,168,76,0.1)" }}
            >
              Back
            </button>
            <button className="btn-gold flex-1" onClick={() => setStep(3)} disabled={!templateId}>
              Next <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Preview & Send */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-5" style={{ borderColor: "rgba(201,168,76,0.15)" }}>
            <p className="text-xs font-medium mb-3" style={{ color: "#888880" }}>Message Preview</p>
            <p className="text-sm leading-relaxed" style={{ color: "#f5f0e8" }}>{previewMessage}</p>
          </div>

          <div
            className="flex items-center justify-between rounded-xl p-4"
            style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)" }}
          >
            <span className="text-sm" style={{ color: "#888880" }}>Recipients</span>
            <span className="font-bold" style={{ color: "#c9a84c" }}>{filteredCustomers.length} customers</span>
          </div>

          {/* Schedule */}
          <div className="space-y-2">
            <p className="text-sm font-medium" style={{ color: "#888880" }}>Schedule (optional)</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0" style={{ color: "#888880" }} />
                <input type="date" className="input-base py-2 text-sm" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} />
              </div>
              <input type="time" className="input-base py-2 text-sm" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="rounded-xl px-4 py-3 text-sm flex-1" style={{ color: "#888880", border: "1px solid rgba(201,168,76,0.1)" }}>Back</button>
            <button className="btn-gold flex-1" onClick={handleSend} disabled={sending}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : scheduleDate ? <><Calendar className="h-4 w-4" /> Schedule</> : <><Send className="h-4 w-4" /> Send Now</>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
