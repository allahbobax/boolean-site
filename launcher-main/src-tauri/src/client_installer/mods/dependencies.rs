use std::fs;

use anyhow::Result;
use tauri::{AppHandle, Emitter, Runtime};

use super::super::{
    ClientInstaller, InstallProgress, FABRIC_API_URL, FABRIC_API_VERSION, SODIUM_URL, SODIUM_VERSION,
};

impl ClientInstaller {
    pub(super) async fn install_fabric_api<R: Runtime>(&self, app: &AppHandle<R>) -> Result<()> {
        let fabric_api_path = self
            .mods_dir
            .join(format!("fabric-api-{}.jar", FABRIC_API_VERSION));

        // Проверяем существующие версии
        if let Ok(entries) = fs::read_dir(&self.mods_dir) {
            for entry in entries.flatten() {
                let file_name = entry.file_name();
                let name = file_name.to_string_lossy();
                if name.starts_with("fabric-api-") && name.ends_with(".jar") {
                    let path = entry.path();
                    if path != fabric_api_path {
                        fs::remove_file(path)?;
                    } else {
                        // Уже установлена нужная версия
                        let _ = app.emit(
                            "client-install-progress",
                            InstallProgress {
                                stage: "fabric-api".to_string(),
                                progress: 100.0,
                                message: "Fabric API уже установлен".to_string(),
                            },
                        );
                        return Ok(());
                    }
                }
            }
        }

        let _ = app.emit(
            "client-install-progress",
            InstallProgress {
                stage: "fabric-api".to_string(),
                progress: 0.0,
                message: "Установка модулей...".to_string(),
            },
        );

        self.download_file(FABRIC_API_URL, &fabric_api_path, app, "fabric-api")
            .await?;

        let _ = app.emit(
            "client-install-progress",
            InstallProgress {
                stage: "fabric-api".to_string(),
                progress: 100.0,
                message: "Модули установлены".to_string(),
            },
        );

        Ok(())
    }

    pub(super) async fn install_sodium<R: Runtime>(&self, app: &AppHandle<R>) -> Result<()> {
        let sodium_path = self
            .mods_dir
            .join(format!("sodium-fabric-{}.jar", SODIUM_VERSION));

        if let Ok(entries) = fs::read_dir(&self.mods_dir) {
            for entry in entries.flatten() {
                let file_name = entry.file_name();
                let name = file_name.to_string_lossy();
                if name.starts_with("sodium-") && name.ends_with(".jar") {
                    let path = entry.path();
                    if path != sodium_path {
                        fs::remove_file(path)?;
                    } else {
                        let _ = app.emit(
                            "client-install-progress",
                            InstallProgress {
                                stage: "sodium".to_string(),
                                progress: 100.0,
                                message: "Sodium уже установлен".to_string(),
                            },
                        );
                        return Ok(());
                    }
                }
            }
        }

        let _ = app.emit(
            "client-install-progress",
            InstallProgress {
                stage: "sodium".to_string(),
                progress: 0.0,
                message: "Установка секций...".to_string(),
            },
        );

        self.download_file(SODIUM_URL, &sodium_path, app, "sodium")
            .await?;

        let _ = app.emit(
            "client-install-progress",
            InstallProgress {
                stage: "sodium".to_string(),
                progress: 100.0,
                message: "Секции установлены".to_string(),
            },
        );

        Ok(())
    }

    pub(super) fn cleanup_viafabric_leftovers(&self) -> Result<()> {
        if let Ok(entries) = fs::read_dir(&self.mods_dir) {
            for entry in entries.flatten() {
                let file_name = entry.file_name();
                let name = file_name.to_string_lossy();
                if name.starts_with("ViaFabric-") && name.ends_with(".jar") {
                    let _ = fs::remove_file(entry.path());
                }
            }
        }

        Ok(())
    }
}
