use std::fs;
use std::io::Write;
use std::path::Path;

use anyhow::Result;
use futures_util::StreamExt;
use tauri::{AppHandle, Emitter, Runtime};

use super::{ClientInstaller, InstallProgress};

impl ClientInstaller {
    /// Скачивает файл. Если force=true, удаляет существующий файл и качает заново.
    pub(super) async fn download_file_force<R: Runtime>(
        &self,
        url: &str,
        dest: &Path,
        app: &AppHandle<R>,
        stage: &str,
        force: bool,
    ) -> Result<()> {
        // Проверяем размер существующего файла
        if dest.exists() {
            if force {
                fs::remove_file(dest)?;
            } else if let Ok(metadata) = fs::metadata(dest) {
                let size = metadata.len();

                // Если файл пустой или слишком маленький, удаляем и скачиваем заново
                if size < 1000 {
                    fs::remove_file(dest)?;
                } else {
                    return Ok(());
                }
            }
        }

        if let Some(parent) = dest.parent() {
            fs::create_dir_all(parent)?;
        }

        let response = self.client.get(url).send().await?;
        let status = response.status();

        if !status.is_success() {
            return Err(anyhow::anyhow!("Ошибка скачивания: статус {}", status));
        }

        let total_size = response.content_length().unwrap_or(0);

        let mut downloaded: u64 = 0;
        let mut file = fs::File::create(dest)?;

        let mut stream = response.bytes_stream();

        while let Some(chunk) = stream.next().await {
            let chunk = chunk?;
            file.write_all(&chunk)?;
            downloaded += chunk.len() as u64;

            if total_size > 0 {
                let progress = (downloaded as f64 / total_size as f64) * 100.0;
                let _ = app.emit(
                    "client-install-progress",
                    InstallProgress {
                        stage: stage.to_string(),
                        progress,
                        message: format!("{}: {:.1}%", stage, progress),
                    },
                );
            }
        }

        // Проверяем, что файл действительно записан
        if let Ok(metadata) = fs::metadata(dest) {
            if metadata.len() == 0 {
                let _ = fs::remove_file(dest);
                return Err(anyhow::anyhow!("Ошибка: скачанный файл пустой!"));
            }
        }

        // Проверяем ZIP magic bytes если это .zip файл
        if dest.extension().map(|e| e == "zip").unwrap_or(false) {
            if let Ok(mut file) = fs::File::open(dest) {
                use std::io::Read;
                let mut magic = [0u8; 4];
                if file.read_exact(&mut magic).is_ok() {
                    // ZIP файлы начинаются с PK (0x50, 0x4B)
                    if magic[0] != 0x50 || magic[1] != 0x4B {
                        let _ = fs::remove_file(dest);
                        return Err(anyhow::anyhow!(
                            "Ошибка: скачанный файл не является ZIP архивом. Возможно сервер вернул ошибку."
                        ));
                    }
                }
            }
        }

        Ok(())
    }

    /// Скачивает файл (без принудительного обновления)
    pub(super) async fn download_file<R: Runtime>(
        &self,
        url: &str,
        dest: &Path,
        app: &AppHandle<R>,
        stage: &str,
    ) -> Result<()> {
        self.download_file_force(url, dest, app, stage, false).await
    }
}
