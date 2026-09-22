const moodLabels: Record<number, string> = {
  0: "terrible",
  1: "very sad",
  2: "sad",
  3: "down",
  4: "low",
  5: "neutral",
  6: "okay",
  7: "good",
  8: "happy",
  9: "great",
  10: "amazing!",
}

export function getMoodLabel(rating: number): string {
  const rounded = Math.round(rating)
  return moodLabels[rounded] || "neutral"
}
