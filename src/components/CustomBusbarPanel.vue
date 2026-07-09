<template>
  <div class="glass-panel p-5">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <el-icon class="text-violet-400"><ElIconEdit /></el-icon>
        <h3 class="text-sm font-bold text-surface-700 dark:text-surface-300">自定义母排验证</h3>
      </div>
      <el-switch
        v-model="cb.enabled"
        active-color="#8b5cf6"
        inactive-color="#334155"
        size="small"
        active-text="启用"
      />
    </div>

    <transition name="el-zoom-in-top">
      <div v-if="cb.enabled" class="space-y-4">
        <!-- 四回路状态缩略 -->
        <div class="grid grid-cols-4 gap-2 mb-2">
          <div
            v-for="c in circuits"
            :key="c.key"
            class="rounded-md border px-2 py-1.5 text-center text-[10px] cursor-pointer transition-all"
            :class="getCircuitBadgeClass(c.key)"
            @click="activeCircuit = c.key"
          >
            <div class="font-medium">{{ c.label }}</div>
            <div v-if="allCustomValidations[c.key]" class="font-mono tabular-nums mt-0.5"
              :class="{
                'text-semantic-error': allCustomValidations[c.key].status === 'danger',
                'text-semantic-warning': allCustomValidations[c.key].status === 'warning',
                'text-green-400': allCustomValidations[c.key].status === 'ok',
                'text-blue-400': allCustomValidations[c.key].status === 'safe',
              }"
            >{{ allCustomValidations[c.key].loadPercent }}%</div>
            <div v-else class="text-surface-500 dark:text-surface-400 mt-0.5">—</div>
          </div>
        </div>

        <!-- 当前回路参数输入 -->
        <div class="rounded-lg bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800/60 p-4 space-y-3">
          <div class="flex items-center justify-between">
            <div class="text-xs font-bold text-surface-600 dark:text-surface-400">
              <span :style="{ color: currentCircuit?.color }">{{ currentCircuit?.label }}</span>
              回路参数
            </div>
            <el-tag size="small" effect="plain" class="!bg-surface-200 dark:bg-surface-800 !border-surface-200 dark:border-surface-700/50 !text-surface-600 dark:text-surface-400">
              {{ activeCircuit }}
            </el-tag>
          </div>

          <el-form :model="cb" label-position="top" size="small">
            <!-- 自定义型号 -->
            <el-form-item label="型号名称">
              <el-input
                v-model="cb.code"
                placeholder="如: 异形-80×12"
                clearable
                class="!w-full"
              />
            </el-form-item>

            <!-- 尺寸行 -->
            <div class="grid grid-cols-3 gap-3">
              <el-form-item label="宽度 (mm)">
                <el-input-number v-model="cb.width" :min="10" :max="500" :step="5" class="!w-full" />
              </el-form-item>
              <el-form-item label="厚度 (mm)">
                <el-input-number v-model="cb.thick" :min="2" :max="20" :step="1" class="!w-full" />
              </el-form-item>
              <el-form-item label="叠层数">
                <el-input-number v-model="cb.layers" :min="1" :max="4" :step="1" class="!w-full" />
              </el-form-item>
            </div>

            <!-- 载流量 + 材料 -->
            <div class="grid grid-cols-2 gap-3">
              <el-form-item label="额定载流量 (A)" class="!mb-1">
                <el-input-number v-model="cb.ampacity" :min="0" :max="10000" :step="50" class="!w-full" />
                <div class="text-[10px] text-surface-500 dark:text-surface-400 mt-0.5">基础载流量（未修正），如厂商标注值</div>
              </el-form-item>
              <el-form-item label="材料">
                <el-radio-group v-model="cb.material" @change="onMaterialChange">
                  <el-radio label="copper">铜</el-radio>
                  <el-radio label="aluminum">铝</el-radio>
                </el-radio-group>
              </el-form-item>
            </div>
          </el-form>
        </div>

        <!-- 验证结果 -->
        <transition name="el-zoom-in-top">
          <div v-if="validation" class="space-y-3">
            <!-- 核心指标卡片 -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div class="stat-card !p-3">
                <div class="data-label mb-1">截面积</div>
                <div class="data-value text-sm text-primary-600 dark:text-primary-400">{{ validation.crossSection }}<span class="text-[10px] ml-0.5">mm²</span></div>
              </div>
              <div class="stat-card !p-3">
                <div class="data-label mb-1">修正后载流</div>
                <div class="data-value text-sm text-primary-600 dark:text-primary-400">{{ validation.realAmpacity }}<span class="text-[10px] ml-0.5">A</span></div>
              </div>
              <div class="stat-card !p-3">
                <div class="data-label mb-1">目标电流</div>
                <div class="data-value text-sm text-surface-700 dark:text-surface-300">{{ validation.target }}<span class="text-[10px] ml-0.5">A</span></div>
              </div>
              <div class="stat-card !p-3">
                <div class="data-label mb-1">负荷率</div>
                <div class="data-value text-sm" :class="statusColor">{{ validation.loadPercent }}<span class="text-[10px] ml-0.5">%</span></div>
              </div>
            </div>

            <!-- 状态栏 -->
            <div class="flex items-center justify-between rounded-lg p-3"
              :class="{
                'bg-red-950/40 border border-red-900/40':   validation.status === 'danger',
                'bg-amber-950/40 border border-amber-900/40': validation.status === 'warning',
                'bg-green-950/40 border border-green-900/40': validation.status === 'ok',
                'bg-blue-950/40 border border-blue-900/40':   validation.status === 'safe',
              }"
            >
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full" :class="{
                  'bg-semantic-error animate-pulse': validation.status === 'danger',
                  'bg-amber-500': validation.status === 'warning',
                  'bg-green-500': validation.status === 'ok',
                  'bg-blue-500': validation.status === 'safe',
                }"></div>
                <span class="text-sm font-medium" :class="statusColor">{{ validation.strategy }}</span>
              </div>
              <div class="flex items-center gap-3 text-xs">
                <span class="text-surface-600 dark:text-surface-400">
                  {{ validation.displaySpec }}
                  · K={{ correctionK.total.toFixed(3) }}
                </span>
              </div>
            </div>

            <!-- 过载警告 -->
            <div v-if="validation.status === 'danger'" class="text-xs text-semantic-error flex items-center gap-1.5 px-1">
              <el-icon><ElIconWarningFilled /></el-icon>
              载流量不足！修正后载流 {{ validation.realAmpacity }}A 低于目标电流 {{ validation.target }}A，
              需增大规格或减少叠层、改善散热条件。
            </div>

            <!-- 压降信息 -->
            <div v-if="validation.voltageDrop" class="flex items-center gap-4 text-xs text-surface-600 dark:text-surface-400 px-1">
              <span>
                压降: <span class="font-mono tabular-nums" :class="{
                  'text-green-400': validation.voltageDrop.status === 'ok',
                  'text-semantic-warning': validation.voltageDrop.status === 'warning',
                  'text-semantic-error': validation.voltageDrop.status === 'danger',
                }">{{ validation.voltageDrop.dropV }}V ({{ validation.voltageDrop.dropPercent }}%)</span>
              </span>
              <span class="text-surface-500 dark:text-surface-400">|</span>
              <span>{{ form.busbarLength }}m · {{ cb.material === 'aluminum' ? 'ρ=0.0283' : 'ρ=0.0175' }} Ω·mm²/m</span>
            </div>

            <!-- 与推荐对比 -->
            <div v-if="comparison" class="rounded-lg bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800/60 p-3">
              <div class="text-[10px] font-bold text-surface-500 dark:text-surface-500 uppercase tracking-wider mb-2">与系统推荐对比</div>
              <div class="grid grid-cols-3 gap-2 text-xs text-center">
                <div>
                  <div class="text-surface-500 dark:text-surface-400 mb-1">规格</div>
                  <div class="text-surface-700 dark:text-surface-300 font-mono tabular-nums">{{ validation.displaySpec }}</div>
                  <div class="text-primary-600 dark:text-primary-500 font-mono tabular-nums mt-0.5">{{ comparison.spec }}</div>
                </div>
                <div>
                  <div class="text-surface-500 dark:text-surface-400 mb-1">载流量</div>
                  <div class="font-mono tabular-nums" :class="statusColor">{{ validation.realAmpacity }}A</div>
                  <div class="text-primary-600 dark:text-primary-500 font-mono tabular-nums mt-0.5">{{ comparison.ampacity }}A</div>
                </div>
                <div>
                  <div class="text-surface-500 dark:text-surface-400 mb-1">负荷率</div>
                  <div class="font-mono tabular-nums" :class="statusColor">{{ validation.loadPercent }}%</div>
                  <div class="text-primary-600 dark:text-primary-500 font-mono tabular-nums mt-0.5">{{ comparison.loadPercent }}%</div>
                </div>
              </div>
              <div class="text-[10px] text-surface-500 dark:text-surface-400 mt-2 text-center">
                <span class="inline-block w-2 h-2 rounded-full bg-violet-500 mr-1 relative" style="top: 1px"></span>自定义
                <span class="ml-3 inline-block w-2 h-2 rounded-full bg-primary-500 mr-1 relative" style="top: 1px"></span>系统推荐 (标准型)
              </div>
            </div>
          </div>
        </transition>

        <!-- 未输入载流量提示 -->
        <div v-if="cb.enabled && (!cb.ampacity || cb.ampacity <= 0)" class="text-center py-3 text-xs text-surface-500 dark:text-surface-500">
          请输入母排额定载流量 (A) 以开始验证
        </div>
      </div>
    </transition>

    <!-- 未启用提示 -->
    <div v-if="!cb.enabled" class="text-center py-2 text-xs text-surface-500 dark:text-surface-400">
      启用后可输入异形/非标母排参数，系统将自动计算负荷率与压降进行验证。
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useSmartBusbar } from '../composables/useSmartBusbar.js';
import { CIRCUITS } from '../constants/index.js';

