/**
 * SmartBusbar v2.2 — 计算引擎
 *
 * 核心公式:
 *   I_out     = S × 1000 / (√3 × U)
 *   I_bypass  = I_out × bypassFactor (默认 1.25, IEC 62040-3)
 *   I_mains   = I_out × 1.3
 *   I_neutral = I_out × K_n
 *   I_real    = I_base × K_total × K_skin
 *   ΔV        = ρ × L × I / S
 */

import { getBusbarDB } from "../constants/busbar_data.js";
import { getCableDB } from "../constants/cable_data.js";
import {
  CORRECTION_FACTORS,
  SKIN_EFFECT_TABLE,
  TEMP_RISE_LIMITS,
  HARMONIC_LOAD_TYPES,
  PE_SIZING_RULES,
} from "../constants/index.js";

// ─── 电流计算 ───────────────────────────────────────

/**
 * 计算 UPS 各回路电流
 * @param {Object} params
 * @param {number} params.kva           UPS容量 (kVA)
 * @param {number} params.voltage       系统电压 (V)
 * @param {number} params.bypassFactor  旁路系数 (默认 1.25, IEC 62040-3: 125%/10min)
 * @param {number} params.mainsFactor   主路系数 (默认 1.3)
 * @param {number} params.neutralFactor N线系数 (默认 1.0)
 * @returns {{ output: number, bypass: number, mains: number, neutral: number }}
 */
export function calculateCurrents({
  kva,
  voltage,
  bypassFactor = 1.25,
  mainsFactor = 1.3,
  neutralFactor = 1.0,
}) {
  const k = Number(kva) || 0;
  const v = Number(voltage) || 400;
  const kb = Number(bypassFactor) || 1.25;
  const km = Number(mainsFactor) || 1.3;
  const kn = Number(neutralFactor) || 1.0;

  if (k <= 0 || v <= 0) {
    return { output: 0, bypass: 0, mains: 0, neutral: 0 };
  }

  const iOut = Math.round((k * 1000) / (Math.sqrt(3) * v));
  return {
    output: iOut,
    bypass: Math.round(iOut * kb),
    mains: Math.round(iOut * km),
    neutral: Math.round(iOut * kn),
  };
}

// ─── 修正系数计算 ───────────────────────────────────

/**
 * 降额修正引擎 - 计算综合修正系数
 * @param {Object} env
 * @param {number} env.temp        环境温度 (℃)
 * @param {number} env.altitude    海拔高度 (m)
 * @param {number} env.wind        风速 (m/s)
 * @param {string} env.standard    标准 ('IEC'|'UL')
 * @param {string} env.cooling     散热方式 ('natural'|'forced')
 * @param {number} [env.humidity]  相对湿度 (%)
 * @param {string} [env.mounting]  安装方式
 * @param {number} [env.layers]    母排层数
 * @param {string} [env.ipRating]  防护等级
 * @returns {Object}
 */
