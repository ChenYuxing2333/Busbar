import codecs
file_path = r"D:\AI\10_Projects\11_Active\SmartBusbar\src\App.vue"
with codecs.open(file_path, "r", "utf-8") as f:
    content = f.read()

# Fix the duplicate class attribute
old_str = '@click="showExport = true" class="!px-3 !py-2 !h-10 border-transparent hover:border-primary-600 focus:!ring-2" class="!px-3 !py-2 !h-10 border-transparent hover:border-primary-600 focus:!ring-2"'
new_str = '@click="showExport = true"'

content = content.replace(old_str, new_str)
content = content.replace('class="!text-surface-600 dark:text-surface-400 hover:!text-primary-600 dark:text-primary-400"\n          @click="showExport = true"', 'class="!text-surface-600 dark:text-surface-400 hover:!text-primary-600 dark:text-primary-400 !px-3 !py-2 !h-10 border-transparent hover:border-primary-600 focus:!ring-2"\n          @click="showExport = true"')

with codecs.open(file_path, "w", "utf-8") as f:
    f.write(content)
print("Duplicate fixed")
