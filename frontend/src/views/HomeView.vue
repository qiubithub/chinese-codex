<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import {
  Bell,
  ChatDotRound,
  Coin,
  CreditCard,
  DocumentChecked,
  Folder,
  Food,
  MagicStick,
  OfficeBuilding,
  Operation,
  Promotion,
  Refresh,
  Search,
  ShoppingCart,
  Ticket,
  TrendCharts,
  Trophy,
  VideoPlay,
  Wallet,
} from '@element-plus/icons-vue'
import { useAppStore } from '../stores/app'
import type { QuickEntry } from '../types'

type EntryCard = QuickEntry & {
  icon: typeof MagicStick
}

type RoastLevel = '轻度' | '中度' | '重度' | '极度' | '祖安级'
type RoastSticker = {
  faceClass: string
  title: string
  caption: string
}
type TerminalLog = {
  text: string
  tone?: 'ok' | 'warn' | 'error' | 'muted'
}

const defaultSticker: RoastSticker = {
  faceClass: 'face-smirk',
  title: '客服在线',
  caption: '等你点错。',
}

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
const interactionLogs = ref<string[]>([])
const lastRoast = ref('嘴臭客服待命中，正在挑一个看起来正常的按钮下手。')
const roastCount = ref(0)
const roastLevel = ref<RoastLevel>('轻度')
const roastScore = ref(0)
const currentSticker = ref<RoastSticker>(defaultSticker)
const selectedDiffIndex = ref(0)
const activeTab = ref('项目协作区')
const taskRunning = ref(false)
const taskStepIndex = ref(0)
const taskInput = ref('把 Codex 做成中国互联网全家桶，但看起来必须像正经生产力工具')
const terminalLogs = ref<TerminalLog[]>([
  { text: 'codex@chinese-codex % pnpm --dir frontend dev', tone: 'muted' },
  { text: '✓ Vite ready on http://127.0.0.1:5173/', tone: 'ok' },
  { text: '读取项目：Chinese Codex / 示例项目A', tone: 'muted' },
  { text: '等待用户输入需求。运营弹窗已在后台预热。', tone: 'warn' },
])

let chart: echarts.ECharts | null = null
let taskTimer: ReturnType<typeof setInterval> | undefined

const baseNavItems = [
  { label: '新建任务', count: '' },
  { label: '已安排', count: '3' },
  { label: '插件', count: '' },
  { label: '站点', count: '' },
  { label: '拉取请求', count: '12' },
  { label: '聊天', count: '' },
]

const redDotCounts = ref<Record<string, string>>(
  Object.fromEntries(baseNavItems.map((item) => [item.label, item.count])),
)

const entryIconMap: Record<string, typeof MagicStick> = {
  ai: MagicStick,
  finance: TrendCharts,
  delivery: Food,
  video: VideoPlay,
  member: Trophy,
  task: Coin,
  social: ChatDotRound,
  shop: ShoppingCart,
  gov: OfficeBuilding,
  weird: Operation,
}

const projectGroups = [
  {
    title: '项目',
    files: ['示例项目A', '移动端应用', '数据可视化看板', '测试自动化框架'],
  },
  {
    title: '展开提示',
    files: ['用户权限模块', '日志分析工具', '远程脚本工具', '无任务'],
  },
]

const workbenchTabs = ['项目协作区', '本地', '团队智能体', '智能体 NEW']

const taskSteps = [
  { title: '读取仓库', detail: '扫描 Vue / Spring Boot / README，并顺手统计红点密度。' },
  { title: '制定计划', detail: '保留 Codex 结构，把运营入口寄生到工作流里。' },
  { title: '运行代码', detail: '模拟终端、diff、测试输出，广告层尝试插队。' },
  { title: '生成结果', detail: '输出可截图的中国式 Codex 工作台。' },
]

