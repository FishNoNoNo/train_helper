// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use clap::Parser;
use train_helper_lib::cli::Cli;

fn main() {
    let cli = Cli::parse();

    // CLI 模式下附加到父进程控制台，使 println! 能正常输出
    if cli.command.is_some() {
        attach_to_parent_console();
    }

    train_helper_lib::run(cli)
}

/// 在 Windows 上将当前进程附加到父进程的控制台（如果存在），
/// 否则分配一个新的控制台窗口。
/// 这使得 CLI 模式下的 stdout 输出对用户可见。
#[cfg(target_os = "windows")]
fn attach_to_parent_console() {
    extern "system" {
        fn AttachConsole(dwProcessId: u32) -> i32;
        fn AllocConsole() -> i32;
    }

    const ATTACH_PARENT_PROCESS: u32 = u32::MAX;

    unsafe {
        // 尝试附加到父进程控制台（从 cmd/pwsh 启动时）
        if AttachConsole(ATTACH_PARENT_PROCESS) == 0 {
            // 父进程没有控制台，分配一个新的
            AllocConsole();
        }
    }
}

#[cfg(not(target_os = "windows"))]
fn attach_to_parent_console() {
    // Unix 系统上 stdout 默认可用，无需额外操作
}
