/**
 * SmartBusbar v2.0 — 电缆/线材规格数据库
 * 数据来源：GB/T 5023 / IEC 60228 标准
 *
 * 字段说明:
 *   code         — 型号编码
 *   name         — 电缆名称
 *   cross_section— 标称截面积 (mm²)
 *   conductor    — 导体结构 (根数/直径)
 *   outer_diameter— 外径 (mm)
 *   ampacity     — 载流量 (A) @40℃ 空气中敷设
 *   resistivity  — 电阻率 (Ω·km) @20℃
 *   weight       — 线密度 (kg/km)
 *   type         — 类型 ('power'|'control'|'flexible')
 */

// ========== 电力电缆 (铜芯) ==========
export const POWER_CABLE_DB = [
  {
    id: "cable_1_5",
    code: "BV-1.5",
    name: "铜芯聚氯乙烯绝缘电线",
    cross_section: 1.5,
    conductor: "1/1.38",
    outer_diameter: 3.4,
    ampacity: 24,
    resistivity: 12.1,
    weight: 21.3,
    type: "power",
  },
  {
    id: "cable_2_5",
    code: "BV-2.5",
    name: "铜芯聚氯乙烯绝缘电线",
    cross_section: 2.5,
    conductor: "1/1.78",
    outer_diameter: 4.0,
    ampacity: 32,
    resistivity: 7.41,
    weight: 33.0,
    type: "power",
  },
  {
    id: "cable_4",
    code: "BV-4",
    name: "铜芯聚氯乙烯绝缘电线",
    cross_section: 4,
    conductor: "1/2.25",
    outer_diameter: 4.6,
    ampacity: 42,
    resistivity: 4.61,
    weight: 49.0,
    type: "power",
  },
  {
    id: "cable_6",
    code: "BV-6",
    name: "铜芯聚氯乙烯绝缘电线",
    cross_section: 6,
    conductor: "1/2.76",
    outer_diameter: 5.3,
    ampacity: 55,
    resistivity: 3.08,
    weight: 68.0,
    type: "power",
  },
  {
    id: "cable_10",
    code: "BV-10",
    name: "铜芯聚氯乙烯绝缘电线",
    cross_section: 10,
    conductor: "7/1.35",
    outer_diameter: 7.0,
    ampacity: 75,
    resistivity: 1.83,
    weight: 115.0,
    type: "power",
  },
  {
    id: "cable_16",
    code: "BV-16",
    name: "铜芯聚氯乙烯绝缘电线",
    cross_section: 16,
    conductor: "7/1.70",
    outer_diameter: 8.0,
    ampacity: 105,
    resistivity: 1.15,
    weight: 170.0,
    type: "power",
  },
  {
    id: "cable_25",
    code: "BV-25",
    name: "铜芯聚氯乙烯绝缘电线",
    cross_section: 25,
    conductor: "7/2.14",
    outer_diameter: 10.0,
    ampacity: 138,
    resistivity: 0.727,
    weight: 260.0,
    type: "power",
  },
  {
    id: "cable_35",
    code: "BV-35",
    name: "铜芯聚氯乙烯绝缘电线",
    cross_section: 35,
    conductor: "7/2.52",
    outer_diameter: 11.5,
    ampacity: 170,
    resistivity: 0.524,
    weight: 350.0,
    type: "power",
  },
  {
    id: "cable_50",
    code: "BV-50",
    name: "铜芯聚氯乙烯绝缘电线",
    cross_section: 50,
    conductor: "19/1.78",
    outer_diameter: 13.0,
    ampacity: 215,
    resistivity: 0.387,
    weight: 480.0,
    type: "power",
  },
  {
    id: "cable_70",
    code: "BV-70",
    name: "铜芯聚氯乙烯绝缘电线",
    cross_section: 70,
    conductor: "19/2.14",
    outer_diameter: 15.0,
    ampacity: 265,
    resistivity: 0.268,
    weight: 660.0,
    type: "power",
  },
  {
    id: "cable_95",
    code: "BV-95",
    name: "铜芯聚氯乙烯绝缘电线",
    cross_section: 95,
    conductor: "19/2.52",
    outer_diameter: 17.5,
    ampacity: 325,
    resistivity: 0.193,
    weight: 880.0,
    type: "power",
  },
  {
    id: "cable_120",
    code: "BV-120",
    name: "铜芯聚氯乙烯绝缘电线",
    cross_section: 120,
    conductor: "37/2.03",
    outer_diameter: 19.0,
    ampacity: 375,
    resistivity: 0.153,
    weight: 1100.0,
    type: "power",
  },
  {
    id: "cable_150",
    code: "BV-150",
    name: "铜芯聚氯乙烯绝缘电线",
    cross_section: 150,
    conductor: "37/2.25",
    outer_diameter: 21.0,
    ampacity: 430,
    resistivity: 0.124,
    weight: 1350.0,
    type: "power",
  },
  {
    id: "cable_185",
    code: "BV-185",
    name: "铜芯聚氯乙烯绝缘电线",
    cross_section: 185,
    conductor: "37/2.52",
    outer_diameter: 23.5,
    ampacity: 490,
    resistivity: 0.0991,
    weight: 1650.0,
    type: "power",
  },
  {
    id: "cable_240",
    code: "BV-240",
    name: "铜芯聚氯乙烯绝缘电线",
    cross_section: 240,
    conductor: "61/2.25",
    outer_diameter: 26.5,
    ampacity: 580,
    resistivity: 0.0754,
    weight: 2100.0,
    type: "power",
  },
];