const runScript: TerminalLog[] = [
  { text: '$ codex run "重构为中国式 Codex 工作台"', tone: 'muted' },
  { text: '读取文件树：src/views/HomeView.vue, src/style.css', tone: 'ok' },
  { text: '检测到 43 个可运营入口，建议新增新人礼包横幅。', tone: 'warn' },
  { text: '生成计划：左侧任务导航 / 中间终端 diff / 右侧 Token 会员。', tone: 'ok' },
  { text: '运行测试：1 个单元测试通过，7 个会员权益待开通。', tone: 'ok' },
  { text: '拦截异常：用户试图查看 diff，系统推荐 A7 会员。', tone: 'warn' },
  { text: '写入变更：+128 行生产力，+999 行运营味。', tone: 'ok' },
  { text: '完成：工作台可用。提现能力仍在维护中。', tone: 'error' },
]

const diffFiles = [
  {
    file: 'frontend/src/views/HomeView.vue',
    additions: 128,
    deletions: 42,
    lines: [
      { type: 'ctx', text: '<main class="codex-main">' },
      { type: 'add', text: '  <section class="agent-panel">Codex 正在分析项目...</section>' },
      { type: 'add', text: '  <TerminalLog message="检测到新人礼包弹窗插队" />' },
      { type: 'del', text: '  <section class="hero">一个 App，解决所有问题</section>' },
      { type: 'add', text: '  <PromptBox placeholder="输入需求，Shift + Enter 换行" />' },
      { type: 'ctx', text: '</main>' },
    ],
  },
  {
    file: 'frontend/src/style.css',
    additions: 214,
    deletions: 96,
    lines: [
      { type: 'add', text: '.codex-shell { grid-template-columns: 248px 1fr 320px; }' },
      { type: 'add', text: '.terminal-line.warn::before { content: "运营"; }' },
      { type: 'add', text: '.meme-sticker.level-zaun { animation: sticker-shake-hard; }' },
      { type: 'del', text: '.hero { padding: 20px; }' },
      { type: 'ctx', text: '@media (max-width: 980px) { ... }' },
    ],
  },
  {
    file: 'backend/src/controller/HomeController.java',
    additions: 10,
    deletions: 0,
    lines: [
      { type: 'ctx', text: 'GET /api/home/overview' },
      { type: 'add', text: 'return ApiResponse.ok(new HomeOverviewResponse(...));' },
      { type: 'add', text: '// 金融、Token、会员权益均为虚构演示。' },
    ],
  },
]

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
  祖安级: [
    '操你妈的，「{action}」都能被你点出这种效果，你是真他妈会给系统添堵。',
    '傻逼到家了，「{action}」这个操作烂得连弹窗都想连夜辞职。',
    '你他妈别点了行不行？「{action}」被你点得像产品经理喝多了写出来的屎山。',
    '操你妈，这不是用户操作，这是把脑子留在登录页以后硬点出来的事故。',
    '你这一下「{action}」点完，系统唯一的想法是：这傻逼怎么还没被缓存清掉。',
    '别装正常用户了，你这套点击逻辑烂得像把需求文档塞进碎纸机再拿胶水糊回去。',
    '你妈看到你点「{action}」都得沉默：这玩意儿怎么还敢投诉客服？',
    '操，客服本来只是嘴臭，你这一点直接把它升级成祖安外包热线。',
  ],
}

