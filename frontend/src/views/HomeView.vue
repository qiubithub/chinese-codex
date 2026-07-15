<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import {
  Bell,
  ChatDotRound,
  Coin,
  CreditCard,
  Food,
  Grid,
  MagicStick,
  OfficeBuilding,
  Operation,
  Promotion,
  Refresh,
  ShoppingCart,
  TakeawayBox,
  Ticket,
  TrendCharts,
  Trophy,
  VideoPlay,
  Wallet,
} from '@element-plus/icons-vue'
import heroImage from '../assets/hero.png'
import { useAppStore } from '../stores/app'
import type { QuickEntry } from '../types'

type EntryCard = QuickEntry & {
  icon: typeof MagicStick
}

type RoastLevel = '轻度' | '中度' | '重度' | '极度'

const appStore = useAppStore()
const chartRef = ref<HTMLDivElement | null>(null)

const overview = computed(() => appStore.overview)
const displayTokenBalance = ref(23456)
const screenshotMode = ref(false)
const aiDialogVisible = ref(false)
const withdrawDialogVisible = ref(false)
const videoDialogVisible = ref(false)
const memberDialogVisible = ref(false)
const closeConfirmVisible = ref(false)
const activeDialogName = ref('当前弹窗')
const activeAiAnswer = ref('正在调度更像人的模型，请先完成权益确认。')
const videoWatchCount = ref(7)
const maintenanceProgress = ref(93)
const memberProgress = ref(68)
const deliveryStep = ref(2)
const compactMode = ref(true)
const interactionLogs = ref<string[]>([])
const lastRoast = ref('嘴臭客服待命中，正在挑一个看起来正常的按钮下手。')
const roastCount = ref(0)
const roastLevel = ref<RoastLevel>('轻度')
const roastScore = ref(0)

let chart: echarts.ECharts | null = null

const baseNavItems = [
  { label: '首页推荐', count: '' },
  { label: 'AI 中心', count: '7' },
  { label: '金融中心', count: '12' },
  { label: '外卖生活', count: '' },
  { label: '短视频', count: '99+' },
  { label: '会员体系', count: '3' },
  { label: '任务中心', count: '27' },
  { label: '社交电商', count: '8' },
  { label: '政企服务', count: '1' },
  { label: '奇怪工具', count: '' },
]

const redDotCounts = ref<Record<string, string>>(
  Object.fromEntries(baseNavItems.map((item) => [item.label, item.count])),
)

const entryIconMap: Record<string, typeof MagicStick> = {
  ai: MagicStick,
  finance: TrendCharts,
  delivery: TakeawayBox,
  video: VideoPlay,
  member: Trophy,
  task: Coin,
  social: ChatDotRound,
  shop: ShoppingCart,
  gov: OfficeBuilding,
  weird: Operation,
}

const deliveryStates = [
  '商家已接单，正在研究你的会员等级',
  '骑手已出发，路线由运营活动实时接管',
  '骑手已进入量子态',
  '普通用户显示即将送达，SVIP 显示更即将送达',
]

const videoCards = [
  { title: 'AI 逆袭三件套', meta: '02:15', status: '看完奖励 +12 Token' },
  { title: '老板已读感教程', meta: '01:32', status: '提现教程第 6 节' },
  { title: '三秒学会低调炫耀', meta: '00:58', status: '继续观看可解锁继续观看' },
]

const weirdTools = [
  { title: '老板已读感生成器', result: '收到，持续对齐，闭环推进。' },
  { title: '朋友圈低调炫耀', result: '也没什么，就是普通地又忙到机场了。' },
  { title: '会议废话压缩器', result: '结论：下次再议。' },
  { title: '一键帮你已读不回', result: '已读，但系统建议保持战略沉默。' },
]

