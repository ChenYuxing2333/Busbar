<template>
  <div class="glass-panel overflow-hidden relative group">
    <div class="p-4 border-b border-surface-200 dark:border-surface-700/50 flex justify-between items-center bg-surface-200 dark:bg-surface-800">
      <div class="flex items-center gap-2 text-primary-600 dark:text-primary-400">
        <el-icon class="text-lg"><ElIconOdometer /></el-icon>
        <h3 class="font-bold text-sm tracking-wider uppercase">UPS 在线双变换运行拓扑</h3>
      </div>
      <!-- Legend -->
      <div class="flex flex-wrap gap-2 text-[10px] font-medium">
        <button 
          class="flex items-center gap-1.5 transition px-2 py-1.5 rounded bg-surface-200 dark:bg-surface-800 hover:bg-slate-700/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          :class="['normal', 'single', 'ess'].includes(activeMode) ? 'opacity-100 text-primary-600 dark:text-primary-400' : 'opacity-40 text-surface-600 dark:text-surface-400'"
          @click="activeMode = 'normal'"
        >
          <div class="w-3 h-0.5 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div> 主路市电模式
        </button>
        <button 
          class="flex items-center gap-1.5 transition px-2 py-1.5 rounded bg-surface-200 dark:bg-surface-800 hover:bg-slate-700/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          :class="activeMode === 'single' ? 'opacity-100 text-primary-600 dark:text-primary-400 ring-1 ring-cyan-500/50' : 'opacity-40 text-surface-600 dark:text-surface-400'"
          @click="activeMode = 'single'"
        >
          <div class="w-3 h-0.5 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div> 单输入模式
        </button>
        <button 
          class="flex items-center gap-1.5 transition px-2 py-1.5 rounded bg-surface-200 dark:bg-surface-800 hover:bg-slate-700/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          :class="activeMode === 'ess' ? 'opacity-100 text-primary-600 dark:text-primary-400 border border-cyan-500/50' : 'opacity-40 text-surface-600 dark:text-surface-400'"
          @click="activeMode = 'ess'"
        >
          <div class="w-3 h-0.5 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div> ESS 节能模式
        </button>
        <button 
          class="flex items-center gap-1.5 transition px-2 py-1.5 rounded bg-surface-200 dark:bg-surface-800 hover:bg-slate-700/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          :class="activeMode === 'bypass' ? 'opacity-100 text-semantic-warning' : 'opacity-40 text-surface-600 dark:text-surface-400'"
          @click="activeMode = 'bypass'"
        >
          <div class="w-3 h-0.5 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"></div> 旁路供电模式
        </button>
        <button 
          class="flex items-center gap-1.5 transition px-2 py-1.5 rounded bg-surface-200 dark:bg-surface-800 hover:bg-slate-700/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          :class="activeMode === 'battery' ? 'opacity-100 text-semantic-success' : 'opacity-40 text-surface-600 dark:text-surface-400'"
          @click="activeMode = 'battery'"
        >
          <div class="w-3 h-0.5 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div> 电池逆变模式
        </button>
        <button 
          class="flex items-center gap-1.5 transition px-2 py-1.5 rounded bg-surface-200 dark:bg-surface-800 hover:bg-slate-700/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          :class="activeMode === 'maintenance' ? 'opacity-100 text-purple-400' : 'opacity-40 text-surface-600 dark:text-surface-400'"
          @click="activeMode = 'maintenance'"
        >
          <div class="w-3 h-0.5 bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]"></div> 维修旁路模式
        </button>
      </div>
    </div>
    
    <!-- Diagram Area -->
    <div class="p-4 overflow-x-auto min-h-[340px] flex items-center justify-center bg-surface-100 dark:bg-surface-900">
      <svg width="860" height="300" viewBox="0 0 860 300" xmlns="http://www.w3.org/2000/svg" class="font-mono tabular-nums sel-none">
        <defs>
          <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-purple" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <!-- Base Wires (Dimmed) -->
        <g stroke="#334155" stroke-width="4" stroke-linecap="round" fill="none">
          <!-- Main AC Path -->
          <path d="M 120 200 L 680 200 L 680 150 L 720 150" />
          <!-- Bypass AC Path -->
          <path d="M 120 100 L 680 100 L 680 150 L 720 150" />
          <!-- Battery Path -->
          <path d="M 450 260 L 450 200" />
          
          <!-- Maintenance Bypass Base Wire -->
          <path d="M 80 80 L 80 40 L 760 40 L 760 130" />
          <!-- Single Input Jumper Base Wire -->
          <path d="M 40 200 L 20 200 L 20 100 L 40 100" />
        </g>

        <!-- Active Animated Wires -->
        <g stroke-width="2" fill="none" class="flow-paths">
          <!-- Jumper for Single Input -->
          <path v-if="activeMode === 'single'" d="M 40 200 L 20 200 L 20 100 L 40 100" stroke="#22d3ee" filter="url(#glow-cyan)" class="animate-flow-fast opacity-80" />

          <!-- Main Continuous Flow (Normal) -->
          <path v-if="['normal', 'single'].includes(activeMode)" d="M 120 200 L 680 200 L 680 150 L 720 150" stroke="#22d3ee" filter="url(#glow-cyan)" class="animate-flow-fast" />
          
          <!-- ESS Flow (Bypass Priority) -->
          <g v-if="activeMode === 'ess'">
            <!-- Primary Flow through Bypass -->
            <path d="M 120 100 L 680 100 L 680 150 L 720 150" stroke="#22d3ee" filter="url(#glow-cyan)" class="animate-flow-fast" />
            <!-- Trickle Charge Path -->
            <path d="M 120 200 L 450 200 L 450 260" stroke="#34d399" stroke-dasharray="4 4" class="animate-flow-slow opacity-60" />
            <!-- Standby Energized Paths -->
            <path d="M 250 200 L 680 200 L 680 150" stroke="#22d3ee" class="opacity-30" stroke-width="1" />
          </g>

          <!-- Bypass Continuous Flow -->
          <path v-if="activeMode === 'bypass'" d="M 120 100 L 680 100 L 680 150 L 720 150" stroke="#fbbf24" filter="url(#glow-amber)" class="animate-flow-fast" />

          <!-- Maintenance Continuous Flow -->
          <path v-if="activeMode === 'maintenance'" d="M 80 80 L 80 40 L 760 40 L 760 130" stroke="#a855f7" filter="url(#glow-purple)" class="animate-flow-fast" />

          <!-- Battery Continuous Flow (Discharging) -->
          <path v-if="activeMode === 'battery'" d="M 450 260 L 450 200 L 680 200 L 680 150 L 720 150" stroke="#34d399" filter="url(#glow-emerald)" class="animate-flow-fast" />

          <!-- Battery Flow (Charging) -->
          <path v-if="['normal', 'single'].includes(activeMode) && form.batteryEnabled" d="M 450 200 L 450 260" stroke="#34d399" filter="url(#glow-emerald)" class="animate-flow-slow opacity-50" />
        </g>

        <!-- Components / Modules -->
        
        <!-- Mains Source -->
        <g transform="translate(40, 180)">
          <rect width="80" height="40" rx="6" fill="#0f172a" :stroke="['normal', 'single'].includes(activeMode) ? '#22d3ee' : '#475569'" stroke-width="2" :filter="['normal', 'single'].includes(activeMode) ? 'url(#glow-cyan)' : ''" class="transition-colors duration-300" />
          <text x="40" y="24" :fill="['normal', 'single'].includes(activeMode) ? '#cbd5e1' : '#64748b'" font-size="12" font-weight="bold" text-anchor="middle" class="transition-colors">MAINS</text>
          <text x="40" y="55" fill="#64748b" font-size="10" text-anchor="middle">主路输入</text>
        </g>

        <!-- Bypass Source -->
        <g transform="translate(40, 80)">
          <rect width="80" height="40" rx="6" fill="#0f172a" :stroke="activeMode === 'maintenance' ? '#a855f7' : (activeMode === 'bypass' ? '#fbbf24' : (activeMode === 'single' ? '#22d3ee' : '#475569'))" stroke-width="2" :filter="activeMode === 'maintenance' ? 'url(#glow-purple)' : (activeMode === 'bypass' ? 'url(#glow-amber)' : (activeMode === 'single' ? 'url(#glow-cyan)' : ''))" class="transition-colors duration-300" />
          <text x="40" y="24" :fill="activeMode === 'maintenance' ? '#d8b4fe' : (activeMode === 'bypass' ? '#cbd5e1' : (activeMode === 'single' ? '#cbd5e1' : '#64748b'))" font-size="12" font-weight="bold" text-anchor="middle" class="transition-colors">BYPASS</text>
          <text x="40" y="55" fill="#64748b" font-size="10" text-anchor="middle">旁路输入</text>
        </g>

        <!-- MBS Switch -->
        <g transform="translate(380, 20)" :class="activeMode === 'maintenance' ? 'opacity-100' : 'opacity-40'">
          <rect width="80" height="40" rx="4" fill="#1e293b" :stroke="activeMode === 'maintenance' ? '#a855f7' : '#475569'" stroke-width="2" class="transition-colors duration-300" />
          <path d="M 20 20 L 35 15 M 45 20 L 60 20" :stroke="activeMode === 'maintenance' ? '#d8b4fe' : '#94a3b8'" stroke-width="2" fill="none" class="transition-colors" />
          <text x="40" y="55" fill="#64748b" font-size="10" text-anchor="middle">MBS 维修旁路</text>
        </g>

        <!-- K1 Switch (Main Input) -->
        <g transform="translate(170, 185)" class="transition-all duration-300">
          <circle cx="15" cy="15" r="3" fill="#475569" />
          <circle cx="45" cy="15" r="3" fill="#475569" />
          <line x1="15" y1="15" :x2="['normal', 'single', 'ess'].includes(activeMode) ? 45 : 40" :y2="['normal', 'single', 'ess'].includes(activeMode) ? 15 : 5" stroke="#94a3b8" stroke-width="2" class="transition-all" />
          <text x="30" y="35" fill="#64748b" font-size="9" text-anchor="middle">K1</text>
        </g>

        <!-- K5 Switch (Bypass Input) -->
        <g transform="translate(170, 85)" class="transition-all duration-300">
          <circle cx="15" cy="15" r="3" fill="#475569" />
          <circle cx="45" cy="15" r="3" fill="#475569" />
          <line x1="15" y1="15" :x2="['bypass', 'single', 'ess'].includes(activeMode) ? 45 : 40" :y2="['bypass', 'single', 'ess'].includes(activeMode) ? 15 : 5" stroke="#94a3b8" stroke-width="2" class="transition-all" />
          <text x="30" y="35" fill="#64748b" font-size="9" text-anchor="middle">K5</text>
        </g>

        <!-- Rectifier -->
        <g transform="translate(250, 160)">
          <rect width="100" height="80" rx="8" fill="#1e293b" :stroke="['normal', 'single', 'ess'].includes(activeMode) ? '#22d3ee' : '#334155'" stroke-width="2" class="transition-colors duration-300" />
          <!-- AC to DC symbol -->
          <text x="50" y="30" fill="#94a3b8" font-size="16" text-anchor="middle" font-weight="bold">AC / DC</text>
          <line x1="20" y1="40" x2="80" y2="40" stroke="#475569" stroke-width="1" />
          <text x="50" y="60" :fill="['normal', 'single', 'ess'].includes(activeMode) ? '#22d3ee' : '#64748b'" font-size="12" font-weight="bold" text-anchor="middle" class="transition-colors">RECTIFIER</text>
          <text x="50" y="75" fill="#64748b" font-size="10" text-anchor="middle">整流器</text>
        </g>

        <!-- Static Switch -->
        <g transform="translate(350, 80)">
          <rect width="100" height="40" rx="4" fill="#1e293b" :stroke="['bypass', 'ess'].includes(activeMode) ? (activeMode === 'ess' ? '#22d3ee' : '#fbbf24') : '#475569'" stroke-width="2" class="transition-colors duration-300" />
          <!-- Professional STS Symbol (Anti-parallel Thyristors) -->
          <g :stroke="['bypass', 'ess'].includes(activeMode) ? '#fff' : '#94a3b8'" fill="none" stroke-width="1.5">
            <path d="M 35 20 L 70 20" />
            <path d="M 42 14 L 52 20 L 42 26 Z" /> <!-- Forward Thyristor -->
            <path d="M 63 14 L 53 20 L 63 26 Z" /> <!-- Reverse Thyristor -->
            <path d="M 42 14 L 40 10 M 63 26 L 65 30" stroke-width="1" /> <!-- Gates -->
          </g>
          <text x="50" y="55" fill="#64748b" font-size="10" text-anchor="middle">STATIC STS (静态开关)</text>
        </g>

        <!-- Battery -->
        <g transform="translate(410, 260)" :class="{ 'opacity-40 grayscale': !(activeMode === 'battery' || (['normal', 'single'].includes(activeMode) && form.batteryEnabled)) }">
          <rect width="80" height="40" rx="4" fill="#1e293b" stroke="#34d399" stroke-width="2" :filter="activeMode === 'battery' ? 'url(#glow-emerald)' : ''" />
          <!-- Battery Cells -->
          <rect x="15" y="10" width="12" height="20" fill="#34d399" />
          <rect x="34" y="10" width="12" height="20" fill="#34d399" />
          <rect x="53" y="10" width="12" height="20" fill="#34d399" />
          <text x="40" y="55" fill="#10b981" font-size="10" font-weight="bold" text-anchor="middle">BATTERY (电池)</text>
        </g>

        <!-- Inverter -->
        <g transform="translate(550, 160)">
          <rect width="100" height="80" rx="8" fill="#1e293b" :stroke="['normal', 'single', 'battery'].includes(activeMode) ? '#22d3ee' : '#334155'" stroke-width="2" class="transition-colors duration-300" />
          <!-- DC to AC symbol -->
          <text x="50" y="30" fill="#94a3b8" font-size="16" text-anchor="middle" font-weight="bold">DC / AC</text>
          <line x1="20" y1="40" x2="80" y2="40" stroke="#475569" stroke-width="1" />
          <text x="50" y="60" :fill="['normal', 'single', 'battery'].includes(activeMode) ? '#22d3ee' : '#64748b'" font-size="12" font-weight="bold" text-anchor="middle" class="transition-colors">INVERTER</text>
          <text x="50" y="75" fill="#64748b" font-size="10" text-anchor="middle">逆变器</text>
        </g>

        <!-- Load -->
        <g transform="translate(720, 130)">
          <!-- K3 Output Switch -->
          <g transform="translate(-40, 20)">
            <circle cx="10" cy="0" r="2" fill="#475569" />
            <circle cx="30" cy="0" r="2" fill="#475569" />
            <line x1="10" y1="0" :x2="activeMode !== 'maintenance' ? 30 : 25" :y2="activeMode !== 'maintenance' ? 0 : -10" stroke="#94a3b8" stroke-width="2" class="transition-all" />
            <text x="20" y="15" fill="#64748b" font-size="8" text-anchor="middle">K3</text>
          </g>
          <rect width="80" height="40" rx="6" fill="#0f172a" 
                :stroke="activeMode === 'maintenance' ? '#a855f7' : (activeMode === 'bypass' ? '#fbbf24' : '#22d3ee')" 
                stroke-width="2" 
                :filter="activeMode === 'maintenance' ? 'url(#glow-purple)' : (activeMode === 'bypass' ? 'url(#glow-amber)' : 'url(#glow-cyan)')" 
                class="transition-colors duration-300" />
          <text x="40" y="24" fill="#cbd5e1" font-size="12" font-weight="bold" text-anchor="middle">LOAD</text>
          <text x="40" y="55" fill="#64748b" font-size="10" text-anchor="middle">系统负载</text>
        </g>

      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useSmartBusbar } from '../composables/useSmartBusbar.js';

const { form } = useSmartBusbar();
const activeMode = ref('normal');
</script>

<style scoped>
.flow-paths path {
  stroke-dasharray: 8 6;
}

.animate-flow-fast {
  animation: flowLine 0.6s linear infinite;
}

.animate-flow-slow {
  animation: flowLine 1.5s linear infinite;
}

@keyframes flowLine {
  from {
    stroke-dashoffset: 14;
  }
  to {
    stroke-dashoffset: 0;
  }
}
</style>
