<template>
  <div class="min-h-screen bg-surface-50 dark:bg-surface-950 text-surface-800 dark:text-surface-200">
    <!-- ─── 顶部导航栏 ─── -->
    <header
      class="sticky top-0 z-50 h-14 flex items-center justify-between px-5 bg-surface-50/90 dark:bg-surface-900/80 backdrop-blur-xl backdrop-blur-xl border-b border-surface-200 dark:border-surface-800/60"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-8 h-8 rounded-lg bg-gradient-to-br bg-primary-600 dark:bg-primary-500 flex items-center justify-center shadow-sm"
        >
          <el-icon :size="18" color="#fff"><ElIconLightning /></el-icon>
        </div>
        <div class="leading-tight">
          <div class="text-base font-bold tracking-tight">
            Smart<span class="text-primary-600 dark:text-primary-400">Busbar</span>
          </div>
          <div class="text-[10px] text-surface-500 dark:text-surface-500 tracking-wider">
            UPS 母排智能选型 v2.0
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <!-- 修正系数实时指示 -->
        <div class="hidden md:flex items-center gap-3 mr-4 text-xs font-mono tabular-nums">
          <span class="text-surface-500 dark:text-surface-500">K =</span>
          <span class="text-primary-600 dark:text-primary-400">{{ correctionK.temp.toFixed(2) }}</span>
          <span class="text-surface-500 dark:text-surface-400">×</span>
          <span class="text-primary-600 dark:text-primary-400">{{ correctionK.alt.toFixed(2) }}</span>
          <span class="text-surface-500 dark:text-surface-400">×</span>
          <span
            :class="correctionK.wind > 1 ? 'text-semantic-warning' : 'text-primary-600 dark:text-primary-400'"
            >{{ correctionK.wind.toFixed(2) }}</span
          >
          <span class="text-surface-500 dark:text-surface-400">=</span>
          <span
            class="text-surface-900 dark:text-surface-900 dark:text-surface-900 dark:text-white font-bold px-1.5 py-0.5 rounded bg-surface-200 dark:bg-surface-800 border border-surface-200 dark:border-surface-700/50"
            >{{ correctionK.total.toFixed(3) }}</span
          >
        </div>

        <el-button
          text
          bg
          class="!text-surface-600 dark:text-surface-400 hover:!text-primary-600 dark:text-primary-400"
          @click="showExport = true"
        >
          <el-icon class="mr-1"><ElIconDocument /></el-icon> 导出
        </el-button>
        <el-button
          text
          bg
          class="!text-surface-600 dark:text-surface-400 hover:!text-primary-600 dark:text-primary-400"
          @click="showHelp = true"
        >
          <el-icon class="mr-1"><ElIconQuestionFilled /></el-icon> 帮助
        </el-button>
      </div>
    </header>

    <!-- ─── 主体 ─── -->
    <main class="max-w-[1440px] mx-auto px-4 py-5">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <!-- 左侧：参数面板 -->
        <aside class="lg:col-span-4 xl:col-span-3">
          <InputPanel />
        </aside>

        <!-- 右侧：结果区 -->
        <section class="lg:col-span-8 xl:col-span-9 space-y-5">
          <!-- 电流仪表盘 -->
          <CurrentDashboard />

          <!-- UPS 拓扑与运行原理解构图 (SVG) -->
          <UpsFlowDiagram />

          <!-- 修正系数拆解 -->
          <CorrectionBreakdown />

          <!-- 安全校验 & 工程参数 (v2.2) -->
          <SafetyVerificationPanel />

          <!-- 回路选项卡 + 推荐 -->
          <div class="glass-panel">
            <div class="flex items-center border-b border-surface-200 dark:border-surface-700/50">
              <button
                v-for="c in circuits"
                :key="c.key"
                class="relative flex-1 py-3 text-center text-sm font-medium transition-all duration-200"
                :class="
                  activeCircuit === c.key
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-surface-500 dark:text-surface-500 hover:text-surface-700 dark:text-surface-300'
                "
                @click="activeCircuit = c.key"
              >
                <span>{{ c.label }}</span>
                <span class="ml-1 text-[10px] text-surface-500 dark:text-surface-400">{{
                  c.labelEn
                }}</span>
                <div
                  v-if="activeCircuit === c.key"
                  class="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-cyan-400 rounded-full"
                ></div>
              </button>
            </div>

            <div class="p-5">
              <RecommendPanel />
            </div>
          </div>

          <!-- 自定义母排验证 -->
          <CustomBusbarPanel />

          <!-- 电缆选型推荐 -->
          <CableRecommendPanel />

          <!-- 电池回路铜排选型 -->
          <BatteryPanel />

          <!-- 风扇失效告警 -->
          <div
            v-if="fanFailureResult"
            class="glass-panel border-red-900/50 bg-red-950/30 p-5"
          >
            <div class="flex items-center gap-2 mb-3">
              <div class="w-2 h-2 rounded-full bg-semantic-error animate-pulse"></div>
              <span class="font-bold text-semantic-error text-sm"
                >风扇失效模拟结果</span
              >
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div class="data-label text-semantic-error/70">降容后载流</div>
                <div class="data-value text-semantic-error">
                  {{ fanFailureResult.degradedAmp
                  }}<span class="text-sm ml-0.5">A</span>
                </div>
              </div>
              <div>
                <div class="data-label text-semantic-error/70">负荷率</div>
                <div
                  class="data-value"
                  :class="
                    fanFailureResult.overloaded
                      ? 'text-semantic-error'
                      : 'text-semantic-warning'
                  "
                >
                  {{ (fanFailureResult.degradedLoadRate * 100).toFixed(1) }}%
                </div>
              </div>
              <div>
                <div class="data-label text-semantic-error/70">降容比例</div>
                <div class="data-value text-semantic-error">
                  -{{ fanFailureResult.derating }}%
                </div>
              </div>
              <div>
                <div class="data-label text-semantic-error/70">状态</div>
                <div class="data-value">
                  <el-tag
                    v-if="fanFailureResult.overloaded"
                    type="danger"
                    effect="dark"
                    round
                    >过载</el-tag
                  >
                  <el-tag v-else type="warning" effect="dark" round
                    >安全</el-tag
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- 压降估算 + 连接工艺 -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <VoltageDrop />
            <ConnectionGuide />
          </div>

          <!-- 成本估算 -->
          <CostEstimationPanel />

          <!-- 底部免责 -->
          <div class="text-center text-xs text-surface-500 dark:text-surface-400 py-2">
            <el-icon class="mr-1"><ElIconInfoFilled /></el-icon>
            计算结果仅供工程参考，最终选型请以设计院图纸与当地规范为准。
          </div>
        </section>
      </div>
    </main>

    <!-- ─── 帮助弹窗 ─── -->
    <el-dialog
      v-model="showHelp"
      title="关于 SmartBusbar"
      width="560px"
      :append-to-body="true"
    >
      <div class="text-sm text-surface-700 dark:text-surface-300 space-y-4">
        <p>
          <strong class="text-primary-600 dark:text-primary-400">SmartBusbar v2.0</strong> 是专为 UPS
          系统设计的母排智能选型工具。基于 IEC/GB
          标准载流量数据，结合环境修正系数，为您推荐最优的母排规格。
        </p>
        <div>
          <h4 class="font-bold text-surface-800 dark:text-surface-200 mb-2">核心算法</h4>
          <ul class="list-disc list-inside space-y-1 text-surface-600 dark:text-surface-400">
            <li>
              <strong>综合修正系数</strong> K = K(temp) × K(alt) × K(wind)
            </li>
            <li><strong>实际载流量</strong> = 基础载流量 × K</li>
            <li><strong>压降估算</strong> ΔV = ρ × L × I / S</li>
          </ul>
        </div>
        <div>
          <h4 class="font-bold text-surface-800 dark:text-surface-200 mb-2">三档策略</h4>
          <ul class="space-y-1 text-surface-600 dark:text-surface-400">
            <li>
              <span
                class="inline-block w-2 h-2 rounded-full bg-semantic-error mr-2"
              ></span
              ><strong>经济型</strong>：负荷率 90%~100%
            </li>
            <li>
              <span
                class="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"
              ></span
              ><strong>标准型</strong>：负荷率 70%~90% (推荐)
            </li>
            <li>
              <span
                class="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"
              ></span
              ><strong>保守型</strong>：负荷率 &lt;70%
            </li>
          </ul>
        </div>
        <div>
          <h4 class="font-bold text-surface-800 dark:text-surface-200 mb-2">新功能 (v2.2)</h4>
          <ul class="list-disc list-inside space-y-1 text-surface-600 dark:text-surface-400">
            <li>铜排/铝排双材料切换</li>
            <li>风扇失效场景模拟</li>
            <li>母排压降估算</li>
            <li>连接工艺 SOP 推荐</li>
            <li>PDF 选型报告导出</li>
            <li><span class="text-primary-600 dark:text-primary-400">短路耐受校验 (IEC 61439)</span></li>
            <li><span class="text-primary-600 dark:text-primary-400">温升估算 & 集肤效应修正</span></li>
            <li><span class="text-primary-600 dark:text-primary-400">短路电动力 & 支撑间距</span></li>
            <li><span class="text-primary-600 dark:text-primary-400">谐波负载自动计算 N 线系数</span></li>
            <li><span class="text-primary-600 dark:text-primary-400">PE 接地母排选型</span></li>
            <li><span class="text-primary-600 dark:text-primary-400">并机 UPS 系统支持</span></li>
            <li><span class="text-primary-600 dark:text-primary-400">湿度/安装方式/防护等级修正</span></li>
          </ul>
        </div>
      </div>
    </el-dialog>

    <!-- ─── 导出弹窗 ─── -->
    <ExportPanel />
  </div>
</template>

<script setup>
import { useSmartBusbar } from "./composables/useSmartBusbar.js";
import { CIRCUITS } from "./constants/index.js";
import InputPanel from "./components/InputPanel.vue";
import CurrentDashboard from "./components/CurrentDashboard.vue";
import CorrectionBreakdown from "./components/CorrectionBreakdown.vue";
import RecommendPanel from "./components/RecommendPanel.vue";
import CustomBusbarPanel from "./components/CustomBusbarPanel.vue";
import CableRecommendPanel from "./components/CableRecommendPanel.vue";
import BatteryPanel from "./components/BatteryPanel.vue";
import VoltageDrop from "./components/VoltageDrop.vue";
import ConnectionGuide from "./components/ConnectionGuide.vue";
import ExportPanel from "./components/ExportPanel.vue";
import SafetyVerificationPanel from "./components/SafetyVerificationPanel.vue";
import CostEstimationPanel from "./components/CostEstimationPanel.vue";
import UpsFlowDiagram from "./components/UpsFlowDiagram.vue";

const {
  form,
  activeCircuit,
  showHelp,
  showExport,
  correctionK,
  currents,
  fanFailureResult,
} = useSmartBusbar();

const circuits = CIRCUITS;
</script>
