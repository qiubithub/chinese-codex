<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import { useAppStore } from '../stores/app'

const appStore = useAppStore()
const chartRef = ref<HTMLDivElement | null>(null)

const overview = computed(() => appStore.overview)
const navItems = [
  ['首页推荐', ''],
  ['AI 中心', '7'],
  ['金融中心', '12'],
  ['外卖生活', ''],
  ['短视频', '99+'],
  ['会员体系', '3'],
  ['任务中心', '27'],
  ['奇怪工具', ''],
  ['政企服务', '1'],
]

onMounted(async () => {
  await appStore.loadOverview()
  if (!chartRef.value) return

  const chart = echarts.init(chartRef.value)
  chart.setOption({
    grid: { top: 10, right: 8, bottom: 18, left: 8 },
    xAxis: { type: 'category', show: false, data: ['一', '二', '三', '四', '五', '六', '截图'] },
    yAxis: { type: 'value', show: false },
    series: [
      {
        type: 'line',
        smooth: true,
        symbolSize: 7,
        data: [12, 16, 14, 19, 18, 23, 36],
        lineStyle: { width: 4, color: '#2f75ff' },
        itemStyle: { color: '#ff7a1a' },
        areaStyle: { color: 'rgba(47, 117, 255, 0.12)' },
      },
    ],
  })
})
</script>

<template>
  <div class="app-layout" v-loading="appStore.loading">
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
          v-for="[label, count] in navItems"
          :key="label"
          class="nav-item"
          :class="{ active: label === '首页推荐' }"
          type="button"
        >
          <span>{{ label }}</span>
          <i v-if="count" class="red-dot">{{ count }}</i>
        </button>
      </nav>
    </aside>

    <main class="workspace">
      <section class="promo">
        <strong>新人专享礼：首充 0 元送 12000 Token + A2 会员体验卡 7 天</strong>
        <el-button type="danger" round>立即领券</el-button>
      </section>

      <section class="hero">
        <span class="muted">万能生活 AI 工作金融本地服务内容电商平台</span>
        <h1>一个 App，解决你没遇到的所有问题。</h1>
        <p class="muted">今日已为你节省 0.03 秒决策时间，并新增 17 个需要处理的权益入口。</p>
      </section>

      <section class="quick-grid">
        <button v-for="entry in overview.quickEntries" :key="entry.key" class="quick-card" type="button">
          <el-tag size="small" type="warning">{{ entry.badgeText }}</el-tag>
          <strong>{{ entry.title }}</strong>
          <span>{{ entry.subtitle }}</span>
        </button>
      </section>

      <section class="dashboard-grid">
        <div class="panel">
          <div class="panel-title">
            <div>
              <span class="muted">今日全功能</span>
              <h2>模块入口与荒诞状态</h2>
            </div>
            <el-tag type="danger">红点迁移中</el-tag>
          </div>

          <div class="module-grid">
            <article v-for="entry in overview.quickEntries" :key="entry.key" class="module-card">
              <strong>{{ entry.title }}</strong>
              <span>{{ entry.bugText }}</span>
            </article>
          </div>
        </div>

        <div class="panel">
          <div class="panel-title">
            <div>
              <span class="muted">金融中心</span>
              <h2>Token 理财</h2>
            </div>
            <el-button size="small">截图模式</el-button>
          </div>
          <div class="finance-value">+{{ overview.finance.todayVirtualProfit }}</div>
          <p class="muted">想象年化 {{ overview.finance.imaginedAnnualRate }}</p>
          <div ref="chartRef" class="chart" />
          <p class="risk">{{ overview.finance.riskNotice }}</p>
        </div>

        <div class="panel">
          <div class="panel-title">
            <div>
              <span class="muted">会员体系</span>
              <h2>{{ overview.user.memberLevel }} 智能焦虑会员</h2>
            </div>
            <el-button type="primary" size="small">升级 A7</el-button>
          </div>
          <el-progress :percentage="68" :stroke-width="12" striped />
          <p class="risk">{{ overview.user.nextBenefit }}</p>
        </div>

        <div class="panel">
          <div class="panel-title">
            <div>
              <span class="muted">任务中心</span>
              <h2>今日已贡献 17 次有效点击</h2>
            </div>
          </div>
          <div class="task-list">
            <div v-for="task in overview.tasks" :key="task.title" class="task-item">
              <strong>{{ task.title }}</strong>
              <span class="muted">{{ task.progressText }}</span>
              <b>{{ task.rewardText }}</b>
            </div>
          </div>
        </div>
      </section>
    </main>

    <aside class="right-rail">
      <section class="rail-card">
        <span class="muted">我的 Token</span>
        <strong>{{ overview.user.tokenBalance.toLocaleString() }}</strong>
        <el-button type="warning" plain>提现维护中</el-button>
      </section>

      <section class="rail-card">
        <span class="muted">外卖状态</span>
        <strong>骑手已进入量子态</strong>
        <p class="muted">普通用户显示即将送达，SVIP 显示更即将送达。</p>
      </section>

      <section class="rail-card">
        <span class="muted">红点迁移日志</span>
        <div class="log-list">
          <p v-for="log in overview.redDotLogs" :key="log.message">{{ log.message }}</p>
        </div>
      </section>

      <section class="rail-card">
        <span class="muted">接口状态</span>
        <strong>{{ appStore.apiOnline ? 'API 已连接' : '使用本地假数据' }}</strong>
        <p class="risk">Token 不具备真实价值，所有收益和权益仅用于演示。</p>
      </section>
    </aside>
  </div>
</template>
