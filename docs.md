# ADHD 学习辅助插件（Bilibili）— 开发文档 v1.0（仅规范，无实现代码）

- 目标读者：插件前端、网站前端、（轻后端）运维
- 适用范围：Chrome/Edge，Bilibili 站点优先
- 后端架构：Firebase-only（Auth + Firestore + Cloud Functions按需）
- 版本日期：2025-08-08

## 0. 产品概览

为 ADHD 学习者提供“学习模式”：

- 去干扰（隐藏推荐/广告等非学习元素）；
- 悬浮番茄钟（25/5 默认，可自定义）；
- 学习档案（记录学习会话，网页端可视化）。

说明：去干扰不依赖 AI，完全由人工维护的选择器包实现。

注意：CSS 隐藏请使用 display: none 或 visibility: hidden；visibility: none 无效（规范提醒，非实现）。

## MVP 目标

- 学习模式开关与去干扰生效（1 秒内完成首屏隐藏 ≥95% 目标元素）。
- 番茄钟（开始/暂停/重置/模式切换）。
- 抽取并记录视频元数据（标题、UP、bvid/合集），形成学习会话。
- 账号与数据同步（登录后跨设备查看）。
- 网页端 Dashboard 与 Sessions 列表、基础统计。
- 数据导出/删除入口。

## 非目标（MVP 不做）

跨平台（YouTube 等）、复杂推荐、社交/排行榜、AI 自动分类与个性化标签。

## 1. 用户与场景

画像：高校/自学人群，易被推荐流吸引，期望有明确时间边界与低刺激界面。

核心路径：打开学习视频 → 开启学习模式 → 页面去干扰+番茄钟 → 结束后在网页端查看进度与累计时长。

ADHD 设计原则：减少诱因（隐藏推荐/热门/广告）、提供明确时间感（倒计时+阶段提示）、弱刺激微动效、默认静音提示可开启。

## 2. 功能清单（MVP）

### 2.1 插件端

- 学习模式开关（工具栏按钮 + 快捷键，建议 Alt+Shift+F）。
- 去干扰：按选择器包隐藏目标元素；页面结构变动时自动复用选择器。
- 悬浮番茄钟：25/5、50/10、自定义；开始/暂停/重置；阶段切换提醒（通知/可选音）。
- 学习会话：记录视频元数据、阶段片段（Focus/Break）、开始/结束时间。
- 同步策略：离线缓存，登录后补传；storage.sync 仅存用户偏好和选择器包版本。

### 2.2 网站端（用户空间）

- 认证：注册/登录/登出。
- 仪表盘：本周番茄个数、专注分钟、近期学习视频。
- 学习会话列表：按日期/UP/课程筛选。
- 设置页：默认番茄配置、白名单域、数据导出（JSON/CSV）与一键删除。

### 2.3 后端（Firebase）

- Auth：Email/Password 起步。
- Firestore：以 /{uid}/... 命名空间存储业务数据。
- Cloud Functions（按需）：聚合统计、数据导出与删除、选择器包 OTA 下发（只读）。

## 3. 非功能需求

- 性能：内容脚本注入 <100ms；首轮隐藏 <1s；MutationObserver 节流。
- 稳定性：B 站 DOM 变更可通过选择器包 OTA 恢复；本地回退默认包。
- 隐私：仅采集最小必要数据（URL、标题、时间段、UP、bvid/合集标识）；不采集评论/弹幕内容。
- 安全：MV3 不远程执行代码；密钥不暴露；全程 HTTPS；严格 Firestore 规则。
- 可用性：键盘可操作、低刺激视觉、可关闭声音。

## 4. 总体架构（文字描述）

- Extension Service Worker：全局状态（学习模式、计时、登录）、通知、与后端通信、选择器包版本管理。
- Content Scripts：应用/撤销去干扰、渲染番茄钟、监听 DOM 变化、提取元数据、上报事件。
- Firebase：Auth 认证；Firestore 存储 users/sessions/videos/courses/pomodoros/events；Functions 提供 exportData/deleteAll/stats。
- Next.js 网站：客户端读取 Firestore，敏感/聚合场景走 Functions。

## 5. 插件设计（Manifest V3 规范）