export function calcCorrectionFactors({
  temp,
  altitude,
  wind,
  standard,
  cooling,
  humidity = 60,
  mounting = 'vertical',
  layers = 1,
  ipRating = 'IP20',
}) {
  const kTemp = CORRECTION_FACTORS.temp[temp] ?? 1.0;

  // 海拔修正 - 线性插值
  const altLevels = Object.keys(CORRECTION_FACTORS.altitude).map(Number).sort((a, b) => a - b);
  let kAlt = 1.0;
  for (let i = 0; i < altLevels.length - 1; i++) {
    if (altitude >= altLevels[i] && altitude < altLevels[i + 1]) {
      const t = (altitude - altLevels[i]) / (altLevels[i + 1] - altLevels[i]);
      kAlt = CORRECTION_FACTORS.altitude[altLevels[i]] * (1 - t) +
             CORRECTION_FACTORS.altitude[altLevels[i + 1]] * t;
      break;
    }
  }
  if (altitude >= altLevels[altLevels.length - 1]) {
    kAlt = CORRECTION_FACTORS.altitude[altLevels[altLevels.length - 1]];
  }

  // 风速修正 - UL 标准禁用风冷增益
  let effectiveWind = cooling === "forced" ? wind : 0;
  const kWind = standard === "UL" ? 1.0 : (CORRECTION_FACTORS.wind[effectiveWind] ?? 1.0);

  // 湿度修正
  const kHumidity = CORRECTION_FACTORS.humidity[humidity] ?? 0.95;

  // 安装方式修正
  const kMounting = CORRECTION_FACTORS.mounting[mounting] ?? 1.0;

  // 邻近效应修正
  const kProximity = CORRECTION_FACTORS.proximity[Math.min(layers, 4)] ?? 0.85;

  // 防护等级修正
  const kIp = CORRECTION_FACTORS.ipRating[ipRating] ?? 1.0;

  const total = kTemp * kAlt * kWind * kHumidity * kMounting * kProximity * kIp;

  // 生成降额分解说明
  const factors = [];
  if (kTemp !== 1.0) factors.push('温度×' + kTemp.toFixed(2));
  if (kAlt !== 1.0) factors.push('海拔×' + kAlt.toFixed(2));
  if (kWind !== 1.0) factors.push('风冷×' + kWind.toFixed(2));
  if (kHumidity !== 1.0) factors.push('湿度×' + kHumidity.toFixed(2));
  if (kMounting !== 1.0) factors.push('安装×' + kMounting.toFixed(2));
  if (kProximity !== 1.0) factors.push('邻近×' + kProximity.toFixed(2));
  if (kIp !== 1.0) factors.push('防护×' + kIp.toFixed(2));
  const breakdown = factors.join(' × ') || '无降额';

  return {
    temp: kTemp,
    alt: parseFloat(kAlt.toFixed(3)),
    wind: kWind,
    humidity: kHumidity,
    mounting: kMounting,
    proximity: kProximity,
    ip: kIp,
    total,
    breakdown,
  };
}

// ─── 推荐算法 ───────────────────────────────────────

/**
 * 智能推荐算法
 * @param {number}  targetAmp       目标电流 (A)
 * @param {Object}  correctionK     修正系数对象
 * @param {Object}  [opts]          选项
 * @param {boolean} [opts.allowStacking=false]  是否允许叠加
 * @param {string}  [opts.material='copper']    材料
 * @returns {Object}
 */
export function recommendBusbar(targetAmp, correctionK, opts = {}) {
  const { allowStacking = false, material = "copper" } = opts;
  const kTotal = correctionK.total;
  const db = getBusbarDB(material);

  const candidates = [];

  for (const bar of db) {
    for (const layer of bar.layers) {
      if (!allowStacking && layer > 1) continue;

      const base = bar.ampacity.tinned?.[layer] || bar.ampacity.bare?.[layer];
      if (!base) continue;

      // 集肤效应修正 (P1 #10)
      const kSkin = calcSkinEffectFactor(bar.width, bar.thick);
      const realAmp = Math.floor(base * kTotal * kSkin);
      if (realAmp < targetAmp) continue;

      const loadRate = targetAmp / realAmp;

      // 计算机械属性
      const heatDissipation = calculateHeatDissipation(
        targetAmp,
        bar.resistivity,
        bar.cross_section * layer,
      );
      const minBendRadius = calculateMinBendRadius(bar.thick, material);
      const totalThickness = calculateTotalThickness(bar.thick, layer);

      candidates.push({
        id: bar.id,
        code: bar.code,
        layers: layer,
        width: bar.width,
        thick: bar.thick,
        cross_section: bar.cross_section * layer,
        weight: bar.weight * layer,
        resistivity: bar.resistivity,
        baseAmp: base,
        realAmp,
        loadRate,
        skinEffect: kSkin,
        shortCircuit: bar.short_circuit,
        displaySpec: layer === 1 ? bar.code : `${bar.code} ×${layer}`,
        // 机械属性
        heatDissipation,
        minBendRadius,
        totalThickness,
      });
    }
  }

  if (candidates.length === 0) {
    return {
      economy: null,
      standard: null,
      premium: null,
      allCandidates: [],
      error: "未找到符合条件的规格，请增加片数或调整参数",
    };
  }

  // 按负荷率降序（经济型在前）
  candidates.sort((a, b) => b.loadRate - a.loadRate);

  // 分档匹配
  const economy =
    candidates.find((c) => c.loadRate >= 0.9 && c.loadRate <= 1.0) ||
    candidates[0];
  const standard =
    candidates.find((c) => c.loadRate < 0.9 && c.loadRate >= 0.7) ||
    candidates.find((c) => c.loadRate < 0.9) ||
    economy;
  const premium =
    candidates.find((c) => c.loadRate < 0.7) ||
    candidates[candidates.length - 1];

  return {
    economy,
    standard,
    premium,
    allCandidates: candidates.slice(0, 25),
    error: null,
  };
}