const roastStickers: Record<RoastLevel, RoastSticker[]> = {
  轻度: [
    { faceClass: 'face-smirk', title: '你继续', caption: '我就静静看你点。' },
    { faceClass: 'face-side-eye', title: '啊对对对', caption: '这个按钮确实很需要你。' },
  ],
  中度: [
    { faceClass: 'face-squint', title: '就这？', caption: '系统忍住没笑出声。' },
    { faceClass: 'face-smirk', title: '又来了', caption: '你这操作真有节目效果。' },
  ],
  重度: [
    { faceClass: 'face-melt', title: '绷不住了', caption: '这破按钮被你点出工伤。' },
    { faceClass: 'face-squint', title: '别点了', caption: '真他妈费界面。' },
  ],
  极度: [
    { faceClass: 'face-rage', title: '急了急了', caption: '投诉按钮都让你点出火星子。' },
    { faceClass: 'face-rage face-shock', title: '当场破防', caption: '报警演示：有人在 App 里发疯。' },
  ],
  祖安级: [
    { faceClass: 'face-rage face-evil', title: '祖安开麦', caption: '客服已把礼貌卸载。' },
    { faceClass: 'face-rage face-shock face-evil', title: '嘴臭核爆', caption: '这按钮今天算是栽你手里了。' },
  ],
}

const actionStupidityScores: Record<string, number> = {
  新建任务: 72,
  已安排: 54,
  插件: 42,
  站点: 38,
  拉取请求: 68,
  聊天: 36,
  '刷新 Token': 72,
  提现: 96,
  运行任务: 84,
  停止任务: 91,
  '查看 diff': 78,
  应用补丁: 86,
  发送需求: 58,
  要求闭嘴: 100,
  投诉客服: 150,
  报警演示: 150,
  继续骂: 150,
  确认关闭关闭弹窗: 98,
  取消关闭: 63,
  关闭无法关闭的弹窗: 88,
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
    icon: entryIconMap[entry.key] ?? Ticket,
  })),
)

const displayedProfit = computed(() => {
  const baseProfit = Number(overview.value.finance.todayVirtualProfit)
  return (baseProfit + (screenshotMode.value ? 88.88 : 0)).toFixed(2)
})

const currentDeliveryState = computed(() => deliveryStates[deliveryStep.value % deliveryStates.length])
const selectedDiff = computed(() => diffFiles[selectedDiffIndex.value] ?? diffFiles[0])
const currentStep = computed(() => taskSteps[Math.min(taskStepIndex.value, taskSteps.length - 1)])

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

