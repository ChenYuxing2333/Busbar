/**
 * SmartBusbar v2.0 — 全局状态 Composable
 * 所有组件共享同一状态源
 *
 * 支持 localStorage 缓存：
 * - 自动保存用户配置
 * - 页面刷新后自动恢复
 * - 版本控制，升级时自动清除旧数据
 */

import { reactive, computed, ref, watch } from "vue";
import {
  calculateCurrents,
  calcCorrectionFactors,
  recommendBusbar,
  simulateFanFailure,
  calculateVoltageDrop,
  calculateBatteryCurrent,
  verifyShortCircuit,
  estimateTemperatureRise,
  calculatePEBusbar,
  calculateShortCircuitForce,
  getHarmonicNeutralFactor,
  calculateParallelCurrents,
  estimateBusbarCost,
} from "../utils/calculator.js";
import { CIRCUITS, BATTERY_SAFETY_FACTOR, HARMONIC_LOAD_TYPES, MATERIAL_PRICES } from "../constants/index.js";

// ─── 缓存配置 ─────────────────────────────────────

const CACHE_KEY = "smartbusbar_config";
const CACHE_VERSION = "2.1";

// 默认值定义
const DEFAULT_FORM = {
  // 设备参数
  kva: 100,
  voltage: 400,
  standard: "IEC",
  material: "copper", // 'copper' | 'aluminum'
  // 环境参数
  temp: 35,
  altitude: 1000,
  // 散热条件
  cooling: "natural", // 'natural' | 'forced'
  wind: 2.0,
  fanFailure: false, // 风扇失效模拟开关
  // 旁路系数 (IEC 62040-3: 125%/10min 过载转旁路)
  bypassFactor: 1.25, // 1.0 / 1.1 / 1.25 / 1.5
  // N线系数
  neutralFactor: 1.0, // 1.0 / 1.5 / 2.0
  // 选型规则
  allowStacking: false,
  // 压降参数
  busbarLength: 1.0, // 母排长度 (m)
  // 电池回路参数 (IEC 62040 / GB/T 7260)
  batteryEnabled: false, // 是否启用电池回路
  batteryVoltage: 240, // 电池组直流电压 (V DC)
  inverterEff: 96, // 逆变效率 (%)
  powerFactor: 0.9, // 功率因数
  batteryCapacity: 0, // 电池容量 (Ah), 0=不计充电电流
  chargeRate: 0.1, // 充电倍率 (C)
  batterySafetyFactor: BATTERY_SAFETY_FACTOR, // 安全系数 1.25

  // ═══ v2.2 新增字段 ═══
  // 安装/结构参数
  mounting: 'vertical',
  ipRating: 'IP20',
  proximity: 'free',
  humidity: 50,
  // 短路参数
  shortCircuitCurrent: 50, // 预期短路电流 (kA)
  phaseSpacing: 100,       // 相间距 (mm)
  // 谐波/负载类型
  loadType: 'linear',      // 负载类型
  // 并机配置
  parallelEnabled: false,
  parallelCount: 1,        // 并机总台数 (N+X)
  parallelRedundant: 0,    // 冗余台数 (X)
  // 成本估算
  costEnabled: false,
  copperPrice: MATERIAL_PRICES.copper.price,   // ¥/kg
  aluminumPrice: MATERIAL_PRICES.aluminum.price, // ¥/kg
  costLengths: {
    mains: [1.0, 1.0, 1.0],
    bypass: [1.0, 1.0, 1.0],
    output: [1.0, 1.0, 1.0],
    neutral: [1.0],
    battery: [1.0, 1.0],
    pe: [1.0]
  }
};

// 创建空白自定义母排记录
function emptyCustomBusbar() {
  return {
    enabled: false,
    code: "", // 自定义型号名称
    width: 60, // mm
    thick: 10, // mm
    layers: 1, // 叠层数
    ampacity: 0, // 额定载流量 (A) — 用户必填
    material: "copper", // 'copper' | 'aluminum'
    resistivity: 0.0175, // Ω·mm²/m
    weight: 0, // kg/m (可选)
  };
}

const DEFAULT_CUSTOM_BUSBARS = {
  mains: emptyCustomBusbar(),
  bypass: emptyCustomBusbar(),
  output: emptyCustomBusbar(),
  neutral: emptyCustomBusbar(),
};

