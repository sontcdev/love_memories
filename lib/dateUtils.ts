// Date and age calculation utilities

export function calculateAge(dob: string): number {
    const birthDate = new Date(dob)
    const today = new Date()

    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
    }

    return age
}

export function getYearFromDob(dob: string): number {
    return new Date(dob).getFullYear()
}

export function calculateDaysBetween(startDate: string, endDate?: string): number {
    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : new Date()

    // Set to start of day to avoid timezone issues
    start.setHours(0, 0, 0, 0)
    end.setHours(0, 0, 0, 0)

    const diffTime = end.getTime() - start.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
}

export function formatDate(dateString: string, locale: string = 'vi-VN'): string {
    const date = new Date(dateString)
    return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

export function formatDateShort(dateString: string): string {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
}

// Get time until next midnight for counter update
export function getTimeUntilMidnight(): number {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    return tomorrow.getTime() - now.getTime()
}
