<template>
  <div
    class="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 p-5 space-y-5 rounded shadow-card"
  >
    <div
      class="flex items-center justify-between mb-1 pb-3 border-b border-surface-200 dark:border-surface-700"
    >
      <h3
        class="text-sm font-bold text-surface-700 dark:text-surface-300 flex items-center gap-2"
      >
        <el-icon class="text-primary-600 dark:text-primary-500"
          ><ElIconSetting
        /></el-icon>
        参数配置
      </h3>
      <div class="flex items-center gap-2">
        <el-tooltip content="重置为默认值" placement="top">
          <el-button
            text
            size="small"
            class="!text-surface-500 hover:!text-semantic-error"
            @click="handleReset"
          >
            <el-icon><ElIconRefreshRight /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tag
          size="small"
          effect="plain"
          class="!bg-surface-100 dark:!bg-surface-800 !border-surface-200 dark:!border-surface-700 !text-surface-600 dark:!text-surface-400 font-mono tabular-nums tracking-tight"
        >
          {{ form.standard }}
        </el-tag>
      </div>
    </div>

    <el-form :model="form" label-position="top" size="default">
      <!-- ▸ 设备参数 -->
      <div class="space-y-3">
        <div
          class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-surface-500 dark:text-surface-400"
        >
          <div class="h-px flex-1 bg-surface-200 dark:bg-surface-700"></div>
          <span>设备参数</span>
          <div class="h-px flex-1 bg-surface-200 dark:bg-surface-700"></div>
        </div>

        <el-form-item label="UPS 容量 (kVA)">
          <el-input-number
            v-model="form.kva"
            :min="10"
            :max="3000"
            :step="10"
            class="!w-full"
          />
        </el-form-item>

        <el-form-item label="系统电压 (V)">
          <el-select v-model="form.voltage" class="!w-full">
            <el-option label="480V (三相)" :value="480" />
            <el-option label="415V (三相)" :value="415" />
            <el-option label="400V (三相)" :value="400" />
            <el-option label="380V (三相)" :value="380" />
            <el-option label="220V (单相)" :value="220" />
          </el-select>
        </el-form-item>

        <el-form-item label="适用标准">
          <el-radio-group v-model="form.standard" class="!w-full">
            <el-radio-button label="IEC">IEC / GB</el-radio-button>
            <el-radio-button label="UL">UL</el-radio-button>
          </el-radio-group>
          <div
            v-if="form.standard === 'UL'"
            class="text-[11px] text-semantic-warning mt-1.5 flex items-center gap-1"
          >
            <el-icon><ElIconWarningFilled /></el-icon> UL 标准禁用风冷修正系数
          </div>
        </el-form-item>

        <el-form-item label="材料选择">
          <el-radio-group v-model="form.material" class="!w-full">
            <el-radio-button label="copper">铜排 (TMY)</el-radio-button>
            <el-radio-button label="aluminum">铝排 (LMY)</el-radio-button>
          </el-radio-group>
          <div class="text-[11px] text-surface-500 dark:text-surface-400 mt-1.5">
            <el-icon class="mr-0.5"><ElIconInfoFilled /></el-icon>
            {{
              form.material === "aluminum"
                ? "铝排载流量≈铜排61%，重量轻、成本低"
                : "铜排导电率高、载流量大"
            }}
          </div>
        </el-form-item>
      </div>

      <!-- ▸ 环境参数 -->
      <div class="space-y-3 mt-2">
        <div
          class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-surface-500 dark:text-surface-400"
        >
          <div class="h-px flex-1 bg-surface-200 dark:bg-surface-700"></div>
          <span>环境参数</span>
          <div class="h-px flex-1 bg-surface-200 dark:bg-surface-700"></div>
        </div>

        <!-- 环境温度 Slider -->
        <el-form-item>
          <template #label>
            <div class="flex items-center justify-between w-full">
              <span>环境温度</span>
              <span
                class="font-mono tabular-nums text-[11px] px-1.5 py-0.5 rounded transition-all duration-300"
                :class="
                  correctionK.temp >= 1
                    ? 'text-semantic-success bg-semantic-success/10'
                    : correctionK.temp >= 0.9
                      ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/30'
                      : 'text-semantic-warning bg-semantic-warning/10'
                "
                >K = {{ correctionK.temp.toFixed(2) }}</span
              >
            </div>
          </template>
          <div class="w-full px-1">
            <div class="flex justify-between items-center mb-1">
              <span class="text-xs text-surface-500 dark:text-surface-400">25℃</span>
              <span class="font-mono tabular-nums text-sm font-bold text-primary-600 dark:text-primary-400"
                >{{ form.temp }}℃</span
              >
              <span class="text-xs text-surface-500 dark:text-surface-400">50℃</span>
            </div>
            <el-slider
              v-model="form.temp"
              :min="25"
              :max="50"
              :step="5"
              :marks="{
                25: '25',
                30: '30',
                35: '35',
                40: '40',
                45: '45',
                50: '50',
              }"
              :show-tooltip="false"
            />
          </div>
        </el-form-item>

        <!-- 海拔高度 Slider -->
        <el-form-item>
          <template #label>
            <div class="flex items-center justify-between w-full">
              <span>海拔高度</span>
              <span
                class="font-mono tabular-nums text-[11px] px-1.5 py-0.5 rounded transition-all duration-300"
                :class="
                  correctionK.alt >= 1
                    ? 'text-semantic-success bg-semantic-success/10'
                    : correctionK.alt >= 0.95
                      ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/30'
                      : 'text-semantic-warning bg-semantic-warning/10'
                "
                >K = {{ correctionK.alt.toFixed(2) }}</span
              >
            </div>
          </template>
          <div class="w-full px-1">
            <div class="flex justify-between items-center mb-1">
              <span class="text-xs text-surface-500 dark:text-surface-400">1000m</span>
              <span class="font-mono tabular-nums text-sm font-bold text-primary-600 dark:text-primary-400"
                >{{ form.altitude }}m</span
              >
              <span class="text-xs text-surface-500 dark:text-surface-400">4000m</span>
            </div>
            <el-slider
              v-model="form.altitude"
              :min="1000"
              :max="4000"
              :step="1000"
              :marks="{ 1000: '1k', 2000: '2k', 3000: '3k', 4000: '4k' }"
              :show-tooltip="false"
            />
          </div>
        </el-form-item>
      </div>

      <!-- ▸ 散热条件 -->
      <div class="space-y-3 mt-2">
        <div
          class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-surface-500 dark:text-surface-400"
        >
          <div class="h-px flex-1 bg-surface-200 dark:bg-surface-700"></div>
          <span>散热条件</span>
          <div class="h-px flex-1 bg-surface-200 dark:bg-surface-700"></div>
        </div>

        <el-form-item label="散热方式">
          <el-radio-group v-model="form.cooling">
            <el-radio label="natural">自然对流</el-radio>
            <el-radio label="forced" :disabled="form.standard === 'UL'"
              >强迫风冷</el-radio
            >
          </el-radio-group>
        </el-form-item>

        <transition name="el-zoom-in-top">
          <div
            v-if="form.cooling === 'forced'"
            class="rounded-lg bg-primary-50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-800/50 shadow-sm p-4 space-y-3"
          >
            <div class="flex justify-between items-center">
              <span class="text-xs text-surface-400 dark:text-surface-500">风速 (m/s)</span>
              <span class="font-mono tabular-nums text-sm font-bold text-primary-600 dark:text-primary-400"
                >{{ form.wind }} m/s</span
              >
            </div>
            <el-slider
              v-model="form.wind"
              :min="0.5"
              :max="3.0"
              :step="0.5"
              :marks="{ 0.5: '0.5', 1: '1.0', 2: '2.0', 3: '3.0' }"
            />
            <div class="text-center text-xs font-mono tabular-nums">
              <span class="text-primary-600 dark:text-primary-400">
                <el-icon class="mr-0.5"><ElIconWindPower /></el-icon>
                预计载流提升: +{{ windBonus }}%
              </span>
              <span class="text-surface-500 dark:text-surface-400 ml-2"
                >(K={{ correctionK.wind.toFixed(2) }})</span
              >
            </div>

            <!-- 风扇失效模拟开关 -->
            <div
              class="flex items-center justify-between pt-2 border-t border-primary-200 dark:border-primary-800/50"
            >
              <div class="flex items-center gap-2">
                <div
                  class="w-1.5 h-1.5 rounded-full"
                  :class="
                    form.fanFailure
                      ? 'bg-semantic-error animate-pulse'
                      : 'bg-slate-600'
                  "
                ></div>
                <span class="text-xs text-surface-400 dark:text-surface-500">风扇失效模拟</span>
              </div>
              <el-switch
                v-model="form.fanFailure"
                active-color="#dc2626"
                inactive-color="#cbd5e1"
                size="small"
              />
            </div>
          </div>
        </transition>
      </div>

      <!-- ▸ 回路系数 -->
      <div class="space-y-3 mt-2">
        <div
          class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-surface-500 dark:text-surface-400"
        >
          <div class="h-px flex-1 bg-surface-200 dark:bg-surface-700"></div>
          <span>回路系数</span>
          <div class="h-px flex-1 bg-surface-200 dark:bg-surface-700"></div>
        </div>

        <el-form-item label="旁路过载系数">
          <el-radio-group v-model="form.bypassFactor">
            <el-radio :label="1.0">×1.0</el-radio>
            <el-radio :label="1.1">×1.1</el-radio>
            <el-radio :label="1.25">×1.25</el-radio>
            <el-radio :label="1.5">×1.5</el-radio>
          </el-radio-group>
          <div class="text-[11px] text-surface-500 dark:text-surface-400 mt-1">
            {{
              form.bypassFactor <= 1.0
                ? "旁路=输出同规格"
                : form.bypassFactor <= 1.1
                  ? "10%余量 (轻载场景)"
                  : form.bypassFactor <= 1.25
                    ? "IEC 62040-3 标准 (125%/10min)"
                    : "覆盖150%/60s短时过载"
            }}
          </div>
        </el-form-item>

        <el-form-item label="负载类型 (谐波)">
          <el-select
            v-model="form.loadType"
            class="!w-full"
            @change="onLoadTypeChange"
          >
            <el-option
              v-for="lt in HARMONIC_LOAD_TYPES"
              :key="lt.key"
              :label="lt.label"
              :value="lt.key"
            >
              <div class="flex items-center justify-between w-full">
                <span>{{ lt.label }}</span>
                <span class="text-xs text-surface-500 dark:text-surface-400 ml-3"
                  >THD {{ lt.thd }} · {{ lt.note }}</span
                >
              </div>
            </el-option>
          </el-select>
          <div v-if="harmonicInfo" class="text-[11px] text-surface-500 dark:text-surface-400 mt-1">
            N线系数:
            <span class="text-primary-600 dark:text-primary-400 font-mono tabular-nums"
              >×{{ harmonicInfo.neutralFactor?.toFixed(2) || "N/A" }}</span
            >
            · THD: {{ harmonicInfo.thd }} · {{ harmonicInfo.note }}
          </div>
        </el-form-item>

        <el-form-item label="N线手动系数">
          <el-radio-group v-model="form.neutralFactor">
            <el-radio :label="1.0">×1.0</el-radio>
            <el-radio :label="1.45">×1.45</el-radio>
            <el-radio :label="1.73">×1.73</el-radio>
            <el-radio :label="2.0">×2.0</el-radio>
          </el-radio-group>
        </el-form-item>
      </div>

      <!-- ▸ 选型规则 -->
      <div class="space-y-3 mt-2">
        <div
          class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-surface-500 dark:text-surface-400"
        >
          <div class="h-px flex-1 bg-surface-200 dark:bg-surface-700"></div>
          <span>选型规则</span>
          <div class="h-px flex-1 bg-surface-200 dark:bg-surface-700"></div>
        </div>

        <el-checkbox v-model="form.allowStacking" border class="!w-full">
          允许母排叠加 (2~3 片)
        </el-checkbox>
        <div class="text-[11px] text-surface-500 dark:text-surface-400">
          默认仅推荐单层母排，勾选后包含多片叠加方案
        </div>
      </div>

      <!-- ▸ 电池回路 -->
      <div class="space-y-3 mt-2">
        <div
          class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-surface-500 dark:text-surface-400"
        >
          <div class="h-px flex-1 bg-surface-200 dark:bg-surface-700"></div>
          <span>电池回路</span>
          <div class="h-px flex-1 bg-surface-200 dark:bg-surface-700"></div>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-sm text-surface-400 dark:text-surface-500">启用电池回路计算</span>
          <el-switch
            v-model="form.batteryEnabled"
            active-color="#0284c7"
            inactive-color="#cbd5e1"
            size="small"
          />
        </div>

        <transition name="el-zoom-in-top">
          <div
            v-if="form.batteryEnabled"
            class="space-y-3 rounded-lg bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 shadow-sm p-4"
          >
            <el-form-item label="电池组电压 (V DC)">
              <el-select v-model="form.batteryVoltage" class="!w-full">
                <el-option
                  v-for="v in batteryVoltages"
                  :key="v.value"
                  :label="v.label"
                  :value="v.value"
                >
                  <div class="flex items-center justify-between w-full">
                    <span class="font-mono tabular-nums">{{ v.label }}</span>
                    <span class="text-xs text-surface-500 dark:text-surface-400 ml-3"
                      >{{ v.cells }} · {{ v.note }}</span
                    >
                  </div>
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="功率因数 (PF)">
              <el-input-number
                v-model="form.powerFactor"
                :min="0.7"
                :max="1.0"
                :step="0.01"
                :precision="2"
                class="!w-full"
              />
              <div class="text-[11px] text-surface-500 dark:text-surface-400 mt-1">
                UPS 标称输出功率因数，通常为 0.9 或 1.0
              </div>
            </el-form-item>

            <el-form-item label="逆变效率 (%)">
              <el-input-number
                v-model="form.inverterEff"
                :min="85"
                :max="99"
                :step="1"
                class="!w-full"
              />
            </el-form-item>

            <el-form-item>
              <template #label>
                <div class="flex items-center gap-1">
                  <span>电池容量 (Ah)</span>
                  <el-tooltip
                    content="填入后自动计算充电电流并取较大值作为设计电流。留 0 则只按放电电流选型。"
                    placement="top"
                  >
                    <el-icon class="text-surface-500 dark:text-surface-400 cursor-help"
                      ><ElIconQuestionFilled
                    /></el-icon>
                  </el-tooltip>
                </div>
              </template>
              <el-input-number
                v-model="form.batteryCapacity"
                :min="0"
                :step="50"
                class="!w-full"
                placeholder="0 = 仅按放电选型"
              />
            </el-form-item>

            <transition name="el-zoom-in-top">
              <el-form-item
                v-if="form.batteryCapacity > 0"
                label="充电倍率 (C)"
              >
                <el-radio-group v-model="form.chargeRate">
                  <el-radio :label="0.1">0.1C</el-radio>
                  <el-radio :label="0.15">0.15C</el-radio>
                  <el-radio :label="0.2">0.2C</el-radio>
                </el-radio-group>
                <div class="text-[11px] text-surface-500 dark:text-surface-400 mt-1">
                  充电电流 = {{ form.batteryCapacity }} ×
                  {{ form.chargeRate }} =
                  {{ Math.ceil(form.batteryCapacity * form.chargeRate) }} A
                </div>
              </el-form-item>
            </transition>

            <el-form-item label="安全系数">
              <el-radio-group v-model="form.batterySafetyFactor">
                <el-radio :label="1.0">×1.0</el-radio>
                <el-radio :label="1.25">×1.25</el-radio>
                <el-radio :label="1.5">×1.5</el-radio>
              </el-radio-group>
              <div class="text-[11px] text-surface-500 dark:text-surface-400 mt-1">
                IEC 62040-3 推荐 ×1.25
              </div>
            </el-form-item>
          </div>
        </transition>
      </div>

      <!-- ▸ 结构参数 (v2.2) -->
      <div class="space-y-3 mt-2">
        <div
          class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-surface-500 dark:text-surface-400"
        >
          <div class="h-px flex-1 bg-surface-200 dark:bg-surface-700"></div>
          <span>结构参数</span>
          <div class="h-px flex-1 bg-surface-200 dark:bg-surface-700"></div>
        </div>

        <el-form-item label="安装方式">
          <el-select v-model="form.mounting" class="!w-full">
            <el-option label="垂直安装 (基准)" value="vertical" />
            <el-option label="水平安装 (×0.95)" value="horizontal" />
            <el-option label="侧卧安装 (×0.92)" value="edge" />
            <el-option label="封闭柜内 (×0.85)" value="enclosed" />
          </el-select>
        </el-form-item>

        <el-form-item label="防护等级">
          <el-select v-model="form.ipRating" class="!w-full">
            <el-option label="IP20 (×1.0)" value="IP20" />
            <el-option label="IP30 (×0.98)" value="IP30" />
            <el-option label="IP40 (×0.96)" value="IP40" />
            <el-option label="IP54 (×0.93)" value="IP54" />
            <el-option label="IP65 (×0.88)" value="IP65" />
          </el-select>
        </el-form-item>

        <el-form-item label="相对湿度 (%)">
          <el-select v-model="form.humidity" class="!w-full">
            <el-option :label="'50% (×1.0)'" :value="50" />
            <el-option :label="'60% (×0.99)'" :value="60" />
            <el-option :label="'70% (×0.98)'" :value="70" />
            <el-option :label="'80% (×0.96)'" :value="80" />
            <el-option :label="'90% (×0.94)'" :value="90" />
            <el-option :label="'95% (×0.92)'" :value="95" />
          </el-select>
        </el-form-item>
      </div>

      <!-- ▸ 短路参数 (v2.2 P1) -->
      <div class="space-y-3 mt-2">
        <div
          class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-surface-500 dark:text-surface-400"
        >
          <div class="h-px flex-1 bg-surface-200 dark:bg-surface-700"></div>
          <span>短路参数</span>
          <div class="h-px flex-1 bg-surface-200 dark:bg-surface-700"></div>
        </div>

        <el-form-item label="预期短路电流 (kA)">
          <el-input-number
            v-model="form.shortCircuitCurrent"
            :min="0"
            :max="200"
            :step="5"
            :precision="1"
            class="!w-full"
            placeholder="0 = 不校验"
          />
          <div class="text-[11px] text-surface-500 dark:text-surface-400 mt-1">
            填入上游变压器/母线的预期短路电流，自动校验母排耐受能力
          </div>
        </el-form-item>

        <el-form-item label="相间距 (mm)">
          <el-input-number
            v-model="form.phaseSpacing"
            :min="50"
            :max="500"
            :step="10"
            class="!w-full"
          />
          <div class="text-[11px] text-surface-500 dark:text-surface-400 mt-1">
            母排中心距，用于计算短路电动力和支撑间距
          </div>
        </el-form-item>
      </div>

      <!-- ▸ 并机配置 (v2.2 P2) -->
      <div class="space-y-3 mt-2">
        <div
          class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-surface-500 dark:text-surface-400"
        >
          <div class="h-px flex-1 bg-surface-200 dark:bg-surface-700"></div>
          <span>并机配置</span>
          <div class="h-px flex-1 bg-surface-200 dark:bg-surface-700"></div>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-sm text-surface-400 dark:text-surface-500">启用并机计算</span>
          <el-switch
            v-model="form.parallelEnabled"
            active-color="#0284c7"
            inactive-color="#cbd5e1"
            size="small"
          />
        </div>

        <transition name="el-zoom-in-top">
          <div
            v-if="form.parallelEnabled"
            class="space-y-3 rounded-lg bg-purple-950/20 border border-purple-900/30 p-4"
          >
            <el-form-item label="并机总台数 (N+X)">
              <el-input-number
                v-model="form.parallelCount"
                :min="2"
                :max="8"
                :step="1"
                class="!w-full"
              />
            </el-form-item>
            <el-form-item label="冗余台数 (X)">
              <el-input-number
                v-model="form.parallelRedundant"
                :min="0"
                :max="form.parallelCount - 1"
                :step="1"
                class="!w-full"
              />
              <div class="text-[11px] text-surface-500 dark:text-surface-400 mt-1">
                {{ form.parallelCount - form.parallelRedundant }}+{{
                  form.parallelRedundant
                }}
                配置， 总容量
                {{
                  form.kva * (form.parallelCount - form.parallelRedundant)
                }}
                kVA
              </div>
            </el-form-item>
          </div>
        </transition>
      </div>
    </el-form>

    <!-- 居中自定义风格重置确认对话框 -->
    <Teleport to="body">
      <transition name="el-fade-in">
        <div
          v-if="showResetDialog"
          class="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4"
        >
          <div
            class="glass-panel p-6 max-w-sm w-full border border-surface-200 dark:border-surface-700/50 shadow-2xl rounded-xl space-y-5"
            @click.stop
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0"
              >
                <el-icon class="text-xl text-semantic-warning"
                  ><ElIconWarningFilled
                /></el-icon>
              </div>
              <h3 class="text-lg font-bold text-surface-800 dark:text-surface-200">确认重置</h3>
            </div>
            <p class="text-sm text-surface-400 dark:text-surface-500 leading-relaxed">
              您当前的压降配置、自定义母排参数以及各相长短等数据都将被彻底清除并恢复为默认。此操作不可恢复。
            </p>
            <div class="flex gap-3 justify-end pt-2">
              <button
                class="px-5 py-2.5 rounded-lg text-sm font-medium bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-slate-700 hover:text-surface-900 dark:text-surface-900 dark:text-surface-900 dark:text-white transition-colors flex-1"
                @click="showResetDialog = false"
              >
                取消
              </button>
              <button
                class="px-5 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-surface-900 dark:text-surface-900 dark:text-surface-900 dark:text-white transition-all shadow-lg flex-1"
                @click="confirmReset"
              >
                确认重置
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { useSmartBusbar } from "../composables/useSmartBusbar.js";
import { BATTERY_VOLTAGES, HARMONIC_LOAD_TYPES } from "../constants/index.js";

const { form, correctionK, windBonus, resetToDefault, harmonicInfo } =
  useSmartBusbar();

const showResetDialog = ref(false);

const batteryVoltages = BATTERY_VOLTAGES;

// 当负载类型变化时，自动更新N线系数
function onLoadTypeChange(val) {
  const entry = HARMONIC_LOAD_TYPES.find((h) => h.key === val);
  if (entry && entry.neutralFactor !== null) {
    form.neutralFactor = entry.neutralFactor;
  }
}

/**
 * 处理重置操作
 */
function handleReset() {
  showResetDialog.value = true;
}

function confirmReset() {
  resetToDefault();
  showResetDialog.value = false;
  ElMessage.success("已重置为系统默认值");
}
</script>