// ─── 缓存读写函数 ─────────────────────────────────

function loadCache() {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);

    if (parsed._version !== CACHE_VERSION) {
      console.warn(`[SmartBusbar] 缓存版本不匹配 (${parsed._version} !== ${CACHE_VERSION})，清除旧数据`);
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return parsed.data;
  } catch (e) {
    console.error("[SmartBusbar] 缓存读取失败:", e);
    return null;
  }
}

function saveCache(data) {
  try {
    const payload = {
      _version: CACHE_VERSION,
      _timestamp: Date.now(),
      data,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.error("[SmartBusbar] 缓存保存失败:", e);
  }
}

function clearCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
    console.log("[SmartBusbar] 缓存已清除");
  } catch (e) { }
}

// ─── 单例状态初始化 ─────────────────────────────────

const cachedData = loadCache();

const form = reactive(
  cachedData?.form
    ? { ...DEFAULT_FORM, ...cachedData.form }
    : { ...DEFAULT_FORM },
);

const customBusbars = reactive(
  cachedData?.customBusbars
    ? {
        mains: { ...emptyCustomBusbar(), ...cachedData.customBusbars.mains },
        bypass: { ...emptyCustomBusbar(), ...cachedData.customBusbars.bypass },
        output: { ...emptyCustomBusbar(), ...cachedData.customBusbars.output },
        neutral: {
          ...emptyCustomBusbar(),
          ...cachedData.customBusbars.neutral,
        },
      }
    : {
        mains: emptyCustomBusbar(),
        bypass: emptyCustomBusbar(),
        output: emptyCustomBusbar(),
        neutral: emptyCustomBusbar(),
      },
);

const activeCircuit = ref(cachedData?.activeCircuit || "mains");

const showHelp = ref(false);
const showExport = ref(false);

let saveTimer = null;

function debouncedSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveCache({
      form: { ...form },
      customBusbars: {
        mains: { ...customBusbars.mains },
        bypass: { ...customBusbars.bypass },
        output: { ...customBusbars.output },
        neutral: { ...customBusbars.neutral },
      },
      activeCircuit: activeCircuit.value,
    });
    saveTimer = null;
  }, 300);
}

watch(() => ({ ...form }), debouncedSave, { deep: true });

watch(
  () => ({
    mains: { ...customBusbars.mains },
    bypass: { ...customBusbars.bypass },
    output: { ...customBusbars.output },
    neutral: { ...customBusbars.neutral },
  }),
  debouncedSave,
  { deep: true },
);

watch(activeCircuit, debouncedSave);

// ─── 计算属性 ─────────────────────────────────────