const {
  form,
  activeCircuit,
  customBusbars,
  correctionK,
  activeCustomBusbar: cb,
  activeCustomValidation: validation,
  activeRecommendation,
  allCustomValidations,
} = useSmartBusbar();

const circuits = CIRCUITS;

const currentCircuit = computed(() => {
  return circuits.find(c => c.key === activeCircuit.value);
});

const statusColor = computed(() => {
  if (!validation.value) return '';
  const map = {
    danger:  'text-semantic-error',
    warning: 'text-semantic-warning',
    ok:      'text-green-400',
    safe:    'text-blue-400',
  };
  return map[validation.value.status] || '';
});

// 与系统推荐对比
const comparison = computed(() => {
  const rec = activeRecommendation.value;
  if (!rec || rec.error || !rec.standard) return null;
  const std = rec.standard;
  return {
    spec: std.displaySpec || std.code || `${std.width}×${std.thick}`,
    ampacity: std.realAmp || 0,
    loadPercent: std.loadRate ? Number((std.loadRate * 100).toFixed(1)) : 0,
  };
});

function getCircuitBadgeClass(key) {
  const isActive = activeCircuit.value === key;
  const cv = allCustomValidations.value[key];
  const base = isActive
    ? 'border-violet-500/50 bg-violet-950/30'
    : 'border-surface-200 dark:border-surface-700/50 bg-panel-900 hover:border-surface-300 dark:border-surface-600';

  if (!cv) return base;
  return base;
}

function onMaterialChange(val) {
  cb.value.resistivity = val === 'aluminum' ? 0.0283 : 0.0175;
}
</script>