- 权限：storage、activeTab、alarms、notifications；域：https://*.bilibili.com/*。
- 后台职责：学习模式广播、计时提醒、与 Firestore/Functions 统一通信（避免内容脚本持有敏感令牌）、定期拉取选择器包版本。
- 内容脚本职责：应用/撤销隐藏样式、渲染隔离 UI（Shadow DOM）、抽取视频元数据、监听 DOM 变化重复隐藏。
- 状态与事件：start/pause/resume/finish；阶段 Focus ↔ Break；异常重试与离线补传。
- 错误策略：写入失败指数退避；登录失效暂停远端写入并提示；选择器包拉取失败回退本地。

## 6. 网站前端信息架构（Next.js + Tailwind + Firebase）

- /dashboard：本周番茄、分钟、连续天数（streak）、近期视频。
- /sessions：会话列表（筛选：日期、UP、课程）。
- /courses/[slug]：合集/课程的进度视图（后续扩展）。
- /settings：账号、偏好（默认番茄、白名单、选择器包版本只读）、导出/删除操作。

认证：Firebase Auth（客户端）；数据：直接读 Firestore；聚合通过 Functions。

## 7. 后端（Firebase-only）职责与安全

组件：Auth、Firestore、Cloud Functions（HTTP）、可选 Storage（导出文件临时存放）。

安全规则原则：

- 所有与用户相关的文档路径含 /{uid}/ 并由 request.auth.uid == uid 才可读写；
- selectorPacks 只读公开，不允许匿名写；
- Functions 仅处理已认证请求，记录审计日志与速率限制（导出每日 ≤3 次）。

## 8. 数据模型（Firestore 规范）

为对齐前后端契约而设定的字段与类型；不含任何实现代码。

### users/{uid}

profile: email, createdAt

settings: focusMinsDefault (number, 25), breakMinsDefault (number, 5), whitelistUrls (string[]), hideSelectorsPackId (string)

### sessions/{uid}/{sessionId}

videoId (string), platform ('bilibili'), bvid (string), title (string), upName (string)

courseId (string, 可选)

startedAt (timestamp), endedAt (timestamp, 可选)

mode ('25-5' | '50-10' | 'custom')

focusMinutes (number), breakMinutes (number)

### videos/{uid}/{videoId}

platform ('bilibili'), bvid (string), title (string), upName (string), duration (seconds, 可选), courseId (string, 可选)

### courses/{uid}/{courseId}

title (string), platform ('bilibili'), externalId (string, 可选), progressPercent (0–100, 可选)

### pomodoros/{uid}/{pomodoroId}

sessionId (string), startedAt (timestamp), endedAt (timestamp), type ('focus' | 'break')

### events/{uid}/{eventId}

sessionId (string), type ('start'|'pause'|'resume'|'finish'), payload (object), createdAt (timestamp)

### selectorPacks/{packId}

version (number, 递增), updatedAt (timestamp), selectors (string[])

### 关系与约束

- sessions.videoId 应关联同 uid 的 videos；
- videos.courseId 关联 courses。
- 幂等键建议：uid + videoId + startedAt。
- 删除用户数据需级联清理同 uid 下各集合。
- 建议索引：sessions.startedAt desc、pomodoros.startedAt desc、videos.title 前缀。

## 9. 云函数接口（HTTP，按需）

所有请求需认证（Auth token）。

| 方法 | 路径 | 说明 | 请求参数 | 响应 | 速率限制 |
| --- | --- | --- | --- | --- | --- |
| POST | /exportData | 触发导出（JSON/CSV） | `range: last7d\tlast30d\tall（默认 last30d），format: json` |  |  |
| POST | /deleteAll | 一键删除当前用户数据 | 无 | { ok: true } | 每用户/天 ≤1（含 24h 保护期） |
| GET | /stats/overview | 聚合统计 | range（默认 last7d） | { tomatoes, minutes, streak } | 每用户/分 ≤10 |

错误范式：400 参数错误 / 401 未认证 / 429 超限 / 500 内部错误（含 taskId 便于追踪）。

## 10. 选择器包（Selector Pack）规范

目的：集中维护“非学习元素”的 CSS 选择器列表，实现去干扰。

字段：version（递增）、updatedAt、selectors: string[]。

### 维护流程：

