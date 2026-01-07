use std::fs;

use tauri::{AppHandle, Manager, Runtime};

use super::launcher::MinecraftLauncher;
use super::types::{LaunchOptions, WipeResult};

pub async fn launch_minecraft<R: Runtime>(
    app: AppHandle<R>,
    options: LaunchOptions,
) -> Result<serde_json::Value, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let launcher = MinecraftLauncher::new_with_path(app_dir, options.install_path.clone());

    match launcher.launch(options, app).await {
        Ok(_) => {
            Ok(serde_json::json!({
            "success": true,
            "message": "Minecraft launch initiated"
            }))
        }
        Err(e) => {
            Ok(serde_json::json!({
            "success": false,
            "error": e.to_string()
            }))
        }
    }
}

pub async fn get_launch_dir<R: Runtime>(app: AppHandle<R>) -> Result<String, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let launcher = MinecraftLauncher::new(app_dir);
    Ok(launcher.get_launch_dir().to_string_lossy().to_string())
}

pub async fn open_launch_folder<R: Runtime>(app: AppHandle<R>) -> Result<(), String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let launcher = MinecraftLauncher::new(app_dir);
    let launch_dir = launcher.get_launch_dir();

    if !launch_dir.exists() {
        fs::create_dir_all(&launch_dir).map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "windows")]
    std::process::Command::new("explorer")
        .arg(&launch_dir)
        .spawn()
        .map_err(|e| e.to_string())?;

    #[cfg(target_os = "linux")]
    std::process::Command::new("xdg-open")
        .arg(&launch_dir)
        .spawn()
        .map_err(|e| e.to_string())?;

    Ok(())
}

pub async fn open_folder_path(path: String) -> Result<(), String> {
    let folder_path = std::path::PathBuf::from(&path);

    if !folder_path.exists() {
        fs::create_dir_all(&folder_path).map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "windows")]
    std::process::Command::new("explorer")
        .arg(&folder_path)
        .spawn()
        .map_err(|e| e.to_string())?;

    #[cfg(target_os = "linux")]
    std::process::Command::new("xdg-open")
        .arg(&folder_path)
        .spawn()
        .map_err(|e| e.to_string())?;

    Ok(())
}

pub async fn check_mods_installed<R: Runtime>(
    app: AppHandle<R>,
) -> Result<serde_json::Value, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let installer = crate::client_installer::ClientInstaller::new(app_dir);

    let installed = installer.check_mods_installed();
    let version = installer.get_installed_client_version();

    Ok(serde_json::json!({
        "installed": installed,
        "version": version
    }))
}

pub async fn check_client_updates<R: Runtime>(
    app: AppHandle<R>,
    user_id: Option<i32>,
) -> Result<serde_json::Value, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let installer = crate::client_installer::ClientInstaller::new(app_dir);

    match installer.get_latest_version(user_id).await {
        Ok(version_info) => {
            let current_version = installer.get_installed_client_version();
            let has_update = current_version.as_ref() != Some(&version_info.version);

            Ok(serde_json::json!({
                "success": true,
                "data": {
                    "version": version_info.version,
                    "hasUpdate": has_update,
                    "currentVersion": current_version,
                    "changelog": version_info.changelog
                }
            }))
        }
        Err(e) => Ok(serde_json::json!({
            "success": false,
            "error": e.to_string()
        })),
    }
}

pub async fn install_and_launch<R: Runtime>(
    app: AppHandle<R>,
    user_id: Option<i32>,
    options: LaunchOptions,
) -> Result<serde_json::Value, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let installer = crate::client_installer::ClientInstaller::new_with_path(app_dir.clone(), options.install_path.clone());

    match installer.install_all_mods(&app, user_id).await {
        Ok(_) => {
            match launch_minecraft(app, options).await {
                Ok(_) => Ok(serde_json::json!({
                    "success": true,
                    "message": "Client installed and launch initiated"
                })),
                Err(e) => Ok(serde_json::json!({
                    "success": false,
                    "error": e
                })),
            }
        }
        Err(e) => Ok(serde_json::json!({
            "success": false,
            "error": e.to_string()
        })),
    }
}

pub async fn install_mods<R: Runtime>(
    app: AppHandle<R>,
    user_id: Option<i32>,
) -> Result<serde_json::Value, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let installer = crate::client_installer::ClientInstaller::new(app_dir);

    match installer.install_all_mods(&app, user_id).await {
        Ok(_) => {
            Ok(serde_json::json!({ "success": true }))
        }
        Err(e) => Ok(serde_json::json!({
            "success": false,
            "error": e.to_string()
        })),
    }
}

