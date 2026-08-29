// Local, API-free review message generation engine.
// Combines randomized parts so virtually no two users see the same message.

const OPENINGS = [
  "Came here on a whim and honestly...",
  "Solid night out at {BAR_NAME}.",
  "Been meaning to visit {BAR_NAME} for a while —",
  "Finally tried {BAR_NAME} last night and",
  "Good times at {BAR_NAME}!",
  "Ekdum mast experience at {BAR_NAME}.",
  "Spent an evening at {BAR_NAME} and",
  "Yaar, {BAR_NAME} did not disappoint.",
  "Quick review of {BAR_NAME} —",
  "Not my first time at {BAR_NAME} but",
  "Stumbled upon {BAR_NAME} with friends and",
  "Date night at {BAR_NAME} —",
]

const MIDDLES = [
  "the cocktails were on point",
  "drinks were well-crafted, not watered down",
  "the ambience is really nice, dim lighting and good music",
  "staff was chill and attentive without being annoying",
  "the bar area gets lively but not too loud",
  "tried their signature cocktail — worth it",
  "food was decent for a bar, better than expected",
  "the crowd was good, nice energy",
  "music selection was on point",
  "great place to catch up with friends",
  "service was quick even when it got busy",
  "love the interiors, very well done",
  "bartenders know what they're doing",
  "portions were generous",
  "perfect spot for a Friday night",
]

const CLOSINGS = [
  "Will be back for sure.",
  "Definitely returning.",
  "Would recommend to anyone looking for a solid bar in Bandra.",
  "Good addition to the Bandra bar scene.",
  "4 out of 5 from me.",
  "Worth a visit if you're in the area.",
  "Already planning the next visit.",
  "Told my friends to check it out.",
  "Solid spot overall.",
  "No complaints from our end!",
  "Exactly what we needed.",
  "Good vibes all around.",
]

const EMOJIS = ["⭐", "🍸", "🥂", "🎵", "👌", "🙌"]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickDistinct<T>(arr: T[], count: number): T[] {
  const pool = [...arr]
  const out: T[] = []
  for (let i = 0; i < count && pool.length; i++) {
    const idx = Math.floor(Math.random() * pool.length)
    out.push(pool.splice(idx, 1)[0])
  }
  return out
}

function capitalizeAfterOpening(opening: string, middle: string): string {
  // If opening ends with a lowercase connector like "and", keep middle lowercase.
  const endsWithConnector = /(\band|but|—|\.\.\.)\s*$/i.test(opening.trim())
  if (endsWithConnector) return middle
  // Otherwise start middle as its own sentence.
  return middle.charAt(0).toUpperCase() + middle.slice(1)
}

export function generateReview(rating: number, barName: string): string {
  // Negative-tone overrides
  if (rating <= 1) {
    return `Wasn't our best experience at ${barName}. A few things didn't go as expected. Hopefully a one-off.`
  }
  if (rating === 2) {
    return `Mixed experience at ${barName}. Had a couple of issues during our visit. Hope things improve.`
  }

  const opening = pick(OPENINGS).replace(/\{BAR_NAME\}/g, barName)

  // Tone by rating
  let middleCount: number
  let closing: string
  if (rating >= 5) {
    middleCount = 2
    closing = pick(CLOSINGS)
  } else if (rating === 4) {
    middleCount = Math.random() > 0.5 ? 2 : 1
    closing = pick(CLOSINGS)
  } else {
    // 3 stars — neutral
    middleCount = 1
    closing = "Decent place, nothing extraordinary but not bad either."
  }

  const middles = pickDistinct(MIDDLES, middleCount)
  const firstMiddle = capitalizeAfterOpening(opening, middles[0])
  let body = `${opening} ${firstMiddle}`
  if (middles[1]) {
    body += `. ${middles[1].charAt(0).toUpperCase() + middles[1].slice(1)}`
  }
  body = body.replace(/\.\.+\s/, "... ")
  let message = `${body}. ${closing}`.replace(/\s+/g, " ").replace(/\.\./g, ".").trim()

  // Randomly add an emoji (skip for the mild 3-star tone occasionally)
  if (rating >= 4 && Math.random() > 0.5) {
    message += ` ${pick(EMOJIS)}`
  }

  return message
}
