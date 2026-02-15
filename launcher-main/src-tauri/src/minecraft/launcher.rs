use std::fs;
use std::path::PathBuf;

use tauri::{AppHandle, Emitter, Runtime};

use super::options::fix_gui_scale;
use super::process::{
    build_java_command, emit_launch_progress, emit_launch_success, emit_pre_launch,
    spawn_and_monitor, JavaLaunchParams,
};
use super::types::{LaunchOptions, LogEvent, ProgressEvent};
use super::version::{find_installed_version_id, load_effective_version_json};
use crate::client_installer::ClientInstaller;

pub struct MinecraftLauncher {
    base_dir: PathBuf,
    launch_dir: PathBuf,
}

impl MinecraftLauncher {
    pub fn new(app_dir: PathBuf) -> Self {
        let launch_dir = app_dir.join("launch");

        Self {
            base_dir: app_dir,
            launch_dir,
        }
    }
    
    /// Создаёт лаунчер с путём из настроек пользователя
    pub fn new_with_path(app_dir: PathBuf, user_install_path: Option<String>) -> Self {
        let user_dir = match user_install_path {
            Some(path) if !path.is_empty() => PathBuf::from(path),
            _ => app_dir.clone(),
        };
        
        let launch_dir = user_dir.join("launch");

        Self {
            base_dir: app_dir,
            launch_dir,
        }
    }

    pub fn ensure_directories(&self) -> std::io::Result<()> {
        fs::create_dir_all(&self.base_dir)?;
        fs::create_dir_all(&self.launch_dir)?;
        Ok(())
    }

    pub fn get_launch_dir(&self) -> PathBuf {
        self.launch_dir.clone()
    }

    pub async fn launch<R: Runtime>(
        &self,
        options: LaunchOptions,
        app: AppHandle<R>,
    ) -> anyhow::Result<()> {
        self.ensure_directories()?;

        app.emit(
            "minecraft-progress",
            ProgressEvent {
                stage: "init".into(),
                progress: 0.0,
                current: None,
            },
        )?;
        app.emit(
            "minecraft-log",
            LogEvent {
                message: "Starting launch sequence...".into(),
            },
        )?;

        let assets_dir = self.launch_dir.join("assets");
        let game_dir = self.launch_dir.join("run");

        let mut version_id = find_installed_version_id(&self.launch_dir);

        // Установка клиента если нужно
        if version_id.is_none() || !assets_dir.exists() {
            app.emit(
                "minecraft-log",
                LogEvent {
                    message: "Launch runtime not found. Downloading launch.zip...".into(),
                },
            )?;

            let installer = ClientInstaller::new_with_path(self.base_dir.clone(), options.install_path.clone());
            installer.install_launch_files(&app).await?;

            version_id = find_installed_version_id(&self.launch_dir);

            if version_id.is_none() || !assets_dir.exists() {
                let error_msg =
                    "Launch runtime not found after install. Please try again or wipe client data."
                        .to_string();
                app.emit("minecraft-log", LogEvent { message: error_msg.clone() })?;
                return Err(anyhow::anyhow!(error_msg));
            }
        }

        let version_id = version_id
            .ok_or_else(|| anyhow::anyhow!("No installed version found in launch/versions"))?;

        let version_dir = self.launch_dir.join("versions").join(&version_id);
        let version_jar_path = version_dir.join(format!("{version_id}.jar"));
        let natives_dir = version_dir.join("natives");

        // Исправляем GUI scale в options.txt перед запуском
        fix_gui_scale(&self.launch_dir, &app)?;

        fs::create_dir_all(&game_dir)?;

        let effective_version_json = load_effective_version_json(&self.launch_dir, &version_id)?;

        // Проверяем/устанавливаем Java 21
        let installer = ClientInstaller::new_with_path(self.base_dir.clone(), options.install_path.clone());
        
        app.emit(
            "minecraft-log",
            LogEvent {
                message: "Проверка Java 21...".into(),
            },
        )?;

        let java_cmd = match options.java_path.clone() {
            Some(path) if !path.is_empty() => path,
            _ => {
                // Автоматически устанавливаем Java 21 если нужно
                match installer.ensure_java_installed(&app).await {
                    Ok(java_path) => {
                        app.emit(
                            "minecraft-log",
                            LogEvent {
                                message: format!("Java 21 готова: {}", java_path),
                            },
                        )?;
                        java_path
                    }
                    Err(e) => {
                        let error_msg = format!("Ошибка установки Java 21: {}. Попробуйте установить Java вручную.", e);
                        app.emit("minecraft-log", LogEvent { message: error_msg.clone() })?;
                        return Err(anyhow::anyhow!(error_msg));
                    }
                }
            }
        };

        emit_launch_progress(&app, &java_cmd)?;

        // Обновляем options с правильным путём к Java
        let mut options = options;
        options.java_path = Some(java_cmd.clone());

        let params = JavaLaunchParams {
            launch_dir: self.launch_dir.clone(),
            version_id: version_id.clone(),
            version_jar_path,
            natives_dir,
            assets_dir,
            game_dir,
            effective_version_json,
        };

        let mut cmd = build_java_command(&params, &options)?;

        emit_pre_launch(&app, &options.username)?;

        match cmd.spawn() {
            Ok(child) => {
                spawn_and_monitor(child, &params, &app)?;
                emit_launch_success(&app)?;
            }
            Err(e) => {
                let error_msg = format!(
                    "✗ Failed to launch Minecraft: {}. Check if Java is installed.",
                    e
                );
                app.emit("minecraft-log", LogEvent { message: error_msg.clone() })?;
                return Err(anyhow::anyhow!(error_msg));
            }
        }

        Ok(())
    }
}
