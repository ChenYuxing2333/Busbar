<template>
  <div>
    <!-- 无结果 -->
    <div v-if="rec.error" class="text-center py-12 text-surface-500 dark:text-surface-500">
      <el-icon :size="36" class="mb-3 text-semantic-warning/50"
        ><ElIconWarningFilled
      /></el-icon>
      <p>{{ rec.error }}</p>
    </div>

    <!-- 负荷率标尺 -->
    <template v-else>
      <div class="mb-5" v-if="getStrategyItem('standard')">
        <div class="flex items-center gap-2 mb-2">
          <span
            class="text-[10px] font-bold uppercase tracking-widest text-surface-500 dark:text-surface-400"
            >负荷率分布</span
          >
        </div>
        <div class="load-gauge-container">
          <!-- 色带 -->
          <div class="load-gauge-track">
            <div class="load-gauge-segment bg-blue-500/40" style="width: 70%">
              <span class="load-gauge-label">保守 &lt;70%</span>
            </div>
            <div
              class="load-gauge-segment bg-emerald-500/40"
              style="width: 20%"
            >
              <span class="load-gauge-label">标准 70-90%</span>
            </div>
            <div class="load-gauge-segment bg-semantic-error/40" style="width: 10%">
              <span class="load-gauge-label">经济</span>
            </div>
          </div>
          <!-- 指针 -->
          <div
            class="load-gauge-pointer"
            :style="{ left: gaugePointerPosition + '%' }"
          >
            <div class="load-gauge-pointer-arrow"></div>
            <div class="load-gauge-pointer-label">
              {{ (standardLoadRate * 100).toFixed(1) }}%
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div
          v-for="s in strategies"
          :key="s.key"
          class="relative rounded-lg border p-4 transition-all duration-200"
          :class="strategyCardClass(s)"
        >
          <!-- 策略标签 -->
          <div class="absolute right-3 top-3">
            <span class="strategy-badge" :class="strategyBadgeClass(s)">
              {{ s.label }}
              <template v-if="s.key === 'standard'"> ★</template>
            </span>
          </div>

          <!-- 英文副标题 -->
          <div
            class="text-[10px] font-bold uppercase tracking-widest text-surface-500 dark:text-surface-400 mb-2"
          >
            {{ s.labelEn }}
          </div>

          <!-- 规格 -->
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

          <!-- 载流量 -->
          <div class="text-sm text-surface-500 dark:text-surface-500 mb-3 font-mono tabular-nums">
            载流 {{ getStrategyItem(s.key)?.realAmp || 0 }} A
          </div>

          <!-- 负荷率进度条 -->
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
            {{ ((getStrategyItem(s.key)?.loadRate || 0) * 100).toFixed(1) }}%
          </div>
          <!-- 智能平替 (铝排) -->
          <div v-if="s.key === 'standard' && rec.altAluminum?.standard" class="mt-4 p-3 bg-amber-950/20 border border-amber-900/30 rounded-md">
            <div class="flex items-center gap-1 mb-1">
              <el-icon class="text-semantic-warning"><ElIconOpportunity /></el-icon>
              <span class="text-xs font-bold text-semantic-warning">平替：推荐铝排规格</span>
            </div>
            <div class="flex justify-between items-end">
              <div>
                <div class="font-mono tabular-nums text-sm text-surface-800 dark:text-surface-200">{{ rec.altAluminum.standard.displaySpec }}</div>
                <div class="text-[10px] text-surface-500 dark:text-surface-500 mt-0.5">截面 {{ rec.altAluminum.standard.cross_section }}mm² | 载流 {{ rec.altAluminum.standard.realAmp }}A</div>
              </div>
              <div v-if="getStrategyItem('standard')?.weight" class="text-[10px] px-2 py-1 bg-amber-500/10 text-semantic-warning rounded border border-amber-500/20">
                减重 {{ Math.max(0, Math.round((1 - rec.altAluminum.standard.weight / getStrategyItem('standard').weight) * 100)) }}%
              </div>
            </div>
          </div>

          <!-- 采用按钮 -->
          <div class="mt-4">
            <el-button
              :type="
                s.key === 'economy'
                  ? 'danger'
                  : s.key === 'standard'
                    ? 'primary'
                    : 'default'
              "
              class="!w-full"
              :class="{
                '!bg-red-600 !border-red-600 hover:!bg-semantic-error':
                  s.key === 'economy',
                '!bg-cyan-600 !border-cyan-600 hover:!bg-cyan-500':
                  s.key === 'standard',
                '!bg-blue-600 !border-blue-600 hover:!bg-blue-500':
                  s.key === 'premium',
              }"
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
          <el-icon class="text-surface-500 dark:text-surface-500"><ElIconGrid /></el-icon>
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
          :max-height="280"
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
                type="success"
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
              <span class="font-mono tabular-nums text-primary-600 dark:text-primary-400">{{ row.realAmp }}</span>
            </template>
          </el-table-column>

          <el-table-column label="负荷率" min-width="160">
            <template #default="{ row }">
              <div class="flex items-center gap-2">
                <el-progress
                  :percentage="Math.min(100, Math.round(row.loadRate * 100))"
                  :show-text="false"
                  :stroke-width="6"
                  :color="
                    row.loadRate > 0.9
                      ? '#ef4444'
                      : row.loadRate > 0.7
                        ? '#22c55e'
                        : '#3b82f6'
                  "
                  class="flex-1"
                />
                <span class="text-xs font-mono tabular-nums w-10 text-right text-surface-600 dark:text-surface-400">
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

          <el-table-column label="重量" width="70" align="center">
            <template #default="{ row }">
              <span class="text-xs text-surface-600 dark:text-surface-400 font-mono tabular-nums">{{
                row.weight
              }}</span>
            </template>
          </el-table-column>

          <el-table-column label="发热" width="70" align="center">
            <template #default="{ row }">
              <span class="text-xs text-semantic-warning font-mono tabular-nums">{{
                row.heatDissipation
              }}</span>
            </template>
          </el-table-column>

          <el-table-column label="最小折弯半径" width="90" align="center">
            <template #default="{ row }">
              <span class="text-xs text-surface-600 dark:text-surface-400 font-mono tabular-nums"
                >R{{ row.minBendRadius }}</span
              >
            </template>
          </el-table-column>

          <el-table-column label="总厚度" width="70" align="center">
            <template #default="{ row }">
              <span class="text-xs text-surface-600 dark:text-surface-400 font-mono tabular-nums">{{
                row.totalThickness
              }}</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="100" align="center">
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                text
                @click="exportForCreo(row)"
              >
                <el-icon class="mr-1"><ElIconDownload /></el-icon>
                导出
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { ElMessage } from "element-plus";
import { useSmartBusbar } from "../composables/useSmartBusbar.js";
import { STRATEGIES } from "../constants/index.js";