const roastMessages: Record<RoastLevel, string[]> = {
  轻度: [
    '你点「{action}」这么认真，系统差点以为自己真有用。',
    '别急，「{action}」刚被你点醒，还在想怎么敷衍你。',
    '普通用户不要对「{action}」这么有主见，产品会害怕。',
    '再点「{action}」就显得我们这个功能真的经过设计了。',
  ],
  中度: [
    '你点「{action}」点得这么自信，真他妈像在指挥航母。',
    '别急，「{action}」又不是你家开的，瞎点什么。',
    '系统看了你的操作，沉默三秒：这他妈也行？',
    '你这手速可以，脑子跟上了吗？',
    '你再点「{action}」，产品经理都要骂娘了。',
  ],
  重度: [
    '操你妈，你点「{action}」这一下把系统 CPU 都点沉默了。',
    '傻逼操作已受理：「{action}」正在被客服拿去当反面案例。',
    '你他妈点「{action}」之前，按钮都没想到自己命这么苦。',
    '操，系统刚想正常服务，你这个傻逼操作就来了。',
    '别点了傻逼，「{action}」已经申请工伤了。',
    '你他妈是真敢点，「{action}」这功能都被你点出心理阴影了。',
  ],
  极度: [
    '操你妈，还敢点「{action}」？系统本来只是嘴臭，现在直接破防了。',
    '傻逼用户触发「{action}」，客服已放弃服务，开始单方面骂街。',
    '你他妈点「{action}」是吧？投诉按钮都没见过这么自信的傻逼。',
    '操，点到「{action}」这一步，产品经理都得给你磕一个反向用户画像。',
    '报警演示已启动：警情描述为“有个傻逼在万能 App 里乱点投诉”。',
    '你真敢点「{action}」，系统判定你不是用户，是压力测试本人。',
  ],
}

const actionStupidityScores: Record<string, number> = {
  首页推荐: 18,
  'AI 中心': 48,
  金融中心: 72,
  外卖生活: 38,
  短视频: 76,
  会员体系: 64,
  任务中心: 58,
  社交电商: 46,
  政企服务: 52,
  奇怪工具: 44,
  '刷新 Token': 72,
  提现: 96,
  'AI 写 PPT': 58,
  'AI 算命': 74,
  'AI 已读不回': 68,
  '开通后继续问': 91,
  '催一下': 57,
  继续刷: 82,
  会员升级: 66,
  截图模式: 78,
  要求闭嘴: 100,
  投诉客服: 120,
  报警演示: 120,
  确认关闭关闭弹窗: 98,
  取消关闭: 63,
  看广告涨信用分: 67,
  关闭无法关闭的弹窗: 88,
  邀请好友看到邀请任务: 72,
  连续失败领取坚持奖励: 84,
  补签昨天的补签任务: 78,
}

const dynamicNavItems = computed(() =>
  baseNavItems.map((item) => ({
    ...item,
    count: redDotCounts.value[item.label] ?? item.count,
  })),
)

const entryCards = computed<EntryCard[]>(() =>
  overview.value.quickEntries.map((entry) => ({
    ...entry,
    icon: entryIconMap[entry.key] ?? Grid,
  })),
)

const displayedProfit = computed(() => {
  const baseProfit = Number(overview.value.finance.todayVirtualProfit)
  return (baseProfit + (screenshotMode.value ? 88.88 : 0)).toFixed(2)
})

const currentDeliveryState = computed(() => deliveryStates[deliveryStep.value % deliveryStates.length])

watch(
  () => overview.value.user.tokenBalance,
  (balance) => {
    displayTokenBalance.value = balance
  },
  { immediate: true },
)

watch(
  () => overview.value.redDotLogs,
  (logs) => {
    if (interactionLogs.value.length) return
    interactionLogs.value = logs.map((log) => log.message)
  },
  { immediate: true },
)

watch(screenshotMode, () => {
  renderFinanceChart()
})

function pushLog(message: string) {
  interactionLogs.value = [message, ...interactionLogs.value].slice(0, 7)
}

function getRoastScore(actionName: string, force: boolean) {
  if (force) return Math.max(actionStupidityScores[actionName] ?? 90, 90)

  if (actionStupidityScores[actionName] !== undefined) {
    return actionStupidityScores[actionName]
  }

  const keywordScores: Array<[string, number]> = [
    ['提现', 96],
    ['关闭关闭', 98],
    ['开通', 91],
    ['继续刷', 82],
    ['连续失败', 84],
    ['关闭无法关闭', 88],
    ['截图', 78],
    ['Token', 72],
    ['算命', 74],
    ['会员', 66],
    ['AI', 58],
    ['催', 57],
    ['政企', 52],
    ['工具', 44],
  ]
  const matched = keywordScores.find(([keyword]) => actionName.includes(keyword))
  if (matched) return matched[1]

  return Math.min(54, 26 + actionName.length * 3)
}