pub async fn get_client_dirs<R: Runtime>(app: AppHandle<R>) -> Result<serde_json::Value, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let launcher = MinecraftLauncher::new(app_dir.clone());
    let installer = crate::client_installer::ClientInstaller::new(app_dir);

    Ok(serde_json::json!({
        "launch": launcher.get_launch_dir(),
        "mods": installer.get_mods_dir()
    }))
}

pub async fn list_mods_folder<R: Runtime>(
    app: AppHandle<R>,
) -> Result<serde_json::Value, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let installer = crate::client_installer::ClientInstaller::new(app_dir);
    let mods_dir = installer.get_mods_dir();

    let mut files = Vec::new();

    if mods_dir.exists() {
        if let Ok(entries) = fs::read_dir(mods_dir) {
            for entry in entries.flatten() {
                if let Ok(metadata) = entry.metadata() {
                    files.push(serde_json::json!({
                        "name": entry.file_name().to_string_lossy().to_string(),
                        "size": metadata.len(),
                        "is_file": metadata.is_file()
                    }));
                }
            }
        }
    }

    Ok(serde_json::json!({
        "path": mods_dir,
        "exists": mods_dir.exists(),
        "files": files
    }))
}

pub async fn wipe_client_data<R: Runtime>(app: AppHandle<R>) -> Result<serde_json::Value, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;

    let launch_dir = app_dir.join("launch");
    let temp_launch_dir = app_dir.join("temp_launch");
    let launch_zip_path = app_dir.join("launch.zip");
    let version_file = app_dir.join("client-version.txt");
    let updated_at_file = app_dir.join("client-updated-at.txt");
    
    // Также удаляем скрытую папку с JAR чита
    let hidden_client_dir = crate::client_installer::ClientInstaller::new(app_dir.clone()).get_hidden_client_dir_path().to_path_buf();

    let mut deleted: Vec<String> = Vec::new();
    let mut errors: Vec<String> = Vec::new();

    let remove_dir = |path: &std::path::Path,
                      deleted: &mut Vec<String>,
                      errors: &mut Vec<String>| {
        if path.exists() {
            match fs::remove_dir_all(path) {
                Ok(_) => deleted.push(path.to_string_lossy().to_string()),
                Err(e) => errors.push(format!(
                    "Failed to remove directory {}: {}",
                    path.to_string_lossy(),
                    e
                )),
            }
        }
    };

    let remove_file = |path: &std::path::Path,
                       deleted: &mut Vec<String>,
                       errors: &mut Vec<String>| {
        if path.exists() {
            match fs::remove_file(path) {
                Ok(_) => deleted.push(path.to_string_lossy().to_string()),
                Err(e) => errors.push(format!(
                    "Failed to remove file {}: {}",
                    path.to_string_lossy(),
                    e
                )),
            }
        }
    };

    remove_dir(&launch_dir, &mut deleted, &mut errors);
    remove_dir(&temp_launch_dir, &mut deleted, &mut errors);
    remove_dir(&hidden_client_dir, &mut deleted, &mut errors);
    remove_file(&launch_zip_path, &mut deleted, &mut errors);
    remove_file(&version_file, &mut deleted, &mut errors);
    remove_file(&updated_at_file, &mut deleted, &mut errors);

    let result = WipeResult {
        success: errors.is_empty(),
        deleted,
        errors,
    };

    Ok(serde_json::to_value(result).map_err(|e| e.to_string())?)
}

pub async fn check_java_status<R: Runtime>(app: AppHandle<R>) -> Result<serde_json::Value, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let installer = crate::client_installer::ClientInstaller::new(app_dir);

    let is_installed = installer.is_java_installed();
    let version = installer.get_installed_java_version();
    let java_path = if is_installed {
        Some(installer.get_java_executable().to_string_lossy().to_string())
    } else {
        None
    };

    // Также проверяем системную Java
    let system_java = crate::client_installer::ClientInstaller::check_system_java();

    Ok(serde_json::json!({
        "installed": is_installed || system_java.is_some(),
        "version": version,
        "path": java_path,
        "systemJava": system_java
    }))
}

pub async fn install_java<R: Runtime>(app: AppHandle<R>) -> Result<serde_json::Value, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let installer = crate::client_installer::ClientInstaller::new(app_dir);

    match installer.ensure_java_installed(&app).await {
        Ok(java_path) => Ok(serde_json::json!({
            "success": true,
            "path": java_path
        })),
        Err(e) => Ok(serde_json::json!({
            "success": false,
            "error": e.to_string()
        })),
    }
}
