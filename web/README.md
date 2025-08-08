ADHD 学习辅助 - 网站端 (Next.js + Tailwind + Firebase)

运行步骤

1. 在 `web/` 下创建 `.env.local` 并填入 Firebase Web SDK 配置：

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

2. 安装依赖并启动：

```
pnpm i # 或 npm i / yarn
pnpm dev
```

信息架构（docs 2.2）

- /dashboard：本周番茄个数、专注分钟、近期学习视频。
- /sessions：会话列表（筛选：日期、UP、课程）。
- /settings：账号、默认番茄配置、白名单域、导出/删除操作（调用 Functions）。

安全与数据：

- 使用 Firebase Auth（客户端）。
- Firestore 直接读取用户命名空间数据（仅示例查询）。
- 敏感/聚合统计走 Cloud Functions（占位接口）。


