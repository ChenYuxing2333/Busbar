<template>
  <div class="glass-panel p-5">
    <div class="flex items-center gap-2 mb-4">
      <el-icon class="text-purple-400"><ElIconConnection /></el-icon>
      <h3 class="text-sm font-bold text-surface-700 dark:text-surface-300">连接工艺</h3>
      <!-- 进度指示 -->
      <div v-if="spec" class="ml-auto flex items-center gap-1.5">
        <template v-if="allChecked">
          <span class="text-[11px] text-semantic-success font-bold">✅ 已确认</span>
        </template>
        <template v-else>
          <span class="text-[11px] text-surface-500 dark:text-surface-500 font-mono tabular-nums">{{ checkedCount }}/{{ totalNotes }}</span>
          <div class="w-12 h-1 rounded-full bg-surface-200 dark:bg-surface-800 overflow-hidden">
            <div
              class="h-full rounded-full bg-purple-500 transition-all duration-300"
              :style="{ width: (checkedCount / totalNotes * 100) + '%' }"
            ></div>
      <!-- BOM 导出 -->
      <div class="mt-4 pt-3 border-t border-surface-200 dark:border-surface-800/60">
        <el-button type="warning" size="default" class="!w-full !bg-amber-600 !border-amber-600 hover:!bg-amber-500" @click="exportBOM">
          <el-icon class="mr-1"><ElIconDocumentCopy /></el-icon>
          导出紧固件 BOM 清单
        </el-button>
        <div class="text-[10px] text-surface-500 dark:text-surface-400 mt-2 text-center">包含螺栓/垫圈规格、数量、扭矩值</div>
      </div>
          </div>
        </template>
      </div>
    </div>

    <!-- 连接类型选择 -->
    <div class="flex gap-2 mb-4">
      <button
        v-for="opt in connectionOptions"
        :key="opt.key"
        class="flex-1 text-xs py-1.5 px-2 rounded-lg border transition-all relative"
        :class="selectedConnection === opt.key
          ? 'border-purple-500/40 bg-purple-950/30 text-purple-400'
          : 'border-surface-200 dark:border-surface-700/50 text-surface-500 dark:text-surface-500 hover:text-surface-700 dark:text-surface-300'"
        @click="selectedConnection = opt.key"
      >
        {{ opt.label }}
        <!-- 推荐标记 -->
        <span
          v-if="opt.key === recommendedConnection"
          class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400"
          title="根据材料推荐"
        ></span>
      </button>
    </div>

    <!-- 铜-铝 警告 -->
    <transition name="el-zoom-in-top">
      <div
        v-if="selectedConnection === 'copper-aluminum'"
        class="mb-4 rounded-lg bg-red-950/30 border border-red-800/30 p-3"
      >
        <div class="flex items-start gap-2">
          <el-icon class="text-semantic-error mt-0.5 shrink-0"><ElIconWarningFilled /></el-icon>
          <div>
            <div class="text-xs font-bold text-semantic-error mb-1">铜-铝混接注意事项</div>
            <div class="text-[11px] text-semantic-error/70">严禁使用铜质弹簧垫圈（电偶腐蚀风险）</div>
            <div class="flex flex-wrap gap-1.5 mt-2">
              <span
                v-for="tag in fourElements"
                :key="tag"
                class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-semantic-warning border border-amber-500/20"
              >{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 工艺详情 -->
    <div v-if="spec" class="space-y-3 text-xs">
      <!-- 镀层要求 -->
      <div class="rounded-lg bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800/60 p-3">
        <div class="data-label mb-1 text-purple-400/70">镀层要求</div>
        <div class="text-surface-700 dark:text-surface-300">{{ spec.coating }}</div>
      </div>

      <!-- 紧固件配置 -->
      <div class="rounded-lg bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800/60 p-3">
        <div class="data-label mb-1.5 text-purple-400/70">紧固件 &amp; 扭力</div>
        <div class="space-y-1.5">
          <div
            v-for="hw in spec.hardware"
            :key="hw.bolt"
            class="flex items-center justify-between text-surface-600 dark:text-surface-400 rounded px-1.5 py-0.5 transition-all duration-200"
            :class="isMatchedHardware(hw) ? 'bg-purple-950/40 ring-1 ring-purple-500/20' : ''"
          >
            <span class="font-mono tabular-nums text-surface-700 dark:text-surface-300">
              {{ hw.bolt }}
              <span v-if="isMatchedHardware(hw)" class="text-purple-400 text-[10px] ml-1">← 匹配</span>
            </span>
            <span class="text-semantic-warning font-mono tabular-nums">{{ hw.torque }}</span>
            <span class="text-surface-500 dark:text-surface-400">{{ hw.forBusbar }}</span>
          </div>
        </div>
      </div>

      <!-- 垫圈 -->
      <div class="rounded-lg bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800/60 p-3">
        <div class="data-label mb-1 text-purple-400/70">垫圈配置</div>
        <div class="text-surface-700 dark:text-surface-300">{{ spec.washer }}</div>
      </div>

      <!-- 施工检查清单 -->
      <div class="rounded-lg bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800/60 p-3">
        <div class="data-label mb-1.5 text-purple-400/70 flex items-center justify-between">
          <span>施工检查清单</span>
          <button
            v-if="checkedCount > 0"
            class="text-[10px] text-surface-500 dark:text-surface-400 hover:text-surface-600 dark:text-surface-400 transition-colors"
            @click="resetChecks"
          >重置</button>
        </div>
        <ul class="space-y-1.5">
          <li
            v-for="(note, idx) in spec.notes"
            :key="idx"
            class="flex items-start gap-2 cursor-pointer group rounded px-1 py-0.5 transition-all"
            :class="checkedNotes[idx] ? 'bg-emerald-950/20' : 'hover:bg-surface-200 dark:bg-surface-800'"
            @click="toggleCheck(idx)"
          >
            <div
              class="w-4 h-4 mt-0.5 shrink-0 rounded border flex items-center justify-center transition-all duration-200"
              :class="checkedNotes[idx]
                ? 'bg-emerald-500 border-emerald-500 text-surface-900 dark:text-surface-900 dark:text-surface-900 dark:text-white'
                : 'border-surface-300 dark:border-surface-600 group-hover:border-purple-500'"
            >
              <span v-if="checkedNotes[idx]" class="text-[10px]">✓</span>
            </div>
            <span
              class="transition-all duration-200"
              :class="checkedNotes[idx] ? 'text-surface-500 dark:text-surface-500 line-through' : 'text-surface-600 dark:text-surface-400'"
            >{{ note }}</span>
          </li>
        </ul>
      </div>

      <!-- 维护周期 -->
      <div class="flex items-center gap-2 rounded-lg bg-amber-950/20 border border-amber-900/30 p-3">
        <el-icon class="text-semantic-warning"><ElIconAlarmClock /></el-icon>
        <span class="text-semantic-warning/80">{{ spec.maintenance }}</span>
      </div>
    </div>
      <!-- BOM 导出 -->
      <div class="mt-4 pt-3 border-t border-surface-200 dark:border-surface-800/60">
        <el-button type="warning" size="default" class="!w-full !bg-amber-600 !border-amber-600 hover:!bg-amber-500" @click="exportBOM">
          <el-icon class="mr-1"><ElIconDocumentCopy /></el-icon>
          导出紧固件 BOM 清单
        </el-button>
        <div class="text-[10px] text-surface-500 dark:text-surface-400 mt-2 text-center">包含螺栓/垫圈规格、数量、扭矩值</div>
      </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, reactive } from 'vue';