function appendTerminal(log: TerminalLog) {
  terminalLogs.value = [...terminalLogs.value, log].slice(-12)
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

function getRoastScore(actionName: string, force: boolean) {
  if (force) return Math.max(actionStupidityScores[actionName] ?? 90, 90)
  if (actionStupidityScores[actionName] !== undefined) return actionStupidityScores[actionName]

  const keywordScores: Array<[string, number]> = [
    ['提现', 96],
    ['停止', 91],
    ['补丁', 86],
    ['运行', 84],
    ['继续骂', 150],
    ['投诉', 150],
    ['报警', 150],
    ['diff', 78],
    ['Token', 72],
    ['AI', 58],
    ['工具', 44],
  ]
  const matched = keywordScores.find(([keyword]) => actionName.includes(keyword))
  if (matched) return matched[1]
  return Math.min(54, 26 + actionName.length * 3)
}

function getRoastLevel(score: number): RoastLevel {
  if (score >= 140) return '祖安级'
  if (score >= 110) return '极度'
  if (score >= 80) return '重度'
  if (score >= 55) return '中度'
  return '轻度'
}

function maybeRoast(actionName: string, force = false) {
  const score = getRoastScore(actionName, force)
  const level = getRoastLevel(score)
  const triggerRate =
    level === '祖安级' || level === '极度' ? 1 : level === '重度' ? 0.76 : level === '中度' ? 0.48 : 0.28

  if (!force && Math.random() > triggerRate) return

  const messages = roastMessages[level]
  const stickers = roastStickers[level]
  const template = messages[Math.floor(Math.random() * messages.length)]
  const message = template.replaceAll('{action}', actionName)
  lastRoast.value = message
  roastCount.value += 1
  roastLevel.value = level
  roastScore.value = score
  currentSticker.value = stickers[Math.floor(Math.random() * stickers.length)]
  pushLog(`嘴臭客服（${level} / 傻逼指数 ${score}）：${message}`)
  ElMessage.error(message)
}

function handleNavClick(label: string) {
  maybeRoast(label)
  if (label === '新建任务') {
    startCodexTask()
    return
  }
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
  appendTerminal({ text: `Token 余额刷新 +${delta}，提现接口继续 503。`, tone: 'warn' })
  pushLog(`Token 余额刷新增加 ${delta}，提现页仍保持维护状态。`)
  ElMessage.success(`余额看起来变多了：+${delta} Token`)
  maybeRoast('刷新 Token')
}

function openWithdrawDialog() {
  withdrawDialogVisible.value = true
  activeDialogName.value = '提现维护弹窗'
  appendTerminal({ text: '打开提现页：maintenance=true, hope=false', tone: 'error' })
  pushLog('你打开了提现页，系统正在维护你的提现期待。')
  maybeRoast('提现')
}

function openAiDialog(mode = 'AI 中心') {
  aiDialogVisible.value = true
  activeDialogName.value = mode
  activeAiAnswer.value = 'AI 已理解你的问题，但建议先开通 A7 以获得更像人的回复。'
  appendTerminal({ text: `AI 模块「${mode}」请求更高等级模型。`, tone: 'warn' })
  maybeRoast(mode)
}

function askHigherModel() {
  activeAiAnswer.value = '开通成功前置检查通过。当前问题属于 A9 Plus Pro Max 模型，请继续升级。'
  memberProgress.value = Math.min(99, memberProgress.value + 6)
  migrateRedDot('已安排')
  maybeRoast('开通后继续问', true)
}

function cycleDeliveryState() {
  deliveryStep.value += 1
  appendTerminal({ text: `外卖状态：${currentDeliveryState.value}`, tone: 'warn' })
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
  appendTerminal({ text: `金融截图模式已${state}，曲线将积极配合截图。`, tone: 'ok' })
  pushLog(`金融曲线截图模式已${state}，曲线仅在你准备截图时表现积极。`)
  maybeRoast('截图模式')
}

function completeTask(taskTitle: string) {
  displayTokenBalance.value += 12
  memberProgress.value = Math.min(99, memberProgress.value + 2)
  appendTerminal({ text: `任务「${taskTitle}」完成，自动生成 3 个后续任务。`, tone: 'ok' })
  pushLog(`任务「${taskTitle}」完成，获得 +12 Token 与更多任务。`)
  maybeRoast(taskTitle)
}

function runWeirdTool(toolTitle: string, result: string) {
  appendTerminal({ text: `${toolTitle} => ${result}`, tone: 'ok' })
  pushLog(`${toolTitle}：${result}`)
  ElMessage.info(result)
  maybeRoast(toolTitle)
}

function startCodexTask() {
  if (taskRunning.value) {
    maybeRoast('重复运行任务', true)
    appendTerminal({ text: '当前任务正在运行，重复点击已转入嘴臭客服。', tone: 'error' })
    return
  }

  taskRunning.value = true
  taskStepIndex.value = 0
  terminalLogs.value = [
    { text: '$ codex run chinese-codex-workbench', tone: 'muted' },
    { text: '初始化任务：复刻 Codex 工作台，并注入中国式运营层。', tone: 'ok' },
  ]
  maybeRoast('运行任务')

  let cursor = 0
  taskTimer = setInterval(() => {
    const nextLog = runScript[cursor]
    if (nextLog) appendTerminal(nextLog)

    taskStepIndex.value = Math.min(taskSteps.length - 1, Math.floor(cursor / 2))
    cursor += 1

    if (cursor > runScript.length) {
      stopTaskTimer()
      taskRunning.value = false
      taskStepIndex.value = taskSteps.length - 1
      appendTerminal({ text: '✓ Codex 工作台已生成。建议截图前先开金融曲线模式。', tone: 'ok' })
    }
  }, 720)
}

function stopTaskTimer() {
  if (!taskTimer) return
  clearInterval(taskTimer)
  taskTimer = undefined
}

function stopCodexTask() {
  stopTaskTimer()
  taskRunning.value = false
  appendTerminal({ text: '用户停止任务。系统弹出“确认停止停止任务？”', tone: 'error' })
  requestCloseDialog('停止任务弹窗')
  maybeRoast('停止任务', true)
}

function selectDiff(index: number) {
  selectedDiffIndex.value = index
  appendTerminal({ text: `打开 diff：${diffFiles[index]?.file ?? 'unknown'}`, tone: 'muted' })
  maybeRoast('查看 diff')
}

function applyPatchDemo() {
  appendTerminal({ text: '应用补丁成功：但右侧金融弹窗要求参与 code review。', tone: 'warn' })
  displayTokenBalance.value += 66
  maybeRoast('应用补丁', true)
}

function submitPrompt() {
  const value = taskInput.value.trim()
  if (!value) {
    maybeRoast('发送空需求', true)
    return
  }

  appendTerminal({ text: `$ user: ${value}`, tone: 'muted' })
  appendTerminal({ text: 'Codex：已收到。先看新人礼包，再运行计划。', tone: 'warn' })
  maybeRoast('发送需求')
  taskInput.value = ''
}

function requestApology() {
  maybeRoast('要求闭嘴', true)
}

function triggerComplaint(actionName: '投诉客服' | '报警演示' | '继续骂') {
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
  migrateRedDot('已安排')
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
  stopTaskTimer()
  window.removeEventListener('resize', resizeChart)
  chart?.dispose()
})
</script>

