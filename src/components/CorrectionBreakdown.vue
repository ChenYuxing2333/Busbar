<template>
  <div class="glass-panel p-4">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-bold text-surface-700 dark:text-surface-300 flex items-center gap-2">
        <el-icon class="text-primary-600 dark:text-primary-400"><ElIconDataAnalysis /></el-icon>
        修正系数拆解
      </h3>
      <span class="text-[10px] text-surface-500 dark:text-surface-400 font-mono tabular-nums">
        K = K<sub>temp</sub> × K<sub>alt</sub> × K<sub>wind</sub>
      </span>
    </div>

    <!-- 系数条目 -->
    <div class="space-y-2">
      <!-- 温度修正 -->
      <div class="k-factor-row">
        <div class="k-factor-label">
          <span class="k-factor-icon">🌡️</span>
          <span>温度修正</span>
        </div>
        <div class="k-factor-source">{{ form.temp }}℃</div>
        <div class="k-factor-bar-wrap">
          <div
            class="k-factor-bar-fill"
            :style="{ width: barWidth(correctionK.temp), backgroundColor: barColor(correctionK.temp) }"
          ></div>
        </div>
        <div class="k-factor-value" :class="valueClass(correctionK.temp)">
          <span class="k-factor-arrow">{{ arrow(correctionK.temp) }}</span>
          × {{ correctionK.temp.toFixed(2) }}
        </div>
      </div>

      <!-- 海拔修正 -->
      <div class="k-factor-row">
        <div class="k-factor-label">
          <span class="k-factor-icon">⛰️</span>
          <span>海拔修正</span>
        </div>
        <div class="k-factor-source">{{ form.altitude }}m</div>
        <div class="k-factor-bar-wrap">
          <div
            class="k-factor-bar-fill"
            :style="{ width: barWidth(correctionK.alt), backgroundColor: barColor(correctionK.alt) }"
          ></div>
        </div>
        <div class="k-factor-value" :class="valueClass(correctionK.alt)">
          <span class="k-factor-arrow">{{ arrow(correctionK.alt) }}</span>
          × {{ correctionK.alt.toFixed(2) }}
        </div>
      </div>

      <!-- 风冷修正 -->
      <div class="k-factor-row">
        <div class="k-factor-label">
          <span class="k-factor-icon">💨</span>
          <span>风冷修正</span>
        </div>
        <div class="k-factor-source">
          <template v-if="form.cooling === 'forced'">{{ form.wind }}m/s</template>
          <template v-else>自然对流</template>
        </div>
        <div class="k-factor-bar-wrap">
          <div
            class="k-factor-bar-fill"
            :style="{ width: barWidth(correctionK.wind), backgroundColor: barColor(correctionK.wind) }"
          ></div>
        </div>
        <div class="k-factor-value" :class="valueClass(correctionK.wind)">
          <span class="k-factor-arrow">{{ arrow(correctionK.wind) }}</span>
          × {{ correctionK.wind.toFixed(2) }}
        </div>
      </div>
    </div>

    <!-- 分隔线 -->
    <div class="h-px bg-surface-700/50 my-3"></div>

    <!-- 最终结果 -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-xs text-surface-500 dark:text-surface-500">综合修正</span>
        <span
          class="font-mono tabular-nums text-base font-bold px-2 py-0.5 rounded transition-all duration-300"
          :class="correctionK.total >= 1 
            ? 'text-semantic-success bg-semantic-success/5 border border-semantic-success/20' 
            : correctionK.total >= 0.85
              ? 'text-semantic-warning bg-semantic-warning/5 border border-semantic-warning/20'
              : 'text-semantic-error bg-semantic-error/5 border border-semantic-error/20'"
        >
          K = {{ correctionK.total.toFixed(3) }}
        </span>
      </div>
      <div class="text-right">
        <div class="text-[10px] text-surface-500 dark:text-surface-400">实际载流量 = 基础载流量 × K</div>
        <div class="text-xs text-surface-600 dark:text-surface-400 font-mono tabular-nums">
          {{ activeTargetCurrent }}A 目标
          <span class="text-surface-500 dark:text-surface-400 mx-1">|</span>
          {{ materialLabel }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSmartBusbar } from '../composables/useSmartBusbar.js';

const { form, correctionK, activeTargetCurrent, materialLabel } = useSmartBusbar();

function barWidth(k) {
  // Map k value to percentage: 0.7 → 0%, 1.0 → 50%, 1.6 → 100%
  const pct = Math.max(0, Math.min(100, ((k - 0.7) / 0.9) * 100));
  return pct + '%';
}

function barColor(k) {
  if (k > 1.0) return '#22c55e';  // green — boost
  if (k >= 0.9) return '#06b6d4'; // cyan — near neutral
  if (k >= 0.8) return '#f59e0b'; // amber — moderate derating
  return '#ef4444';                // red — strong derating
}

function valueClass(k) {
  if (k > 1.0) return 'text-semantic-success';
  if (k >= 0.95) return 'text-primary-600 dark:text-primary-400';
  if (k >= 0.85) return 'text-semantic-warning';
  return 'text-semantic-error';
}

function arrow(k) {
  if (k > 1.0) return '↑';
  if (k < 1.0) return '↓';
  return '—';
}
</script>
