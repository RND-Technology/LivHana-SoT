// ===== GAMIFICATION UTILITIES =====
// XP calculation, level progression, rank assignment
// OPTIMIZED: DRY principle, no duplication

import { Rank } from '@/types'

/**
 * Calculate XP required to reach the next level
 * Formula: level * 100 (linear progression)
 * Future: Could make exponential for harder scaling
 */
export function getXpToNextLevel(level: number): number {
  return level * 100
}

/**
 * Calculate progress percentage toward next level
 * @returns Percentage (0-100)
 */
export function getXpProgress(xp: number, level: number): number {
  const required = getXpToNextLevel(level)
  const current = xp % required
  return Math.min((current / required) * 100, 100)
}

/**
 * Calculate remaining XP needed for next level
 */
export function getXpRemaining(xp: number, level: number): number {
  const required = getXpToNextLevel(level)
  const current = xp % required
  return required - current
}

/**
 * Calculate total XP accumulated in current level
 */
export function getCurrentLevelXp(xp: number, level: number): number {
  const required = getXpToNextLevel(level)
  return xp % required
}

/**
 * Determine rank based on level
 * SEEDLING: 1-5
 * CULTIVATOR: 6-15
 * TRUTH_FARMER: 16-30
 * WALL_RIDER: 31+
 */
export function getRankForLevel(level: number): Rank {
  if (level >= 31) return Rank.WALL_RIDER
  if (level >= 16) return Rank.TRUTH_FARMER
  if (level >= 6) return Rank.CULTIVATOR
  return Rank.SEEDLING
}

/**
 * Get rank display metadata
 */
export function getRankMetadata(rank: Rank) {
  const metadata = {
    [Rank.SEEDLING]: {
      name: 'Seedling',
      color: 'from-green-400 to-green-600',
      textColor: 'text-green-400',
      bgColor: 'bg-green-500',
      description: 'Just getting started on your journey',
      minLevel: 1,
      maxLevel: 5,
    },
    [Rank.CULTIVATOR]: {
      name: 'Cultivator',
      color: 'from-blue-400 to-blue-600',
      textColor: 'text-blue-400',
      bgColor: 'bg-blue-500',
      description: 'Growing your knowledge and skills',
      minLevel: 6,
      maxLevel: 15,
    },
    [Rank.TRUTH_FARMER]: {
      name: 'Truth Farmer',
      color: 'from-purple-400 to-purple-600',
      textColor: 'text-purple-400',
      bgColor: 'bg-purple-500',
      description: 'Cultivating truth and freedom',
      minLevel: 16,
      maxLevel: 30,
    },
    [Rank.WALL_RIDER]: {
      name: 'Wall Rider',
      color: 'from-yellow-400 to-yellow-600',
      textColor: 'text-yellow-400',
      bgColor: 'bg-yellow-500',
      description: 'Elite status - riding the wall',
      minLevel: 31,
      maxLevel: Infinity,
    },
  }

  return metadata[rank]
}

/**
 * Check if XP gain triggers level up
 * @returns { leveled: boolean, newLevel: number, newRank: Rank }
 */
export function checkLevelUp(
  currentXp: number,
  currentLevel: number,
  xpGain: number
): { leveled: boolean; newLevel: number; newRank: Rank; oldRank: Rank } {
  const newXp = currentXp + xpGain
  let newLevel = currentLevel

  // Check if we crossed level threshold
  while (newXp >= getXpToNextLevel(newLevel)) {
    newLevel++
  }

  const leveled = newLevel > currentLevel
  const oldRank = getRankForLevel(currentLevel)
  const newRank = getRankForLevel(newLevel)

  return { leveled, newLevel, newRank, oldRank }
}

/**
 * Format XP number for display
 * 1000 -> "1,000"
 * 1000000 -> "1M"
 */
export function formatXp(xp: number): string {
  if (xp >= 1_000_000) {
    return `${(xp / 1_000_000).toFixed(1)}M`
  }
  if (xp >= 1_000) {
    return xp.toLocaleString()
  }
  return xp.toString()
}

/**
 * Calculate leaderboard position based on XP
 * (Placeholder - would need actual database query)
 */
export function estimateLeaderboardPosition(xp: number): number {
  // This is a mock calculation
  // In production, query database for actual position
  return Math.max(1, Math.floor(Math.random() * 1000))
}
