use std::fs;

use anyhow::Result;
use tauri::{AppHandle, Emitter, Runtime};

use super::super::{ClientInstaller, InstallProgress};

impl ClientInstaller {
    /// Читает сохранённую дату обновления клиента
    fn get_saved_updated_at(&self) -> Option<String> {
        let file = self.base_dir.join("client-updated-at.txt");
        fs::read_to_string(file).ok().map(|s| s.trim().to_string())
    }

    /// Сохраняет дату обновления клиента
    fn save_updated_at(&self, updated_at: &str) -> Result<()> {
        let file = self.base_dir.join("client-updated-at.txt");
        fs::write(file, updated_at)?;
        Ok(())
    }

    pub(super) async fn install_boolean_client<R: Runtime>(
        &self,
        app: &AppHandle<R>,
        user_id: Option<i32>,
    ) -> Result<()> {
        let _ = app.emit(
            "client-install-progress",
            InstallProgress {
                stage: "client-info".to_string(),
                progress: 0.0,
                message: "Проверка версии...".to_string(),
            },
        );

        let version_info = self.get_latest_version(user_id).await?;
        
        let saved_updated_at = self.get_saved_updated_at();

        // Определяем имя файла, которое должно быть установлено, из URL
        let default_filename = format!("boolean-client-{}.jar", version_info.version);
        let client_filename = version_info
            .download_url
            .split('/')
            .last()
            .unwrap_or(&default_filename);

        // JAR чита качается в СКРЫТУЮ папку, а не в mods_dir
        let hidden_client_path = self.hidden_client_dir.join(client_filename);
        // Симлинк/копия в mods_dir для загрузки Fabric
        let client_jar_path = self.mods_dir.join(client_filename);

        // Проверяем, установлен ли уже именно тот jar в скрытой папке
        let client_exists_hidden = hidden_client_path
            .metadata()
            .map(|m| m.is_file() && m.len() >= 1000)
            .unwrap_or(false);

        // Проверяем, нужно ли обновление - сравниваем по дате updated_at
        let needs_update = match (&version_info.updated_at, &saved_updated_at) {
            (Some(server_date), Some(local_date)) => {
                // Сравниваем ISO даты как строки (они сортируются правильно)
                if server_date > local_date {
                    true
                } else if !client_exists_hidden {
                    true
                } else {
                    false
                }
            }
            (Some(_), None) => {
                // Нет локальной даты - нужно скачать
                true
            }
            (None, _) => {
                // Сервер не вернул дату - проверяем по наличию файла
                !client_exists_hidden
            }
        };

        if !needs_update {
            // Убеждаемся что копия есть в mods_dir
            self.ensure_client_in_mods(&hidden_client_path, &client_jar_path)?;
            
            let _ = app.emit(
                "client-install-progress",
                InstallProgress {
                    stage: "client".to_string(),
                    progress: 100.0,
                    message: format!("Клиент актуален ({})", version_info.version),
                },
            );
            return Ok(());
        }

        let _ = app.emit(
            "client-install-progress",
            InstallProgress {
                stage: "client".to_string(),
                progress: 0.0,
                message: format!("Установка клиента {}...", version_info.version),
            },
        );

        // Убеждаемся, что скрытая папка существует
        if !self.hidden_client_dir.exists() {
            fs::create_dir_all(&self.hidden_client_dir)?;
        }

        // Удаляем ВСЕ старые версии клиента из скрытой папки
        let target_filename_lower = client_filename.to_lowercase();
        
        if let Ok(entries) = fs::read_dir(&self.hidden_client_dir) {
            for entry in entries.flatten() {
                let file_name = entry.file_name();
                let name = file_name.to_string_lossy().to_lowercase();
                let path = entry.path();

                let is_client_jar = name.ends_with(".jar")
                    && (name.contains("boolean")
                        || name.contains("shakedown")
                        || name.contains("arizon")
                        || name.contains("exosware"));
                
                let is_target_file = name == target_filename_lower;

                if is_client_jar && !is_target_file {
                    let _ = fs::remove_file(&path);
                }
            }
        }
        
        // Также удаляем старые версии из mods_dir
        self.cleanup_old_client_from_mods(&target_filename_lower)?;

        // Скачиваем JAR-файл в СКРЫТУЮ папку (force=true т.к. версия новая)
        self.download_file_force(&version_info.download_url, &hidden_client_path, app, "client", true)
            .await?;

        // Проверяем, что файл действительно существует
        if !hidden_client_path.exists() {
            return Err(anyhow::anyhow!("Client file not found after download"));
        }

        // Копируем JAR в mods_dir для загрузки Fabric
        self.ensure_client_in_mods(&hidden_client_path, &client_jar_path)?;

        // Сохраняем версию и дату обновления
        let version_file = self.base_dir.join("client-version.txt");
        fs::write(version_file, &version_info.version)?;
        
        // Сохраняем дату обновления для будущих проверок
        if let Some(updated_at) = &version_info.updated_at {
            self.save_updated_at(updated_at)?;
        }

        let _ = app.emit(
            "client-install-progress",
            InstallProgress {
                stage: "client".to_string(),
                progress: 100.0,
                message: format!("Клиент {} установлен", version_info.version),
            },
        );

        Ok(())
    }
    
    /// Копирует JAR из скрытой папки в mods_dir
    fn ensure_client_in_mods(&self, hidden_path: &std::path::Path, mods_path: &std::path::Path) -> Result<()> {
        if !self.mods_dir.exists() {
            fs::create_dir_all(&self.mods_dir)?;
        }
        
        // Проверяем, нужно ли копировать
        let needs_copy = if mods_path.exists() {
            // Сравниваем размеры файлов
            let hidden_size = fs::metadata(hidden_path).map(|m| m.len()).unwrap_or(0);
            let mods_size = fs::metadata(mods_path).map(|m| m.len()).unwrap_or(0);
            hidden_size != mods_size
        } else {
            true
        };
        
        if needs_copy && hidden_path.exists() {
            fs::copy(hidden_path, mods_path)?;
        }
        
        Ok(())
    }
    
    /// Удаляет старые версии клиента из mods_dir
    fn cleanup_old_client_from_mods(&self, target_filename_lower: &str) -> Result<()> {
        if let Ok(entries) = fs::read_dir(&self.mods_dir) {
            for entry in entries.flatten() {
                let file_name = entry.file_name();
                let name = file_name.to_string_lossy().to_lowercase();
                let path = entry.path();

                let is_client_jar = name.ends_with(".jar")
                    && (name.contains("boolean")
                        || name.contains("shakedown")
                        || name.contains("arizon")
                        || name.contains("exosware"));
                
                let is_target_file = name == *target_filename_lower;

                if is_client_jar && !is_target_file {
                    let _ = fs::remove_file(&path);
                }
                // Удаляем распакованные файлы клиента
                else if name.contains("arizon") || name.contains("boolean") || name == "com" || name == "meta-inf" {
                    if path.is_dir() {
                        let _ = fs::remove_dir_all(path);
                    } else {
                        let _ = fs::remove_file(path);
                    }
                }
            }
        }
        Ok(())
    }
}
