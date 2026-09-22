const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/

// Entries are stored as UTC midnight of the user's local calendar day, so the
// day never depends on the server's timezone.
export function toEntryDate(date?: string | null, timeZone?: string | null): Date | null {
  if (date) {
    if (!DATE_KEY.test(date)) return null
    const parsed = new Date(`${date}T00:00:00.000Z`)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  if (timeZone) {
    try {
      // en-CA formats as yyyy-MM-dd
      const local = new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date())
      return new Date(`${local}T00:00:00.000Z`)
    } catch {
      return null
    }
  }

  return new Date(`${dateKey(new Date())}T00:00:00.000Z`)
}

export function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}
