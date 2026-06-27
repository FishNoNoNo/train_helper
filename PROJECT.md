# Train Helper — 12306 火车票抢票助手

## 项目概述

Train Helper 是一款基于 **Tauri v2 + Vue 3** 构建的桌面端 12306 火车票抢票工具。它将常规的购票流程压缩为更高效的批量抢票流程：**查询车次 → 选择候选班次（购物车）→ 配置乘客 → 并发提交订单 → 等待出票结果**。支持同时选择多个候选车次进行"赛跑式"抢票，先成功的订单胜出。同时支持 **CLI 命令行模式**，无需打开 GUI 即可在终端中查询车票。

> **注意**：本项目不绕过 12306 的安全机制，支付环节需要用户在 12306 官方 App 中完成。

- **CLI 命令行模式** — 在终端直接查询车票，支持表格 / JSON 输出

## 技术栈

| 层次 | 技术 | 版本 |
|------|------|------|
| 桌面框架 | **Tauri v2** (Rust) | 2.x |
| 前端框架 | **Vue 3** (Composition API + `<script setup>`) | 3.5.13 |
| 状态管理 | **Pinia** | 3.0.4 |
| 路由 | **Vue Router** (hash 模式) | 5.0.4 |
| CSS | **Tailwind CSS** | 3.4.19 |
| 构建工具 | **Vite** | 6.0.3 |
| 前端语言 | **TypeScript** (strict) | 5.6.2 |
| 后端语言 | **Rust** (edition 2021) | — |
| 图标库 | **Lucide Vue Next** | 0.577.0 |
| 代码检查 | **ESLint** + **Prettier** | 10.2.0 / 3.8.1 |
| SCSS | **sass-embedded** | 1.98.0 |
| Tauri 插件 | http, notification, opener | 2.x |

## 项目结构