const { activeRecommendation, activeCircuit } = useSmartBusbar();
const strategies = STRATEGIES;

const rec = computed(() => activeRecommendation.value);

function getStrategyItem(key) {
  return rec.value?.[key] || null;
}

// 负荷率标尺
const standardLoadRate = computed(() => {
  const item = getStrategyItem("standard");
  return item?.loadRate || 0;
});

const gaugePointerPosition = computed(() => {
  // Map 0-100% load rate to 0-100% gauge position
  const rate = standardLoadRate.value * 100;
  return Math.max(0, Math.min(100, rate));
});

function strategyCardClass(s) {
  const item = getStrategyItem(s.key);
  if (!item) return "border-surface-200 dark:border-surface-800/60 bg-panel-900/50";

  if (s.key === "standard")
    return "border-green-800/50 bg-green-950/20 ring-1 ring-green-600/20 shadow-glow-green";
  if (s.key === "economy") return "border-red-900/30 bg-panel-900/50";
  return "border-blue-900/30 bg-panel-900/50";
}

function strategyBadgeClass(s) {
  if (s.key === "economy")
    return "bg-semantic-error/10 text-semantic-error border border-red-500/20";
  if (s.key === "standard")
    return "bg-green-500/10 text-green-400 border border-green-500/20";
  return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
}

function copyResult(item) {
  if (!item) return;
  const text = `推荐方案: ${item.displaySpec}\n修正载流: ${item.realAmp}A\n负荷率: ${(item.loadRate * 100).toFixed(1)}%\n截面积: ${item.cross_section}mm²`;
  navigator.clipboard
    .writeText(text)
    .then(() => {
      ElMessage.success({ message: "方案已复制到剪贴板", grouping: true });
    })
    .catch(() => {
      ElMessage.error("复制失败");
    });
}

function exportForCreo(item) {
  if (!item) return;

  // 生成 Creo 参数化 JSON 配置
  const creoConfig = {
    version: "1.0",
    project: "SmartBusbar",
    timestamp: new Date().toISOString(),
    circuit: activeCircuit.value,
    busbar: {
      code: item.code,
      material: item.code.startsWith("TMY") ? "copper" : "aluminum",
      dimensions: {
        width: item.width,
        thickness: item.thick,
        layers: item.layers,
        totalThickness: item.totalThickness,
      },
      electrical: {
        current: item.realAmp,
        crossSection: item.cross_section,
        resistivity: item.resistivity,
      },
      mechanical: {
        weightPerMeter: item.weight,
        heatDissipation: item.heatDissipation,
        minBendRadius: item.minBendRadius,
      },
    },
  };

  // 下载 JSON 文件
  const blob = new Blob([JSON.stringify(creoConfig, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `creo_busbar_${activeCircuit.value}_${item.code.replace(/[^a-zA-Z0-9]/g, "_")}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  ElMessage.success({ message: "Creo 配置文件已导出", grouping: true });
}
</script>