function getRoastLevel(score: number): RoastLevel {
  if (score >= 110) return '极度'
  if (score >= 80) return '重度'
  if (score >= 55) return '中度'
  return '轻度'
}

function maybeRoast(actionName: string, force = false) {
  const score = getRoastScore(actionName, force)
  const level = getRoastLevel(score)
  const triggerRate = level === '重度' ? 0.76 : level === '中度' ? 0.48 : 0.28

  if (!force && Math.random() > triggerRate) return

  const messages = roastMessages[level]
  const template = messages[Math.floor(Math.random() * messages.length)]
  const message = template.replaceAll('{action}', actionName)
  lastRoast.value = message
  roastCount.value += 1
  roastLevel.value = level
  roastScore.value = score
  pushLog(`嘴臭客服（${level} / 傻逼指数 ${score}）：${message}`)
  ElMessage.error(message)
}

function bumpCount(count: string) {
  if (!count) return '1'
  if (count.includes('+')) return count
  return String(Number(count) + 1)
}

function migrateRedDot(source: string) {
  const candidates = baseNavItems.map((item) => item.label).filter((label) => label !== source)
  const target = candidates[Math.floor(Math.random() * candidates.length)]
  redDotCounts.value = {
    ...redDotCounts.value,
    [source]: '',
    [target]: bumpCount(redDotCounts.value[target] ?? ''),
  }
  pushLog(`你清除了「${source}」红点，系统已将它转移至「${target}」。`)
}

function handleNavClick(label: string) {
  maybeRoast(label)
  if (redDotCounts.value[label]) {
    migrateRedDot(label)
    ElMessage.warning('红点已清除，并完成跨入口再就业。')
    return
  }
  redDotCounts.value = {
    ...redDotCounts.value,
    [label]: '1',
  }
  pushLog(`你访问了「${label}」，系统判定这里也应该有一个红点。`)
}

function refreshToken() {
  const delta = Math.floor(Math.random() * 666) + 88
  displayTokenBalance.value += delta
  pushLog(`Token 余额刷新增加 ${delta}，提现页仍保持维护状态。`)
  ElMessage.success(`余额看起来变多了：+${delta} Token`)
  maybeRoast('刷新 Token')
}

function openWithdrawDialog() {
  withdrawDialogVisible.value = true
  activeDialogName.value = '提现维护弹窗'
  pushLog('你打开了提现页，系统正在维护你的提现期待。')
  maybeRoast('提现')
}

function openAiDialog(mode = 'AI 中心') {
  aiDialogVisible.value = true
  activeDialogName.value = mode
  activeAiAnswer.value = 'AI 已理解你的问题，但建议先开通 A7 以获得更像人的回复。'
  maybeRoast(mode)
}

function askHigherModel() {
  activeAiAnswer.value = '开通成功前置检查通过。当前问题属于 A9 Plus Pro Max 模型，请继续升级。'
  memberProgress.value = Math.min(99, memberProgress.value + 6)
  migrateRedDot('AI 中心')
  maybeRoast('开通后继续问', true)
}

function cycleDeliveryState() {
  deliveryStep.value += 1
  pushLog(`外卖状态更新为「${currentDeliveryState.value}」。`)
  maybeRoast('催一下')
}

function openVideoDialog() {
  videoDialogVisible.value = true
  activeDialogName.value = '短视频提现教程'
  videoWatchCount.value += 1
  pushLog(`你已观看 ${videoWatchCount.value} 个提现教程，距离提现入口更熟悉了。`)
  maybeRoast('继续刷')
}

function openMemberDialog() {
  memberDialogVisible.value = true
  activeDialogName.value = '会员升级弹窗'
  memberProgress.value = Math.min(99, memberProgress.value + 3)
  maybeRoast('会员升级')
}

function triggerScreenshotMode() {
  screenshotMode.value = !screenshotMode.value
  const state = screenshotMode.value ? '开启' : '关闭'
  pushLog(`金融曲线截图模式已${state}，曲线仅在你准备截图时表现积极。`)
  maybeRoast('截图模式')
}

