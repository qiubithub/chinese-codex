<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import {
  ChatDotRound,
  Coin,
  DataAnalysis,
  DocumentChecked,
  Folder,
  MagicStick,
  Menu,
  Operation,
  Present,
  Promotion,
  Search,
  Star,
  Ticket,
  VideoPlay,
} from '@element-plus/icons-vue'
import { useAppStore } from '../stores/app'

type RoastLevel = '轻度' | '中度' | '重度' | '极度' | '祖安级'
type RoastSticker = {
  faceClass: string
  title: string
  caption: string
}

const appStore = useAppStore()
const overview = computed(() => appStore.overview)
const chartRef = ref<HTMLDivElement | null>(null)
const displayTokenBalance = ref(23456)
const screenshotMode = ref(false)
const memberProgress = ref(68)
const roastVisible = ref(false)
const roastCount = ref(0)
const roastLevel = ref<RoastLevel>('轻度')
const roastScore = ref(0)
const lastRoast = ref('嘴臭客服待命中，正在挑一个看起来正常的按钮下手。')
const currentSticker = ref<RoastSticker>({
  faceClass: 'face-smirk',
  title: '客服在线',
  caption: '等你点错。',
})
const taskInput = ref('输入你的需求，Shift + Enter 换行，/ 触发快捷命令')
const maintenanceProgress = ref(93)
const withdrawDialogVisible = ref(false)
const videoDialogVisible = ref(false)
const videoWatchCount = ref(7)
const closeConfirmVisible = ref(false)

let chart: echarts.ECharts | null = null

const sidebarItems = [
  { label: '新建任务', icon: DocumentChecked, count: '' },
  { label: '已安排', icon: Coin, count: '3' },
  { label: '插件', icon: Operation, count: '' },
  { label: '站点', icon: Menu, count: '' },
  { label: '拉取请求', icon: ChatDotRound, count: '12' },
  { label: '聊天', icon: ChatDotRound, count: '' },
]

const projectGroups = [
  {
    title: '项目',
    files: ['示例项目A', '前端功能迭代', '接口性能优化', '用户权限模块', '日志分析工具'],
  },
  {
    title: '',
    files: ['移动端应用', '数据可视化看板', '测试自动化框架', '运维脚本工具'],
  },
]

const featureTabs = [
  { label: '推荐', icon: Star, hot: false },
  { label: '代码助手', icon: MagicStick, hot: false },
  { label: '智能问答', icon: ChatDotRound, hot: false },
  { label: '数据分析', icon: DataAnalysis, hot: false },
  { label: '写作创作', icon: Operation, hot: false },
  { label: 'AI绘图', icon: Present, hot: false },
  { label: '更多工具', icon: Menu, hot: true },
]

const perkItems = [
  { title: '福利中心', desc: '领券中心抽奖', count: '2', icon: Present },
  { title: '任务中心', desc: '做任务赚Token', count: '16', icon: DocumentChecked },
  { title: '邀请好友', desc: '得 2000 Token', count: '', icon: Promotion },
  { title: '限时活动', desc: '五一狂欢季', count: '', icon: Star },
  { title: '充 100 送 20%', desc: '最高送 10000 Token', count: '10', icon: Ticket },
  { title: '新人必看', desc: '快速上手指南', count: '', icon: MagicStick },
]

const videoCards = [
  { title: 'AI编程爽文实录', meta: '02:15', views: '32.7M' },
  { title: '用AI重构甲方项目', meta: '01:32', views: '18.7M' },
  { title: '一行代码骗过老板', meta: '01:46', views: '26.9M' },
  { title: 'AI绘图燃爆现场', meta: '02:56', views: '43.7M' },
]

const commandTools = ['联网搜索', '深度思考', '上传文件', '代码运行']