<template>
  <div class="codex-app" v-loading="appStore.loading">
    <header class="window-bar">
      <div class="window-left">
        <span class="traffic red"></span>
        <span class="traffic yellow"></span>
        <span class="traffic green"></span>
        <strong>ChatGPT Codex</strong>
        <nav class="menu-strip">
          <button type="button">文件</button>
          <button type="button">编辑</button>
          <button type="button">视图</button>
          <button type="button">帮助</button>
        </nav>
      </div>
      <div class="top-promo">
        <el-icon><Promotion /></el-icon>
        <span>新人专享礼：首充 0 元送 12000 Token + A2 会员体验卡 7 天</span>
        <button type="button" @click="openMemberDialog">立即领券</button>
      </div>
      <div class="window-actions">
        <button type="button" class="token-pill" @click="refreshToken">
          <el-icon><Coin /></el-icon>
          {{ displayTokenBalance.toLocaleString() }}
        </button>
        <button type="button" class="icon-button" @click="handleNavClick('通知中心')">
          <el-icon><Bell /></el-icon>
          <i class="red-dot">99+</i>
        </button>
        <div class="avatar">秋</div>
      </div>
    </header>

    <div class="codex-shell">
      <aside class="codex-sidebar">
        <div class="brand">
          <div class="brand-mark">万</div>
          <div>
            <strong>Chinese Codex</strong>
            <span>万能生活 AI 工作金融平台</span>
          </div>
        </div>

        <label class="search-box">
          <el-icon><Search /></el-icon>
          <input placeholder="搜索任务、项目、权益入口" />
        </label>

        <button class="primary-sidebar-action" type="button" @click="startCodexTask">
          <el-icon><MagicStick /></el-icon>
          新建任务
        </button>

        <nav class="nav-list">
          <button
            v-for="item in dynamicNavItems"
            :key="item.label"
            class="nav-item"
            :class="{ active: item.label === '新建任务' }"
            type="button"
            @click="handleNavClick(item.label)"
          >
            <span>{{ item.label }}</span>
            <i v-if="item.count" class="red-dot">{{ item.count }}</i>
          </button>
        </nav>

        <section v-for="group in projectGroups" :key="group.title" class="project-group">
          <span>{{ group.title }}</span>
          <button v-for="file in group.files" :key="file" type="button" @click="handleNavClick(file)">
            <el-icon><Folder /></el-icon>
            {{ file }}
          </button>
        </section>

        <section class="sidebar-card">
          <span class="muted">神秘研发团队</span>
          <strong>SVIP</strong>
          <p>升级 A7 后可解锁更像人的客服。</p>
        </section>
      </aside>

      <main class="codex-main">
        <section class="workspace-tabs">
          <button
            v-for="tab in workbenchTabs"
            :key="tab"
            type="button"
            :class="{ active: activeTab === tab }"
            @click="activeTab = tab"
          >
            {{ tab }}
          </button>
          <button type="button" class="tab-plus" @click="handleEntry(entryCards[0])">+</button>
        </section>

        <section class="task-hero">
          <div>
            <span class="muted">示例项目A / Codex 工作台</span>
            <h1>把 Codex 复刻成中国互联网全家桶</h1>
            <p>左边像 Codex，右边像运营后台，中间正常干活但随时被 Token、会员、短视频和嘴臭客服污染。</p>
          </div>
          <div class="task-actions">
            <el-button :icon="MagicStick" type="primary" :loading="taskRunning" @click="startCodexTask">
              {{ taskRunning ? '正在运行' : '运行任务' }}
            </el-button>
            <el-button @click="stopCodexTask">停止</el-button>
            <el-button :icon="DocumentChecked" @click="selectDiff(0)">查看 diff</el-button>
            <el-button :icon="Wallet" type="warning" plain @click="openWithdrawDialog">提现维护中</el-button>
          </div>
        </section>

        <section class="workbench-grid">
          <div class="left-workbench">
            <section class="panel agent-panel">
              <div class="panel-title">
                <div>
                  <span class="muted">Codex Agent</span>
                  <h2>{{ currentStep.title }}</h2>
                </div>
                <el-tag :type="taskRunning ? 'success' : 'info'">{{ taskRunning ? 'RUNNING' : 'IDLE' }}</el-tag>
              </div>
              <p class="agent-detail">{{ currentStep.detail }}</p>
              <div class="step-list">
                <div
                  v-for="(step, index) in taskSteps"
                  :key="step.title"
                  class="step-item"
                  :class="{ done: index < taskStepIndex, active: index === taskStepIndex }"
                >
                  <b>{{ index + 1 }}</b>
                  <div>
                    <strong>{{ step.title }}</strong>
                    <span>{{ step.detail }}</span>
                  </div>
                </div>
              </div>
            </section>

            <section class="panel terminal-panel">
              <div class="panel-title">
                <div>
                  <span class="muted">终端</span>
                  <h2>本地执行日志</h2>
                </div>
                <el-tag type="warning">运营插队中</el-tag>
              </div>
              <div class="terminal">
                <p v-for="(line, index) in terminalLogs" :key="`${line.text}-${index}`" :class="line.tone">
                  {{ line.text }}
                </p>
              </div>
            </section>

            <section class="prompt-box">
              <textarea v-model="taskInput" placeholder="输入你的需求，Shift + Enter 换行，Enter 会触发运营建议" />
              <div>
                <button type="button" @click="runWeirdTool('联网搜索', '已联网，但先推荐你开通 A7 联网包。')">联网搜索</button>
                <button type="button" @click="applyPatchDemo">上传文件</button>
                <button type="button" @click="startCodexTask">代码运行</button>
                <el-button type="primary" @click="submitPrompt">发送</el-button>
              </div>
            </section>
          </div>

          <div class="right-workbench">
            <section class="panel diff-panel">
              <div class="panel-title">
                <div>
                  <span class="muted">Diff</span>
                  <h2>{{ selectedDiff.file }}</h2>
                </div>
                <el-button size="small" type="primary" @click="applyPatchDemo">应用补丁</el-button>
              </div>
              <div class="diff-tabs">
                <button
                  v-for="(file, index) in diffFiles"
                  :key="file.file"
                  type="button"
                  :class="{ active: selectedDiffIndex === index }"
                  @click="selectDiff(index)"
                >
                  {{ file.file.split('/').pop() }}
                  <span>+{{ file.additions }} -{{ file.deletions }}</span>
                </button>
              </div>
              <pre class="diff-code"><code><span
                v-for="(line, index) in selectedDiff.lines"
                :key="`${line.text}-${index}`"
                :class="line.type"
              >{{ line.type === 'add' ? '+ ' : line.type === 'del' ? '- ' : '  ' }}{{ line.text }}
