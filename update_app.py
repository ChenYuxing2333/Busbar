import codecs

file_path = r"D:\AI\10_Projects\11_Active\SmartBusbar\src\App.vue"
with codecs.open(file_path, "r", "utf-8") as f:
    content = f.read()

# Enhance button touch targets and sizes (P2 Touch Target Minimum: 44x44pt)
content = content.replace('size="small"', 'size="default" class="!px-3 !py-2 !h-10 border-transparent hover:!border-primary-600 focus:!ring-2"')
content = content.replace('@click="showExport = true"', '@click="showExport = true" class="!px-3 !py-2 !h-10 border-transparent hover:border-primary-600 focus:!ring-2"')

with codecs.open(file_path, "w", "utf-8") as f:
    f.write(content)
print("App.vue touch targets updated.")
