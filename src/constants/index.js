/**
 * SmartBusbar v2.0 — 修正系数表 & 连接工艺常量
 */

// ========== 环境修正系数 ==========
export const CORRECTION_FACTORS = {
  // 温度修正 (IEC 60587, 基准温度 35℃)
  temp: {
    25: 1.1,
    30: 1.06,
    35: 1.0,
    40: 0.94,
    45: 0.87,
    50: 0.82,
    55: 0.76,
    60: 0.7,
  },
  // 海拔修正 (IEC 60664-1)
  altitude: {
    0: 1.05,
    500: 1.02,
    1000: 1.0,
    1500: 0.97,
    2000: 0.95,
    2500: 0.92,
    3000: 0.9,
    3500: 0.87,
    4000: 0.85,
    4500: 0.82,
    5000: 0.8,
  },
  // 风速修正 (强迫风冷增益)
  wind: {
    0: 1.0,
    0.5: 1.12,
    1: 1.25,
    1.5: 1.35,
    2: 1.45,
    2.5: 1.53,
    3: 1.6,
    3.5: 1.65,
    4: 1.7,
  },
  // 湿度修正 (相对湿度 %)
  humidity: {
    50: 1.0,
    60: 0.99,
    70: 0.98,
    80: 0.96,
    90: 0.94,
    95: 0.92,
  },
  // 安装方式修正
  mounting: {
    vertical: 1.0,     // 垂直安装 (基准)
    horizontal: 0.95,  // 水平安装
    edge: 0.92,        // 侧卧安装
    enclosed: 0.85,    // 封闭柜内
  },
  // 并排邻近效应修正 (多片母排平行布置)
  proximity: {
    1: 1.0,   // 单片
    2: 0.95,  // 2 片平行
    3: 0.90,  // 3 片平行
    4: 0.85,  // 4 片及以上
  },
  // 防护等级修正 (IP 等级)
  ipRating: {
    IP20: 1.0,
    IP30: 0.98,
    IP40: 0.96,
    IP54: 0.93,
    IP65: 0.88,
  },
};

// ========== 集肤效应系数表 (AC) ==========
// 宽厚比 w/t → 集肤效应修正系数
export const SKIN_EFFECT_TABLE = [
  { maxRatio: 4,  factor: 1.0 },
  { maxRatio: 6,  factor: 0.98 },
  { maxRatio: 8,  factor: 0.95 },
  { maxRatio: 10, factor: 0.92 },
  { maxRatio: 12, factor: 0.88 },
  { maxRatio: 15, factor: 0.85 },
  { maxRatio: 20, factor: 0.80 },
  { maxRatio: 25, factor: 0.76 },
  { maxRatio: Infinity, factor: 0.72 },
];

// ========== 温升限值 (IEC 61439-1) ==========
export const TEMP_RISE_LIMITS = {
  bare:      { maxTemp: 105, maxRise: 65, label: '裸铜排' },
  tinned:    { maxTemp: 105, maxRise: 65, label: '镀锡铜排' },
  silvered:  { maxTemp: 115, maxRise: 75, label: '镀银铜排' },
  insulated: { maxTemp: 90,  maxRise: 50, label: '绝缘铜排' },
};

// ========== 谐波/负载类型 → 中性线系数 ==========
export const HARMONIC_LOAD_TYPES = [
  { key: 'linear',       label: '线性负载',       neutralFactor: 1.0,  thd: '<5%',    note: '电机、电阻加热' },
  { key: 'it_pfc',       label: 'IT 负载 (有PFC)', neutralFactor: 1.0,  thd: '15-33%', note: '现代服务器、存储' },
  { key: 'it_no_pfc',    label: 'IT 负载 (无PFC)', neutralFactor: 1.73, thd: '50-80%', note: '老旧 SMPS 设备' },
  { key: 'mixed',        label: '混合负载',       neutralFactor: 1.45, thd: '30-50%', note: '典型数据中心' },
  { key: 'lighting_led', label: 'LED 照明',       neutralFactor: 1.3,  thd: '20-40%', note: 'LED 驱动器' },
  { key: 'vfd',          label: '变频器负载',     neutralFactor: 1.0,  thd: '30-50%', note: '变频驱动 (电流在相线)' },
  { key: 'custom',       label: '自定义',         neutralFactor: null, thd: '-',      note: '手动输入系数' },
];