const roastMessages: Record<RoastLevel, string[]> = {
  轻度: [
    '你点「{action}」这么认真，系统差点以为自己真有用。',
    '别急，「{action}」刚被你点醒，还在想怎么敷衍你。',
  ],
  中度: [
    '你点「{action}」点得这么自信，真他妈像在指挥航母。',
    '系统看了你的操作，沉默三秒：这他妈也行？',
    '你这手速可以，脑子跟上了吗？',
  ],
  重度: [
    '操你妈，你点「{action}」这一下把系统 CPU 都点沉默了。',
    '傻逼操作已受理：「{action}」正在被客服拿去当反面案例。',
    '别点了傻逼，「{action}」已经申请工伤了。',
    '你点「{action}」这一下真他妈抽象，系统都不知道该骂你还是该拉黑你。',
    '你这操作脏得离谱，点个「{action}」都能点出一股子没救的味儿。',
    '别装懂了傻逼，「{action}」被你点得像刚从垃圾桶里捞出来的需求。',
  ],
  极度: [
    '操你妈，还敢点「{action}」？系统本来只是嘴臭，现在直接破防了。',
    '你他妈点「{action}」是吧？投诉按钮都没见过这么自信的傻逼。',
    '报警演示已启动：警情描述为“有个傻逼在万能 App 里乱点投诉”。',
    '你这「{action}」点得真他妈下饭，正常人看了都得怀疑按钮是不是被污染了。',
    '你别跟系统解释了，「{action}」这坨操作烂得连错误日志都嫌晦气。',
    '操，你这一下不是误触，是明目张胆地把智商按在界面上摩擦。',
  ],
  祖安级: [
    '操你妈的，「{action}」都能被你点出这种效果，你是真他妈会给系统添堵。',
    '傻逼到家了，「{action}」这个操作烂得连弹窗都想连夜辞职。',
    '你他妈别点了行不行？「{action}」被你点得像产品经理喝多了写出来的屎山。',
    '操，客服本来只是嘴臭，你这一点直接把它升级成祖安外包热线。',
    '你他妈是真能整活，「{action}」被你点完以后，系统感觉自己像被傻逼污染了。',
    '别叫了傻逼，「{action}」不是功能入口，是你把脑子扔一边以后留下的犯罪现场。',
    '你这坨「{action}」操作烂得发臭，客服看完都想把聊天框拿去消毒。',
    '操，你点「{action}」这一下，像把一整盆馊需求扣在界面上，还问为什么不好用。',
    '你少在这装无辜，「{action}」能被你点成这样，不是系统问题，是你手欠得太稳定。',
    '傻逼指数爆表，「{action}」已经不是被你使用了，是被你当场祸害了。',
    '你这操作臭得很纯粹，连“确认关闭关闭弹窗”都觉得你他妈有点过分。',
    '操你妈的，系统原本只想弹个窗，结果被你点「{action}」点成大型低素质展览。',
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
    { faceClass: 'face-rage', title: '开骂了', caption: '这操作看着就来火。' },
  ],
  极度: [
    { faceClass: 'face-rage', title: '急了急了', caption: '投诉按钮都让你点出火星子。' },
    { faceClass: 'face-rage face-shock', title: '当场破防', caption: '报警演示：有人在 App 里发疯。' },
    { faceClass: 'face-rage face-evil', title: '素质掉线', caption: '客服已经不想装人。' },
  ],
  祖安级: [
    { faceClass: 'face-rage face-evil', title: '祖安开麦', caption: '客服已把礼貌卸载。' },
    { faceClass: 'face-rage face-shock face-evil', title: '嘴臭核爆', caption: '这按钮今天算是栽你手里了。' },
    { faceClass: 'face-rage face-shock face-evil', title: '破口大骂', caption: '系统礼貌值已清零。' },
    { faceClass: 'face-rage face-evil', title: '低素质上线', caption: '你一点击，客服直接开喷。' },
  ],
}

const actionScores: Record<string, number> = {
  看广告得Token: 72,
  每日签到: 58,
  立即订阅: 76,
  立即开通: 88,
  短视频提现: 96,
  去充值: 84,
  投诉客服: 150,
  报警演示: 150,
  继续骂: 150,
  提现: 96,
  发送需求: 62,
  关闭关闭弹窗: 98,
}

const displayedProfit = computed(() => {
  const baseProfit = Number(overview.value.finance.todayVirtualProfit)
  return (baseProfit + (screenshotMode.value ? 88.88 : 0)).toFixed(2)
})

watch(
  () => overview.value.user.tokenBalance,
  (balance) => {
    displayTokenBalance.value = balance
  },
  { immediate: true },
)

watch(screenshotMode, () => {
  renderFinanceChart()
})

function getRoastLevel(score: number): RoastLevel {
  if (score >= 140) return '祖安级'
  if (score >= 110) return '极度'
  if (score >= 80) return '重度'
  if (score >= 55) return '中度'
  return '轻度'
}