// ─── 风扇失效模拟 ───────────────────────────────────

/**
 * 模拟风扇失效场景 (P0 #2: 使用 total/wind 而非手动拼装)
 * @param {Object} currentResult   当前推荐结果(standard策略)
 * @param {number} targetAmp       目标电流
 * @param {Object} correctionK     当前修正系数
 * @returns {{ degradedAmp, degradedLoadRate, overloaded, derating }}
 */
export function simulateFanFailure(currentResult, targetAmp, correctionK) {
  if (!currentResult || !currentResult.baseAmp) {
    return {
      degradedAmp: 0,
      degradedLoadRate: 0,
      overloaded: true,
      derating: 100,
    };
  }

  // 风扇失效：K_wind 回落到1.0，其余所有修正因子保持不变
  const kNoWind = correctionK.wind > 0 ? correctionK.total / correctionK.wind : correctionK.total;
  const degradedAmp = Math.floor(currentResult.baseAmp * kNoWind);
  const degradedLoadRate = targetAmp / degradedAmp;
  const overloaded = degradedLoadRate > 1.0;
  const derating = Math.round((1 - kNoWind / correctionK.total) * 100);

  return {
    degradedAmp,
    degradedLoadRate,
    overloaded,
    derating,
    kFactor: kNoWind,
  };
}

// ─── 电池回路计算 ───────────────────────────────────

/**
 * 计算 UPS 电池回路电流
 * @param {Object} params
 * @param {number} params.kva               UPS 容量 (kVA)
 * @param {number} params.powerFactor       功率因数 (默认 0.9)
 * @param {number} params.batteryVoltage    电池组直流电压 (V DC)
 * @param {number} params.inverterEff       逆变效率 (%, 默认 96)
 * @param {number} params.batteryCapacity   电池容量 (Ah, 0=不计充电电流)
 * @param {number} params.chargeRate        充电倍率 (C, 默认 0.1)
 * @param {number} params.safetyFactor      安全系数 (默认 1.25)
 * @returns {{ discharge, charge, design, powerKW }}
 */
export function calculateBatteryCurrent({
  kva,
  powerFactor = 0.9,
  batteryVoltage,
  inverterEff = 96,
  batteryCapacity = 0,
  chargeRate = 0.1,
  safetyFactor = 1.25,
}) {
  const k = Number(kva) || 0;
  const pf = Number(powerFactor) || 0.9;
  const ubat = Number(batteryVoltage) || 240;
  const eta = (Number(inverterEff) || 96) / 100;
  const qah = Number(batteryCapacity) || 0;
  const cr = Number(chargeRate) || 0.1;
  const sf = Number(safetyFactor) || 1.25;

  if (k <= 0 || ubat <= 0) {
    return { discharge: 0, charge: 0, design: 0, powerKW: 0 };
  }

  const powerKW = k * pf;
  const discharge = Math.ceil((powerKW * 1000) / (ubat * eta));
  const charge = qah > 0 ? Math.ceil(qah * cr) : 0;
  const design = Math.ceil(Math.max(discharge, charge) * sf);

  return {
    discharge,
    charge,
    design,
    powerKW: Number(powerKW.toFixed(1)),
  };
}

// ─── 机械属性计算 ───────────────────────────────────

/**
 * 计算母排发热量 (W/m)
 */
export function calculateHeatDissipation(current, resistivity, crossSection) {
  if (!current || !resistivity || !crossSection) return 0;
  const resistancePerMeter = resistivity / crossSection;
  return Number((current * current * resistancePerMeter).toFixed(2));
}

/**
 * 计算最小折弯半径 (mm)
 */
export function calculateMinBendRadius(thickness, material) {
  if (!thickness) return 0;
  const kFactor = material === "copper" ? 2.5 : 3.5;
  return Number((kFactor * thickness).toFixed(1));
}

/**
 * 计算叠层总厚度 (mm)
 */