// ========== PE 母排最小截面规则 (IEC 60364-5-54) ==========
export const PE_SIZING_RULES = [
  { maxPhaseSection: 16,  peSection: 'equal',  label: 'S_PE = S_phase' },
  { maxPhaseSection: 35,  peSection: 16,       label: 'S_PE = 16 mm²' },
  { maxPhaseSection: Infinity, peSection: 'half', label: 'S_PE ≥ S_phase / 2' },
];

// ========== 风速对应描述 ==========
export const WIND_LABELS = {
  0.5: "微风",
  1.0: "定向风道",
  1.5: "中等风冷",
  2.0: "强迫风冷",
  2.5: "高效风冷",
  3.0: "极限风冷",
};

// ========== 连接工艺常量 ==========
export const CONNECTION_SPEC = {
  // 铜-铜连接
  "copper-copper": {
    title: "铜-铜连接",
    coating: "可选镀锡（推荐≥5μm）",
    hardware: [
      { bolt: "M8", torque: "20 N·m", forBusbar: "≤40×5" },
      { bolt: "M10", torque: "40 N·m", forBusbar: "50×5~60×10" },
      { bolt: "M12", torque: "60 N·m", forBusbar: "80×10~120×10" },
      { bolt: "M16", torque: "100 N·m", forBusbar: "150×10~250×10" },
    ],
    washer: "DIN 125 标准平垫圈 + 弹簧垫圈",
    notes: ["搭接面积≥母排宽度×2倍宽度", "接触面需打磨去氧化层", "涂抹导电脂"],
    maintenance: "每2年检查紧固力矩",
  },
  // 铜-铝连接（关键工艺）
  "copper-aluminum": {
    title: "铜-铝连接",
    coating: "双面镀锡（铝排≥8μm，铜排≥5μm）",
    hardware: [
      { bolt: "M8", torque: "15 N·m", forBusbar: "≤40×5" },
      { bolt: "M10", torque: "30 N·m", forBusbar: "50×5~60×10" },
      { bolt: "M12", torque: "45 N·m", forBusbar: "80×10~120×10" },
      { bolt: "M16", torque: "80 N·m", forBusbar: "150×10~250×10" },
    ],
    washer: "DIN 9021 加大平垫圈 + 碟形弹簧垫圈 (DIN 2093)",
    notes: [
      "四要素：双面镀锡 + 碟簧补偿 + 铝排力矩(降低30%) + 24h复紧",
      "铝排面积换算：S_Al ≈ S_Cu × 1.5",
      "严禁使用铜质弹簧垫圈（电偶腐蚀）",
      "搭接区域涂覆防氧化导电脂",
      "安装后24小时内必须复紧",
    ],
    maintenance: "首次通电后1个月复检，此后每年检查",
  },
  // 铝-铝连接
  "aluminum-aluminum": {
    title: "铝-铝连接",
    coating: "双面镀锡（≥8μm）",
    hardware: [
      { bolt: "M8", torque: "15 N·m", forBusbar: "≤40×5" },
      { bolt: "M10", torque: "30 N·m", forBusbar: "50×5~80×5" },
      { bolt: "M12", torque: "45 N·m", forBusbar: "60×10~160×10" },
      { bolt: "M16", torque: "80 N·m", forBusbar: "200×10~250×10" },
    ],
    washer: "DIN 9021 加大平垫圈 + 碟形弹簧垫圈",
    notes: [
      "6063-T6铝合金推荐",
      "两步紧固法：先70%力矩 → 24h后100%复紧",
      "接触面打磨后立即涂导电脂",
      "防松标记线（划线法）",
    ],
    maintenance: "每年红外测温巡检，温升<30K合格",
  },
};

