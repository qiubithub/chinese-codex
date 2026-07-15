import { defineStore } from 'pinia'
import { getHomeOverview } from '../services/api'
import type { HomeOverview } from '../types'

const fallbackOverview: HomeOverview = {
  user: {
    nickname: '高潜力普通用户',
    memberLevel: 'A6',
    tokenBalance: 23456,
    anxietyValue: 680,
    nextBenefit: '升级 A7 后可解锁更像人的客服',
  },
  finance: {
    todayVirtualProfit: 23.68,
    imaginedAnnualRate: '0.09% 起',
    withdrawStatus: '系统维护中，请继续积累信任',
    riskNotice: '页面数字均为虚构展示，不构成任何金融、投资、收益或消费建议。',
  },
  quickEntries: [
    { key: 'ai', title: 'AI 写周报', subtitle: '把暂无进展写成持续推进', badgeText: 'A7', bugText: '当前问题属于更高等级模型' },
    { key: 'finance', title: 'Token 理财', subtitle: '想象年化 0.09% 起', badgeText: '虚构', bugText: '截图时曲线自动上扬' },
    { key: 'delivery', title: '外卖生活', subtitle: '老板画饼套餐配送中', badgeText: '热', bugText: '骑手已进入量子态' },
    { key: 'video', title: '短视频', subtitle: '再刷 3 分钟解锁再刷', badgeText: '99+', bugText: '提现需要继续观看教程' },
    { key: 'member', title: '会员体系', subtitle: 'A1-A10 成长焦虑通道', badgeText: 'SVIP', bugText: '升级后解锁更像人的客服' },
    { key: 'task', title: '任务中心', subtitle: '连续失败也能领奖励', badgeText: '27', bugText: '完成任务后生成更多任务' },
    { key: 'social', title: '社交关系', subtitle: '朋友圈低调炫耀托管', badgeText: '8', bugText: '点赞理由由算法统一口径' },
    { key: 'shop', title: '电商严选', subtitle: '更贵但更有仪式感', badgeText: '券', bugText: '比价后推荐情绪价值最高款' },
    { key: 'gov', title: '政企服务', subtitle: '等待一个看不见的章', badgeText: 'NEW', bugText: '请上传更像证件的证件' },
    { key: 'weird', title: '奇怪工具', subtitle: '会议废话压缩器', badgeText: '怪', bugText: '关闭弹窗后弹出关闭确认' },
  ],
  tasks: [
    { title: '看广告涨信用分', progressText: '2/3', rewardText: '+0.1' },
    { title: '关闭无法关闭的弹窗', progressText: '1/3', rewardText: '+清醒值' },
    { title: '邀请好友看到邀请任务', progressText: '0/1', rewardText: '+200 Token' },
    { title: '连续失败领取坚持奖励', progressText: '3/3', rewardText: '+2 坚持值' },
    { title: '补签昨天的补签任务', progressText: '0/2', rewardText: '+复活卡' },
  ],
  redDotLogs: [
    { targetName: '会员中心', message: '你清除了任务中心红点，系统已转移至会员中心' },
    { targetName: '通知中心', message: '你关闭了通知，通知已通过弹窗通知你' },
    { targetName: '提现中心', message: 'Token 余额看起来更多了，提现能力正在维护' },
  ],
}

export const useAppStore = defineStore('app', {
  state: () => ({
    overview: fallbackOverview,
    loading: false,
    apiOnline: false,
  }),
  actions: {
    async loadOverview() {
      this.loading = true
      try {
        this.overview = await getHomeOverview()
        this.apiOnline = true
      } catch {
        this.overview = fallbackOverview
        this.apiOnline = false
      } finally {
        this.loading = false
      }
    },
  },
})
