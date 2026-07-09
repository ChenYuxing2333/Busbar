import codecs
import re

file_path = r"D:\AI\10_Projects\11_Active\SmartBusbar\src\components\SafetyVerificationPanel.vue"
with codecs.open(file_path, "r", "utf-8") as f:
    content = f.read()

# Use proper string replacement instead of regex to avoid escape issues
replacement1 = '</div>\n      <div v-if="!shortCircuitCheck.pass" class="mt-3 flex justify-end gap-2">\n        <el-button size="small" type="danger" plain class="cursor-pointer">⚠️ 推荐: 增加母排截面 或 更换材质</el-button>\n      </div>'

content = content.replace('{{ shortCircuitCheck.remark }}</div>', '{{ shortCircuitCheck.remark }}</div>' + replacement1)

replacement2 = '{{ temperatureRise.remark }}</div>\n      <div v-if="!temperatureRise.pass" class="mt-3 flex justify-end gap-2">\n        <el-button size="small" type="danger" plain class="cursor-pointer">⚠️ 推荐: 降低环境温度 或 增加母排截面</el-button>\n      </div>'
content = content.replace('{{ temperatureRise.remark }}</div>', replacement2)

with codecs.open(file_path, "w", "utf-8") as f:
    f.write(content)
print("SafetyVerificationPanel.vue error recovery updated.")
