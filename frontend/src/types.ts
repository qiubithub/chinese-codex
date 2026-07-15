export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface HomeOverview {
  user: {
    nickname: string
    memberLevel: string
    tokenBalance: number
    anxietyValue: number
    nextBenefit: string
  }
  finance: {
    todayVirtualProfit: number
    imaginedAnnualRate: string
    withdrawStatus: string
    riskNotice: string
  }
  quickEntries: QuickEntry[]
  tasks: TaskItem[]
  redDotLogs: RedDotLog[]
}

export interface QuickEntry {
  key: string
  title: string
  subtitle: string
  badgeText: string
  bugText: string
}

export interface TaskItem {
  title: string
  progressText: string
  rewardText: string
}

export interface RedDotLog {
  targetName: string
  message: string
}
