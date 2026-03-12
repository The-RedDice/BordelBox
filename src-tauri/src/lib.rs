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

    /// Rend la fenêtre complètement click-through.
    pub fn enable(hwnd: isize) {
        unsafe {
            let hwnd = HWND(hwnd as *mut _);
            let ex   = GetWindowLongPtrW(hwnd, GWL_EXSTYLE);
            SetWindowLongPtrW(
                hwnd,
                GWL_EXSTYLE,
                ex | WS_EX_LAYERED.0 as isize | WS_EX_TRANSPARENT.0 as isize,
            );
        }
    }

    /// Réactive les clics sur la fenêtre (ex: si on veut l'interactivité temporaire).
    pub fn disable(hwnd: isize) {
        unsafe {
            let hwnd = HWND(hwnd as *mut _);
            let ex   = GetWindowLongPtrW(hwnd, GWL_EXSTYLE);
            SetWindowLongPtrW(
                hwnd,
                GWL_EXSTYLE,
                ex & !(WS_EX_TRANSPARENT.0 as isize),
            );
        }
    }
}

/// Commande Tauri exposée au JS — active le click-through
#[tauri::command]
fn set_clickthrough(window: WebviewWindow, enabled: bool) {
    #[cfg(target_os = "windows")]
    {
        use tauri::raw_window_handle::{HasWindowHandle, RawWindowHandle};
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
    {
        // Linux/macOS : pas de click-through natif via Tauri 2
        // L'overlay reste fonctionnel mais recevra les clics
        let _ = (window, enabled);
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![set_clickthrough])
        .setup(|app| {
            let window = app.get_webview_window("overlay").unwrap();

            // Positionner sur tout l'écran principal
            // La fenêtre est déjà configurée 1920x1080 dans tauri.conf.json
            // Pour multi-monitor, adapter ici

            // Appliquer le click-through dès le démarrage
            #[cfg(target_os = "windows")]
            {
                // Petit délai pour que la fenêtre soit bien créée
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
