import codecs

file_path = r"D:\AI\10_Projects\11_Active\SmartBusbar\src\components\SafetyVerificationPanel.vue"
with codecs.open(file_path, "r", "utf-8") as f:
    content = f.read()

# Fix messed up nested div tags from multiple Python appends
# Look for the duplicated error recovery markup
old_str = """{{ shortCircuitCheck.remark }}</div></div>
      <div v-if="!shortCircuitCheck.pass" class="mt-3 flex justify-end gap-2">
        <el-button size="small" type="danger" plain class="cursor-pointer">⚠️ 推荐: 增加母排截面 或 更换材质</el-button>
      </div></div>
      <div v-if="!shortCircuitCheck.pass" class="mt-3 flex justify-end gap-2">
        <el-button size="small" type="danger" plain class="cursor-pointer">⚠️ 推荐: 增加母排截面 或 更换材质</el-button>
      </div>"""
new_str = """{{ shortCircuitCheck.remark }}</div>
      <div v-if="!shortCircuitCheck.pass" class="mt-3 flex justify-end gap-2">
        <el-button size="small" type="danger" plain class="cursor-pointer">⚠️ 推荐: 增加母排截面 或 更换材质</el-button>
      </div>"""

if old_str in content:
    content = content.replace(old_str, new_str)
elif '</div></div>\n      <div v-if="!shortCircuit' in content:
    content = content.replace("</div></div>\n      <div", '</div>\n      <div')

# Check the other instance too
old_t = """{{ temperatureRise.remark }}</div>\n      <div v-if="!temperatureRise.pass" class="mt-3 flex justify-end gap-2">\n        <el-button size="small" type="danger" plain class="cursor-pointer">⚠️ 推荐: 降低环境温度 或 增加母排截面</el-button>\n      </div>\n      <div v-if="!temperatureRise.pass"""
if old_t in content:
    content = content.split("      <div v-if=\"!temperatureRise.pass")[0] + "      <div v-if=\"!temperatureRise.pass" + content.split("      <div v-if=\"!temperatureRise.pass")[1]

# Quick fix using regex for any duplicate recovery blocks
import re
content = re.sub(r'(\s*<div v-if="!shortCircuitCheck\.pass" class=".*?<\/div>){2,}', r'\1', content, flags=re.DOTALL)
content = re.sub(r'(\s*<div v-if="!temperatureRise\.pass" class=".*?<\/div>){2,}', r'\1', content, flags=re.DOTALL)
content = content.replace("</div></div>\n      <div v-if=\"!shortCircuitCheck.pass\"", "</div>\n      <div v-if=\"!shortCircuitCheck.pass\"")

with codecs.open(file_path, "w", "utf-8") as f:
    f.write(content)
print("Safety element tags fixed")
