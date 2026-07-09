import os
import codecs
import re

file_path = r"D:\AI\10_Projects\11_Active\SmartBusbar\src\components\CableRecommendPanel.vue"
with codecs.open(file_path, "r", "utf-8") as f:
    content = f.read()

# Fix the table to support responsive horizontal scrolling with fade effect
# Find the table wrapper and enhance it
pattern = r'(<div class="overflow-hidden rounded border border-surface-200 dark:border-surface-700/50">)'
replacement = r'''<div class="relative group">
    <!-- 横向滚动遮罩提示 (Swipe Clarity) -->
    <div class="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-surface-50 dark:from-surface-900 to-transparent pointer-events-none opacity-100 md:opacity-0 transition-opacity duration-300 z-10 flex items-center justify-end pr-1">
      <el-icon class="text-surface-400 animate-pulse"><ElIconArrowRight /></el-icon>
    </div>
    <div class="overflow-x-auto overflow-y-hidden rounded border border-surface-200 dark:border-surface-700/50 touch-pan-x">'''

if "Swipe Clarity" not in content:
    content = re.sub(pattern, replacement, content)
    
with codecs.open(file_path, "w", "utf-8") as f:
    f.write(content)
print("CableRecommendPanel.vue responsive table updated.")