export function calculateTotalThickness(thickness, layers, gap = 1) {
  if (!thickness || !layers) return 0;
  return Number((thickness * layers + gap * (layers - 1)).toFixed(1));
}

// ─── 压降计算 ───────────────────────────────────────

/**
 * 计算母排压降
 */
export function calculateVoltageDrop({
  current, length, crossSection, resistivity, voltage,
}) {
  if (!current || !length || !crossSection || !resistivity || !voltage) {
    return { dropV: 0, dropPercent: 0, status: "ok" };
  }

  const dropV = (resistivity * length * current) / crossSection;
  const dropPercent = (dropV / voltage) * 100;

  let status = "ok";
  if (dropPercent > 5) status = "danger";
  else if (dropPercent > 3) status = "warning";

  return {
    dropV: Number(dropV.toFixed(3)),
    dropPercent: Number(dropPercent.toFixed(2)),
    status,
  };
}

// ─── 电缆推荐算法 ───────────────────────────────────

/**
 * 电缆推荐算法
 */
export function recommendCable(targetAmp, correctionK, opts = {}) {
  const { cableType = "power", standard: selectedStandard = "IEC" } = opts;
  const kTotal = correctionK.total;
  const db = getCableDB(cableType, selectedStandard);

  const candidates = [];

  for (const cable of db) {
    const singleRealAmp = Math.floor(cable.ampacity * kTotal);
    
    // Calculate required parallel count
    let count = 1;
    let totalRealAmp = singleRealAmp;
    
    if (singleRealAmp < targetAmp) {
      // For parallel cables, apply a grouping derating factor (standard practice: 0.8)
      const groupingFactor = 0.8;
      count = Math.ceil(targetAmp / (singleRealAmp * groupingFactor));
      totalRealAmp = Math.floor(singleRealAmp * count * groupingFactor);
    }

    // Engineering limit: No more than 12 cables per phase (P2 #11)
    if (count > 12) continue;

    const loadRate = targetAmp / totalRealAmp;
    candidates.push({
      id: cable.id,
      code: cable.code,
      name: cable.name,
      count,
      cross_section: cable.cross_section,
      total_cross_section: cable.cross_section * count,
      conductor: cable.conductor,
      outer_diameter: cable.outer_diameter,
      baseAmp: cable.ampacity,
      singleRealAmp,
      realAmp: totalRealAmp,
      loadRate,
      resistivity: cable.resistivity,
      weight: cable.weight * count,
      type: cable.type,
      displaySpec: count === 1 ? cable.code : `${count} × ${cable.code}`,
    });
  }

  if (candidates.length === 0) {
    return {
      economy: null,
      standard: null,
      premium: null,
      allCandidates: [],
      error: "电流过大，单相电缆并联根数已超过 12 根上限，建议采用母排选型。",
    };
  }

  candidates.sort((a, b) => b.loadRate - a.loadRate);

  const economy =
    candidates.find((c) => c.loadRate >= 0.9 && c.loadRate <= 1.0) ||
    candidates[0];
  const standard =
    candidates.find((c) => c.loadRate < 0.9 && c.loadRate >= 0.7) ||
    candidates.find((c) => c.loadRate < 0.9) ||
    economy;
  const premium =
    candidates.find((c) => c.loadRate < 0.7) ||
    candidates[candidates.length - 1];

  return {
    economy,
    standard,
    premium,
    allCandidates: candidates.slice(0, 25),
    error: null,
  };
}

/**
 * 计算电缆压降
 */
export function calculateCableVoltageDrop({
  current, length, crossSection, resistivity, voltage,
}) {
  if (!current || !length || !crossSection || !resistivity || !voltage) {
    return { dropV: 0, dropPercent: 0, status: "ok" };
  }

  const resistivityPerMeter = resistivity / 1000;
  const resistance = resistivityPerMeter * length;

  const dropV = current * resistance;
  const dropPercent = (dropV / voltage) * 100;

  let status = "ok";
  if (dropPercent > 5) status = "danger";
  else if (dropPercent > 3) status = "warning";

  return {
    dropV: Number(dropV.toFixed(3)),
    dropPercent: Number(dropPercent.toFixed(2)),
    status,
  };
}