export function useSmartBusbar() {
  // 修正系数
  const correctionK = computed(() => {
    return calcCorrectionFactors({
      temp: form.temp,
      altitude: form.altitude,
      wind: form.wind,
      standard: form.standard,
      cooling: form.cooling,
      mounting: form.mounting,
      ipRating: form.ipRating,
      proximity: form.proximity,
      humidity: form.humidity,
    });
  });

  // 风冷增益百分比
  const windBonus = computed(() => {
    return Math.round((correctionK.value.wind - 1) * 100);
  });

  // 谐波中性线计算
  const harmonicInfo = computed(() => {
    return getHarmonicNeutralFactor(form.loadType);
  });

  // 各回路电流
  const currents = computed(() => {
    const neutralF = harmonicInfo.value ? harmonicInfo.value.neutralFactor : form.neutralFactor;
    return calculateCurrents({
      kva: form.kva,
      voltage: form.voltage,
      bypassFactor: form.bypassFactor,
      mainsFactor: 1.3,
      neutralFactor: neutralF,
    });
  });

  // 并机系统电流
  const parallelResult = computed(() => {
    if (!form.parallelEnabled) return null;
    return calculateParallelCurrents({
      singleOutput: currents.value.output,
      totalCount: form.parallelCount,
      redundantCount: form.parallelRedundant,
      bypassFactor: form.bypassFactor,
    });
  });

  // 四回路推荐结果
  const recommendations = computed(() => {
    const result = {};
    const circuitCurrents = currents.value;
    const k = correctionK.value;

    const circuitMap = {
      mains: circuitCurrents.mains,
      bypass: circuitCurrents.bypass,
      output: circuitCurrents.output,
      neutral: circuitCurrents.neutral,
    };

    for (const circuit of CIRCUITS) {
      const target = circuitMap[circuit.key];
      if (!target || target <= 0) {
        result[circuit.key] = { error: "无电流数据" };
        continue;
      }
      result[circuit.key] = recommendBusbar(target, k, {
        allowStacking: form.allowStacking,
        material: form.material,
      });
    }

    return result;
  });

  const activeRecommendation = computed(() => {
    return recommendations.value[activeCircuit.value] || { error: "无数据" };
  });

  const activeTargetCurrent = computed(() => {
    return currents.value[activeCircuit.value] || 0;
  });

  const fanFailureResult = computed(() => {
    if (!form.fanFailure || form.cooling !== "forced") return null;

    const rec = activeRecommendation.value;
    if (!rec || rec.error || !rec.standard) return null;

    return simulateFanFailure(
      rec.standard,
      activeTargetCurrent.value,
      correctionK.value,
    );
  });

  const materialLabel = computed(() => {
    return form.material === "aluminum" ? "铝排 (LMY)" : "铜排 (TMY)";
  });

  // ─── 电池回路计算 ─────────────────────────────────

  const batteryCurrents = computed(() => {
    if (!form.batteryEnabled) return null;
    return calculateBatteryCurrent({
      kva: form.kva,
      powerFactor: form.powerFactor,
      batteryVoltage: form.batteryVoltage,
      inverterEff: form.inverterEff,
      batteryCapacity: form.batteryCapacity,
      chargeRate: form.chargeRate,
      safetyFactor: form.batterySafetyFactor,
    });
  });

  const batteryRecommendation = computed(() => {
    if (!form.batteryEnabled || !batteryCurrents.value) return null;
    const { design } = batteryCurrents.value;
    if (design <= 0) return null;

    // 电池室不使用强迫风冷
    const kDC = {
      ...correctionK.value,
      wind: 1.0,
      total: correctionK.value.temp * correctionK.value.alt,
    };

    return recommendBusbar(design, kDC, {
      allowStacking: form.allowStacking,
      material: form.material,
    });
  });

  // ─── 成本估算 ─────────────────────────────
  const costEstimation = computed(() => {
    if (!form.costEnabled) return null;
    return estimateBusbarCost({
      recommendations: recommendations.value,
      batteryRec: batteryRecommendation.value,
      peBusbar: peBusbarSizing.value,
      costLengths: form.costLengths,
      material: form.material,
      materialPrice: form.material === 'copper' ? form.copperPrice : form.aluminumPrice,
      altMaterialPrice: form.aluminumPrice,
    });
  });

  // ─── 安全校验 (v2.2) ─────────────────────────────

  // PE 母排计算
  const peBusbarSizing = computed(() => {
    const mainsRec = recommendations.value.mains;
    if (!mainsRec || mainsRec.error || !mainsRec.standard) return null;
    
    // 取相线保护管横截面积 (mm2)
    const sPhase = mainsRec.standard.width * mainsRec.standard.thick * mainsRec.standard.layers;
    return calculatePEBusbar(sPhase, form.material, correctionK.value);
  });

  // 短路耐受校验
  const shortCircuitCheck = computed(() => {
    if (!form.shortCircuitCurrent) return null;
    
    const mainsRec = recommendations.value.mains;
    if (!mainsRec || mainsRec.error || !mainsRec.standard) return null;

    const sPhase = mainsRec.standard.width * mainsRec.standard.thick * mainsRec.standard.layers;
    return verifyShortCircuit({
      crossSection: sPhase,
      shortCircuitCurrent: form.shortCircuitCurrent,
      material: form.material,
      duration: 1.0, 
    });
  });

  // 电动力校验
  const shortCircuitForce = computed(() => {
    if (!form.shortCircuitCurrent || !form.phaseSpacing) return null;
    
    return calculateShortCircuitForce({
      shortCircuitCurrent: form.shortCircuitCurrent,
      phaseSpacing: form.phaseSpacing,
    });
  });

  // 温升验算
  const temperatureRise = computed(() => {
    const active = activeRecommendation.value;
    if (!active || active.error || !active.standard) return null;

    const s = active.standard;
    return estimateTemperatureRise({
      current: activeTargetCurrent.value,
      width: s.width,
      thick: s.thick,
      layers: s.layers,
      resistivity: s.resistivity,
      ambientTemp: form.temp,
      mounting: form.mounting,
      surfaceType: 'tinned', // 默认镀锡
    });
  });

  // ─── 自定义母排验证 ─────────────────────────────

  const activeCustomBusbar = computed(() => {
    return customBusbars[activeCircuit.value];
  });

  const activeCustomValidation = computed(() => {
    const cb = customBusbars[activeCircuit.value];
    if (!cb || !cb.enabled || !cb.ampacity || cb.ampacity <= 0) return null;

    const target = activeTargetCurrent.value;
    const k = correctionK.value;

    const crossSection = cb.width * cb.thick * cb.layers;
    const realAmpacity = Math.round(cb.ampacity * k.total);
    const loadRate = target / realAmpacity;
    const loadPercent = Number((loadRate * 100).toFixed(1));

    let status, strategy;
    if (loadRate > 1.0) {
      status = "danger";
      strategy = "过载";
    } else if (loadRate > 0.9) {
      status = "warning";
      strategy = "经济型";
    } else if (loadRate > 0.7) {
      status = "ok";
      strategy = "标准型";
    } else {
      status = "safe";
      strategy = "保守型";
    }

    const resistivity = cb.material === "aluminum" ? 0.0283 : 0.0175;
    const voltageDrop = calculateVoltageDrop({
      current: target,
      length: form.busbarLength,
      crossSection,
      resistivity,
      voltage: form.voltage,
    });

    return {
      crossSection,
      realAmpacity,
      target,
      loadRate,
      loadPercent,
      status,
      strategy,
      voltageDrop,
      displaySpec: cb.code || `${cb.width}×${cb.thick}×${cb.layers}`,
    };
  });

  const allCustomValidations = computed(() => {
    const result = {};
    const circuitCurrents = currents.value;
    const k = correctionK.value;

    const circuitMap = {
      mains: circuitCurrents.mains,
      bypass: circuitCurrents.bypass,
      output: circuitCurrents.output,
      neutral: circuitCurrents.neutral,
    };

    for (const circuit of CIRCUITS) {
      const cb = customBusbars[circuit.key];
      if (!cb || !cb.enabled || !cb.ampacity || cb.ampacity <= 0) {
        result[circuit.key] = null;
        continue;
      }

      const target = circuitMap[circuit.key];
      const crossSection = cb.width * cb.thick * cb.layers;
      const realAmpacity = Math.round(cb.ampacity * k.total);
      const loadRate = target / realAmpacity;
      const loadPercent = Number((loadRate * 100).toFixed(1));

      let status;
      if (loadRate > 1.0) status = "danger";
      else if (loadRate > 0.9) status = "warning";
      else if (loadRate > 0.7) status = "ok";
      else status = "safe";

      result[circuit.key] = {
        crossSection,
        realAmpacity,
        target,
        loadPercent,
        status,
        displaySpec: cb.code || `${cb.width}×${cb.thick}×${cb.layers}`,
      };
    }
    return result;
  });

  // ─── 重置功能 ─────────────────────────────────

  function resetToDefault() {
    clearCache();
    Object.assign(form, DEFAULT_FORM);
    Object.assign(customBusbars.mains, emptyCustomBusbar());
    Object.assign(customBusbars.bypass, emptyCustomBusbar());
    Object.assign(customBusbars.output, emptyCustomBusbar());
    Object.assign(customBusbars.neutral, emptyCustomBusbar());
    activeCircuit.value = "mains";

    console.log("[SmartBusbar] 已重置为默认值");
  }

  return {
    form,
    activeCircuit,
    showHelp,
    showExport,
    customBusbars,
    resetToDefault,
    correctionK,
    windBonus,
    currents,
    recommendations,
    activeRecommendation,
    activeTargetCurrent,
    fanFailureResult,
    materialLabel,
    batteryCurrents,
    batteryRecommendation,
    activeCustomBusbar,
    activeCustomValidation,
    allCustomValidations,
    shortCircuitCheck,
    temperatureRise,
    peBusbarSizing,
    shortCircuitForce,
    harmonicInfo,
    parallelResult,
    costEstimation,
  };
}
