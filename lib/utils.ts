import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1)  return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  })
}

export function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24))
}

export function fillTemplate(message: string, vars: Record<string, string>): string {
  return message.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`)
}

export function generateReview(rating: number, cafeName: string): string {
  const messages: Record<number, string[]> = {
    5: [
      `Absolutely love ${cafeName}! The ambiance is stunning, the food is incredible, and the service is top-notch. Every visit feels special. Highly recommend to everyone! ⭐⭐⭐⭐⭐`,
      `${cafeName} never disappoints! Had an amazing time here. The food was delicious, service was prompt and friendly. Will definitely be coming back! 🙌`,
    ],
    4: [
      `Really enjoyed my visit to ${cafeName}. Great food and lovely atmosphere. Service was good too. Would definitely recommend for a nice evening out! 😊`,
      `${cafeName} is a wonderful spot. The quality of food and drinks is excellent. Had a great experience overall and will definitely return! 👍`,
    ],
    3: [
      `Good experience at ${cafeName}. The food was tasty and the place has a nice vibe. Service could be a bit faster but overall a decent visit. 🙂`,
      `Decent visit to ${cafeName}. Food was good, atmosphere was pleasant. A solid choice for a casual outing. Would give it another try! 👌`,
    ],
    2: [
      `Mixed experience at ${cafeName}. Some things were good but there's room for improvement. Hope to see better on my next visit. 🤞`,
    ],
    1: [
      `Had some issues during my visit to ${cafeName}. The team could work on improving the experience. Hoping for better next time. 🙏`,
    ],
  }
  const options = messages[rating] ?? messages[3]
  return options[Math.floor(Math.random() * options.length)]
}
