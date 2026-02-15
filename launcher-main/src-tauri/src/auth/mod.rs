mod oauth;
mod hwid;
mod templates;

pub use oauth::AuthState;

use tauri::{AppHandle, Runtime, State};

#[tauri::command]
pub async fn start_oauth_server<R: Runtime>(
    app: AppHandle<R>,
    state: State<'_, AuthState>,
) -> Result<serde_json::Value, String> {
    oauth::start_oauth_server(app, state).await
}

#[tauri::command]
pub async fn stop_oauth_server(state: State<'_, AuthState>) -> Result<serde_json::Value, String> {
    oauth::stop_oauth_server(state).await
}

#[tauri::command]
pub async fn get_hwid() -> Result<String, String> {
    hwid::get_hwid().await
}