function completeTask(taskTitle: string) {
  displayTokenBalance.value += 12
  memberProgress.value = Math.min(99, memberProgress.value + 2)
  pushLog(`任务「${taskTitle}」完成，获得 +12 Token 与更多任务。`)
  maybeRoast(taskTitle)
}

function runWeirdTool(toolTitle: string, result: string) {
  pushLog(`${toolTitle}：${result}`)
  ElMessage.info(result)
  maybeRoast(toolTitle)
}

function requestApology() {
  maybeRoast('要求闭嘴', true)
}

function triggerComplaint(actionName: '投诉客服' | '报警演示') {
  pushLog(`${actionName}已进入演示流程：未连接任何真实外部渠道。`)
  maybeRoast(actionName, true)
}

function handleEntry(entry: EntryCard) {
  const actionMap: Record<string, () => void> = {
    ai: () => openAiDialog(entry.title),
    finance: triggerScreenshotMode,
    delivery: cycleDeliveryState,
    video: openVideoDialog,
    member: openMemberDialog,
    task: () => completeTask(entry.title),
    social: () => runWeirdTool('社交关系热度维护', '已为你生成 3 条看似真诚的点赞理由。'),
    shop: () => runWeirdTool('电商比价', '已找到更贵但更有仪式感的同款。'),
    gov: () => runWeirdTool('政企服务', '请上传更像证件的证件，并保持章感。'),
    weird: () => runWeirdTool('奇怪工具箱', '今日已为你节省 0.03 秒决策时间。'),
  }
  ;(actionMap[entry.key] ?? (() => pushLog(`你点击了「${entry.title}」，系统正在安排一个红点。`)))()
}

function requestCloseDialog(dialogName: string) {
  activeDialogName.value = dialogName
  closeConfirmVisible.value = true
}

function closeActiveDialog() {
  aiDialogVisible.value = false
  withdrawDialogVisible.value = false
  videoDialogVisible.value = false
  memberDialogVisible.value = false
  closeConfirmVisible.value = false
  pushLog(`你关闭了「${activeDialogName.value}」，系统已记录一次有效关闭。`)
  migrateRedDot('任务中心')
  maybeRoast('确认关闭关闭弹窗')
}

function keepDialogOpen() {
  closeConfirmVisible.value = false
  pushLog('你取消了关闭关闭弹窗，弹窗继续保持业务连续性。')
  maybeRoast('取消关闭')
}

function renderFinanceChart() {
  if (!chartRef.value) return
  if (!chart) {
    chart = echarts.init(chartRef.value)
  }

  const normalData = [12, 16, 14, 19, 18, 23, 24]
  const screenshotData = [12, 16, 14, 19, 18, 23, 48]
  chart.setOption({
    grid: { top: 8, right: 8, bottom: 20, left: 8 },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      show: false,
      data: ['周一', '周二', '周三', '周四', '周五', '昨天', '截图'],
    },
    yAxis: { type: 'value', show: false },
    series: [
      {
        name: '虚构收益',
        type: 'line',
        smooth: true,
        symbolSize: 7,
        data: screenshotMode.value ? screenshotData : normalData,
        lineStyle: { width: 4, color: screenshotMode.value ? '#16a34a' : '#2f75ff' },
        itemStyle: { color: '#ff7a1a' },
        areaStyle: { color: screenshotMode.value ? 'rgba(22, 163, 74, 0.14)' : 'rgba(47, 117, 255, 0.12)' },
      },
    ],
  })
}

function resizeChart() {
  chart?.resize()
}

onMounted(async () => {
  await appStore.loadOverview()
  await nextTick()
  renderFinanceChart()
  window.addEventListener('resize', resizeChart)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
  chart?.dispose()
})
</script>