function maybeRoast(action: string, force = false) {
  const score = force ? Math.max(actionScores[action] ?? 90, 90) : actionScores[action] ?? 42
  const level = getRoastLevel(score)
  const triggerRate = level === '祖安级' || level === '极度' ? 1 : level === '重度' ? 0.8 : level === '中度' ? 0.5 : 0.25

  if (!force && Math.random() > triggerRate) return

  const messages = roastMessages[level]
  const stickers = roastStickers[level]
  const template = messages[Math.floor(Math.random() * messages.length)]
  const message = template.replaceAll('{action}', action)
  roastVisible.value = true
  roastCount.value += 1
  roastLevel.value = level
  roastScore.value = score
  lastRoast.value = message
  currentSticker.value = stickers[Math.floor(Math.random() * stickers.length)]
  ElMessage.error(message)
}

function rewardToken(action: string, amount = 120) {
  displayTokenBalance.value += amount
  ElMessage.success(`+${amount} Token，提现能力维护中`)
  maybeRoast(action)
}

function signIn() {
  displayTokenBalance.value += 120
  maybeRoast('每日签到')
}

function triggerScreenshotMode() {
  screenshotMode.value = !screenshotMode.value
  maybeRoast('立即订阅')
}

function openWithdrawDialog() {
  withdrawDialogVisible.value = true
  maybeRoast('提现')
}

function openVideoDialog() {
  videoDialogVisible.value = true
  videoWatchCount.value += 1
  maybeRoast('短视频提现')
}

function openMember() {
  memberProgress.value = Math.min(99, memberProgress.value + 5)
  maybeRoast('立即开通')
}

function submitPrompt() {
  const text = taskInput.value.trim()
  if (!text) {
    maybeRoast('发送空需求', true)
    return
  }
  ElMessage.warning('Codex 已收到需求，但先弹一个新人礼包。')
  maybeRoast('发送需求')
  taskInput.value = ''
}

function triggerComplaint(action: '投诉客服' | '报警演示' | '继续骂') {
  maybeRoast(action, true)
}

function requestCloseDialog() {
  closeConfirmVisible.value = true
}

function closeActiveDialog() {
  withdrawDialogVisible.value = false
  videoDialogVisible.value = false
  closeConfirmVisible.value = false
  maybeRoast('关闭关闭弹窗', true)
}

