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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            app.handle().plugin(tauri_plugin_http::init())?;

            let status_item =
                MenuItem::with_id(app, TRAY_STATUS_ID, "状态：空闲", false, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, TRAY_QUIT_ID, "退出", true, None::<&str>)?;
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

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            window_minimize,
            window_toggle_maximize,
            window_close,
            update_tray_status
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