// ========== UL / NEC 电力电缆 (铜芯, 75°C) ==========
// 规格单位: AWG/kcmil
export const UL_POWER_CABLE_DB = [
  { id: "ul_14", code: "14 AWG", name: "THHN/THWN", cross_section: 2.08, ampacity: 15, resistivity: 8.5, weight: 19, type: "power" },
  { id: "ul_12", code: "12 AWG", name: "THHN/THWN", cross_section: 3.31, ampacity: 20, resistivity: 5.3, weight: 30, type: "power" },
  { id: "ul_10", code: "10 AWG", name: "THHN/THWN", cross_section: 5.26, ampacity: 30, resistivity: 3.3, weight: 48, type: "power" },
  { id: "ul_8", code: "8 AWG", name: "THHN/THWN", cross_section: 8.37, ampacity: 50, resistivity: 2.1, weight: 78, type: "power" },
  { id: "ul_6", code: "6 AWG", name: "THHN/THWN", cross_section: 13.3, ampacity: 65, resistivity: 1.3, weight: 130, type: "power" },
  { id: "ul_4", code: "4 AWG", name: "THHN/THWN", cross_section: 21.2, ampacity: 85, resistivity: 0.82, weight: 200, type: "power" },
  { id: "ul_3", code: "3 AWG", name: "THHN/THWN", cross_section: 26.7, ampacity: 100, resistivity: 0.65, weight: 250, type: "power" },
  { id: "ul_2", code: "2 AWG", name: "THHN/THWN", cross_section: 33.6, ampacity: 115, resistivity: 0.52, weight: 320, type: "power" },
  { id: "ul_1", code: "1 AWG", name: "THHN/THWN", cross_section: 42.4, ampacity: 130, resistivity: 0.41, weight: 400, type: "power" },
  { id: "ul_1_0", code: "1/0 AWG", name: "THHN/THWN", cross_section: 53.5, ampacity: 150, resistivity: 0.33, weight: 500, type: "power" },
  { id: "ul_2_0", code: "2/0 AWG", name: "THHN/THWN", cross_section: 67.4, ampacity: 175, resistivity: 0.26, weight: 630, type: "power" },
  { id: "ul_3_0", code: "3/0 AWG", name: "THHN/THWN", cross_section: 85.0, ampacity: 200, resistivity: 0.21, weight: 790, type: "power" },
  { id: "ul_4_0", code: "4/0 AWG", name: "THHN/THWN", cross_section: 107, ampacity: 230, resistivity: 0.16, weight: 1000, type: "power" },
  { id: "ul_250", code: "250 kcmil", name: "THHN/THWN", cross_section: 127, ampacity: 255, resistivity: 0.14, weight: 1200, type: "power" },
  { id: "ul_300", code: "300 kcmil", name: "THHN/THWN", cross_section: 152, ampacity: 285, resistivity: 0.11, weight: 1400, type: "power" },
  { id: "ul_350", code: "350 kcmil", name: "THHN/THWN", cross_section: 177, ampacity: 310, resistivity: 0.098, weight: 1600, type: "power" },
  { id: "ul_400", code: "400 kcmil", name: "THHN/THWN", cross_section: 203, ampacity: 335, resistivity: 0.086, weight: 1850, type: "power" },
  { id: "ul_500", code: "500 kcmil", name: "THHN/THWN", cross_section: 253, ampacity: 380, resistivity: 0.069, weight: 2300, type: "power" },
  { id: "ul_600", code: "600 kcmil", name: "THHN/THWN", cross_section: 304, ampacity: 420, resistivity: 0.057, weight: 2750, type: "power" },
  { id: "ul_750", code: "750 kcmil", name: "THHN/THWN", cross_section: 380, ampacity: 475, resistivity: 0.046, weight: 3450, type: "power" },
  { id: "ul_1000", code: "1000 kcmil", name: "THHN/THWN", cross_section: 507, ampacity: 545, resistivity: 0.035, weight: 4600, type: "power" },
];