import { useSmartBusbar } from '../composables/useSmartBusbar.js';
import { CONNECTION_SPEC } from '../constants/index.js';

const { form, activeRecommendation } = useSmartBusbar();

const connectionOptions = [
  { key: 'copper-copper',     label: '铜-铜' },
  { key: 'copper-aluminum',   label: '铜-铝' },
  { key: 'aluminum-aluminum', label: '铝-铝' },
];

const fourElements = ['双面镀锡', '碟簧补偿', '力矩降低30%', '24h复紧'];

const selectedConnection = ref('copper-copper');

// 推荐的连接类型
const recommendedConnection = computed(() => {
  return form.material === 'aluminum' ? 'aluminum-aluminum' : 'copper-copper';
});

// 材料变化时自动切换连接类型
watch(() => form.material, (mat) => {
  selectedConnection.value = mat === 'aluminum' ? 'aluminum-aluminum' : 'copper-copper';
  resetChecks();
}, { immediate: false });

// 当前工艺规范
const spec = computed(() => {
  return CONNECTION_SPEC[selectedConnection.value] || null;
});

// 施工检查状态
const checkedNotes = reactive({});

const totalNotes = computed(() => {
  return spec.value?.notes?.length || 0;
});

const checkedCount = computed(() => {
  let count = 0;
  for (let i = 0; i < totalNotes.value; i++) {
    if (checkedNotes[i]) count++;
  }
  return count;
});

