<template>
  <div class="glass-panel p-5">
    <div class="flex items-center gap-2 mb-4">
      <el-icon class="text-semantic-warning"><ElIconOdometer /></el-icon>
      <h3 class="text-sm font-bold text-surface-700 dark:text-surface-300">??‹é?ä¼°ç®?</h3>
    </div>

    <div class="space-y-3">
      <!-- æ¯æ?’é•¿åº¦è?“å?? -->
      <div class="flex items-center gap-3">
        <label class="text-xs text-surface-500 dark:text-surface-500 whitespace-nowrap">æ¯æ?’é•¿åº?</label>
        <el-input-number
          v-model="form.busbarLength"
          :min="0.1" :max="50" :step="0.5"
          :precision="1"
          size="small"
          class="!w-28"
        />
        <span class="text-xs text-surface-500 dark:text-surface-500">m</span>
      </div>

      <!-- è®¡ç?—åŸºäºå?“å?æ¨??æ????????-->
      <div v-if="dropResult && selectedSpec" class="space-y-3">
        <div class="text-[11px] text-surface-500 dark:text-surface-500">
          ?Ÿºäº? <span class="font-mono tabular-nums" :class="selectedSpec.isCustom ? 'text-violet-400' : 'text-primary-600 dark:text-primary-400'">{{ selectedSpec.displaySpec }}</span>
          <span v-if="selectedSpec.isCustom" class="text-violet-500">(?‡ªå®šä??</span>
          Â· {{ activeTargetCurrent }}A Â· {{ form.busbarLength }}m
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="rounded-lg bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800/60 p-3 text-center">
            <div class="data-label mb-1">??‹é?? ?”V</div>
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
            <div class="data-label mb-1">??‹é?ç???”V%</div>
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

        <!-- ?Š¶??????ç¤?-->
        <div class="flex items-center gap-2 text-xs">
          <div
            class="w-2 h-2 rounded-full"
            :class="{
              'bg-semantic-success': dropResult.status === 'ok',
              'bg-semantic-warning animate-pulse': dropResult.status === 'warning',
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
            {{ dropResult.status === 'ok' ? '??‹é?æ­£å¸? (???%)' : dropResult.status === 'warning' ? '??‹é?å?å¤§ (3%~5%)' : '??‹é?è??å¤? (>5%)' }}
          </span>
        </div>
      </div>

      <div v-else class="text-center py-4 text-xs text-surface-500 dark:text-surface-400">
        è¯·å??å®Œæ?é?‰å?‹è·??–æ¨??è??? ¼
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useSmartBusbar } from '../composables/useSmartBusbar.js';
import { calculateVoltageDrop } from '../utils/calculator.js';

const { form, activeRecommendation, activeTargetCurrent, activeCustomBusbar, activeCustomValidation } = useSmartBusbar();

// ä¼˜å??ä½¿ç”¨?‡ªå®šä?‰æ?æ?’æ•°?®ï¼??¦??™ç”¨ç³»ç???¨???
const selectedSpec = computed(() => {
  // ?‡ªå®šä?‰æ?æ?’å¯?”¨ä¸”æ?‰æ?‰æ???•°?®?—¶ä¼˜å??ä½¿ç”¨
  const cb = activeCustomBusbar.value;
  if (cb && cb.enabled && cb.ampacity > 0) {
    return {
      displaySpec: cb.code || `?‡ªå®šä??${cb.width}??${cb.thick}??${cb.layers}`,
      cross_section: cb.width * cb.thick * cb.layers,
      resistivity: cb.material === 'aluminum' ? 0.0283 : 0.0175,
      isCustom: true,
    };
  }

  // ??é????°ç³»ç»??¨???
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
