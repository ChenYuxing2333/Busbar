<template>
  <div class="glass-panel">
    <div
      class="flex items-center justify-between px-4 py-2.5 bg-panel-900 border-b border-surface-200 dark:border-surface-800/60"
    >
      <div class="flex items-center gap-2">
        <el-icon class="text-surface-500 dark:text-surface-500"><ElIconConnection /></el-icon>
        <span class="text-xs font-bold text-surface-600 dark:text-surface-400 uppercase tracking-wider"
          >电缆选型推荐</span
        >
      </div>
      <div class="flex items-center gap-4">
        <el-tag size="small" type="info" effect="plain" class="!bg-surface-200 dark:bg-surface-800 !border-surface-200 dark:border-surface-700/50/30 text-[10px]">
          并机降额 Kp=0.8
        </el-tag>
        <span class="text-[10px] text-surface-500 dark:text-surface-500 font-mono tabular-nums italic">仅限电力电缆 (IEC/GB)</span>
      </div>
    </div>

    <div class="p-5">
      <!-- 无结果 -->
      <div v-if="rec.error" class="text-center py-12 text-surface-500 dark:text-surface-500">
        <el-icon :size="36" class="mb-3 text-semantic-warning/50"
          ><ElIconWarningFilled
        /></el-icon>
        <p>{{ rec.error }}</p>
      </div>

      <!-- 三档推荐卡片 -->
      <template v-else>
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

            <!-- 标准型采用按钮 -->
            <div v-if="s.key === 'standard'" class="mt-4">
              <el-button
                type="primary"
                class="!w-full !bg-cyan-600 !border-cyan-600 hover:!bg-cyan-500"
                @click="copyResult(getStrategyItem('standard'))"
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

            <el-table-column prop="displaySpec" label="型号" min-width="120">
              <template #default="{ row }">
                <span class="font-mono tabular-nums text-sm" :class="row.count > 1 ? 'text-semantic-warning' : 'text-surface-800 dark:text-surface-200'">{{
                  row.displaySpec
                }}</span>
              </template>
            </el-table-column>

            <el-table-column
              prop="total_cross_section"
              :label="form.standard === 'UL' ? '等效截面' : '总截面'"
              width="100"
              align="center"
            >
              <template #default="{ row }">
                <span class="text-xs text-surface-500 dark:text-surface-500 font-mono tabular-nums"
                  >{{ row.total_cross_section }}mm²</span
                >
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
                  <span
                    class="text-xs font-mono tabular-nums w-10 text-right text-surface-600 dark:text-surface-400"
                  >
                    {{ (row.loadRate * 100).toFixed(0) }}%
                  </span>
                </div>
              </template>
            </el-table-column>

            <el-table-column
              prop="outer_diameter"
              label="外径"
              width="70"
              align="center"
            >
              <template #default="{ row }">
                <span class="text-xs text-surface-600 dark:text-surface-400 font-mono tabular-nums">{{
                  row.outer_diameter
                }}</span>
              </template>
            </el-table-column>

            <el-table-column
              prop="weight"
              label="重量"
              width="70"
              align="center"
            >
              <template #default="{ row }">
                <span class="text-xs text-surface-600 dark:text-surface-400 font-mono tabular-nums">{{
                  row.weight
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
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { ElMessage } from "element-plus";
import { useSmartBusbar } from "../composables/useSmartBusbar.js";
import { recommendCable } from "../utils/calculator.js";
import { STRATEGIES } from "../constants/index.js";

const { activeTargetCurrent, correctionK, activeCircuit, form } = useSmartBusbar();
const strategies = STRATEGIES;

const cableType = ref("power");

// 电缆推荐结果
const rec = computed(() => {
  const target = activeTargetCurrent.value;
  const k = correctionK.value;

  if (!target || target <= 0) {
    return {
      economy: null,
      standard: null,
      premium: null,
      allCandidates: [],
      error: "无电流数据",
    };
  }

  return recommendCable(target, k, { 
    cableType: cableType.value,
    standard: form.standard 
  });
});

function handleCableTypeChange() {
  // 电缆类型切换时自动刷新
}

function getStrategyItem(key) {
  return rec.value?.[key] || null;
}

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
  const text = `推荐方案: ${item.displaySpec}\n平行根数: ${item.count} 根\n总载流量: ${item.realAmp}A\n负荷率: ${(item.loadRate * 100).toFixed(1)}%\n总截面积: ${item.total_cross_section}mm²`;
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
    type: "cable",
    cable: {
      code: item.code,
      name: item.name,
      cableType: cableType.value,
      dimensions: {
        crossSection: item.cross_section,
        outerDiameter: item.outer_diameter,
        conductor: item.conductor,
      },
      electrical: {
        current: item.realAmp,
        resistivity: item.resistivity,
      },
      mechanical: {
        weightPerKm: item.weight,
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
  a.download = `creo_cable_${activeCircuit.value}_${item.code.replace(/[^a-zA-Z0-9]/g, "_")}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  ElMessage.success({ message: "Creo 配置文件已导出", grouping: true });
}
</script>
