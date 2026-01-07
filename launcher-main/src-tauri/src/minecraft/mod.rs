mod classpath;
mod commands;
mod launcher;
mod options;
mod process;
mod types;
mod version;



use tauri::{AppHandle, Runtime};

#[tauri::command]
pub async fn launch_minecraft<R: Runtime>(
    app: AppHandle<R>,
    options: types::LaunchOptions,
) -> Result<serde_json::Value, String> {
    commands::launch_minecraft(app, options).await
}

#[tauri::command]
pub async fn get_launch_dir<R: Runtime>(app: AppHandle<R>) -> Result<String, String> {
    commands::get_launch_dir(app).await
}

#[tauri::command]
pub async fn open_launch_folder<R: Runtime>(app: AppHandle<R>) -> Result<(), String> {
    commands::open_launch_folder(app).await
}

#[tauri::command]
pub async fn open_folder_path(path: String) -> Result<(), String> {
    commands::open_folder_path(path).await
}

#[tauri::command]
pub async fn check_mods_installed<R: Runtime>(
    app: AppHandle<R>,
) -> Result<serde_json::Value, String> {
    commands::check_mods_installed(app).await
}

#[tauri::command]
pub async fn check_client_updates<R: Runtime>(
    app: AppHandle<R>,
    user_id: Option<i32>,
) -> Result<serde_json::Value, String> {
    commands::check_client_updates(app, user_id).await
}

#[tauri::command]
pub async fn install_mods<R: Runtime>(
    app: AppHandle<R>,
    user_id: Option<i32>,
) -> Result<serde_json::Value, String> {
    commands::install_mods(app, user_id).await
}

#[tauri::command]
pub async fn install_and_launch<R: Runtime>(
    app: AppHandle<R>,
    user_id: Option<i32>,
    options: types::LaunchOptions,
) -> Result<serde_json::Value, String> {
    commands::install_and_launch(app, user_id, options).await
}

#[tauri::command]
pub async fn get_client_dirs<R: Runtime>(app: AppHandle<R>) -> Result<serde_json::Value, String> {
    commands::get_client_dirs(app).await
}

#[tauri::command]
pub async fn list_mods_folder<R: Runtime>(
    app: AppHandle<R>,
) -> Result<serde_json::Value, String> {
    commands::list_mods_folder(app).await
}

#[tauri::command]
pub async fn wipe_client_data<R: Runtime>(app: AppHandle<R>) -> Result<serde_json::Value, String> {
    commands::wipe_client_data(app).await
}

#[tauri::command]
pub async fn check_java_status<R: Runtime>(app: AppHandle<R>) -> Result<serde_json::Value, String> {
    commands::check_java_status(app).await
}

#[tauri::command]
pub async fn install_java<R: Runtime>(app: AppHandle<R>) -> Result<serde_json::Value, String> {
    commands::install_java(app).await
}
