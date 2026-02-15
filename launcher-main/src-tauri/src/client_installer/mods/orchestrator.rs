use std::fs;

use anyhow::Result;
use tauri::{AppHandle, Emitter, Runtime};

use super::super::{ClientInstaller, InstallProgress};

impl ClientInstaller {
    pub async fn install_all_mods<R: Runtime>(
        &self,
        app: &AppHandle<R>,
        user_id: Option<i32>,
    ) -> Result<()> {
        self.ensure_directories()?;

        let _ = app.emit(
            "client-install-progress",
            InstallProgress {
                stage: "init".to_string(),
                progress: 0.0,
                message: "Подготовка к запуску...".to_string(),
            },
        );

        // Сначала устанавливаем launch файлы (gradlew и т.д.)
        self.install_launch_files(app).await?;

        // Затем устанавливаем моды
        self.install_fabric_api(app).await?;

        self.install_sodium(app).await?;

        let _ = self.cleanup_viafabric_leftovers();

        self.install_boolean_client(app, user_id).await?;

        let _ = app.emit(
            "client-install-progress",
            InstallProgress {
                stage: "complete".to_string(),
                progress: 100.0,
                message: "Запуск завершён".to_string(),
            },
        );

        Ok(())
    }

    pub fn check_mods_installed(&self) -> bool {
        // Проверяем наличие runtime файлов
        let version_id = "Fabric 1.21.4";
        let version_dir = self.launch_dir.join("versions").join(version_id);
        let version_json_path = version_dir.join(format!("{version_id}.json"));
        let version_jar_path = version_dir.join(format!("{version_id}.jar"));
        let assets_dir = self.launch_dir.join("assets");
        let libraries_dir = self.launch_dir.join("libraries");

        let runtime_exists = version_json_path.exists()
            && version_jar_path.exists()
            && assets_dir.exists()
            && libraries_dir.exists();

        if !runtime_exists {
            return false;
        }

        // Проверяем наличие папки mods
        if !self.mods_dir.exists() {
            return false;
        }

        let required_mods = ["fabric-api", "sodium", "client"];
        let mut found_mods = vec![false; required_mods.len()];

        if let Ok(entries) = fs::read_dir(&self.mods_dir) {
            for entry in entries.flatten() {
                let file_name = entry.file_name();
                let name = file_name.to_string_lossy().to_lowercase();

                // Проверяем только JAR файлы
                if !name.ends_with(".jar") {
                    continue;
                }

                for (i, mod_name) in required_mods.iter().enumerate() {
                    // Для клиента проверяем все возможные имена
                    if mod_name == &"client" {
                        if name.contains("boolean") 
                        {
                            found_mods[i] = true;
                        }
                    } else if name.contains(mod_name) {
                        found_mods[i] = true;
                    }
                }
            }
        }

        // Все необходимые моды должны быть установлены
        found_mods.iter().all(|&found| found)
    }
}
