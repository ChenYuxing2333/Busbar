<template>
  <el-dialog
    v-model="showExport"
    title="导出选型报告"
    width="480px"
    :append-to-body="true"
  >
    <div class="space-y-4 text-sm text-surface-700 dark:text-surface-300">
      <p>将当前选型结果导出为 PDF 报告，包含：</p>
      <ul class="list-disc list-inside text-surface-600 dark:text-surface-400 space-y-1">
        <li>设备参数与环境条件</li>
        <li>四回路电流计算结果</li>
        <li>各回路推荐方案（三档）</li>
        <li>压降估算结果</li>
        <li>连接工艺要求</li>
      </ul>

      <el-form label-position="top" size="default">
        <el-form-item label="项目名称 (仅支持英文/拼音)">
          <el-input v-model="projectName" placeholder="e.g. DataCenter UPS Busbar" @input="projectName = projectName.replace(/[^\w\s-]/g, '')" />
        </el-form-item>
        <el-form-item label="编制人 (仅支持英文/拼音)">
          <el-input v-model="authorName" placeholder="e.g. John Doe" @input="authorName = authorName.replace(/[^\w\s-]/g, '')" />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <el-button @click="showExport = false">取消</el-button>
      <el-button
        type="primary"
        class="!bg-cyan-600 !border-cyan-600"
        :loading="exporting"
        @click="handleExport"
      >
        <el-icon class="mr-1"><ElIconDownload /></el-icon>
        生成 PDF
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useSmartBusbar } from '../composables/useSmartBusbar.js';
import { CIRCUITS, STRATEGIES } from '../constants/index.js';

const {
  form,
  showExport,
  currents,
  correctionK,
  recommendations,
  materialLabel,
} = useSmartBusbar();

const projectName = ref('');
const authorName = ref('');
const exporting = ref(false);

async function handleExport() {
  exporting.value = true;

  try {
    // 动态导入 jsPDF (减少初始包体积)
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // ── 标题 ──
    doc.setFontSize(18);
    doc.setTextColor(6, 182, 212);
    doc.text('SmartBusbar', 20, y);
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text('UPS Mother Bar Selection Report v2.0', 75, y);
    y += 10;

    doc.setDrawColor(30, 41, 59);
    doc.line(20, y, pageWidth - 20, y);
    y += 8;

    // ── 项目信息 ──
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    if (projectName.value) {
      doc.text(`Project: ${projectName.value}`, 20, y);
      y += 6;
    }
    if (authorName.value) {
      doc.text(`Author: ${authorName.value}`, 20, y);
      y += 6;
    }
    doc.text(`Date: ${new Date().toISOString().slice(0, 10)}`, 20, y);
    y += 10;

    // ── 设备参数 ──
    doc.setFontSize(12);
    doc.setTextColor(6, 182, 212);
    doc.text('1. Device Parameters', 20, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      margin: { left: 20, right: 20 },
      head: [['Parameter', 'Value']],
      body: [
        ['UPS Capacity', `${form.kva} kVA`],
        ['System Voltage', `${form.voltage} V`],
        ['Standard', form.standard],
        ['Material', form.material === 'copper' ? 'Copper (T2)' : 'Aluminum (6063)'],
        ['Temperature', `${form.temp}°C`],
        ['Altitude', `${form.altitude}m`],
        ['Cooling', form.cooling === 'forced' ? `Forced (${form.wind}m/s)` : 'Natural'],
        ['Neutral Factor', `${form.neutralFactor * 100}%`],
        ['Stacking', form.allowStacking ? 'Allowed' : 'Single layer'],
      ],
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [30, 41, 59], textColor: [6, 182, 212] },
      alternateRowStyles: { fillColor: [15, 23, 42] },
      bodyStyles: { textColor: [203, 213, 225] },
    });

    y = doc.lastAutoTable.finalY + 10;

    // ── 修正系数 ──
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Correction Factors: K_temp=${correctionK.value.temp.toFixed(2)} x K_alt=${correctionK.value.alt.toFixed(2)} x K_wind=${correctionK.value.wind.toFixed(2)} = ${correctionK.value.total.toFixed(3)}`,
      20, y
    );
    y += 10;

    // ── 电流计算 ──
    doc.setFontSize(12);
    doc.setTextColor(6, 182, 212);
    doc.text('2. Current Calculation', 20, y);
    y += 6;

    const cur = currents.value;
    autoTable(doc, {
      startY: y,
      margin: { left: 20, right: 20 },
      head: [['Circuit', 'Current (A)', 'Note']],
      body: [
        ['Mains Input', cur.mains, 'x1.3 overload'],
        ['Bypass Input', cur.bypass, `x${form.bypassFactor} overload (IEC 62040-3)`],
        ['Output', cur.output, 'Rated'],
        ['Neutral', cur.neutral, `${form.neutralFactor * 100}% factor`],
      ],
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [30, 41, 59], textColor: [6, 182, 212] },
      alternateRowStyles: { fillColor: [15, 23, 42] },
      bodyStyles: { textColor: [203, 213, 225] },
    });

    y = doc.lastAutoTable.finalY + 10;

    // ── 推荐方案 ──
    doc.setFontSize(12);
    doc.setTextColor(6, 182, 212);
    doc.text('3. Recommendations', 20, y);
    y += 6;

    const recs = recommendations.value;
    for (const circuit of CIRCUITS) {
      const r = recs[circuit.key];
      if (!r || r.error) continue;

      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184);
      doc.text(`${circuit.labelEn} Circuit`, 20, y);
      y += 5;

      const rows = STRATEGIES.map(s => {
        const item = r[s.key];
        if (!item) return [s.labelEn, '-', '-', '-'];
        return [
          s.labelEn,
          item.displaySpec,
          `${item.realAmp} A`,
          `${(item.loadRate * 100).toFixed(1)}%`,
        ];
      });

      autoTable(doc, {
        startY: y,
        margin: { left: 20, right: 20 },
        head: [['Strategy', 'Spec', 'Ampacity', 'Load Rate']],
        body: rows,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [30, 41, 59], textColor: [6, 182, 212] },
        alternateRowStyles: { fillColor: [15, 23, 42] },
        bodyStyles: { textColor: [203, 213, 225] },
      });

      y = doc.lastAutoTable.finalY + 8;

      // 检查分页
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
    }

    // ── 免责声明 ──
    y += 5;
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Disclaimer: Results are for reference only. Final selection must comply with local codes and engineering drawings.', 20, y);

    // 保存
    const filename = projectName.value
      ? `SmartBusbar_${projectName.value}_${new Date().toISOString().slice(0,10)}.pdf`
      : `SmartBusbar_Report_${new Date().toISOString().slice(0,10)}.pdf`;

    doc.save(filename);
    ElMessage.success({ message: `报告已导出: ${filename}`, grouping: true });
    showExport.value = false;

  } catch (err) {
    console.error('PDF export error:', err);
    ElMessage.error('导出失败，请检查控制台');
  } finally {
    exporting.value = false;
  }
}
</script>

