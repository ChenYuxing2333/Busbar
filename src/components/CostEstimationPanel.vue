<template>
  <div class="glass-panel p-5 space-y-4">
    <div class="flex items-center justify-between mb-1">
      <div class="flex items-center gap-2">
        <el-icon class="text-semantic-success"><ElIconMoney /></el-icon>
        <h3 class="text-sm font-bold text-surface-700 dark:text-surface-300">成本估算</h3>
      </div>
      <div class="flex items-center gap-2">
        <el-switch
          v-model="form.costEnabled"
          active-color="#10b981"
          inactive-color="#334155"
          size="small"
        />
      </div>
    </div>

    <transition name="el-zoom-in-top">
      <div v-if="form.costEnabled" class="space-y-4">
        <!-- 单价设置 -->
        <div class="grid grid-cols-2 gap-3 mb-2">
          <el-form-item size="small" class="!mb-0">
            <template #label>
              <span class="text-[11px] text-surface-600 dark:text-surface-400">铜价 (¥/kg)</span>
            </template>
            <el-input-number
              v-model="form.copperPrice"
              :min="10"
              :max="200"
              :step="1"
              class="!w-full"
              size="small"
            />
          </el-form-item>
          <el-form-item size="small" class="!mb-0">
            <template #label>
              <span class="text-[11px] text-surface-600 dark:text-surface-400">铝价 (¥/kg)</span>
            </template>
            <el-input-number
              v-model="form.aluminumPrice"
              :min="5"
              :max="100"
              :step="1"
              class="!w-full"
              size="small"
            />
          </el-form-item>
        </div>
        <div class="text-[10px] text-surface-500 dark:text-surface-400">
          <el-icon class="mr-0.5"><ElIconInfoFilled /></el-icon>
          单价为趋势参考，以实际报价为准。
        </div>

        <!-- 等待数据 -->
        <div v-if="!costEstimation" class="text-center py-6 text-surface-500 dark:text-surface-500 text-sm">
          <el-icon class="mb-2 text-xl"><ElIconLoading /></el-icon>
          <div>等待母排选型结果…</div>
        </div>

        <!-- 成本明细 -->
        <template v-else>
          <!-- 总价卡片 -->
          <div class="rounded-xl bg-gradient-to-br from-emerald-950/40 to-emerald-900/20 border border-emerald-800/30 p-4">
            <div class="flex items-end justify-between">
              <div>
                <div class="text-[10px] text-semantic-success/80 uppercase tracking-wider">估算总价</div>
                <div class="text-3xl font-bold text-semantic-success font-mono tabular-nums mt-1">
                  ¥{{ formatNumber(costEstimation.grandTotal) }}
                </div>
              </div>
              <div class="text-right">
                <div class="text-[10px] text-surface-500 dark:text-surface-500">材料费用</div>
                <div class="font-mono tabular-nums text-sm text-surface-700 dark:text-surface-300">¥{{ formatNumber(costEstimation.summary.totalMaterialCost) }}</div>
              </div>
            </div>
          </div>

          <!-- 回路明细表 -->
          <div class="rounded-lg bg-surface-200 dark:bg-surface-800 border border-surface-200 dark:border-surface-700/50/30 overflow-hidden">
            <div class="px-4 py-2 text-[10px] font-bold text-surface-500 dark:text-surface-500 uppercase tracking-wider border-b border-surface-200 dark:border-surface-700/50/30">
              回路明细 · {{ form.material === 'copper' ? '铜排' : '铝排' }} {{ costEstimation.summary.materialPrice }}¥/kg
            </div>
            <table class="w-full text-xs">
              <thead>
                <tr class="text-[10px] text-surface-500 dark:text-surface-500">
                  <th class="text-left py-1.5 px-3">回路</th>
                  <th class="text-center py-1.5 px-1">规格</th>
                  <th class="text-right py-1.5 px-2 w-[110px]">单相长度(m)</th>
                  <th class="text-right py-1.5 px-1">材料费</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="c in costEstimation.circuits"
                  :key="c.key"
                  class="border-t border-surface-200 dark:border-surface-800/60/50 hover:bg-slate-700/20 transition-colors"
                >
                  <td class="py-2 px-3 text-surface-700 dark:text-surface-300 align-top pt-3">{{ c.circuit }}</td>
                  <td class="py-2 px-1 text-center font-mono tabular-nums text-surface-600 dark:text-surface-400 align-top pt-3">{{ c.spec }}</td>
                  <td class="py-2 px-2 text-right">
                    <div class="flex flex-col items-end gap-1.5">
                      <el-input-number
                        v-for="(len, idx) in c.lengths"
                        :key="idx"
                        v-model="form.costLengths[c.key][idx]"
                        :min="0.1"
                        :step="0.5"
                        size="small"
                        class="!w-[90px]"
                        controls-position="right"
                      />
                    </div>
                  </td>
                  <td class="py-2 px-3 text-right font-mono tabular-nums align-top pt-3">
                    <div class="text-semantic-success">¥{{ formatNumber(c.materialCost) }}</div>
                    <div class="text-[10px] text-surface-500 dark:text-surface-500 mt-0.5">{{ c.totalWeight }}kg / {{ c.totalLength }}m</div>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="border-t border-surface-300 dark:border-surface-600/50 font-bold">
                  <td class="py-2 px-3 text-surface-800 dark:text-surface-200" colspan="2">合计</td>
                  <td class="py-2 px-2 text-right font-mono tabular-nums text-surface-500 dark:text-surface-500 text-[10px]">{{ costEstimation.summary.totalWeight }}kg</td>
                  <td class="py-2 px-3 text-right font-mono tabular-nums text-semantic-success">¥{{ formatNumber(costEstimation.summary.totalMaterialCost) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- 铝排对比 -->
          <div
            v-if="costEstimation.altMaterialComparison"
            class="rounded-lg bg-blue-950/20 border border-blue-900/20 p-3"
          >
            <div class="flex items-center gap-2 mb-2">
              <el-icon class="text-blue-400"><ElIconTrendCharts /></el-icon>
              <span class="text-[10px] font-bold text-blue-400/80 uppercase tracking-wider">铜 vs 铝 成本对比</span>
            </div>
            <div class="grid grid-cols-3 gap-3 text-center">
              <div>
                <div class="text-[10px] text-surface-500 dark:text-surface-500">当前 (铜)</div>
                <div class="font-mono tabular-nums text-sm text-surface-800 dark:text-surface-200">¥{{ formatNumber(costEstimation.grandTotal) }}</div>
              </div>
              <div>
                <div class="text-[10px] text-surface-500 dark:text-surface-500">等效铝排</div>
                <div class="font-mono tabular-nums text-sm text-blue-400">¥{{ formatNumber(costEstimation.altMaterialComparison.altTotal) }}</div>
              </div>
              <div>
                <div class="text-[10px] text-surface-500 dark:text-surface-500">潜在节省</div>
                <div class="font-mono tabular-nums text-sm text-semantic-success">
                  ¥{{ formatNumber(costEstimation.altMaterialComparison.saving) }}
                  <span class="text-[10px] text-semantic-success/70">({{ costEstimation.altMaterialComparison.savingPercent }}%)</span>
                </div>
              </div>
            </div>
            <div class="text-[10px] text-surface-500 dark:text-surface-500 mt-2">
              <el-icon class="mr-0.5"><ElIconWarningFilled /></el-icon>
              {{ costEstimation.altMaterialComparison.note }}
            </div>
          </div>
        </template>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { useSmartBusbar } from '../composables/useSmartBusbar.js';

const { form, costEstimation } = useSmartBusbar();

function formatNumber(n) {
  return (n || 0).toLocaleString('zh-CN');
}
</script>
