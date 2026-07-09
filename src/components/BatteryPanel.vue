<template>
  <transition name="el-zoom-in-top">
    <div v-if="form.batteryEnabled" class="glass-panel border-amber-900/40">
      <!-- 标题栏 -->
      <div
        class="flex items-center gap-3 px-5 py-4 border-b border-amber-900/30"
      >
        <div class="w-2 h-2 rounded-full bg-amber-400"></div>
        <span class="font-bold text-semantic-warning text-sm">电池回路铜排选型</span>
        <span class="text-[10px] text-surface-500 dark:text-surface-500 font-mono tabular-nums"
          >DC {{ form.batteryVoltage }}V · {{ materialLabel }}</span
        >
        <el-tag
          size="small"
          class="!bg-amber-950/50 !border-amber-700/40 !text-semantic-warning ml-auto"
        >
          IEC 62040 / GB/T 7260
        </el-tag>
      </div>

      <div class="p-5 space-y-5">
        <!-- 无电流数据 -->
        <div v-if="!bat" class="text-center py-8 text-surface-500 dark:text-surface-500">
          <el-icon :size="32" class="mb-2 text-semantic-warning/40"
            ><ElIconWarningFilled
          /></el-icon>
          <p>请先填写 UPS 容量</p>
        </div>

        <!-- 无选型结果 -->
        <div
          v-else-if="!rec || rec.error"
          class="text-center py-8 text-surface-500 dark:text-surface-500"
        >
          <el-icon :size="32" class="mb-2 text-semantic-warning/40"
            ><ElIconWarningFilled
          /></el-icon>
          <p>{{ rec?.error || "未找到符合条件的规格" }}</p>
        </div>

        <template v-else>
          <!-- 电流摘要 -->
          <div
            class="grid grid-cols-3 gap-3 rounded-lg bg-amber-950/30 border border-amber-900/30 p-4"
          >
            <div class="text-center">
              <div
                class="text-[10px] text-amber-600/70 uppercase tracking-widest mb-1"
              >
                放电电流
              </div>
              <div class="font-mono tabular-nums font-bold text-lg text-semantic-warning">
                {{ bat.discharge }}
                <span class="text-sm text-surface-500 dark:text-surface-500">A</span>
              </div>
              <div class="text-[10px] text-surface-500 dark:text-surface-400 mt-0.5">
                {{ bat.powerKW }}kW / {{ form.batteryVoltage }}V /
                {{ (form.inverterEff / 100).toFixed(2) }}η
              </div>
            </div>
            <div class="text-center border-x border-amber-900/30">
              <div
                class="text-[10px] text-amber-600/70 uppercase tracking-widest mb-1"
              >
                充电电流
              </div>
              <div
                class="font-mono tabular-nums font-bold text-lg"
                :class="bat.charge > 0 ? 'text-semantic-warning' : 'text-surface-500 dark:text-surface-400'"
              >
                {{ bat.charge > 0 ? bat.charge : "—" }}
                <span v-if="bat.charge > 0" class="text-sm text-surface-500 dark:text-surface-500"
                  >A</span
                >
              </div>
              <div class="text-[10px] text-surface-500 dark:text-surface-400 mt-0.5">
                {{
                  bat.charge > 0
                    ? `${form.batteryCapacity}Ah × ${form.chargeRate}C`
                    : "未配置电池容量"
                }}
              </div>
            </div>
            <div class="text-center">
              <div
                class="text-[10px] text-amber-600/70 uppercase tracking-widest mb-1"
              >
                设计电流
              </div>
              <div class="font-mono tabular-nums font-bold text-xl text-surface-900 dark:text-surface-900 dark:text-surface-900 dark:text-white">
                {{ bat.design }} <span class="text-sm text-surface-500 dark:text-surface-500">A</span>
              </div>
              <div class="text-[10px] text-surface-500 dark:text-surface-400 mt-0.5">
                × {{ form.batterySafetyFactor }} 安全系数
              </div>
            </div>
          </div>

          <!-- DC 修正说明 -->
          <div
            class="flex items-center gap-2 text-[11px] text-surface-500 dark:text-surface-500 bg-surface-200 dark:bg-surface-800 rounded px-3 py-2"
          >
            <el-icon class="text-semantic-warning/70 flex-shrink-0"
              ><ElIconInfoFilled
            /></el-icon>
            <span
              >电池室铜排仅施加温度与海拔修正（K_temp × K_alt =
              <strong class="text-semantic-warning font-mono tabular-nums">{{
                dcKTotal.toFixed(3)
              }}</strong
              >），不计风冷增益</span
            >
          </div>

          <!-- 三档推荐卡片 -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              v-for="s in strategies"
              :key="s.key"
              class="relative rounded-lg border p-4 transition-all duration-200"
              :class="strategyCardClass(s)"
            >
              <div class="absolute right-3 top-3">
                <span class="strategy-badge" :class="strategyBadgeClass(s)">
                  {{ s.label
                  }}<template v-if="s.key === 'standard'"> ★</template>
                </span>
              </div>

              <div
                class="text-[10px] font-bold uppercase tracking-widest text-surface-500 dark:text-surface-400 mb-2"
              >
                {{ s.labelEn }}
              </div>
              <div
                class="font-bold font-mono tabular-nums mb-1"
                :class="
                  s.key === 'standard'
                    ? 'text-xl text-slate-100'
                    : 'text-lg text-surface-700 dark:text-surface-300'
                "
              >
                {{ getStrategyItem(s.key)?.displaySpec || "—" }}
              </div>
              <div class="text-sm text-surface-500 dark:text-surface-500 mb-3 font-mono tabular-nums">
                载流 {{ getStrategyItem(s.key)?.realAmp || 0 }} A
              </div>

              <div class="mb-1">
                <el-progress
                  :percentage="
                    Math.round((getStrategyItem(s.key)?.loadRate || 0) * 100)
                  "
                  :color="s.color"
                  :stroke-width="8"
                  :show-text="false"
                />
              </div>
              <div class="text-xs text-surface-500 dark:text-surface-500 font-mono tabular-nums">
                负荷率
                {{
                  ((getStrategyItem(s.key)?.loadRate || 0) * 100).toFixed(1)
                }}%
              </div>

              <div class="mt-4">
                <el-button
                  :class="{
                    '!bg-red-600 !border-red-600 hover:!bg-semantic-error':
                      s.key === 'economy',
                    '!bg-amber-600 !border-amber-600 hover:!bg-amber-500':
                      s.key === 'standard',
                    '!bg-blue-600 !border-blue-600 hover:!bg-blue-500':
                      s.key === 'premium',
                  }"
                  class="!w-full"
                  @click="copyResult(getStrategyItem(s.key))"
                >
                  <el-icon class="mr-1"><ElIconDocumentCopy /></el-icon>
                  采用此方案
                </el-button>
              </div>
            </div>
          </div>

          <!-- 候选规格表 -->
          <div class="rounded-lg border border-surface-200 dark:border-surface-700/50 overflow-hidden">
            <div
              class="flex items-center gap-2 px-4 py-2.5 bg-panel-900 border-b border-surface-200 dark:border-surface-800/60"
            >
              <el-icon class="text-semantic-warning/60"><ElIconGrid /></el-icon>
              <span
                class="text-xs font-bold text-surface-600 dark:text-surface-400 uppercase tracking-wider"
                >全部候选规格</span
              >
              <span class="text-[10px] text-surface-500 dark:text-surface-400"
                >({{ rec.allCandidates.length }})</span
              >
            </div>

            <el-table
              :data="rec.allCandidates"
              stripe
              style="width: 100%"
              :max-height="260"
              :header-cell-style="{
                backgroundColor: '#0a0f1a',
                color: '#94a3b8',
                fontSize: '12px',
              }"
            >
              <el-table-column label="策略" width="90" align="center">
                <template #default="{ row }">
                  <el-tag
                    v-if="row.loadRate >= 0.9"
                    type="danger"
                    size="small"
                    effect="dark"
                    round
                    >经济</el-tag
                  >
                  <el-tag
                    v-else-if="row.loadRate >= 0.7"
                    type="warning"
                    size="small"
                    effect="dark"
                    round
                    >标准</el-tag
                  >
                  <el-tag v-else type="primary" size="small" effect="dark" round
                    >保守</el-tag
                  >
                </template>
              </el-table-column>

              <el-table-column prop="displaySpec" label="规格" min-width="140">
                <template #default="{ row }">
                  <span class="font-mono tabular-nums text-sm text-surface-800 dark:text-surface-200">{{
                    row.displaySpec
                  }}</span>
                </template>
              </el-table-column>

              <el-table-column
                prop="realAmp"
                label="载流量(A)"
                width="100"
                align="center"
              >
                <template #default="{ row }">
                  <span class="font-mono tabular-nums text-semantic-warning">{{
                    row.realAmp
                  }}</span>
                </template>
              </el-table-column>

              <el-table-column label="负荷率" min-width="150">
                <template #default="{ row }">
                  <div class="flex items-center gap-2">
                    <el-progress
                      :percentage="
                        Math.min(100, Math.round(row.loadRate * 100))
                      "
                      :show-text="false"
                      :stroke-width="6"
                      :color="
                        row.loadRate > 0.9
                          ? '#ef4444'
                          : row.loadRate > 0.7
                            ? '#f59e0b'
                            : '#3b82f6'
                      "
                      class="flex-1"
                    />
                    <span
                      class="text-xs font-mono tabular-nums w-10 text-right text-surface-600 dark:text-surface-400"
                    >
                      {{ (row.loadRate * 100).toFixed(0) }}%
                    </span>
                  </div>
                </template>
              </el-table-column>

              <el-table-column label="截面" width="80" align="center">
                <template #default="{ row }">
                  <span class="text-xs text-surface-500 dark:text-surface-500 font-mono tabular-nums"
                    >{{ row.cross_section }}mm²</span
                  >
                </template>
              </el-table-column>

              <el-table-column label="发热(W/m)" width="90" align="center">
                <template #default="{ row }">
                  <span class="text-xs text-semantic-warning font-mono tabular-nums">{{
                    row.heatDissipation
                  }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </template>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from "vue";
import { ElMessage } from "element-plus";
import { useSmartBusbar } from "../composables/useSmartBusbar.js";
import { STRATEGIES } from "../constants/index.js";

const {
  form,
  materialLabel,
  batteryCurrents,
  batteryRecommendation,
  correctionK,
} = useSmartBusbar();
const strategies = STRATEGIES;

const bat = computed(() => batteryCurrents.value);
const rec = computed(() => batteryRecommendation.value);

// DC 修正系数（不含风冷）
const dcKTotal = computed(() => correctionK.value.temp * correctionK.value.alt);

function getStrategyItem(key) {
  return rec.value?.[key] || null;
}

function strategyCardClass(s) {
  const item = getStrategyItem(s.key);
  if (!item) return "border-surface-200 dark:border-surface-800/60 bg-panel-900/50";
  if (s.key === "standard")
    return "border-amber-800/50 bg-amber-950/20 ring-1 ring-amber-600/20";
  if (s.key === "economy") return "border-red-900/30 bg-panel-900/50";
  return "border-blue-900/30 bg-panel-900/50";
}

function strategyBadgeClass(s) {
  if (s.key === "economy")
    return "bg-semantic-error/10 text-semantic-error border border-red-500/20";
  if (s.key === "standard")
    return "bg-amber-500/10 text-semantic-warning border border-amber-500/20";
  return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
}

function copyResult(item) {
  if (!item) return;
  const text = `[电池回路] 推荐方案: ${item.displaySpec}\nDC电压: ${form.batteryVoltage}V\n设计电流: ${bat.value?.design}A\n修正载流: ${item.realAmp}A\n负荷率: ${(item.loadRate * 100).toFixed(1)}%\n截面积: ${item.cross_section}mm²`;
  navigator.clipboard
    .writeText(text)
    .then(() =>
      ElMessage.success({ message: "方案已复制到剪贴板", grouping: true }),
    )
    .catch(() => ElMessage.error("复制失败"));
}
</script>
