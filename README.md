安装与调试

1. 在 Chrome/Edge 的 扩展程序 → 管理扩展程序 → 开发者模式。
2. 选择“加载已解压的扩展程序”，选择本项目的 `extension/` 目录。
3. 打开任意 B 站页面（`https://www.bilibili.com/` 域名下）。
4. 点击工具栏图标或在页面按快捷键 Alt+Shift+F 切换“学习模式”。

说明

- 学习模式开启时，`remove_div.txt` 中列出的 className 对应的元素将被隐藏（`display: none`）。
- 该列表目前放在扩展包内，后续会改为“选择器包 OTA”。
- 后续版本将引入悬浮番茄钟与会话数据采集（见 `docs.md` 第 5 章与整体规范）。

文件结构

- `manifest.json`：MV3 清单，声明权限、脚本与快捷键。
- `background.js`：全局状态与广播；处理图标点击与快捷键。
- `content.js`：根据“学习模式”状态应用/移除隐藏样式。
- `popup.html/.js`：弹窗界面，可手动切换学习模式。
- `remove_div.txt`：需要隐藏的 class 名称列表（来自根目录）。


