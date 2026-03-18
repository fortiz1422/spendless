import type { HeroCache, HeroEngineInput } from './types'

const CACHE_KEY = 'gota_hero_cache'

export function readHeroCache(): HeroCache | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as HeroCache) : null
  } catch {
    return null
  }
}

export function writeHeroCache(cache: HeroCache): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // localStorage might be unavailable (private mode, quota exceeded)
  }
}

function dateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function shouldRecompute(
  cache: HeroCache | null,
  s: HeroEngineInput,
): boolean {
  if (!cache) return true

  const today = dateKey(s.today)

  // New day
  if (cache.computedAt !== today) return true

  // Big expense today (> 20% of income)
  if (
    s.bigExpenseToday &&
    s.monthlyIncome > 0 &&
    s.bigExpenseAmount > s.monthlyIncome * 0.20
  )
    return true

  // Phase changed
  if (cache.monthPhase !== s.monthPhase) return true

  // A card closes today
  if (s.closingCards.some((c) => c.daysToClosing === 0)) return true

  return false
}