// ═══════════════════════════════════════════════════════
//  以下为 v2.2 新增功能函数
// ═══════════════════════════════════════════════════════

// ─── 集肤效应修正 (P1 #10) ──────────────────────────

/**
 * 计算集肤效应修正系数
 * 交流电流趋向导体表面，宽厚比越大集肤效应越明显
 * @param {number} width   母排宽度 (mm)
 * @param {number} thick   母排厚度 (mm)
 * @returns {number} 集肤效应修正系数 (0~1)
 */
export function calcSkinEffectFactor(width, thick) {
  if (!width || !thick) return 1.0;
  const ratio = width / thick;
  for (const entry of SKIN_EFFECT_TABLE) {
    if (ratio <= entry.maxRatio) return entry.factor;
  }
  return 0.72;
}

// ─── 短路耐受校验 (P1 #4) ───────────────────────────

/**
 * 校验母排短路耐受能力
 * @param {Object} params
 * @param {number} params.shortCircuitCurrent  预期短路电流 (kA)
 * @param {number} params.busbarIcw            母排短时耐受电流 (kA/1s)
 * @param {number} [params.duration=1]         短路持续时间 (s)
 * @returns {{ pass, margin, icw, isc, remark }}
 */
export function verifyShortCircuit({
  shortCircuitCurrent,
  busbarIcw,
  duration = 1,
}) {
  const isc = Number(shortCircuitCurrent) || 0;
  const icw = Number(busbarIcw) || 0;

  if (isc <= 0 || icw <= 0) {
    return { pass: true, margin: 100, icw, isc, remark: '未提供短路数据' };
  }

  // 短时耐受电流与持续时间的关系：Icw_t = Icw_1s * sqrt(1/t)
  const icwAdj = duration !== 1 ? icw * Math.sqrt(1 / duration) : icw;
  const margin = Number((((icwAdj - isc) / icwAdj) * 100).toFixed(1));
  const pass = isc <= icwAdj;

  let remark = '';
  if (!pass) {
    remark = `短路电流 ${isc}kA 超过母排耐受 ${icwAdj.toFixed(1)}kA，需升级规格！`;
  } else if (margin < 20) {
    remark = `裕度偏低 (${margin}%)，建议关注上游保护动作时间`;
  } else {
    remark = '短路耐受充足';
  }

  return { pass, margin, icw: icwAdj, isc, remark };
}

// ─── 温升估算 (P1 #5) ───────────────────────────────

/**
 * 估算母排稳态温升
 * 简化模型：基于单位长度发热量和散热面积
 * @param {Object} params
 * @param {number} params.current       工作电流 (A)
 * @param {number} params.width         母排宽度 (mm)
 * @param {number} params.thick         母排厚度 (mm)
 * @param {number} params.layers        叠层数
 * @param {number} params.resistivity   电阻率
 * @param {number} params.ambientTemp   环境温度
 * @param {string} params.mounting      安装方式
 * @param {string} params.surfaceType   表面类型
 * @returns {{ tempRise, finalTemp, maxRise, maxTemp, pass, status, utilization }}
 */
export function estimateTemperatureRise({
  current, width, thick, layers = 1, resistivity,
  ambientTemp = 35, mounting = 'vertical', surfaceType = 'tinned',
}) {
  if (!current || !width || !thick || !resistivity) {
    return { tempRise: 0, finalTemp: ambientTemp, maxRise: 65, maxTemp: 105, pass: true, status: 'ok', utilization: 0 };
  }

  const crossSection = width * thick * layers;
  const powerPerMeter = (current * current * resistivity) / crossSection;

  // 散热周长 (mm)
  const perimeterMm = layers === 1
    ? 2 * (width + thick)
    : 2 * width + 2 * (thick * layers + (layers - 1));
  const surfaceArea = perimeterMm / 1000; // m^2/m

  // 综合散热系数 h (W/m^2*K)
  let h = 10;
  if (mounting === 'vertical') h = 11;
  else if (mounting === 'horizontal') h = 9;
  else if (mounting === 'edge') h = 8.5;
  else if (mounting === 'enclosed') h = 7;

  const tempRise = Number((powerPerMeter / (h * surfaceArea)).toFixed(1));
  const finalTemp = Number((ambientTemp + tempRise).toFixed(1));

  const limits = TEMP_RISE_LIMITS[surfaceType] || TEMP_RISE_LIMITS.tinned;
  const pass = tempRise <= limits.maxRise && finalTemp <= limits.maxTemp;
  const utilization = Number((tempRise / limits.maxRise * 100).toFixed(1));

  let status = 'ok';
  if (!pass) status = 'danger';
  else if (utilization > 80) status = 'warning';

  return { tempRise, finalTemp, maxRise: limits.maxRise, maxTemp: limits.maxTemp, pass, status, utilization };
}