const allChecked = computed(() => {
  return totalNotes.value > 0 && checkedCount.value === totalNotes.value;
});

function toggleCheck(idx) {
  checkedNotes[idx] = !checkedNotes[idx];
}

function resetChecks() {
  for (const key in checkedNotes) {
    delete checkedNotes[key];
  }
}

// 切换连接类型时重置勾选
watch(selectedConnection, () => {
  resetChecks();
});

// 紧固件自动匹配
function isMatchedHardware(hw) {
  const rec = activeRecommendation.value;
  if (!rec || rec.error || !rec.standard) return false;
  const spec = rec.standard.displaySpec || '';
  const forBusbar = hw.forBusbar || '';
  // 简单匹配：检查推荐规格中的宽度×厚度是否在紧固件适用范围
  if (!forBusbar) return false;
  const width = rec.standard.width;
  const thick = rec.standard.thick;
  if (!width || !thick) return false;
  const busbarSpec = `${width}×${thick}`;
  return forBusbar.includes(busbarSpec) || forBusbar.includes(`${width}x${thick}`);
}

// 生成紧固件 BOM
function generateFastenerBOM() {
  if (!spec.value) return null;
  const rec = activeRecommendation.value;
  if (!rec || rec.error || !rec.standard) return null;
  const s = rec.standard, w = s.width, t = s.thick, layers = s.layers || 1;
  const hw = spec.value.hardware.find(h => {
    if (!h.forBusbar) return false;
    const parts = h.forBusbar.split('~');
    if (parts.length !== 2) return false;
    const parse = str => { const m=str.match(/(\d+)[×x](\d+)/); return m?{w:+m[1],t:+m[2]}:null; };
    const [min,max] = parts.map(parse);
    return min && max && w>=min.w && w<=max.w && t>=min.t && t<=max.t;
  });
  if (!hw) return null;
  const boltCnt = 6 * layers;
  const ds = {M8:'DIN 2093-A10',M10:'DIN 2093-A12.5',M12:'DIN 2093-A16',M16:'DIN 2093-B20'}[hw.bolt]||'DIN 2093';
  const ws = {M8:'DIN 9021 M8',M10:'DIN 9021 M10',M12:'DIN 9021 M12',M16:'DIN 9021 M16'}[hw.bolt]||'DIN 9021';
  return {
    bolt: {size:hw.bolt, grade:form.material==='aluminum'?'8.8 级':'10.9 级', torque:hw.torque, qty:boltCnt, note:form.material==='aluminum'?'铝排扭矩降 30%':'标准扭矩'},
    washers: {flat:{spec:ws,type:'加大平垫',qty:boltCnt,std:'DIN 9021'}, disc:{spec:ds,type:'碟簧⭐防冷流',qty:boltCnt,std:'DIN 2093'}},
    plating: spec.value.coating, total: boltCnt*3
  };
}

// 导出 BOM
function exportBOM() {
  const bom = generateFastenerBOM();
  if (!bom) { ElMessage.warning('无法生成 BOM'); return; }
  const ts = new Date().toISOString().slice(0,16).replace('T','_');
  const txt = `====================================
SmartBusbar - 紧固件 BOM 清单
====================================
回路：${activeCircuit.value}  时间：${ts}
连接：${spec.value.title}  母排：${activeRecommendation.value.standard.displaySpec}

【螺栓】${bom.bolt.size} ${bom.bolt.grade}
扭矩：${bom.bolt.torque}  数量：${bom.bolt.qty}件
备注：${bom.bolt.note}

【垫圈】
平垫：${bom.washers.flat.spec} ${bom.washers.flat.qty}件
碟簧：${bom.washers.disc.spec} ${bom.washers.disc.qty}件

【镀层】${bom.plating}
【合计】${bom.total}件

【要点】
1.铝排扭矩降 30%  2.必用碟簧  3.24h 复紧
4.涂导电脂  5.1 月后复检
====================================`;
  navigator.clipboard.writeText(txt).then(()=>ElMessage.success('BOM 已复制')).catch(()=>ElMessage.error('复制失败'));
}
</script>
