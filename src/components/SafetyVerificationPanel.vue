<template>
  <div v-if="hasAnyData" class="glass-panel p-5 space-y-4">
    <div class="flex items-center gap-2 mb-1">
      <div class="w-2 h-2 rounded-full" :class="overallStatus === 'danger' ? 'bg-semantic-error animate-pulse' : overallStatus === 'warning' ? 'bg-semantic-warning' : 'bg-semantic-success'"></div>
      <h3 class="text-sm font-bold text-surface-700 dark:text-surface-300">安全校验 & 工程参数</h3>
      <el-tag v-if="overallStatus === 'danger'" type="danger" size="small" effect="dark" round>异常</el-tag>
      <el-tag v-else-if="overallStatus === 'warning'" type="warning" size="small" effect="dark" round>注意</el-tag>
      <el-tag v-else type="success" size="small" effect="dark" round>正常</el-tag>
    </div>

    <!-- 短路耐受校验 (P1 #4) -->
    <div v-if="shortCircuitCheck && shortCircuitCheck.isc > 0" class="rounded-lg p-4 border" :class="shortCircuitCheck.pass ? 'bg-emerald-950/20 border-emerald-900/30' : 'bg-red-950/30 border-red-900/50'">
      <div class="flex items-center gap-2 mb-2">
        <el-icon :class="shortCircuitCheck.pass ? 'text-semantic-success' : 'text-semantic-error'">
          <ElIconCircleCheckFilled v-if="shortCircuitCheck.pass" />
          <ElIconWarningFilled v-else />
        </el-icon>
        <span class="text-xs font-bold" :class="shortCircuitCheck.pass ? 'text-semantic-success' : 'text-semantic-error'">短路耐受校验</span>
      </div>
      <div class="grid grid-cols-3 gap-3 text-center">
        <div>
          <div class="text-[10px] text-surface-500 dark:text-surface-500">预期 Isc</div>
          <div class="font-mono tabular-nums text-sm" :class="shortCircuitCheck.pass ? 'text-surface-800 dark:text-surface-200' : 'text-semantic-error'">{{ shortCircuitCheck.isc }} kA</div>
        </div>
        <div>
          <div class="text-[10px] text-surface-500 dark:text-surface-500">母排 Icw</div>
          <div class="font-mono tabular-nums text-sm text-surface-800 dark:text-surface-200">{{ shortCircuitCheck.icw }} kA</div>
        </div>
        <div>
          <div class="text-[10px] text-surface-500 dark:text-surface-500">安全裕度</div>
          <div class="font-mono tabular-nums text-sm" :class="shortCircuitCheck.margin > 20 ? 'text-semantic-success' : shortCircuitCheck.margin > 0 ? 'text-semantic-warning' : 'text-semantic-error'">{{ shortCircuitCheck.margin }}%</div>
        </div>
      </div>
      <div class="text-[11px] mt-2" :class="shortCircuitCheck.pass ? 'text-surface-500 dark:text-surface-500' : 'text-semantic-error'">{{ shortCircuitCheck.remark }}</div>
      <div v-if="!shortCircuitCheck.pass" class="mt-3 flex justify-end gap-2">
        <el-button size="small" type="danger" plain class="cursor-pointer">⚠️ 推荐: 增加母排截面 或 更换材质</el-button>
      </div>
    </div>

    <!-- 温升估算 (P1 #5) -->
    <div v-if="temperatureRise" class="rounded-lg p-4 border" :class="temperatureRise.pass ? 'bg-surface-200 dark:bg-surface-800 border-surface-200 dark:border-surface-700/50' : 'bg-red-950/30 border-red-900/50'">
      <div class="flex items-center gap-2 mb-2">
        <el-icon :class="temperatureRise.status === 'ok' ? 'text-semantic-success' : temperatureRise.status === 'warning' ? 'text-semantic-warning' : 'text-semantic-error'">
          <ElIconSunny />
        </el-icon>
        <span class="text-xs font-bold text-surface-700 dark:text-surface-300">温升估算 (IEC 61439-1)</span>
      </div>
      <div class="grid grid-cols-4 gap-3 text-center">
        <div>
          <div class="text-[10px] text-surface-500 dark:text-surface-500">温升</div>
          <div class="font-mono tabular-nums text-sm" :class="temperatureRise.pass ? 'text-surface-800 dark:text-surface-200' : 'text-semantic-error'">{{ temperatureRise.tempRise }}K</div>
        </div>
        <div>
          <div class="text-[10px] text-surface-500 dark:text-surface-500">终温</div>
          <div class="font-mono tabular-nums text-sm" :class="temperatureRise.finalTemp > temperatureRise.maxTemp ? 'text-semantic-error' : 'text-surface-800 dark:text-surface-200'">{{ temperatureRise.finalTemp }}℃</div>
        </div>
        <div>
          <div class="text-[10px] text-surface-500 dark:text-surface-500">限值</div>
          <div class="font-mono tabular-nums text-sm text-surface-500 dark:text-surface-500">{{ temperatureRise.maxRise }}K / {{ temperatureRise.maxTemp }}℃</div>
        </div>
        <div>
          <div class="text-[10px] text-surface-500 dark:text-surface-500">利用率</div>
          <div class="font-mono tabular-nums text-sm" :class="temperatureRise.utilization > 80 ? 'text-semantic-warning' : 'text-semantic-success'">{{ temperatureRise.utilization }}%</div>
        </div>
      </div>
      <!-- 进度条 -->
      <div class="mt-2 h-1.5 bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden">
        <div class="h-full rounded-full transition-all duration-500"
          :class="temperatureRise.utilization > 100 ? 'bg-semantic-error' : temperatureRise.utilization > 80 ? 'bg-semantic-warning' : 'bg-semantic-success'"
          :style="{ width: Math.min(temperatureRise.utilization, 100) + '%' }"
        ></div>
      </div>
    </div>

    <!-- 集肤效应标注 -->
    <div v-if="skinEffect && skinEffect < 1.0" class="rounded-lg p-3 bg-blue-950/20 border border-blue-900/30">
      <div class="flex items-center gap-2">
        <el-icon class="text-blue-400"><ElIconMagicStick /></el-icon>
        <span class="text-xs font-bold text-blue-400">集肤效应修正</span>
        <span class="ml-auto font-mono tabular-nums text-sm text-blue-300">×{{ skinEffect.toFixed(2) }}</span>
      </div>
      <div class="text-[11px] text-surface-500 dark:text-surface-500 mt-1">
        宽厚比较大，交流集肤效应已降低有效载流量 {{ Math.round((1 - skinEffect) * 100) }}%
      </div>
    </div>

    <!-- 短路电动力 (P2 #7) -->
    <div v-if="shortCircuitForce" class="rounded-lg p-4 bg-surface-200 dark:bg-surface-800 border border-surface-200 dark:border-surface-700/50">
      <div class="flex items-center gap-2 mb-2">
        <el-icon class="text-purple-400"><ElIconLightning /></el-icon>
        <span class="text-xs font-bold text-surface-700 dark:text-surface-300">短路电动力 & 支撑间距</span>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        <div>
          <div class="text-[10px] text-surface-500 dark:text-surface-500">峰值电流</div>
          <div class="font-mono tabular-nums text-sm text-surface-800 dark:text-surface-200">{{ shortCircuitForce.peakCurrent }} kA</div>
        </div>
        <div>
          <div class="text-[10px] text-surface-500 dark:text-surface-500">电动力</div>
          <div class="font-mono tabular-nums text-sm text-semantic-warning">{{ shortCircuitForce.forcePerMeter }} N/m</div>
        </div>
        <div>
          <div class="text-[10px] text-surface-500 dark:text-surface-500">最大间距</div>
          <div class="font-mono tabular-nums text-sm text-surface-800 dark:text-surface-200">{{ shortCircuitForce.maxSpan }} mm</div>
        </div>
        <div>
          <div class="text-[10px] text-surface-500 dark:text-surface-500">推荐间距</div>
          <div class="font-mono tabular-nums text-sm text-semantic-success">{{ shortCircuitForce.recommendedSpan }} mm</div>
        </div>
      </div>
      <div class="text-[11px] text-surface-500 dark:text-surface-500 mt-2">{{ shortCircuitForce.remark }}</div>
    </div>

    <!-- PE 母排选型 (P2 #9) -->
    <div v-if="peBusbarSizing" class="rounded-lg p-4 bg-yellow-950/20 border border-yellow-900/30">
      <div class="flex items-center gap-2 mb-2">
        <el-icon class="text-yellow-400"><ElIconLock /></el-icon>
        <span class="text-xs font-bold text-yellow-400">接地母排 (PE)</span>
        <span class="text-[10px] text-surface-500 dark:text-surface-500 ml-auto">IEC 60364-5-54</span>
      </div>
      <div class="grid grid-cols-3 gap-3 text-center">
        <div>
          <div class="text-[10px] text-surface-500 dark:text-surface-500">规则</div>
          <div class="font-mono tabular-nums text-xs text-surface-700 dark:text-surface-300">{{ peBusbarSizing.rule }}</div>
        </div>
        <div>
          <div class="text-[10px] text-surface-500 dark:text-surface-500">最小截面</div>
          <div class="font-mono tabular-nums text-sm text-yellow-400">{{ peBusbarSizing.minPESection }} mm²</div>
        </div>
        <div v-if="peBusbarSizing.recommendation">
          <div class="text-[10px] text-surface-500 dark:text-surface-500">推荐规格</div>
          <div class="font-mono tabular-nums text-sm text-surface-800 dark:text-surface-200">{{ peBusbarSizing.recommendation.code }}</div>
        </div>
      </div>
      <div v-if="peBusbarSizing.recommendation" class="text-[11px] text-surface-500 dark:text-surface-500 mt-2">
        截面 {{ peBusbarSizing.recommendation.cross_section }}mm² · 载流 {{ peBusbarSizing.recommendation.ampacity }}A · {{ peBusbarSizing.recommendation.weight }} kg/m
      </div>
    </div>

    <!-- 并机系统电流 (P2 #6) -->
    <div v-if="parallelResult" class="rounded-lg p-4 bg-purple-950/20 border border-purple-900/30">
      <div class="flex items-center gap-2 mb-2">
        <el-icon class="text-purple-400"><ElIconCopyDocument /></el-icon>
        <span class="text-xs font-bold text-purple-400">并机系统 {{ parallelResult.activeUnits }}+{{ form.parallelRedundant }}</span>
        <span class="text-[10px] text-surface-500 dark:text-surface-500 ml-auto">总容量 {{ parallelResult.totalKVA }} kVA</span>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        <div>
          <div class="text-[10px] text-surface-500 dark:text-surface-500">主路母排</div>
          <div class="font-mono tabular-nums text-sm text-blue-400">{{ parallelResult.mains }} A</div>
        </div>
        <div>
          <div class="text-[10px] text-surface-500 dark:text-surface-500">旁路母排</div>
          <div class="font-mono tabular-nums text-sm text-semantic-warning">{{ parallelResult.bypass }} A</div>
        </div>
        <div>
          <div class="text-[10px] text-surface-500 dark:text-surface-500">输出母排</div>
          <div class="font-mono tabular-nums text-sm text-semantic-success">{{ parallelResult.output }} A</div>
        </div>
        <div>
          <div class="text-[10px] text-surface-500 dark:text-surface-500">中性线</div>
          <div class="font-mono tabular-nums text-sm text-surface-700 dark:text-surface-300">{{ parallelResult.neutral }} A</div>
        </div>
      </div>
      <div class="mt-3 pt-3 border-t border-purple-900/30">
        <div class="text-[10px] text-surface-500 dark:text-surface-500 mb-1">单台 UPS 分支电流</div>
        <div class="flex gap-4 text-[11px] font-mono tabular-nums">
          <span class="text-surface-600 dark:text-surface-400">输入 {{ parallelResult.branchMains }}A</span>
          <span class="text-surface-600 dark:text-surface-400">旁路 {{ parallelResult.branchBypass }}A</span>
          <span class="text-surface-600 dark:text-surface-400">输出 {{ parallelResult.branchOutput }}A</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useSmartBusbar } from '../composables/useSmartBusbar.js';

const {
  shortCircuitCheck,
  temperatureRise,
  peBusbarSizing,
  shortCircuitForce,
  parallelResult,
  activeRecommendation,
  form,
} = useSmartBusbar();

// 集肤效应系数（从推荐结果中提取）
const skinEffect = computed(() => {
  const rec = activeRecommendation.value;
  if (!rec || rec.error || !rec.standard) return null;
  return rec.standard.skinEffect || 1.0;
});

// 是否显示面板
const hasAnyData = computed(() => {
  return (shortCircuitCheck.value && shortCircuitCheck.value.isc > 0)
    || temperatureRise.value
    || (skinEffect.value && skinEffect.value < 1.0)
    || shortCircuitForce.value
    || peBusbarSizing.value
    || parallelResult.value;
});

// 综合状态
const overallStatus = computed(() => {
  if (shortCircuitCheck.value && !shortCircuitCheck.value.pass) return 'danger';
  if (temperatureRise.value && !temperatureRise.value.pass) return 'danger';
  if (temperatureRise.value && temperatureRise.value.status === 'warning') return 'warning';
  if (shortCircuitCheck.value && shortCircuitCheck.value.margin < 20 && shortCircuitCheck.value.isc > 0) return 'warning';
  return 'ok';
});
</script>