- 人工在目标页面标注与验证；
- 小流量用户灰度（仅拉取新版本）；
- 无问题后全量 OTA；
- 如失败，回退上一个版本并记录原因。

### 编写准则：

- 优先选择稳定父级容器/结构型选择器；避免随机哈希类名；
- 为不同页面类型（主站视频页/番剧页/直播页）分组；
- 提供误隐藏“白名单 URL/区域”机制；
- 选择器数量与层级深度控制，避免性能开销。

生效语义：学习模式开启时应用；关闭时撤销；页面 DOM 变化时重用同一包。

## 11. 学习会话语义与统计口径

状态机：Idle → FocusRunning ↔ Paused → BreakRunning → Finished

事件：start / pause / resume / finish

统计：

- 番茄个数 = 完整 FocusRunning 段次数；
- 专注分钟 = 所有 Focus 段时长总和（四舍五入到分钟）；
- Streak = 连续至少 1 个番茄的自然日数。

异常：浏览器崩溃/断网时，以最近心跳或阶段开始时间做尾部截断；下次上线补传。

## 12. 隐私与合规

- 最小化收集：URL、标题、UP、bvid/合集标识、时间段、用户偏好；不抓评论/弹幕正文。
- 用户权利：设置页提供导出（JSON/CSV）与一键删除；删除后客户端需清空缓存。
- 透明度：隐私政策声明“仅 DOM 隐藏，不绕过登录/付费”。
- 安全：HTTPS、最小权限、严格 Firestore 规则，Functions 审计日志开启。
- 保留周期：默认长期保留；用户可删除；二次确认与 24 小时缓冲期可选。

## 13. 质量与测试

### 验收指标

- 去干扰：进入视频页 1 秒内目标区块隐藏率 ≥95%，切分 P 或刷新后仍保持；
- 计时：误差 ≤1s/分钟；阶段切换与提醒正确；
- 数据：离线 24h 内补传成功；幂等写避免重复；
- 登录：未登录本地缓存，登录后历史补传；
- 导出/删除：字段完整、区间正确、权限严密。

### E2E 场景

- 首次安装 → 登录 → 开启学习模式 → 隐藏成功；
- 25/5 完成 → 会话结束 → 网页端可见统计；
- 离线学习 → 上线补传；
- 推送新选择器包 → 无需发版即生效（含回退验证）。

## 14. 部署与运维

- Firebase 项目：Auth/Firestore/Functions/（可选 Storage），配置安全规则、必需索引、配额与告警。
- 网站：Vercel 部署（环境变量管理 Firebase 配置）。
- 插件上架：Chrome Web Store & Edge Add-ons；准备截图、说明与隐私政策。
- 监控：Functions 日志、导出任务耗时与失败率、客户端匿名错误上报（不含 PII）。
- 发布管理：选择器包版本号递增；灰度 → 全量 → 回归；出现误隐藏可一键回退。

## 15. 里程碑与分工（两人）

- 第 1 周：插件骨架 & 学习模式开关；首版选择器包；番茄钟信息架构与视觉规范。
- 第 2 周：Auth 接入（网站/插件）；会话数据写入；Dashboard 原型。
- 第 3 周：离线队列与补传语义；选择器包 OTA 管道；设置页含导出/删除入口（调用 Functions）。
- 第 4 周：稳定性回归、上架素材与隐私政策；小规模内测与选择器迭代。

分工建议：

- 你：插件前端、Next.js 站点、选择器维护、E2E 用例设计；
- 队友：Firestore 结构与安全规则、Functions（导出/删除/聚合）、配额/监控/发布流程。

## 16. 风险与缓解

- B 站 DOM 变动频繁 → 选择器包 OTA 与结构型选择器；支持快速回退；白名单机制降低误伤。
- MV3 限制（计时/音频） → 使用 alarms 触发提醒，必要时 Offscreen Document 方案（后续可评估）。
- 网络/登录异常 → 本地队列 + 幂等写；失效时暂停远端写入并提示。
- 导出滥用 → 限流（天/用户 ≤3）；大数据集采用异步任务与临时链接。

## 17. 变更记录

- v1.0（2025-08-08）：定版 Firebase-only；去干扰完全由选择器包实现；移除“按住预览被隐藏区块”；新增导出/删除规范；全文不含实现代码。