// ─── PE 母排选型 (P2 #9) ────────────────────────────

/**
 * 计算 PE (接地) 母排最小截面积
 * @param {number} phaseCrossSection  相线母排截面积 (mm^2)
 * @returns {{ minPESection: number, rule: string }}
 */
export function calculatePEBusbar(phaseCrossSection) {
  const s = Number(phaseCrossSection) || 0;
  if (s <= 0) return { minPESection: 0, rule: '无数据' };

  for (const rule of PE_SIZING_RULES) {
    if (s <= rule.maxPhaseSection) {
      let minPE;
      if (rule.peSection === 'equal') minPE = s;
      else if (rule.peSection === 'half') minPE = Math.ceil(s / 2);
      else minPE = rule.peSection;
      return { minPESection: minPE, rule: rule.label };
    }
  }
  return { minPESection: Math.ceil(s / 2), rule: 'S_PE >= S_phase / 2' };
}

/**
 * 从母排数据库中查找满足 PE 截面要求的最小规格
 * @param {number} minPESection  最小PE截面积
 * @param {string} material      材料
 * @returns {Object|null}
 */
export function recommendPEBusbar(minPESection, material = 'copper') {
  const db = getBusbarDB(material);
  const candidates = db
    .filter(bar => bar.cross_section >= minPESection)
    .sort((a, b) => a.cross_section - b.cross_section);
  if (candidates.length === 0) return null;
  const bar = candidates[0];
  return {
    code: bar.code,
    cross_section: bar.cross_section,
    width: bar.width,
    thick: bar.thick,
    weight: bar.weight,
    ampacity: bar.ampacity.tinned?.[1] || bar.ampacity.bare?.[1] || 0,
  };
}

// ─── 短路电动力 & 支撑间距 (P2 #7) ──────────────────

/**
 * 计算短路电动力和母排支撑件间距
 * @param {Object} params
 * @param {number} params.shortCircuitCurrent  短路电流 (kA)
 * @param {number} params.phaseSpacing         相间距 (mm, 中心距)
 * @param {number} params.width                母排宽度 (mm)
 * @param {number} params.thick                母排厚度 (mm)
 * @param {string} params.material             材料
 * @returns {{ forcePerMeter, maxSpan, recommendedSpan, peakCurrent, remark }}
 */
export function calculateShortCircuitForce({
  shortCircuitCurrent, phaseSpacing, width, thick, material = 'copper',
}) {
  const isc = (Number(shortCircuitCurrent) || 0) * 1000; // kA -> A
  const d = (Number(phaseSpacing) || 100) / 1000;         // mm -> m
  const w = Number(width) || 60;
  const t = Number(thick) || 10;

  if (isc <= 0) {
    return { forcePerMeter: 0, maxSpan: 0, recommendedSpan: 0, peakCurrent: 0, remark: '未提供短路数据' };
  }

  // 短路峰值电流 = 2.5 * Isc (IEC 峰值系数)
  const iPeak = 2.5 * isc;

  // 三相中间相最大电动力: F = sqrt(3) * 2e-7 * i^2 / d (N/m)
  const forcePerMeter = Number((Math.sqrt(3) * 2e-7 * iPeak * iPeak / d).toFixed(1));

  // 母排惯性矩 I = b*h^3/12
  const bm = w / 1000;
  const hm = t / 1000;
  const inertia = (bm * Math.pow(hm, 3)) / 12;

  // 许用应力 (Pa): 铜 80MPa, 铝 50MPa
  const sigma = material === 'copper' ? 80e6 : 50e6;

  // 最大支撑间距 L_max = sqrt(10 * sigma * W / F), W = I/(h/2)
  const secMod = inertia / (hm / 2);
  const maxSpan = forcePerMeter > 0
    ? Number((Math.sqrt(10 * sigma * secMod / forcePerMeter) * 1000).toFixed(0))
    : 0;

  const recommendedSpan = Math.max(Math.floor(maxSpan * 0.7 / 50) * 50, 100);

  let remark = '';
  if (maxSpan > 0 && maxSpan < 200) remark = '短路力极大，需加密支撑或增大母排截面';
  else if (maxSpan < 500) remark = '支撑间距偏小，建议核实安装空间';
  else remark = '支撑间距合理';

  return { forcePerMeter, maxSpan, recommendedSpan, peakCurrent: Number((iPeak / 1000).toFixed(1)), remark };
}