```
train_helper/
├── index.html                          # Vite HTML 入口，挂载 <div id="app">
├── package.json                        # Node.js 依赖与脚本
├── vite.config.ts                      # Vite 配置 (端口 1420, Tauri 专用设置)
├── tsconfig.json                       # TypeScript 配置 (strict, 路径别名 @/ → src/)
├── tsconfig.node.json                  # vite.config.ts 的 TypeScript 配置
├── tailwind.config.js                  # Tailwind CSS 配置
├── postcss.config.js                   # PostCSS 配置 (tailwind + autoprefixer)
├── eslint.config.ts                    # ESLint flat 配置 (Vue + TS 规则)
├── .prettierrc.json                    # Prettier 配置 (无分号, 单引号)
├── .editorconfig                       # 编辑器设置 (2空格缩进, UTF-8, LF)
├── README.md                           # 中文 README
├── api.md                              # 12306 API 接口文档 (16 个接口)
├── app-icon.png                        # 应用图标
├── 12306.postman_collection.json       # Postman 调试集合
│
├── public/
│   └── app-icon.svg                    # SVG 应用图标 (火车剪影)
│
├── src/                                # ---------- 前端源码 ----------
│   ├── cli/
│   │   └── runner.ts                   # CLI 模式执行器: 检测 CLI 命令并调度执行
│   ├── main.ts                         # 应用入口: 创建 Vue 应用, 注册 Router/Pinia, 挂载 #app
│   ├── App.vue                         # 根组件, 包裹 IndexView
│   ├── vite-env.d.ts                   # Vite 客户端类型声明
│   │
│   ├── assets/
│   │   └── index.css                   # Tailwind 指令 + 全局重置样式
│   │
│   ├── router/
│   │   └── index.ts                    # Vue Router (hash history), 路由: / → /home, /login
│   │
│   ├── store/
│   │   ├── index.ts                    # Pinia 实例创建
│   │   ├── userStore.ts                # 用户状态: userName, setUser/removeUser
│   │   └── dataStore.ts                # 数据状态: bookingShift (当前正在抢票的车次)
│   │
│   ├── types/
│   │   ├── global.d.ts                 # 全局类型扩展 (window.ticketInfo)
│   │   └── train.d.ts                  # Shift / Seat 等 TypeScript 接口定义
│   │
│   ├── data/
│   │   └── station.ts                  # 火车站数据库: 站名 → {code, threeCode, pinyin, city, ...}
│   │
│   ├── hook/
│   │   └── eventHandler.ts             # 事件总线处理器: 连接 eventBus 与 store
│   │
│   ├── service/
│   │   ├── app.service.ts              # 🔴 核心: 全部 12306 API 调用 + 抢票编排逻辑 (~950 行)
│   │   ├── train.service.ts            # 车次服务: 站名→代码查找, 搜索结果解析
│   │   ├── passenger.service.ts        # 乘客管理: 乘客 CRUD + Ticket 类 (移植自 12306 官方 JS)
│   │   ├── station.service.ts          # 车站服务 (预留)
│   │   └── notification.service.ts     # 桌面通知封装 (Tauri notification 插件)
│   │
│   ├── utils/
│   │   ├── request.ts                  # HttpClient: 基于 Tauri fetch 的 HTTP 客户端
│   │   ├── cookieJar.ts               # CookieJar: 手动 Cookie 管理 + localStorage 持久化
│   │   ├── parse.ts                    # 解析工具: 从文本提取 JS 对象, 解析中文日期时间
│   │   ├── time.ts                     # 时间工具: getTimestamp, waitUntil, waitUntilWithTimeout
│   │   └── opener.ts                   # URL/文件打开包装 (Tauri opener 插件)
│   │
│   ├── lib/utils/                      # 可复用工具库
│   │   ├── base64.ts                   # Base64 图像转换器
│   │   ├── clipboard.ts               # 剪贴板写入 (含降级方案)
│   │   ├── cookie.ts                   # 浏览器 Cookie 辅助函数
│   │   ├── eventBus.ts                # EventEmitter (on/off/emit/once) 事件总线
│   │   ├── lodash.ts                   # debounce / throttle 实现
│   │   ├── string.ts                   # camelCase / snake_case 转换
│   │   ├── time.ts                     # formatTime / formatTimeAgo / today
│   │   ├── useTheme.ts                # 暗色/亮色主题 Composable
│   │   ├── watermark.ts               # Canvas 水印背景生成器
│   │   └── ...                         # 其他工具 (css, device, file, hook, list)
│   │
│   ├── components/
│   │   ├── WindowFrame.vue             # 自定义窗口标题栏 (最小化/最大化/关闭, 调用 Tauri invoke)
│   │   └── social/
│   │       └── Github.vue              # GitHub 链接按钮
│   │
│   └── views/
│       ├── IndexView.vue               # 根视图: 初始化事件处理器, 清理存储, 调用 init()
│       ├── login/
│       │   └── IndexView.vue           # 二维码登录页: 生成二维码, 轮询状态, 完成登录
│       └── home/
│           ├── IndexView.vue           # 主页面: 多步骤流程容器 (搜索 → 结果 → 乘客 → 抢票)
│           └── components/
│               ├── SearchPage.vue      # 搜索表单: 出发/到达站自动补全, 日期选择
│               ├── ShiftInfo.vue       # 搜索结果: 按席别筛选, 购物车管理, 提交抢票
│               ├── PassengerInfo.vue   # 乘客配置: 选择乘客, 席别, 票种, 座位偏好
│               └── BookingResult.vue   # 抢票结果: 等待中/成功/失败三种状态
│
└── src-tauri/                          # ---------- Tauri 后端 (Rust) ----------
    ├── Cargo.toml                      # Rust 依赖: tauri v2, clap, tauri-plugin-http, notification, opener
    ├── build.rs                        # Tauri 构建脚本
    ├── tauri.conf.json                 # Tauri 配置: 窗口 1080×800, 无边框, 开发/构建命令, 图标
    ├── icons/                          # 各平台图标 (Windows, macOS, iOS, Android)
    └── src/
        ├── main.rs                     # Rust 入口: 解析 CLI, 附加控制台, 调用 lib::run()
        ├── lib.rs                      # Tauri 应用构建: 双模式 (GUI 托盘 / CLI headless), 窗口命令, 插件注册
        └── cli.rs                      # CLI 参数定义 (clap): query 子命令及参数
```

## 核心模块详解

