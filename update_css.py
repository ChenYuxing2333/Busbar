import os
import codecs

file_path = r"D:\AI\10_Projects\11_Active\SmartBusbar\src\style.css"
with codecs.open(file_path, "r", "utf-8") as f:
    content = f.read()

content = content.replace("bg-panel-950 text-slate-200", "bg-surface-950 text-surface-200 dark:bg-surface-950 dark:text-surface-200")
content = content.replace("bg-panel-800/80 backdrop-blur-xl border border-slate-700/50", "bg-surface-800/80 backdrop-blur-xl border border-surface-700/50")
content = content.replace("border-slate-700/50", "border-surface-700/50")
content = content.replace("text-cyan-400", "text-primary-600 dark:text-primary-400")

with codecs.open(file_path, "w", "utf-8") as f:
    f.write(content)
print("done")
