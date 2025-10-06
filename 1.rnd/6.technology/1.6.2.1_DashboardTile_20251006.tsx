// ===== REUSABLE DASHBOARD TILE COMPONENT =====
// DRY principle - eliminate duplication in page.tsx
// OPTIMIZED: Accessible, semantic, flexible

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface DashboardTileProps {
  title: string
  icon: LucideIcon
  badge?: string
  badgeColor?: string
  children: ReactNode
  className?: string
  variant?: 'default' | 'glass' | 'bordered'
}

export function DashboardTile({
  title,
  icon: Icon,
  badge,
  badgeColor = 'bg-hemp-500',
  children,
  className = '',
  variant = 'glass',
}: DashboardTileProps) {
  const baseClasses = 'p-6 rounded-2xl'
  const variantClasses = {
    default: 'bg-slate-800',
    glass: 'glass hover:bg-white/20 transition-all',
    bordered: 'glass border-2 border-liberty-500/50',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      role="region"
      aria-label={title}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="w-6 h-6 text-hemp-500" aria-hidden="true" />
          <h3 className="text-xl font-bold">{title}</h3>
        </div>
        {badge && (
          <div
            className={`px-3 py-1 ${badgeColor} rounded-full text-sm font-bold`}
            role="status"
          >
            {badge}
          </div>
        )}
      </div>

      {/* Content */}
      <div>{children}</div>
    </motion.div>
  )
}

// ===== XP PROGRESS BAR COMPONENT =====
export function XpProgressBar({
  current,
  required,
  showNumbers = true,
}: {
  current: number
  required: number
  showNumbers?: boolean
}) {
  const percentage = Math.min((current / required) * 100, 100)

  return (
    <div className="mb-3">
      {showNumbers && (
        <div className="flex justify-between text-sm text-slate-300 mb-1">
          <span>{current.toLocaleString()} XP</span>
          <span>{required.toLocaleString()} XP</span>
        </div>
      )}
      <div
        className="h-3 bg-slate-700 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={required}
        aria-label="Experience points progress"
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-hemp-400 to-hemp-600 xp-bar-glow"
        />
      </div>
    </div>
  )
}

// ===== LOADING SKELETON =====
export function TileSkeleton() {
  return (
    <div className="glass p-6 rounded-2xl animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-slate-700 rounded" />
          <div className="w-32 h-6 bg-slate-700 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-slate-700 rounded w-full" />
        <div className="h-4 bg-slate-700 rounded w-3/4" />
      </div>
    </div>
  )
}

// ===== ERROR BOUNDARY FALLBACK =====
export function TileError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="glass p-6 rounded-2xl border-2 border-red-500/50">
      <div className="flex items-center gap-2 mb-4">
        <div className="text-red-500 text-xl">⚠️</div>
        <h3 className="text-xl font-bold text-red-500">Error Loading Tile</h3>
      </div>
      <p className="text-sm text-slate-400 mb-4">{error.message}</p>
      <button onClick={reset} className="btn-secondary text-sm">
        Try Again
      </button>
    </div>
  )
}

// Optimized: 2025-10-02

// Last optimized: 2025-10-02