### 1. `src/service/app.service.ts` — 核心业务逻辑 (~950 行)

整个应用的"大脑"，包含 `AppService` 类和导出的抢票函数：

**认证相关方法：**
- `loginConfig()` — 获取登录配置
- `createQrcode()` / `checkQr()` — 创建二维码 / 轮询扫码状态
- `userLogin()` / `authUamtk()` / `uamauthclient()` — 完成登录授权链

**查询相关方法：**
- `queryTickets()` — 查询车次（含站点 Cookie 管理）
- `getPassengers()` — 获取乘客列表

**下单流水线方法：**
- `submitOrderRequest()` — 提交订单请求
- `initDc()` — 初始化订单上下文
- `checkOrderInfo()` — 验证订单信息
- `getQueueCount()` — 获取排队人数
- `confirmSingleForQueue()` — 确认进入排队
- `queryOrderWaitTime()` — 轮询排队等待时间

**抢票编排函数：**
- `bookTicket()` — 单车次抢票（含重试逻辑）
- `bookTicketBatch()` — **多车次并发抢票**：使用 `raceSuccess()` 并发提交所有候选车次，先成功的订单胜出
- `runBookTicketOnce()` — 执行完整下单流水线
- `waitToSubmitOrder()` — 处理"起售"状态：计算起售时间，等待至可购

### 2. `src/service/passenger.service.ts` — 乘客管理

包含 `PassengerManager` 类和从 12306 官方 JavaScript **移植**的 `Ticket` 类：

- 存储乘客列表、已选乘客 (`limitTickets`)、票种配置、座位偏好
- 构建 `passengerTicketStr` 和 `oldPassengerStr` —— 12306 `checkOrderInfo` 和 `confirmSingleForQueue` 接口所需的关键编码字符串
- `Ticket` 类封装了年龄计算、票种判定、席别排序等 12306 核心逻辑

### 3. `src/service/train.service.ts` — 车次服务

- `nameToCode()` — 从站点数据库查找三字码
- `parseSearchResult()` — 将 12306 管道分隔的查询结果解析为类型化 `Shift[]` 对象

### 4. `src/utils/request.ts` — HTTP 客户端

基于 `@tauri-apps/plugin-http` 的自定义 HTTP 客户端：

- 支持 GET / POST (form-urlencoded, JSON, multipart) / PUT / DELETE
- 从 `CookieJar` 自动注入 Cookie
- `raceSuccess<T>()` — Promise.race 变体，首个成功即返回（用于批量抢票）

### 5. `src/utils/cookieJar.ts` — Cookie 管理

由于 Tauri 的 HTTP 插件不支持跨域自动 Cookie 处理，项目实现了完整的手动 Cookie 管理：

- 将 Cookie 持久化到 `localStorage` 的 `"cookie_jar"` 键
- 解析 `Set-Cookie` 响应头
- 按 domain/path/secure 匹配 Cookie 用于特定 URL

### 6. Vue 视图组件

| 组件 | 职责 |
|------|------|
| `login/IndexView.vue` | 二维码登录：生成 → 待扫描 → 已扫码 → 已登录 / 已过期，每秒轮询 |
| `home/IndexView.vue` | 4 步流程容器 (`search` → `results` → `passengers` → `bookingResult`)，协调子组件并调用 `bookTicketBatch` |
| `SearchPage.vue` | 双自动补全下拉框（按名称/拼音/城市/代码筛选），日期选择器，记住上次搜索 |
| `ShiftInfo.vue` | 可筛选车次列表，购物车侧边栏，批量提交 |
| `PassengerInfo.vue` | 乘客选择，每人独立席别/票种配置，交互式座位选择网格 |
| `BookingResult.vue` | 三态结果显示（等待中 + 倒计时 / 成功 + 订单号 / 失败 + 重试/取消） |

## CLI 架构

CLI 模式通过 **Tauri Headless 模式** 实现，在不显示窗口的情况下复用全部 TypeScript 业务代码。