<template>
  <div class="app-layout" :class="{ compact: compactMode }" v-loading="appStore.loading">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark">万</div>
        <div>
          <strong>Chinese Codex</strong>
          <span>万能生活 AI 工作金融平台</span>
        </div>
      </div>

      <nav class="nav-list">
        <button
          v-for="item in dynamicNavItems"
          :key="item.label"
          class="nav-item"
          :class="{ active: item.label === '首页推荐' }"
          type="button"
          @click="handleNavClick(item.label)"
        >
          <span>{{ item.label }}</span>
          <i v-if="item.count" class="red-dot">{{ item.count }}</i>
        </button>
      </nav>

      <section class="sidebar-card">
        <span class="muted">神秘研发团队</span>
        <strong>SVIP</strong>
        <p>升级 A7 后可解锁更像人的客服。</p>
      </section>
    </aside>

    <main class="workspace">
      <section class="promo">
        <div class="promo-copy">
          <el-icon><Promotion /></el-icon>
          <strong>新人专享礼：首充 0 元送 12000 Token + A2 会员体验卡 7 天</strong>
        </div>
        <div class="promo-actions">
          <el-button :icon="Ticket" type="danger" round @click="openMemberDialog">立即领券</el-button>
          <el-button :icon="Bell" round @click="handleNavClick('通知中心')">通知 99+</el-button>
        </div>
      </section>

      <section class="hero">
        <div class="hero-copy">
          <span class="muted">万能生活 AI 工作金融本地服务内容电商平台</span>
          <h1>一个 App，解决你没遇到的所有问题。</h1>
          <p>今日已为你节省 0.03 秒决策时间，并新增 17 个需要处理的权益入口。</p>
          <div class="hero-actions">
            <el-button :icon="MagicStick" type="primary" @click="openAiDialog()">AI 替我处理</el-button>
            <el-button :icon="Refresh" @click="refreshToken">刷新 Token</el-button>
            <el-switch
              v-model="compactMode"
              inline-prompt
              active-text="满屏"
              inactive-text="更满"
            />
          </div>
        </div>
        <img :src="heroImage" alt="Chinese Codex layered product visual" class="hero-visual" />
      </section>

      <section class="quick-grid">
        <button v-for="entry in entryCards" :key="entry.key" class="quick-card" type="button" @click="handleEntry(entry)">
          <span class="quick-icon">
            <el-icon><component :is="entry.icon" /></el-icon>
            <i class="red-dot">{{ entry.badgeText }}</i>
          </span>
          <strong>{{ entry.title }}</strong>
          <span>{{ entry.subtitle }}</span>
        </button>
      </section>

      <section class="ticker-grid">
        <div class="ticker-item">
          <span>今日运营口径</span>
          <strong>高密度首屏健康度 98.7%</strong>
        </div>
        <div class="ticker-item">
          <span>权益入口</span>
          <strong>43 个，仍可继续塞</strong>
        </div>
        <div class="ticker-item">
          <span>弹窗关闭率</span>
          <strong>关闭关闭弹窗后统计</strong>
        </div>
        <div class="ticker-item">
          <span>提现状态</span>
          <strong>维护中，请保持信任</strong>
        </div>
      </section>

      <section class="dashboard-grid">
        <div class="panel panel-wide">
          <div class="panel-title">
            <div>
              <span class="muted">今日全功能</span>
              <h2>模块入口与荒诞状态</h2>
            </div>
            <el-tag type="danger">红点迁移中</el-tag>
          </div>

          <div class="module-grid">
            <article v-for="entry in entryCards" :key="entry.key" class="module-card" @click="handleEntry(entry)">
              <el-icon><component :is="entry.icon" /></el-icon>
              <div>
                <strong>{{ entry.title }}</strong>
                <span>{{ entry.bugText }}</span>
              </div>
            </article>
          </div>
        </div>

        <div class="panel">
          <div class="panel-title">
            <div>
              <span class="muted">金融中心</span>
              <h2>Token 理财</h2>
            </div>
            <el-button :icon="TrendCharts" size="small" @click="triggerScreenshotMode">截图模式</el-button>
          </div>
          <div class="finance-value">+{{ displayedProfit }}</div>
          <p class="muted">想象年化 {{ overview.finance.imaginedAnnualRate }}，截图时曲线自动上扬。</p>
          <div ref="chartRef" class="chart" />
          <div class="button-row">
            <el-button :icon="Wallet" type="primary" @click="openWithdrawDialog">立即提现</el-button>
            <el-button :icon="CreditCard" @click="handleEntry(entryCards.find((entry) => entry.key === 'finance') ?? entryCards[0])">
              买入信任
            </el-button>
          </div>
          <p class="risk">{{ overview.finance.riskNotice }}</p>
        </div>

        <div class="panel">
          <div class="panel-title">
            <div>
              <span class="muted">AI 中心</span>
              <h2>比人更像运营的助手</h2>
            </div>
            <el-tag type="warning">A7 可用</el-tag>
          </div>
          <div class="ai-stack">
            <button type="button" @click="openAiDialog('AI 写 PPT')">AI 写 PPT：把空页写成战略蓝图</button>
            <button type="button" @click="openAiDialog('AI 算命')">AI 算命：根据缓存预测你的 KPI</button>
            <button type="button" @click="openAiDialog('AI 已读不回')">AI 已读不回：保持高级冷静</button>
          </div>
        </div>

        <div class="panel">
          <div class="panel-title">
            <div>
              <span class="muted">外卖生活</span>
              <h2>{{ currentDeliveryState }}</h2>
            </div>
            <el-button :icon="Food" size="small" @click="cycleDeliveryState">催一下</el-button>
          </div>
          <div class="timeline">
            <span v-for="state in deliveryStates" :key="state" :class="{ active: state === currentDeliveryState }">
              {{ state }}
            </span>
          </div>
          <p class="risk">点外卖可顺便买基金，但基金不会顺便送到。</p>
        </div>

        <div class="panel">
          <div class="panel-title">
            <div>
              <span class="muted">短视频</span>
              <h2>刷视频赚 Token</h2>
            </div>
            <el-button :icon="VideoPlay" type="danger" size="small" @click="openVideoDialog">继续刷</el-button>
          </div>
          <div class="video-grid">
            <article v-for="video in videoCards" :key="video.title" class="video-card" @click="openVideoDialog">
              <div class="play-dot"><el-icon><VideoPlay /></el-icon></div>
              <strong>{{ video.title }}</strong>
              <span>{{ video.meta }} · {{ video.status }}</span>
            </article>
          </div>
        </div>

        <div class="panel">
          <div class="panel-title">
            <div>
              <span class="muted">会员体系</span>
              <h2>{{ overview.user.memberLevel }} 智能焦虑会员</h2>
            </div>
            <el-button :icon="Trophy" type="primary" size="small" @click="openMemberDialog">升级 A7</el-button>
          </div>
          <el-progress :percentage="memberProgress" :stroke-width="12" striped />
          <p class="risk">{{ overview.user.nextBenefit }}</p>
          <div class="member-tags">
            <el-tag>SVIP</el-tag>
            <el-tag type="success">黑金卡</el-tag>
            <el-tag type="warning">老板卡</el-tag>
            <el-tag type="danger">A1-A10</el-tag>
          </div>
        </div>

        <div class="panel">
          <div class="panel-title">
            <div>
              <span class="muted">任务中心</span>
              <h2>今日已贡献 17 次有效点击</h2>
            </div>
          </div>
          <div class="task-list">
            <button v-for="task in overview.tasks" :key="task.title" class="task-item" type="button" @click="completeTask(task.title)">
              <strong>{{ task.title }}</strong>
              <span class="muted">{{ task.progressText }}</span>
              <b>{{ task.rewardText }}</b>
            </button>
          </div>
        </div>

        <div class="panel">
          <div class="panel-title">
            <div>
              <span class="muted">奇怪工具</span>
              <h2>严肃提升职场含糊度</h2>
            </div>
          </div>
          <div class="tool-grid">
            <button
              v-for="tool in weirdTools"
              :key="tool.title"
              class="tool-chip"
              type="button"
              @click="runWeirdTool(tool.title, tool.result)"
            >
              <el-icon><Operation /></el-icon>
              <span>{{ tool.title }}</span>
            </button>
          </div>
        </div>
      </section>
    </main>

    <aside class="right-rail">
      <section class="rail-card token-card">
        <span class="muted">我的 Token</span>
        <strong>{{ displayTokenBalance.toLocaleString() }}</strong>
        <div class="button-row">
          <el-button :icon="Refresh" type="warning" plain @click="refreshToken">刷新</el-button>
          <el-button :icon="Wallet" type="danger" plain @click="openWithdrawDialog">提现</el-button>
        </div>
      </section>

      <section class="rail-card">
        <span class="muted">外卖状态</span>
        <strong>{{ currentDeliveryState }}</strong>
        <p>普通用户显示即将送达，SVIP 显示更即将送达。</p>
      </section>

      <section class="rail-card">
        <span class="muted">红点迁移日志</span>
        <div class="log-list">
          <p v-for="log in interactionLogs" :key="log">{{ log }}</p>
        </div>
      </section>

      <section class="rail-card roast-card">
        <span class="muted">嘴臭客服</span>
        <strong>已骂骂咧咧 {{ roastCount }} 次</strong>
        <div
          class="roast-meta"
          :class="{
            'level-mid': roastLevel === '中度',
            'level-heavy': roastLevel === '重度',
            'level-extreme': roastLevel === '极度',
          }"
        >
          {{ roastLevel }} · 傻逼指数 {{ roastScore }}
        </div>
        <p>{{ lastRoast }}</p>
        <div class="roast-actions">
          <el-button size="small" type="danger" plain @click="requestApology">要求闭嘴</el-button>
          <el-button size="small" type="danger" @click="triggerComplaint('投诉客服')">投诉</el-button>
          <el-button size="small" type="danger" @click="triggerComplaint('报警演示')">报警</el-button>
        </div>
        <span class="roast-disclaimer">演示按钮，不会连接真实投诉、报警或支付接口。</span>
      </section>

      <section class="rail-card">
        <span class="muted">接口状态</span>
        <strong>{{ appStore.apiOnline ? 'API 已连接' : '使用本地假数据' }}</strong>
        <p class="risk">Token 不具备真实价值，所有收益和权益仅用于演示。</p>
      </section>
    </aside>

    <el-dialog v-model="aiDialogVisible" width="480px" :show-close="false" title="AI 中心">
      <div class="dialog-copy">
        <strong>{{ activeDialogName }}</strong>
        <p>{{ activeAiAnswer }}</p>
        <p class="risk">免费模型可回答“建议升级会员”以内的问题。</p>
      </div>
      <template #footer>
        <el-button @click="askHigherModel">开通后继续问</el-button>
        <el-button type="primary" @click="requestCloseDialog('AI 中心弹窗')">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="withdrawDialogVisible" width="500px" :show-close="false" title="提现中心">
      <div class="dialog-copy">
        <strong>系统维护中，请继续积累信任</strong>
        <el-progress :percentage="maintenanceProgress" status="warning" :stroke-width="12" />
        <p>维护进度到 100% 后将自动进入下一阶段维护。</p>
      </div>
      <template #footer>
        <el-button @click="maintenanceProgress = Math.max(1, maintenanceProgress - 7)">刷新维护进度</el-button>
        <el-button type="primary" @click="requestCloseDialog('提现维护弹窗')">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="videoDialogVisible" width="480px" :show-close="false" title="短视频提现教程">
      <div class="dialog-copy">
        <strong>你已经观看 {{ videoWatchCount }} 个教程</strong>
        <p>提现按钮正在路上。继续刷 3 分钟可解锁“继续刷 3 分钟”。</p>
      </div>
      <template #footer>
        <el-button @click="openVideoDialog">再刷一个</el-button>
        <el-button type="primary" @click="requestCloseDialog('短视频提现教程')">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="memberDialogVisible" width="500px" :show-close="false" title="会员中心">
      <div class="dialog-copy">
        <strong>A7 会员可解锁更像人的客服</strong>
        <p>当前成长值 {{ memberProgress }}/100，补签、复活任务和连续失败奖励均可加速。</p>
        <el-progress :percentage="memberProgress" :stroke-width="12" striped />
      </div>
      <template #footer>
        <el-button @click="memberProgress = Math.min(99, memberProgress + 5)">补一点成长值</el-button>
        <el-button type="primary" @click="requestCloseDialog('会员升级弹窗')">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="closeConfirmVisible" width="420px" :show-close="false" title="确认关闭关闭弹窗？">
      <div class="dialog-copy">
        <strong>关闭后将无法继续关闭当前关闭流程</strong>
        <p>系统建议保留弹窗，以便持续获得完整权益提醒。</p>
      </div>
      <template #footer>
        <el-button @click="keepDialogOpen">取消关闭</el-button>
        <el-button type="danger" @click="closeActiveDialog">确认关闭关闭弹窗</el-button>
      </template>
    </el-dialog>
  </div>
</template>
