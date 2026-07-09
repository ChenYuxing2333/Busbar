import codecs

file_path = r"D:\AI\10_Projects\11_Active\SmartBusbar\src\style.css"
with codecs.open(file_path, "r", "utf-8") as f:
    content = f.read()

content = content.replace("text-slate-500", "text-surface-500 dark:text-surface-400")
content = content.replace("text-slate-400", "text-surface-400 dark:text-surface-500")
content = content.replace("bg-slate-800", "bg-surface-200 dark:bg-surface-700")

with codecs.open(file_path, "w", "utf-8") as f:
    f.write(content)
print("done")
