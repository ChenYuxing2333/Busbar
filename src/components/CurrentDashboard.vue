<template>
  <div class="glass-panel p-5 space-y-4">
    <!-- AC 四回路卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div
        v-for="c in circuits"
        :key="c.key"
        class="stat-card cursor-pointer transition-all duration-200"
        :class="
          activeCircuit === c.key
            ? 'ring-1 ring-primary-500/40 shadow-sm'
            : 'hover:ring-1 hover:ring-surface-400 dark:hover:ring-surface-600'
        "
        :style="{ '--glow-color': c.color }"
        @click="activeCircuit = c.key"
      >
        <div class="relative z-10">
          <div class="data-label mb-2" :style="{ color: c.color + '99' }">
            {{ c.label }}
          </div>
          <div class="flex items-baseline gap-1">
            <span class="data-value" :style="{ color: c.color }">
              {{ animatedCurrents[c.key] }}
            </span>
            <span class="text-sm text-surface-500 dark:text-surface-500 font-mono tabular-nums">A</span>
          </div>
          <div class="text-[10px] text-surface-500 dark:text-surface-400 mt-1 font-mono tabular-nums">
            <template v-if="c.key === 'mains'">×1.3 overload</template>
            <template v-else-if="c.key === 'bypass'"
              >×{{ form.bypassFactor }} overload</template
            >
            <template v-else-if="c.key === 'output'">rated</template>
            <template v-else
              >{{ (form.neutralFactor * 100).toFixed(0) }}% factor</template
            >
          </div>
        </div>

        <!-- 活动指示条 -->
        <div
          v-if="activeCircuit === c.key"
          class="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-lg"
          :style="{ backgroundColor: c.color }"
        ></div>
      </div>
    </div>

    <!-- 电池回路卡片 -->
    <transition name="el-zoom-in-top">
      <div
        v-if="form.batteryEnabled && bat"
        class="rounded-lg border border-semantic-warning/20 bg-semantic-warning/5 p-4"
      >
        <div class="flex items-center gap-2 mb-3">
          <div
            class="w-1.5 h-1.5 rounded-full bg-semantic-warning animate-pulse"
          ></div>
          <span
            class="text-[10px] font-bold uppercase tracking-widest text-semantic-warning"
          >
            电池回路 DC {{ form.batteryVoltage }}V
          </span>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div class="text-center">
            <div class="data-label text-semantic-warning/70">放电电流</div>
            <div class="flex items-baseline justify-center gap-1">
              <span class="data-value text-semantic-warning">{{ bat.discharge }}</span>
              <span class="text-sm text-surface-500 dark:text-surface-500 font-mono tabular-nums">A</span>
            </div>
            <div class="text-[10px] text-surface-500 dark:text-surface-400 mt-0.5 font-mono tabular-nums">
              P/(U·η)
            </div>
          </div>
          <div class="text-center border-x border-semantic-warning/20">
            <div class="data-label text-semantic-warning/70">充电电流</div>
            <div class="flex items-baseline justify-center gap-1">
              <span
                class="data-value"
                :class="bat.charge > 0 ? 'text-semantic-warning' : 'text-surface-500 dark:text-surface-400'"
              >
                {{ bat.charge > 0 ? bat.charge : "—" }}
              </span>
              <span
                v-if="bat.charge > 0"
                class="text-sm text-surface-500 dark:text-surface-500 font-mono tabular-nums"
                >A</span
              >
            </div>
            <div class="text-[10px] text-surface-500 dark:text-surface-400 mt-0.5 font-mono tabular-nums">
              {{
                bat.charge > 0
                  ? (form.chargeRate * 100).toFixed(0) + "%C"
                  : "未配置"
              }}
            </div>
          </div>
          <div class="text-center">
            <div class="data-label text-semantic-warning/70">设计电流</div>
            <div class="flex items-baseline justify-center gap-1">
              <span class="data-value text-surface-900 dark:text-white font-bold">{{
                bat.design
              }}</span>
              <span class="text-sm text-surface-500 dark:text-surface-500 font-mono tabular-nums">A</span>
            </div>
            <div class="text-[10px] text-surface-500 dark:text-surface-400 mt-0.5 font-mono tabular-nums">
              ×{{ form.batterySafetyFactor }}
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useTransition, TransitionPresets } from "@vueuse/core";
import { useSmartBusbar } from "../composables/useSmartBusbar.js";
import { CIRCUITS } from "../constants/index.js";

const { form, activeCircuit, currents, batteryCurrents } = useSmartBusbar();
const circuits = CIRCUITS;

const circuitCurrents = computed(() => currents.value);
const bat = computed(() => batteryCurrents.value);

const sourceMains = computed(() => circuitCurrents.value.mains || 0);
const sourceBypass = computed(() => circuitCurrents.value.bypass || 0);
const sourceOutput = computed(() => circuitCurrents.value.output || 0);
const sourceNeutral = computed(() => circuitCurrents.value.neutral || 0);

const animatedMains = useTransition(sourceMains, { duration: 500, transition: TransitionPresets.easeOutCubic });
const animatedBypass = useTransition(sourceBypass, { duration: 500, transition: TransitionPresets.easeOutCubic });
const animatedOutput = useTransition(sourceOutput, { duration: 500, transition: TransitionPresets.easeOutCubic });
const animatedNeutral = useTransition(sourceNeutral, { duration: 500, transition: TransitionPresets.easeOutCubic });

const animatedCurrents = computed(() => ({
  mains: Math.round(animatedMains.value),
  bypass: Math.round(animatedBypass.value),
  output: Math.round(animatedOutput.value),
  neutral: Math.round(animatedNeutral.value)
}));
</script>