// ========== 柔性电缆 (多股软线) ==========
export const FLEXIBLE_CABLE_DB = [
  {
    id: "flex_0_75",
    code: "BVR-0.75",
    name: "铜芯聚氯乙烯绝缘软电线",
    cross_section: 0.75,
    conductor: "24/0.20",
    outer_diameter: 2.8,
    ampacity: 16,
    resistivity: 24.5,
    weight: 12.0,
    type: "flexible",
  },
  {
    id: "flex_1",
    code: "BVR-1",
    name: "铜芯聚氯乙烯绝缘软电线",
    cross_section: 1,
    conductor: "32/0.20",
    outer_diameter: 3.0,
    ampacity: 19,
    resistivity: 18.1,
    weight: 15.0,
    type: "flexible",
  },
  {
    id: "flex_1_5",
    code: "BVR-1.5",
    name: "铜芯聚氯乙烯绝缘软电线",
    cross_section: 1.5,
    conductor: "30/0.25",
    outer_diameter: 3.3,
    ampacity: 24,
    resistivity: 12.1,
    weight: 21.0,
    type: "flexible",
  },
  {
    id: "flex_2_5",
    code: "BVR-2.5",
    name: "铜芯聚氯乙烯绝缘软电线",
    cross_section: 2.5,
    conductor: "49/0.25",
    outer_diameter: 4.0,
    ampacity: 32,
    resistivity: 7.41,
    weight: 33.0,
    type: "flexible",
  },
  {
    id: "flex_4",
    code: "BVR-4",
    name: "铜芯聚氯乙烯绝缘软电线",
    cross_section: 4,
    conductor: "56/0.30",
    outer_diameter: 4.6,
    ampacity: 42,
    resistivity: 4.61,
    weight: 49.0,
    type: "flexible",
  },
  {
    id: "flex_6",
    code: "BVR-6",
    name: "铜芯聚氯乙烯绝缘软电线",
    cross_section: 6,
    conductor: "84/0.30",
    outer_diameter: 5.5,
    ampacity: 55,
    resistivity: 3.08,
    weight: 68.0,
    type: "flexible",
  },
  {
    id: "flex_10",
    code: "BVR-10",
    name: "铜芯聚氯乙烯绝缘软电线",
    cross_section: 10,
    conductor: "84/0.40",
    outer_diameter: 7.2,
    ampacity: 75,
    resistivity: 1.83,
    weight: 115.0,
    type: "flexible",
  },
  {
    id: "flex_16",
    code: "BVR-16",
    name: "铜芯聚氯乙烯绝缘软电线",
    cross_section: 16,
    conductor: "126/0.40",
    outer_diameter: 8.5,
    ampacity: 105,
    resistivity: 1.15,
    weight: 170.0,
    type: "flexible",
  },
  {
    id: "flex_25",
    code: "BVR-25",
    name: "铜芯聚氯乙烯绝缘软电线",
    cross_section: 25,
    conductor: "196/0.40",
    outer_diameter: 10.5,
    ampacity: 138,
    resistivity: 0.727,
    weight: 260.0,
    type: "flexible",
  },
  {
    id: "flex_35",
    code: "BVR-35",
    name: "铜芯聚氯乙烯绝缘软电线",
    cross_section: 35,
    conductor: "276/0.40",
    outer_diameter: 12.0,
    ampacity: 170,
    resistivity: 0.524,
    weight: 350.0,
    type: "flexible",
  },
  {
    id: "flex_50",
    code: "BVR-50",
    name: "铜芯聚氯乙烯绝缘软电线",
    cross_section: 50,
    conductor: "396/0.40",
    outer_diameter: 14.0,
    ampacity: 215,
    resistivity: 0.387,
    weight: 480.0,
    type: "flexible",
  },
];