</span></code></pre>
            </section>

            <section class="module-strip">
              <button v-for="entry in entryCards.slice(0, 6)" :key="entry.key" type="button" @click="handleEntry(entry)">
                <el-icon><component :is="entry.icon" /></el-icon>
                <strong>{{ entry.title }}</strong>
                <span>{{ entry.bugText }}</span>
              </button>
            </section>
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

        <section class="rail-card finance-card">
          <div class="rail-title">
            <span class="muted">Codex 金融</span>
            <el-button :icon="TrendCharts" size="small" @click="triggerScreenshotMode">截图模式</el-button>
          </div>
          <strong>+{{ displayedProfit }}</strong>
          <p>想象年化 {{ overview.finance.imaginedAnnualRate }}，截图时曲线自动上扬。</p>
          <div ref="chartRef" class="chart" />
        </section>

        <section class="rail-card">
          <span class="muted">外卖状态</span>
          <strong>{{ currentDeliveryState }}</strong>
          <div class="rail-actions">
            <el-button :icon="Food" size="small" @click="cycleDeliveryState">催一下</el-button>
            <el-button :icon="CreditCard" size="small" @click="triggerScreenshotMode">顺便买基金</el-button>
          </div>
        </section>

        <section class="rail-card">
          <span class="muted">短视频提现教程</span>
          <div class="mini-video-grid">
            <button v-for="video in videoCards" :key="video.title" type="button" @click="openVideoDialog">
              <el-icon><VideoPlay /></el-icon>
              <strong>{{ video.title }}</strong>
              <span>{{ video.meta }}</span>
            </button>
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
              'level-zaun': roastLevel === '祖安级',
            }"
          >
            {{ roastLevel }} · 傻逼指数 {{ roastScore }}
          </div>
          <div
            :key="`${roastLevel}-${roastCount}`"
            class="meme-sticker"
            :class="[
              currentSticker.faceClass,
              {
                'level-mid': roastLevel === '中度',
                'level-heavy': roastLevel === '重度',
                'level-extreme': roastLevel === '极度',
                'level-zaun': roastLevel === '祖安级',
              },
            ]"
          >
            <div class="meme-head" aria-hidden="true">
              <span class="meme-brow brow-left"></span>
              <span class="meme-brow brow-right"></span>
              <span class="meme-eye eye-left"></span>
              <span class="meme-eye eye-right"></span>
              <span class="meme-mouth"></span>
            </div>
            <div class="meme-copy">
              <b>{{ currentSticker.title }}</b>
              <span>{{ currentSticker.caption }}</span>
            </div>
          </div>
          <p>{{ lastRoast }}</p>
          <div class="roast-actions">
            <el-button size="small" type="danger" plain @click="requestApology">要求闭嘴</el-button>
            <el-button size="small" type="danger" @click="triggerComplaint('投诉客服')">投诉</el-button>
            <el-button size="small" type="danger" @click="triggerComplaint('报警演示')">报警</el-button>
            <el-button size="small" type="danger" @click="triggerComplaint('继续骂')">继续骂</el-button>
          </div>
          <span class="roast-disclaimer">演示按钮，不会连接真实投诉、报警或支付接口。</span>
        </section>

        <section class="rail-card">
          <span class="muted">红点迁移日志</span>
          <div class="log-list">
            <p v-for="log in interactionLogs" :key="log">{{ log }}</p>
          </div>
        </section>
      </aside>
    </div>

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
