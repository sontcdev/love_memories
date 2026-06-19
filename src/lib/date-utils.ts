const TZ = "Asia/Ho_Chi_Minh"

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions) {
  return new Date(date).toLocaleDateString("vi-VN", {
    timeZone: TZ,
    ...options,
  })
}

export function getDateParts(date: Date | string) {
  const d = new Date(date)
  const formatter = new Intl.DateTimeFormat("vi-VN", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
  const parts = formatter.formatToParts(d)
  const get = (type: string) => parseInt(parts.find((p) => p.type === type)?.value ?? "0", 10)
  return { year: get("year"), month: get("month"), day: get("day") }
}

export function getTodayStart() {
  const now = new Date()
  const { year, month, day } = getDateParts(now)
  const tzOffset = new Date(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T00:00:00+07:00`).getTime()
  return new Date(tzOffset)
}

export function tomorrowMinInput() {
  const { year, month, day } = getDateParts(new Date())
  const d = new Date(year, month - 1, day + 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}
