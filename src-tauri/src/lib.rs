pub mod cli;

use crate::cli::Cli;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager,
};

const TRAY_ID: &str = "main-tray";
const TRAY_STATUS_ID: &str = "task-status";
const TRAY_QUIT_ID: &str = "quit";

fn set_tray_tooltip(app: &AppHandle, status: &str) -> Result<(), String> {
    let tray = app
        .tray_by_id(TRAY_ID)
        .ok_or_else(|| "系统托盘未初始化".to_string())?;

    let status_item = MenuItem::with_id(
        app,
        TRAY_STATUS_ID,
        format!("状态：{}", status),
        false,
        None::<&str>,
    )
    .map_err(|error| error.to_string())?;
    let quit_item = MenuItem::with_id(app, TRAY_QUIT_ID, "退出", true, None::<&str>)
        .map_err(|error| error.to_string())?;
    let menu =
        Menu::with_items(app, &[&status_item, &quit_item]).map_err(|error| error.to_string())?;

    tray.set_menu(Some(menu))
        .map_err(|error| error.to_string())?;
    tray.set_tooltip(Some(format!("Train Helper - {}", status)))
        .map_err(|error| error.to_string())
}

#[tauri::command]
fn window_minimize(window: tauri::Window) -> Result<(), String> {
    window.minimize().map_err(|error| error.to_string())
}

#[tauri::command]
fn window_toggle_maximize(window: tauri::Window) -> Result<(), String> {
    if window.is_maximized().map_err(|error| error.to_string())? {
        window.unmaximize().map_err(|error| error.to_string())
    } else {
        window.maximize().map_err(|error| error.to_string())
    }
}

#[tauri::command]
fn window_close(window: tauri::Window) -> Result<(), String> {
    window.close().map_err(|error| error.to_string())
}

#[tauri::command]
fn update_tray_status(app: AppHandle, status: String) -> Result<(), String> {
    set_tray_tooltip(&app, &status)
}

/// 将 CLI 参数序列化为扁平的 JSON 字符串传给前端。
/// 不使用 serde 默认的嵌套 enum 表示，而是手动展开为前端友好的格式。
#[tauri::command]
fn get_cli_args(state: tauri::State<'_, CliState>) -> Result<String, String> {
    let cli = state.cli.as_ref().ok_or("CLI state unavailable")?;
    match &cli.command {
        Some(crate::cli::Commands::Query {
            from,
            to,
            date,
            student,
            gd,
            json,
        }) => {
            let flat = serde_json::json!({
                "command": "Query",
                "from": from,
                "to": to,
                "date": date,
                "student": student,
                "gd": gd,
                "json": json,
            });
            Ok(flat.to_string())
        }
        None => Ok("{}".to_string()),
    }
}

/// 前端调用此命令将查询结果输出到 stdout 并退出进程
#[tauri::command]
fn cli_print_and_exit(app: AppHandle, output: String) -> Result<(), String> {
    println!("{}", output);
    app.exit(0);
    Ok(())
}

/// 持有 CLI 参数的状态，供前端通过 get_cli_args 命令读取
struct CliState {
    cli: Option<Cli>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run(cli: Cli) {
    let is_cli_mode = cli.command.is_some();

    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .manage(CliState { cli: Some(cli) })
        .setup(move |app| {
            app.handle().plugin(tauri_plugin_http::init())?;

            if is_cli_mode {
                // --- CLI 模式：窗口默认 invisible，无需额外操作；不创建系统托盘 ---
            } else {
                // --- GUI 模式：显示窗口，创建系统托盘 ---
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                }
                let status_item =
                    MenuItem::with_id(app, TRAY_STATUS_ID, "状态：空闲", false, None::<&str>)?;
                let quit_item =
                    MenuItem::with_id(app, TRAY_QUIT_ID, "退出", true, None::<&str>)?;
                let menu = Menu::with_items(app, &[&status_item, &quit_item])?;

                TrayIconBuilder::with_id(TRAY_ID)
                    .tooltip("Train Helper")
                    .icon(app.default_window_icon().unwrap().clone())
                    .menu(&menu)
                    .show_menu_on_left_click(false)
                    .on_menu_event(|app, event| {
                        if event.id().as_ref() == TRAY_QUIT_ID {
                            app.exit(0);
                        }
                    })
                    .on_tray_icon_event(|tray, event| {
                        if let TrayIconEvent::Click {
                            button: MouseButton::Left,
                            button_state: MouseButtonState::Up,
                            ..
                        } = event
                        {
                            let app = tray.app_handle();
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                    })
                    .build(app)?;
            }

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            window_minimize,
            window_toggle_maximize,
            window_close,
            update_tray_status,
            get_cli_args,
            cli_print_and_exit,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