```
用户执行: train_helper query --from 北京 --to 上海 --date 2026-07-01
                │
                ▼
┌──────────────────────────────────────────┐
│  Rust main.rs                            │
│  - clap 解析参数 → Cli { Query { ... } } │
│  - 附加到父进程控制台 (AttachConsole)      │
└──────────────┬───────────────────────────┘
               ▼
┌──────────────────────────────────────────┐
│  Rust lib.rs (Tauri Builder)             │
│  - CLI 模式: 不创建托盘, 隐藏窗口         │
│  - 注册 get_cli_args / cli_print_and_exit │
└──────────────┬───────────────────────────┘
               ▼
┌──────────────────────────────────────────┐
│  src/cli/runner.ts                       │
│  - invoke('get_cli_args') 获取参数        │
│  - new AppService().queryTickets()       │
│  - 格式化表格 / JSON                      │
│  - invoke('cli_print_and_exit', output)  │
└──────────────────────────────────────────┘
               │
               ▼
          stdout: 查询结果
```

**新增 CLI 命令流程：** 在 `cli.rs` 的 `Commands` enum 添加变体 → 在 `runner.ts` 的 `handleCommand()` 添加 `case` 分支 → 复用 `AppService` 方法。

**TODO 待实现：**
- `book` — 命令行抢票
- `status` — 订单状态查询
- `passenger` — 乘客管理

## 架构设计要点

1. **手动 Cookie 管理** — Tauri HTTP 插件不支持跨域自动 Cookie，项目实现了完整 `CookieJar`，持久化到 localStorage，手动注入请求头

2. **赛跑式批量抢票** — `bookTicketBatch()` 使用 `raceSuccess()` 并发提交所有候选车次，首个 `submitOrderRequest` 成功者进入完整下单流水线，其余被取消

3. **12306 前端逻辑移植** — `Ticket` 类直接移植自 12306 官方 JavaScript，保持字段命名、年龄计算、票种判定算法与原版一致

4. **无边框窗口** — 使用 `decorations: false` 并自绘标题栏 (`WindowFrame.vue`)，通过 `invoke()` 调用 Rust 命令控制窗口

5. **系统托盘集成** — Rust 后端维护系统托盘图标，工具提示实时反映抢票状态（如"抢票中, 已等待 30 秒"）

6. **会话恢复抢票** — 退出登录前将已选车次存入 `sessionStorage`，重新登录后恢复并继续抢票流程 (`restorePendingBooking()`)

7. **起售时间处理** — 检测标记"起售"的车次，计算精确起售时间，轮询等待至可购状态

## 配置说明

| 配置项 | 值 | 说明 |
|--------|-----|------|
| 开发服务器端口 | 1420 | Vite dev server |
| HMR 端口 | 1421 | 热更新 WebSocket |
| 窗口尺寸 | 1080 × 800 | resizable, frameless |
| 应用标识 | `cn.ew-flow.train-helper` | Tauri bundle identifier |
| TypeScript 目标 | ES2020 | — |
| 模块解析 | bundler | — |
| 缩进 | 2 空格 | — |
| 行尾 | LF | — |

## 构建与运行

### 开发环境

```bash
# 安装依赖
npm install

# 启动 Tauri 开发模式 (Vite + Tauri 窗口)
npm run tauri dev

# 仅启动前端 (浏览器开发, 无 Tauri)
npm run dev
```

### 生产构建

```bash
npm run tauri build
```

该命令先通过 `vue-tsc --noEmit && vite build` 构建前端，再由 Tauri 编译 Rust 后端并打包安装程序。

### 代码检查

```bash
npm run lint          # ESLint 检查
npm run prettier      # Prettier 格式化检查
```

## Git 历史

| 提交 | 说明 |
|------|------|
| `b9304e3` | Mod: 修改配置信息 |
| `e4f3ed4` | Feat: 增加打开浏览器的功能 |
| `aecbff9` | Mod: 修改应用图标 |
| `6faa12d` | Fin: 基本功能完成 |
| `ba22686` | init |

单分支 `main`，项目处于早期阶段，基本功能已完成。

## 接口文档

详细的 12306 API 接口文档见 [api.md](api.md)，包含 16 个接口的请求/响应格式。Postman 调试集合见 [12306.postman_collection.json](12306.postman_collection.json)。