// ─── 谐波中性线系数 (P2 #8) ─────────────────────────

/**
 * 根据负载类型获取推荐的中性线系数
 * @param {string} loadType  负载类型 key
 * @returns {{ neutralFactor, thd, note, label } | null}
 */
export function getHarmonicNeutralFactor(loadType) {
  const entry = HARMONIC_LOAD_TYPES.find(h => h.key === loadType);
  if (!entry) return null;
  return { neutralFactor: entry.neutralFactor, thd: entry.thd, note: entry.note, label: entry.label };
}

// ─── 并机系统电流计算 (P2 #6) ────────────────────────

/**
 * 计算并机 UPS 系统各回路电流
 * @param {Object} params
 * @param {number} params.kva             单台 UPS 容量
 * @param {number} params.voltage         系统电压
 * @param {number} params.parallelCount   并机总台数 (N+X)
 * @param {number} params.parallelRedundant 冗余台数 (X)
 * @param {number} params.bypassFactor    旁路系数
 * @param {number} params.neutralFactor   中性线系数
 * @returns {Object}
 */
export function calculateParallelCurrents({
  kva, voltage, parallelCount = 1, parallelRedundant = 0,
  bypassFactor = 1.25, neutralFactor = 1.0,
}) {
  const k = Number(kva) || 0;
  const v = Number(voltage) || 400;
  const n = Number(parallelCount) || 1;
  const x = Number(parallelRedundant) || 0;
  const activeUnits = n - x;

  if (k <= 0 || v <= 0 || n <= 0) {
    return { totalKVA: 0, activeUnits: 0, singleOutput: 0, mains: 0, bypass: 0, output: 0, neutral: 0, branchMains: 0, branchBypass: 0, branchOutput: 0 };
  }

  const totalKVA = k * activeUnits;
  const singleOutput = Math.round((k * 1000) / (Math.sqrt(3) * v));

  // 主母排：承载全部 N 台输入
  const busbarMains = Math.round((k * n * 1000 * 1.3) / (Math.sqrt(3) * v));
  // 旁路母排：承载全部负载的旁路过载
  const busbarBypass = Math.round((totalKVA * 1000 * bypassFactor) / (Math.sqrt(3) * v));
  // 输出母排：承载总输出
  const busbarOutput = Math.round((totalKVA * 1000) / (Math.sqrt(3) * v));
  // 中性线
  const neutral = Math.round(busbarOutput * neutralFactor);

  return {
    totalKVA, activeUnits, singleOutput,
    mains: busbarMains, bypass: busbarBypass, output: busbarOutput, neutral,
    branchMains: Math.round(singleOutput * 1.3),
    branchBypass: Math.round(singleOutput * bypassFactor),
    branchOutput: singleOutput,
  };
}

// ─── 成本估算 ────────────────────────────────────────

/**
 * 估算母排系统总成本
 * @param {Object} params
 * @param {Object} params.recommendations     各回路推荐结果 { mains, bypass, output, neutral }
 * @param {Object} params.batteryRec           电池回路推荐结果 (可选)
 * @param {Object} params.peBusbar             PE 母排推荐 (可选)
 * @param {Object} params.costLengths          各回路线长数组，如 { mains: [1,1,1] }
 * @param {string} params.material             材料 ('copper'|'aluminum')
 * @param {number} params.materialPrice        材料单价 (¥/kg)
 * @returns {Object} 详细成本明细
 */
