import os
import codecs
import re

vue_files = []
target_dir = r"D:\AI\10_Projects\11_Active\SmartBusbar\src"
for root, dirs, files in os.walk(target_dir):
    for file in files:
        if file.endswith(".vue"):
            vue_files.append(os.path.join(root, file))

replacements = {
    r"bg-panel-950": "bg-surface-50 dark:bg-surface-950",
    r"bg-panel-900/80": "bg-surface-50/90 dark:bg-surface-900/80 backdrop-blur-xl",
    r"bg-panel-800": "bg-surface-100 dark:bg-surface-800",
    r"text-slate-200": "text-surface-800 dark:text-surface-200",
    r"\btext-slate-300\b": "text-surface-700 dark:text-surface-300",
    r"\btext-slate-400\b": "text-surface-600 dark:text-surface-400",
    r"\btext-slate-500\b": "text-surface-500 dark:text-surface-500",
    r"\btext-slate-600\b": "text-surface-500 dark:text-surface-400",
    r"\btext-slate-700\b": "text-surface-700 dark:text-surface-300",
    r"border-slate-800/60|border-slate-800": "border-surface-200 dark:border-surface-800/60",
    r"border-slate-700/50|border-slate-700": "border-surface-200 dark:border-surface-700/50",
    r"border-slate-600": "border-surface-300 dark:border-surface-600",
    r"bg-slate-800/\d+|bg-slate-800": "bg-surface-200 dark:bg-surface-800",
    r"bg-slate-900/\d+|bg-slate-900": "bg-surface-100 dark:bg-surface-900",
    r"text-cyan-400": "text-primary-600 dark:text-primary-400",
    r"text-cyan-500": "text-primary-600 dark:text-primary-500",
    r"bg-cyan-950/30": "bg-primary-50 dark:bg-primary-900/30",
    r"bg-cyan-950": "bg-primary-100 dark:bg-primary-900",
    r"border-cyan-900/30|border-cyan-900": "border-primary-200 dark:border-primary-800/50",
    r"\btext-amber-400\b|\btext-amber-500\b": "text-semantic-warning",
    r"\btext-emerald-400\b|\btext-emerald-500\b": "text-semantic-success",
    r"from-cyan-500\s*to-blue-600": "bg-primary-600 dark:bg-primary-500", 
    r"bg-gradient-to-br\s+from-cyan-500\s+to-blue-600": "bg-primary-600 dark:bg-primary-500",
    r"shadow-glow-cyan": "shadow-sm",
    r"\btext-red-400\b|\btext-red-500\b": "text-semantic-error",
    r"\bbg-red-400\b|\bbg-red-500\b": "bg-semantic-error",
    r"font-mono(?! tabular-nums)": "font-mono tabular-nums",
    r"text-white": "text-surface-900 dark:text-white"
}

for file_path in vue_files:
    # Skip the broken test files
    if "test1" in file_path:
        continue
    with codecs.open(file_path, "r", "utf-8") as f:
        content = f.read()
    
    original_content = content
    for old, new in replacements.items():
        content = re.sub(old, new, content)
    
    if content != original_content:
        with codecs.open(file_path, "w", "utf-8") as f:
            f.write(content)
        print(f"Updated: {os.path.basename(file_path)}")

print("Global token update complete.")