// ========== 控制电缆 ==========
export const CONTROL_CABLE_DB = [
  {
    id: "ctrl_0_5",
    code: "KVVP-0.5",
    name: "铜芯聚氯乙烯绝缘聚氯乙烯护套控制电缆",
    cross_section: 0.5,
    conductor: "16/0.20",
    outer_diameter: 7.5,
    ampacity: 12,
    resistivity: 36.0,
    weight: 45.0,
    type: "control",
  },
  {
    id: "ctrl_0_75",
    code: "KVVP-0.75",
    name: "铜芯聚氯乙烯绝缘聚氯乙烯护套控制电缆",
    cross_section: 0.75,
    conductor: "24/0.20",
    outer_diameter: 8.0,
    ampacity: 16,
    resistivity: 24.5,
    weight: 55.0,
    type: "control",
  },
  {
    id: "ctrl_1",
    code: "KVVP-1",
    name: "铜芯聚氯乙烯绝缘聚氯乙烯护套控制电缆",
    cross_section: 1,
    conductor: "32/0.20",
    outer_diameter: 8.5,
    ampacity: 19,
    resistivity: 18.1,
    weight: 65.0,
    type: "control",
  },
  {
    id: "ctrl_1_5",
    code: "KVVP-1.5",
    name: "铜芯聚氯乙烯绝缘聚氯乙烯护套控制电缆",
    cross_section: 1.5,
    conductor: "30/0.25",
    outer_diameter: 9.0,
    ampacity: 24,
    resistivity: 12.1,
    weight: 80.0,
    type: "control",
  },
];

/**
 * 根据电缆类型和标准获取数据库
 * @param {'power'|'flexible'|'control'} cableType
 * @param {'IEC'|'UL'} standard
 * @returns {Array}
 */
export function getCableDB(cableType, standard = "IEC") {
  if (standard === "UL") {
    return UL_POWER_CABLE_DB;
  }
  
  switch (cableType) {
    case "flexible":
      return FLEXIBLE_CABLE_DB;
    case "control":
      return CONTROL_CABLE_DB;
    case "power":
    default:
      return POWER_CABLE_DB;
  }
}

/**
 * 获取所有电缆数据库
 * @returns {Object}
 */
export function getAllCableDB(standard = "IEC") {
  if (standard === "UL") {
    return {
      power: UL_POWER_CABLE_DB,
      flexible: [],
      control: [],
    };
  }
  return {
    power: POWER_CABLE_DB,
    flexible: FLEXIBLE_CABLE_DB,
    control: CONTROL_CABLE_DB,
  };
}
