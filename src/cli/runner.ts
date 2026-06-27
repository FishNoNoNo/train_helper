/**
 * CLI 模式执行器
 *
 * 在 Vue 应用挂载之前运行，检测 CLI 参数并执行对应命令。
 * 如果是 GUI 模式（无 CLI 参数），返回 false 让主流程继续启动 Vue 应用。
 *
 * 扩展方式：在 `matchCommand()` 中添加新的 case 分支即可。
 *
 * TODO: CLI 命令待实现列表
 * - book     提交抢票订单 (复用 AppService.bookTicket / bookTicketBatch)
 * - status   查询订单状态 (复用 AppService.queryOrderWaitTime)
 * - passenger 管理乘客列表 (复用 AppService.passengerManager)
 */

import { invoke } from '@tauri-apps/api/core'
import { AppService } from '@/service/app.service'
import type { Shift } from '@/types/train.d'

// ---------------------------------------------------------------------------
// CLI 参数类型（与 Rust 侧 cli.rs 的 Commands enum 序列化格式对齐）
// ---------------------------------------------------------------------------

interface CliArgs {
  command: 'Query' | null
  from?: string
  to?: string
  date?: string
  student?: boolean
  gd?: boolean
  json?: boolean
}

// ---------------------------------------------------------------------------
// 入口
// ---------------------------------------------------------------------------

/**
 * 尝试以 CLI 模式运行。如果成功（有 CLI 命令），处理完后进程会退出。
 * @returns true 表示 CLI 模式已处理（调用者应停止继续启动 GUI）
 */
export async function tryRunCli(): Promise<boolean> {
  let args: CliArgs

  try {
    const raw = await invoke<string>('get_cli_args')
    if (!raw) return false
    args = JSON.parse(raw)
  } catch {
    // get_cli_args 不可用或解析失败 → GUI 模式
    return false
  }

  if (!args.command) return false

  try {
    await handleCommand(args)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    await invoke('cli_print_and_exit', { output: `[ERROR] ${message}` })
  }

  return true
}

// ---------------------------------------------------------------------------
// 命令路由
// ---------------------------------------------------------------------------

async function handleCommand(args: CliArgs): Promise<void> {
  switch (args.command) {
    case 'Query':
      await runQuery(args)
      break
    // TODO: case 'Book':     return runBook(args)
    // TODO: case 'Status':   return runStatus(args)
    // TODO: case 'Passenger': return runPassenger(args)
    default:
      throw new Error(`未知命令: ${args.command}`)
  }
}

// ---------------------------------------------------------------------------
// query — 查询车票
// ---------------------------------------------------------------------------

async function runQuery(args: CliArgs): Promise<void> {
  const { from, to, date, student, gd, json } = args

  if (!from || !to || !date) {
    throw new Error('缺少必要参数: --from, --to, --date')
  }

  const svc = new AppService()

  let shifts: Shift[]
  try {
    shifts = await svc.queryTickets({ from, to, toDate: date, student, gd })
  } catch (error) {
    throw new Error(`查询失败: ${error instanceof Error ? error.message : String(error)}`)
  }

  if (!shifts || shifts.length === 0) {
    await invoke('cli_print_and_exit', { output: '没有找到符合条件的车次。' })
    return
  }

  const output = json ? JSON.stringify(shifts, null, 2) : formatShiftsTable(shifts)
  await invoke('cli_print_and_exit', { output })
}

// ---------------------------------------------------------------------------
// 格式化输出
// ---------------------------------------------------------------------------

const COLUMN_WIDTHS = {
  code: 8,
  route: 24,
  time: 6,
  date: 12,
  useTime: 7,
  secondClass: 6,
  firstClass: 6,
  hardSleeper: 6,
  softSleeper: 6,
  noSeat: 4,
  status: 6,
}

function pad(str: string, width: number): string {
  // 中文字符按 2 个字符宽度计算
  let len = 0
  for (const ch of str) {
    len += /[一-鿿　-〿＀-￯]/.test(ch) ? 2 : 1
  }
  const padding = Math.max(0, width - len)
  return str + ' '.repeat(padding)
}

function formatShiftsTable(shifts: Shift[]): string {
  const w = COLUMN_WIDTHS

  const header = [
    pad('车次', w.code),
    pad('出发 → 到达', w.route),
    pad('日期', w.date),
    pad('发时', w.time),
    pad('历时', w.useTime),
    pad('二等座', w.secondClass),
    pad('一等座', w.firstClass),
    pad('硬卧', w.hardSleeper),
    pad('软卧', w.softSleeper),
    pad('无座', w.noSeat),
    pad('状态', w.status),
  ].join(' ')

  const rows = shifts.map((s) =>
    [
      pad(s.stationTrainCode, w.code),
      pad(`${s.fromStation} → ${s.toStation}`, w.route),
      pad(s.trainDate, w.date),
      pad(s.startTime, w.time),
      pad(s.useTime, w.useTime),
      pad(s.seat.secondClass || '--', w.secondClass),
      pad(s.seat.firstClass || '--', w.firstClass),
      pad(s.seat.hardSleeper || '--', w.hardSleeper),
      pad(s.seat.softSleeper || '--', w.softSleeper),
      pad(s.seat.noSeat || '--', w.noSeat),
      pad(s.tip, w.status),
    ].join(' '),
  )

  const total = `\n共 ${shifts.length} 趟车次`

  return [header, ...rows, total].join('\n')
}
