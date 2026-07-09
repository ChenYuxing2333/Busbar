/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // 工业感主色 (沉稳务实，使用相对冷静的科技青钛蓝)
        primary: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4", // 核心主色
          600: "#0891b2",
          700: "#0e7490", // 按钮 Hover
          800: "#155e75",
          900: "#164e63",
          950: "#083344",
        },
        // 界面框架色系 (冷亮灰为主，适合 B 端工程工具的高信息密度)
        surface: {
          50: "#f8fafc",
          100: "#f1f5f9", // 浅色模式背景基底
          200: "#e2e8f0", // 分割线/边框
          300: "#cbd5e1",
          400: "#94a3b8", // 辅助文本
          500: "#64748b", // 次要文本
          600: "#475569",
          700: "#334155", // 主要正文
          800: "#1e293b",
          900: "#0f172a", // 深色模式面板
          950: "#020617", // 深色模式背景基底
        },
        // 纯语义反馈色 (严谨区分指示与告警状态)
        semantic: {
          success: "#10b981", // 校验合规/生成成功
          warning: "#f59e0b", // 降额临界/温升预警
          error: "#ef4444", // 参数超限/不合规报错
          info: "#3b82f6", // 一般引导与提示
        },
      },
      fontFamily: {
        // 核心关注点：数据要求强制等宽对齐，防抖动
        mono: [
          '"JetBrains Mono"',
          '"Fira Code"',
          "Consolas",
          "Menlo",
          "monospace",
        ],
        // 中性克制无衬线字体
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          '"Microsoft YaHei"',
          "sans-serif",
        ],
      },
      boxShadow: {
        // 去除炫光霓虹，改用严谨的多层拟物克制阴影
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
        dropdown:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
        modal:
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05)",
        "dark-card":
          "0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.3)",
      },
      borderRadius: {
        // 工程软件偏务实，减少大规模圆润，推崇精密切割的微圆角
        none: "0",
        sm: "0.125rem", // 2px
        DEFAULT: "0.25rem", // 4px (默认)
        md: "0.375rem", // 6px
        lg: "0.5rem", // 8px (弹窗/卡片最大限制)
      },
      animation: {
        // 禁用超长悬浮吸错，保证最高效反馈 (150ms-200ms过场)
        "fade-in": "fadeIn 0.15s ease-out",
        "slide-up": "slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
