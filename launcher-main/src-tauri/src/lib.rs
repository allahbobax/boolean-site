mod minecraft;
mod auth;
mod client_installer;

use std::sync::Mutex;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  // Создаем builder с обработкой ошибок
  let result = tauri::Builder::default()
    .plugin(tauri_plugin_log::Builder::default()
        .level(log::LevelFilter::Info)
        .build())
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_http::init())
    .plugin(tauri_plugin_process::init())
    .manage(auth::AuthState {
        server_stop_tx: Mutex::new(None),
    })
    .setup(|app| {
      log::info!("Boolean Launcher setup started");
      
      // Проверяем, что все пути доступны
      if let Ok(app_dir) = app.path().app_data_dir() {
        log::info!("App data dir: {:?}", app_dir);
      } else {
        log::error!("Failed to get app data dir");
      }
      
      log::info!("Boolean Launcher initialized successfully");
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
        minecraft::launch_minecraft,
        minecraft::get_launch_dir,
        minecraft::open_launch_folder,
        minecraft::open_folder_path,
        minecraft::check_mods_installed,
        minecraft::check_client_updates,
        minecraft::install_mods,
        minecraft::install_and_launch,
        minecraft::get_client_dirs,
        minecraft::list_mods_folder,
        minecraft::wipe_client_data,
        minecraft::check_java_status,
        minecraft::install_java,
        auth::start_oauth_server,
        auth::stop_oauth_server,
        auth::get_hwid
    ])
    .run(tauri::generate_context!());
    
  if let Err(_e) = result {
    std::process::exit(1);
  }
}
