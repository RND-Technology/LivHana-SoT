// ===== EMPIRE EMPIRE TYPE DEFINITIONS =====
// Complete type safety for cannabis commerce + gamification

export enum Rank {
  SEEDLING = 'SEEDLING',
  CULTIVATOR = 'CULTIVATOR',
  TRUTH_FARMER = 'TRUTH_FARMER',
  WALL_RIDER = 'WALL_RIDER',
}

export enum MissionType {
  WATCH_EPISODE = 'WATCH_EPISODE',
  SIGN_PETITION = 'SIGN_PETITION',
  COMPLETE_ORDER = 'COMPLETE_ORDER',
  REFER_FRIEND = 'REFER_FRIEND',
  DAILY_LOGIN = 'DAILY_LOGIN',
  LEARN_POLICY = 'LEARN_POLICY',
  SHARE_CONTENT = 'SHARE_CONTENT',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  AUTHORIZED = 'AUTHORIZED',
  CAPTURED = 'CAPTURED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum NotificationType {
  MISSION_COMPLETE = 'MISSION_COMPLETE',
  LEVEL_UP = 'LEVEL_UP',
  XP_REWARD = 'XP_REWARD',
  ORDER_CONFIRMED = 'ORDER_CONFIRMED',
  RAFFLE_WIN = 'RAFFLE_WIN',
  PETITION_MILESTONE = 'PETITION_MILESTONE',
  EPISODE_RELEASE = 'EPISODE_RELEASE',
}

// ===== USER TYPES =====

export interface User {
  id: string
  email: string
  phone?: string
  firstName: string
  lastName: string
  dateOfBirth: Date
  ageVerified: boolean
  ageVerifiedAt?: Date
  xp: number
  level: number
  rank: Rank
  preferences?: Record<string, any>
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
}

export interface UserProfile extends User {
  missionsCompleted: number
  ordersCompleted: number
  petitionsSigned: number
  raffleEntries: number
}

// ===== GAMIFICATION TYPES =====

export interface Mission {
  id: string
  type: MissionType
  title: string
  description: string
  xpReward: number
  requirements: Record<string, any>
  videoUrl?: string
  articleUrl?: string
  externalUrl?: string
  active: boolean
  startDate?: Date
  endDate?: Date
}

export interface UserMission {
  id: string
  userId: string
  missionId: string
  completed: boolean
  completedAt?: Date
  progress: number
  mission: Mission
}

export interface XPEvent {
  id: string
  userId: string
  amount: number
  source: string
  reason: string
  createdAt: Date
}

export interface LevelUpEvent {
  oldLevel: number
  newLevel: number
  oldRank: Rank
  newRank: Rank
  xpRequired: number
}

// ===== COMMERCE TYPES =====

export interface Product {
  id: string
  sku: string
  name: string
  description?: string
  price: number
  salePrice?: number
  stock: number
  lowStock: number
  thcPercent?: number
  cbdPercent?: number
  coaUrl?: string
  coaVerified: boolean
  greeks?: HerbitrageGreeks
  images: string[]
  thumbnail?: string
  active: boolean
  featured: boolean
  category?: string
  tags: string[]
}

export interface HerbitrageGreeks {
  delta: number  // Price sensitivity
  theta: number  // Time decay
  gamma: number  // Acceleration
  vega: number   // Volatility
}

export interface Order {
  id: string
  userId: string
  orderNumber: string
  subtotal: number
  tax: number
  shipping: number
  total: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  location?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  items: OrderItem[]
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  price: number
  subtotal: number
  product: Product
}

export interface CartItem {
  product: Product
  quantity: number
}

// ===== RAFFLE TYPES =====

export interface Raffle {
  id: string
  title: string
  description: string
  prizeItem: string
  prizeValue: number
  minXpRequired: number
  minRank?: Rank
  startDate: Date
  endDate: Date
  drawDate: Date
  active: boolean
  drawn: boolean
  winnerId?: string
  totalEntries: number
}

export interface RaffleEntry {
  id: string
  raffleId: string
  userId: string
  createdAt: Date
}

// ===== POLICY & ADVOCACY TYPES =====

export interface Petition {
  id: string
  title: string
  description: string
  targetBody: string
  billNumber?: string
  goal: number
  current: number
  active: boolean
  startDate: Date
  endDate?: Date
}

export interface PetitionSignature {
  id: string
  petitionId: string
  userId: string
  comment?: string
  signedAt: Date
}

// ===== CONTENT TYPES =====

export interface Episode {
  id: string
  episodeNum: number
  title: string
  description?: string
  youtubeId: string
  youtubeUrl: string
  bpm?: number
  key?: string
  mood?: string
  published: boolean
  publishedAt?: Date
  views: number
  likes: number
}

// ===== NOTIFICATION TYPES =====

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
  read: boolean
  readAt?: Date
  createdAt: Date
}

// ===== API TYPES =====

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// ===== DASHBOARD METRICS =====

export interface DashboardMetrics {
  totalUsers: number
  activeUsers: number
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  conversionRate: number
  topProducts: Product[]
  recentOrders: Order[]
}

// ===== WALL OF WEED =====

export interface WallProduct extends Product {
  herbitrageScore: number
  roiPerDay: number
  popularity: number
  trending: boolean
}

// ===== AGE VERIFICATION =====

export interface AgeVerificationRequest {
  dateOfBirth: Date
  idDocument?: File
  ipAddress: string
}

export interface AgeVerificationResponse {
  verified: boolean
  method: 'dob' | 'id' | 'biometric'
  verifiedAt: Date
  expiresAt: Date
}

// Optimized: 2025-10-02