// ========== 电池回路常量 (IEC/GB) ==========

/**
 * IEC 62040 / GB/T 7260 UPS 蓄电池组常用直流母线电压档位
 * 基于 VRLA 蓄电池 12V 模块或 2V 单体串联
 */
export const BATTERY_VOLTAGES = [
  { value: 96, label: "96V DC", cells: "8×12V", note: "小型 UPS ≤30kVA" },
  { value: 120, label: "120V DC", cells: "10×12V", note: "小型 UPS 20-60kVA" },
  { value: 192, label: "192V DC", cells: "16×12V", note: "中型 UPS 40-120kVA" },
  {
    value: 240,
    label: "240V DC",
    cells: "20×12V",
    note: "中大型 UPS 80-400kVA",
  },
  {
    value: 384,
    label: "384V DC",
    cells: "32×12V",
    note: "大型 UPS 150-800kVA",
  },
  {
    value: 480,
    label: "480V DC",
    cells: "40×12V",
    note: "大型 UPS 300-1200kVA",
  },
];

/**
 * 电池回路安全系数
 * IEC 62040-3 推荐放电回路留 25% 余量
 */
export const BATTERY_SAFETY_FACTOR = 1.25;

// ========== 压降计算阈值 ==========
export const VOLTAGE_DROP_THRESHOLDS = {
  ok: 3, // ≤3% 正常（绿色）
  warning: 5, // 3%~5% 警告（黄色）
  danger: 5, // >5% 危险（红色）
};

// ========== 回路定义 ==========
export const CIRCUITS = [
  {
    key: "mains",
    label: "主路输入",
    labelEn: "Mains",
    color: "#3b82f6",
    icon: "Connection",
  },
  {
    key: "bypass",
    label: "旁路输入",
    labelEn: "Bypass",
    color: "#f59e0b",
    icon: "Switch",
  },
  {
    key: "output",
    label: "输出回路",
    labelEn: "Output",
    color: "#22c55e",
    icon: "Position",
  },
  {
    key: "neutral",
    label: "中性线",
    labelEn: "Neutral",
    color: "#a855f7",
    icon: "Warning",
  },
];

// ========== 策略定义 ==========
export const STRATEGIES = [
  {
    key: "economy",
    label: "经济型",
    labelEn: "Economy",
    color: "#ef4444",
    tagType: "danger",
    range: "90%~100%",
  },
  {
    key: "standard",
    label: "标准型",
    labelEn: "Standard",
    color: "#22c55e",
    tagType: "success",
    range: "70%~90%",
  },
  {
    key: "premium",
    label: "保守型",
    labelEn: "Premium",
    color: "#3b82f6",
    tagType: "primary",
    range: "<70%",
  },
];

// ========== 材料价格参考 (¥/kg) ==========
// 数据来源: 2024-2025 年国内大宗商品均价，仅供估算
export const MATERIAL_PRICES = {
  copper: { price: 72, unit: '¥/kg', label: '紫铜 (T2)', source: '上海期货交易所参考' },
  aluminum: { price: 22, unit: '¥/kg', label: '铝合金 (6063)', source: '上海期货交易所参考' },
};

// ========== 附件/工艺成本 (¥/组) ==========
export const ACCESSORY_COSTS = {
  joint: { price: 35, label: '并联接头 (螺栓组)', note: '含绝缘螺栓/弹垫/绝缘套' },
  insulator: { price: 28, label: '绝缘支撑件', note: 'DMC/SMC 材料' },
  heatShrink: { price: 18, label: '热缩套管 (¥/m)', note: '双壁含胶' },
  tinPlating: { price: 15, label: '镀锡加工 (¥/m)', note: '每面镀锡' },
};