export function estimateBusbarCost({
  recommendations = {},
  batteryRec = null,
  peBusbar = null,
  costLengths = {},
  material = 'copper',
  materialPrice = 72,
  altMaterialPrice = 22,
}) {
  const price = Number(materialPrice) || (material === 'copper' ? 72 : 22);

  // 计算单回路成本
  function calcBarCost(rec, circuitKey, circuitLabel) {
    const lengths = costLengths[circuitKey] || [];
    if (!rec || rec.error || !rec.standard || lengths.length === 0) {
      return { circuit: circuitLabel, key: circuitKey, weight: 0, materialCost: 0, totalLength: 0, spec: '-', layers: 0, lengths };
    }
    const s = rec.standard;
    const weightPerMeter = s.weight || 0;       // kg/m (每片)
    const layers = s.layers || 1;
    
    const totalLength = lengths.reduce((sum, l) => sum + Number(l), 0);
    const totalWeight = weightPerMeter * layers * totalLength;
    const materialCost = totalWeight * price;

    return {
      circuit: circuitLabel,
      key: circuitKey,
      spec: s.displaySpec || s.code,
      layers,
      barCount: lengths.length,
      lengths,
      weightPerMeter: Number((weightPerMeter * layers).toFixed(3)),
      totalLength: Number(totalLength.toFixed(2)),
      totalWeight: Number(totalWeight.toFixed(2)),
      materialCost: Math.round(materialCost),
    };
  }

  const circuits = [];

  // 主路 (三相)
  if (recommendations.mains) {
    circuits.push(calcBarCost(recommendations.mains, 'mains', '主路输入'));
  }
  // 旁路 (三相)
  if (recommendations.bypass) {
    circuits.push(calcBarCost(recommendations.bypass, 'bypass', '旁路输入'));
  }
  // 输出 (三相)
  if (recommendations.output) {
    circuits.push(calcBarCost(recommendations.output, 'output', '输出回路'));
  }
  // 中性线 (单根)
  if (recommendations.neutral) {
    circuits.push(calcBarCost(recommendations.neutral, 'neutral', '中性线 (N)'));
  }
  // 电池回路 (正负极各一根)
  if (batteryRec && !batteryRec.error && batteryRec.standard) {
    circuits.push(calcBarCost(batteryRec, 'battery', '电池回路 (DC±)'));
  }
  // PE 母排 (单根)
  if (peBusbar && peBusbar.recommendation) {
    const lengths = costLengths['pe'] || [1.0];
    const peWeight = peBusbar.recommendation.weight || 0;
    const totalLength = lengths.reduce((sum, l) => sum + Number(l), 0);
    const peTotalWeight = peWeight * totalLength;
    circuits.push({
      circuit: '接地母排 (PE)',
      key: 'pe',
      spec: peBusbar.recommendation.code,
      layers: 1,
      barCount: lengths.length,
      lengths,
      weightPerMeter: Number(peWeight.toFixed(3)),
      totalLength: Number(totalLength.toFixed(2)),
      totalWeight: Number(peTotalWeight.toFixed(2)),
      materialCost: Math.round(peTotalWeight * price),
    });
  }

  // 汇总材料成本
  const totalWeight = circuits.reduce((s, c) => s + c.totalWeight, 0);
  const totalMaterialCost = circuits.reduce((s, c) => s + c.materialCost, 0);
  const grandTotal = totalMaterialCost;

  // 铝排对比计算 logic
  const altPriceNum = Number(altMaterialPrice) || 22;
  const altEquivalentWeight = totalWeight * 0.50;
  const altTotalMaterialCost = Math.round(altEquivalentWeight * altPriceNum);

  return {
    circuits,
    summary: {
      totalWeight: Number(totalWeight.toFixed(2)),
      totalMaterialCost,
      materialPrice: price,
      materialUnit: `¥/kg (${material === 'copper' ? '铜' : '铝'})`,
    },
    grandTotal,
    // 铝排对比价
    altMaterialComparison: material === 'copper' ? {
      altPrice: altPriceNum,
      altTotal: altTotalMaterialCost, 
      saving: Math.round(totalMaterialCost - altTotalMaterialCost),
      savingPercent: totalMaterialCost > 0 ? Number(((1 - altTotalMaterialCost / totalMaterialCost) * 100).toFixed(1)) : 0,
      note: '为保证等效安全载流量，参考铝排截面约提升至1.6倍计算，等效总重量约为铜排的 50%',
    } : null,
  };
}
