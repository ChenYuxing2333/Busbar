<template>
  <div class="glass-panel p-5">
    <div class="flex items-center gap-2 mb-4">
      <el-icon class="text-semantic-warning"><ElIconOdometer /></el-icon>
      <h3 class="text-sm font-bold text-surface-700 dark:text-surface-300">压降估算</h3>
    </div>

    <div class="space-y-3">
      <!-- 母排长度输入 -->
      <div class="flex items-center gap-3">
        <label class="text-xs text-surface-500 dark:text-surface-500 whitespace-nowrap">母排长度</label>
        <el-input-number
          v-model="form.busbarLength"
          :min="0.1" :max="50" :step="0.5"
          :precision="1"
          size="small"
          class="!w-28"
        />
        <span class="text-xs text-surface-500 dark:text-surface-500">m</span>
      </div>

      <!-- 计算基于当前推荐标准型 -->
      <div v-if="dropResult && selectedSpec" class="space-y-3">
        <div class="text-[11px] text-surface-500 dark:text-surface-500">
          基于 <span class="font-mono tabular-nums" :class="selectedSpec.isCustom ? 'text-violet-400' : 'text-primary-600 dark:text-primary-400'">{{ selectedSpec.displaySpec }}</span>
          <span v-if="selectedSpec.isCustom" class="text-violet-500">(自定义)</span>
          · {{ activeTargetCurrent }}A · {{ form.busbarLength }}m
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="rounded-lg bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800/60 p-3 text-center">
            <div class="data-label mb-1">压降 ΔV</div>
            <div
              class="data-value text-lg"
              :class="{
                'text-green-400': dropResult.status === 'ok',
                'text-semantic-warning': dropResult.status === 'warning',
                'text-semantic-error':   dropResult.status === 'danger',
              }"
            >
              {{ dropResult.dropV }}
              <span class="text-xs ml-0.5">V</span>
            </div>
          </div>
          <div class="rounded-lg bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800/60 p-3 text-center">
            <div class="data-label mb-1">压降率 ΔV%</div>
            <div
              class="data-value text-lg"
              :class="{
                'text-green-400': dropResult.status === 'ok',
                'text-semantic-warning': dropResult.status === 'warning',
                'text-semantic-error':   dropResult.status === 'danger',
              }"
            >
              {{ dropResult.dropPercent }}
              <span class="text-xs ml-0.5">%</span>
            </div>
          </div>
        </div>

        <!-- 状态指示 -->
        <div class="flex items-center gap-2 text-xs">
          <div
            class="w-2 h-2 rounded-full"
            :class="{
              'bg-green-500': dropResult.status === 'ok',
              'bg-amber-500 animate-pulse': dropResult.status === 'warning',
              'bg-semantic-error animate-pulse':   dropResult.status === 'danger',
            }"
          ></div>
          <span
            :class="{
              'text-green-500': dropResult.status === 'ok',
              'text-semantic-warning': dropResult.status === 'warning',
              'text-semantic-error':   dropResult.status === 'danger',
            }"
          >
            {{ dropResult.status === 'ok' ? '压降正常 (≤3%)' : dropResult.status === 'warning' ? '压降偏大 (3%~5%)' : '压降过大 (>5%)' }}
          </span>
        </div>
      </div>

      <div v-else class="text-center py-4 text-xs text-surface-500 dark:text-surface-400">
        请先完成选型获取推荐规格
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useSmartBusbar } from '../composables/useSmartBusbar.js';
import { calculateVoltageDrop } from '../utils/calculator.js';

const { form, activeRecommendation, activeTargetCurrent, activeCustomBusbar, activeCustomValidation } = useSmartBusbar();

// 优先使用自定义母排数据，否则用系统推荐
const selectedSpec = computed(() => {
  // 自定义母排启用且有有效数据时优先使用
  const cb = activeCustomBusbar.value;
  if (cb && cb.enabled && cb.ampacity > 0) {
    return {
      displaySpec: cb.code || `自定义-${cb.width}×${cb.thick}×${cb.layers}`,
      cross_section: cb.width * cb.thick * cb.layers,
      resistivity: cb.material === 'aluminum' ? 0.0283 : 0.0175,
      isCustom: true,
    };
  }

  // 回退到系统推荐
  const rec = activeRecommendation.value;
  if (!rec || rec.error || !rec.standard) return null;
  return { ...rec.standard, isCustom: false };
});

const dropResult = computed(() => {
  const spec = selectedSpec.value;
  if (!spec) return null;

  return calculateVoltageDrop({
    current: activeTargetCurrent.value,
    length: form.busbarLength,
    crossSection: spec.cross_section,
    resistivity: spec.resistivity,
    voltage: form.voltage,
  });
});
</script>
