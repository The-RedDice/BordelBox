// Cacabox — Tauri backend
// Click-through dynamique via WS_EX_TRANSPARENT + WS_EX_LAYERED (Windows)

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager, WebviewWindow};

#[cfg(target_os = "windows")]
mod win_clickthrough {
    use windows::Win32::Foundation::HWND;
    use windows::Win32::UI::WindowsAndMessaging::{
        GetWindowLongPtrW, SetWindowLongPtrW,
        GWL_EXSTYLE, WS_EX_LAYERED, WS_EX_TRANSPARENT,
    };

    pub fn enable(hwnd: isize) {
        unsafe {
            let hwnd = HWND(hwnd as *mut _);
            let ex = GetWindowLongPtrW(hwnd, GWL_EXSTYLE);
            SetWindowLongPtrW(
                hwnd,
                GWL_EXSTYLE,
                ex | WS_EX_LAYERED.0 as isize | WS_EX_TRANSPARENT.0 as isize,
            );
        }
    }

    pub fn disable(hwnd: isize) {
        unsafe {
            let hwnd = HWND(hwnd as *mut _);
            let ex = GetWindowLongPtrW(hwnd, GWL_EXSTYLE);
            SetWindowLongPtrW(
                hwnd,
                GWL_EXSTYLE,
                ex & !(WS_EX_TRANSPARENT.0 as isize),
            );
        }
    }
}

#[tauri::command]
fn set_clickthrough(window: WebviewWindow, enabled: bool) {
    #[cfg(target_os = "windows")]
    {
        use raw_window_handle::HasWindowHandle;
        use raw_window_handle::RawWindowHandle;

        if let Ok(handle) = window.window_handle() {
            if let RawWindowHandle::Win32(h) = handle.as_raw() {
                let hwnd = h.hwnd.get() as isize;
                if enabled {
                    win_clickthrough::enable(hwnd);
                } else {
                    win_clickthrough::disable(hwnd);
                }
            }
        }
    }

    #[cfg(not(target_os = "windows"))]
    let _ = (window, enabled);
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![set_clickthrough])
        .setup(|app| {
            let window = app.get_webview_window("overlay").unwrap();

            #[cfg(target_os = "windows")]
            {
                let w = window.clone();
                std::thread::spawn(move || {
                    std::thread::sleep(std::time::Duration::from_millis(200));
                    set_clickthrough(w, true);
                });
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Erreur lors du lancement de Cacabox");
}