function renderFinanceChart() {
  if (!chartRef.value) return
  if (!chart) chart = echarts.init(chartRef.value)

  chart.setOption({
    grid: { top: 8, right: 8, bottom: 16, left: 8 },
    xAxis: { type: 'category', show: false, data: ['05-10', '05-11', '05-12', '05-13', '05-14', '05-15', '06-16'] },
    yAxis: { type: 'value', show: false },
    series: [
      {
        type: 'line',
        smooth: true,
        symbolSize: 6,
        data: screenshotMode.value ? [9, 16, 12, 18, 17, 22, 39] : [9, 16, 12, 18, 17, 22, 24],
        lineStyle: { width: 3, color: screenshotMode.value ? '#16a34a' : '#2f75ff' },
        itemStyle: { color: '#2f75ff' },
        areaStyle: { color: 'rgba(47, 117, 255, 0.1)' },
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
  <div class="product-window" v-loading="appStore.loading">
    <header class="system-bar">
      <div class="window-controls">
        <button type="button" class="mini-icon"><Menu /></button>
        <button type="button">←</button>
        <button type="button">→</button>
        <span>文件</span>
        <span>编辑</span>
        <span>视图</span>
        <span>帮助</span>
      </div>
      <div class="window-buttons">
        <span>−</span>
        <span>□</span>
        <span>×</span>
      </div>
    </header>

    <div class="product-shell">
      <aside class="screenshot-sidebar">
        <div class="codex-brand">
          <strong>ChatGPT <b>Codex</b></strong>
          <el-icon><Search /></el-icon>
        </div>

        <nav class="side-nav">
          <button v-for="item in sidebarItems" :key="item.label" type="button" @click="maybeRoast(item.label)">
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.label }}</span>
            <i v-if="item.count" class="red-dot">{{ item.count }}</i>
          </button>
        </nav>

        <section v-for="group in projectGroups" :key="group.title || group.files[0]" class="project-list">
          <span v-if="group.title">{{ group.title }}</span>
          <button
            v-for="(file, index) in group.files"
            :key="file"
            type="button"
            :class="{ active: file === '示例项目A' }"
            @click="maybeRoast(file)"
          >
            <el-icon><Folder /></el-icon>
            {{ file }}
            <small v-if="index > 2">无任务</small>
          </button>
        </section>

        <div class="sidebar-bottom">
          <span>任务</span>
          <button type="button">+</button>
          <div>
            <b>神</b>
            <strong>智能研发团队</strong>
            <i>SVIP</i>
          </div>
        </div>
      </aside>

      <main class="screenshot-main">
        <section class="hero-banner">
          <div class="gift-box">🎁</div>
          <strong>新人专享礼 🎁 首充送 12000 Token + A2 会员体验卡7天</strong>
          <button type="button" @click="openMember">立即领取</button>
        </section>

        <nav class="feature-tabs">
          <button v-for="tab in featureTabs" :key="tab.label" type="button" :class="{ active: tab.label === '推荐' }">
            <el-icon><component :is="tab.icon" /></el-icon>
            {{ tab.label }}
            <i v-if="tab.hot">NEW</i>
          </button>
          <div class="feature-tools">
            <button type="button">自定义</button>
            <button type="button">最近使用</button>
          </div>
        </nav>

        <section class="top-card-grid">
          <article class="china-card ad-card">
            <div class="card-head">
              <div>
                <h2>看广告得Token</h2>
                <p>每看1次广告得 20 Token</p>
              </div>
              <em>限时双倍</em>
            </div>
            <div class="ad-visual">
              <div class="play-board"><el-icon><VideoPlay /></el-icon></div>
              <span>🪙</span>
              <span>💫</span>
            </div>
            <button type="button" class="orange-button" @click="rewardToken('看广告得Token', 20)">立即赚Token</button>
            <footer>今日可看 0/10 次 <b>看广告记录 ›</b></footer>
          </article>

          <article class="china-card sign-card">
            <div class="card-head">
              <div>
                <h2>每日签到领Token</h2>
                <p>连续签到奖励翻倍</p>
              </div>
              <em>连续签到待解锁</em>
            </div>
            <div class="sign-row">
              <div class="signed">✓<span>已签</span></div>
              <div v-for="day in ['第2天', '第3天', '第4天', '第5天', '第6天', '第7天']" :key="day">
                🪙<span>{{ day }}</span><b>+{{ day === '第7天' ? 120 : 20 }}</b>
              </div>
            </div>
            <button type="button" class="orange-button" @click="signIn">去签到</button>
            <footer>签到日历 ›</footer>
          </article>

          <article class="china-card finance-card">
            <div class="card-head">
              <div>
                <h2>Codex 金融 <i>热门</i></h2>
                <p>首次订阅首月 0.9% 起</p>
              </div>
            </div>
            <strong class="profit">+{{ displayedProfit }}</strong>
            <span class="profit-rate">+3.24%</span>
            <div ref="chartRef" class="finance-chart" />
            <button type="button" class="blue-button" @click="triggerScreenshotMode">立即订阅</button>
            <footer>了解详情 ›</footer>
          </article>
        </section>

        <section class="middle-grid">
          <article class="member-card">
            <header>
              <div>
                <h2>👑 Codex会员</h2>
                <p>A1-A10 会员全景权益，A7及以上享受 1.5x 加速</p>
              </div>
              <button type="button">会员中心 ›</button>
            </header>
            <div class="level-panel">
              <div class="level-track">
                <span v-for="level in ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10']" :key="level" :class="{ active: level === 'A7' }">
                  {{ level }}
                </span>
              </div>
              <div class="progress-row">
                <b>当前等级 A6</b>
                <el-progress :percentage="memberProgress" :stroke-width="10" />
                <small>距离 A7 还差 320 成长值</small>
              </div>
              <div class="benefit-row">
                <span>1.5x 编译</span>
                <span>优先队列</span>
                <span>专属客服</span>
                <span>每日礼包</span>
                <span>会员任务</span>
                <span>更多特权</span>
              </div>
            </div>
            <aside>
              <span>季付立省 40%</span>
              <strong>¥298</strong>
              <small>/季</small>
              <button type="button" @click="openMember">立即开通</button>
            </aside>
          </article>

          <article class="short-video-card">
            <header>
              <div>
                <h2>Codex短视频 <i>火热</i></h2>
                <p>学习AI的同时赚Token</p>
              </div>
              <span>今日已赚 <b>120 Token</b></span>
            </header>
            <div class="video-row">
              <button v-for="video in videoCards" :key="video.title" type="button" @click="openVideoDialog">
                <span class="video-thumb"><el-icon><VideoPlay /></el-icon></span>
                <strong>{{ video.title }}</strong>
                <small>{{ video.meta }} · ♥ {{ video.views }}</small>
              </button>
            </div>
            <button type="button" class="red-button" @click="openVideoDialog">去刷视频赚Token</button>
            <footer>更多视频 ›</footer>
          </article>
        </section>

        <section class="perk-strip">
          <button v-for="item in perkItems" :key="item.title" type="button" @click="maybeRoast(item.title)">
            <el-icon><component :is="item.icon" /></el-icon>
            <span>
              <strong>{{ item.title }}</strong>
              <small>{{ item.desc }}</small>
            </span>
            <i v-if="item.count" class="red-dot">{{ item.count }}</i>
          </button>
        </section>

        <section class="bottom-workspace">
          <div class="workspace-tabs">
            <button type="button" class="active">项目协作区</button>
            <button type="button">本地</button>
            <button type="button">团队智能体</button>
            <button type="button">智能体 <i>NEW</i></button>
            <button type="button">+</button>
          </div>
          <div class="prompt-area">
            <textarea v-model="taskInput" />
            <div class="prompt-footer">
              <div>
                <button v-for="tool in commandTools" :key="tool" type="button" @click="maybeRoast(tool)">
                  {{ tool }}
                </button>
              </div>
              <div>
                <span>⚡ 今日签到可领 60 Token</span>
                <button type="button" @click="submitPrompt">➤</button>
              </div>
            </div>
          </div>
          <aside class="bottom-token">
            <div>
              <span>我的Token</span>
              <strong>{{ displayTokenBalance.toLocaleString() }}</strong>
              <button type="button" @click="openWithdrawDialog">去充值</button>
              <small>明细 | 收益榜</small>
            </div>
            <div>
              <span>连续购 5 天</span>
              <p>新手学习进度焦虑包</p>
            </div>
          </aside>
        </section>
      </main>
    </div>

    <transition name="roast-pop">
      <aside v-if="roastVisible" class="roast-float">
        <button type="button" class="roast-close" @click="roastVisible = false">×</button>
        <span>嘴臭客服 · {{ roastLevel }} · 傻逼指数 {{ roastScore }}</span>
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
            <small>{{ currentSticker.caption }}</small>
          </div>
        </div>
        <p>{{ lastRoast }}</p>
        <div class="roast-actions">
          <el-button size="small" type="danger" plain @click="triggerComplaint('投诉客服')">投诉</el-button>
          <el-button size="small" type="danger" @click="triggerComplaint('报警演示')">报警</el-button>
          <el-button size="small" type="danger" @click="triggerComplaint('继续骂')">继续骂</el-button>
        </div>
        <small>演示按钮，不连接真实投诉、报警或支付接口。</small>
      </aside>
    </transition>

    <el-dialog v-model="withdrawDialogVisible" width="500px" :show-close="false" title="提现中心">
      <div class="dialog-copy">
        <strong>系统维护中，请继续积累信任</strong>
        <el-progress :percentage="maintenanceProgress" status="warning" :stroke-width="12" />
        <p>维护进度到 100% 后将自动进入下一阶段维护。</p>
      </div>
      <template #footer>
        <el-button @click="maintenanceProgress = Math.max(1, maintenanceProgress - 7)">刷新维护进度</el-button>
        <el-button type="primary" @click="requestCloseDialog">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="videoDialogVisible" width="480px" :show-close="false" title="短视频提现教程">
      <div class="dialog-copy">
        <strong>你已经观看 {{ videoWatchCount }} 个教程</strong>
        <p>提现按钮正在路上。继续刷 3 分钟可解锁“继续刷 3 分钟”。</p>
      </div>
      <template #footer>
        <el-button @click="openVideoDialog">再刷一个</el-button>
        <el-button type="primary" @click="requestCloseDialog">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="closeConfirmVisible" width="420px" :show-close="false" title="确认关闭关闭弹窗？">
      <div class="dialog-copy">
        <strong>关闭后将无法继续关闭当前关闭流程</strong>
        <p>系统建议保留弹窗，以便持续获得完整权益提醒。</p>
      </div>
      <template #footer>
        <el-button @click="closeConfirmVisible = false">取消关闭</el-button>
        <el-button type="danger" @click="closeActiveDialog">确认关闭关闭弹窗</el-button>
      </template>
    </el-dialog>
  </div>
</template>
