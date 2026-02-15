use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

use anyhow::Result;
use tauri::{AppHandle, Emitter, Runtime};

use super::{ClientInstaller, InstallProgress};

// Adoptium (Eclipse Temurin) Java 21 URLs
#[cfg(target_os = "windows")]
const JAVA_21_URL: &str = "https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.5%2B11/OpenJDK21U-jre_x64_windows_hotspot_21.0.5_11.zip";

#[cfg(target_os = "linux")]
const JAVA_21_URL: &str = "https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.5%2B11/OpenJDK21U-jre_x64_linux_hotspot_21.0.5_11.tar.gz";

#[cfg(target_os = "macos")]
const JAVA_21_URL: &str = "https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.5%2B11/OpenJDK21U-jre_x64_mac_hotspot_21.0.5_11.tar.gz";

const JAVA_VERSION: &str = "21.0.5";

impl ClientInstaller {
    /// Возвращает путь к директории Java
    pub fn get_java_dir(&self) -> PathBuf {
        self.base_dir.join("java")
    }

    /// Возвращает путь к исполняемому файлу Java
    pub fn get_java_executable(&self) -> PathBuf {
        let java_dir = self.get_java_dir();
        
        #[cfg(target_os = "windows")]
        {
            // Ищем java.exe в подпапках
            if let Some(java_path) = Self::find_java_in_dir(&java_dir) {
                return java_path;
            }
            java_dir.join("bin").join("java.exe")
        }
        
        #[cfg(not(target_os = "windows"))]
        {
            if let Some(java_path) = Self::find_java_in_dir(&java_dir) {
                return java_path;
            }
            java_dir.join("bin").join("java")
        }
    }

    /// Ищет java executable в директории (рекурсивно на 2 уровня)
    fn find_java_in_dir(dir: &Path) -> Option<PathBuf> {
        if !dir.exists() {
            return None;
        }

        #[cfg(target_os = "windows")]
        let java_name = "java.exe";
        #[cfg(not(target_os = "windows"))]
        let java_name = "java";

        // Проверяем bin/java напрямую
        let direct_path = dir.join("bin").join(java_name);
        if direct_path.exists() {
            return Some(direct_path);
        }

        // Ищем в подпапках (например jdk-21.0.5+11-jre/bin/java)
        if let Ok(entries) = fs::read_dir(dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_dir() {
                    let java_path = path.join("bin").join(java_name);
                    if java_path.exists() {
                        return Some(java_path);
                    }
                }
            }
        }

        None
    }

    /// Проверяет, установлена ли Java 21
    pub fn is_java_installed(&self) -> bool {
        let java_exe = self.get_java_executable();
        if !java_exe.exists() {
            return false;
        }

        // Проверяем версию
        self.check_java_version(&java_exe).unwrap_or(false)
    }

    /// Проверяет версию Java
    fn check_java_version(&self, java_path: &Path) -> Result<bool> {
        let output = Command::new(java_path)
            .arg("-version")
            .output()?;

        let version_output = String::from_utf8_lossy(&output.stderr);
        
        // Java выводит версию в stderr в формате: openjdk version "21.0.5" или java version "21.0.5"
        Ok(version_output.contains("21.0") || version_output.contains("\"21."))
    }

    /// Проверяет системную Java
    pub fn check_system_java() -> Option<String> {
        let output = Command::new("java")
            .arg("-version")
            .output()
            .ok()?;

        let version_output = String::from_utf8_lossy(&output.stderr);
        
        // Проверяем что это Java 21
        if version_output.contains("21.0") || version_output.contains("\"21.") {
            return Some("java".to_string());
        }

        None
    }

    /// Устанавливает Java 21 если не установлена
    pub async fn ensure_java_installed<R: Runtime>(&self, app: &AppHandle<R>) -> Result<String> {
        // Сначала проверяем нашу локальную Java
        if self.is_java_installed() {
            let java_path = self.get_java_executable();
            log::info!("Java 21 already installed at: {:?}", java_path);
            return Ok(java_path.to_string_lossy().to_string());
        }

        // Проверяем системную Java
        if let Some(system_java) = Self::check_system_java() {
            log::info!("Using system Java 21");
            return Ok(system_java);
        }

        // Устанавливаем Java
        log::info!("Java 21 not found, installing...");
        self.install_java(app).await?;

        let java_path = self.get_java_executable();
        if java_path.exists() {
            Ok(java_path.to_string_lossy().to_string())
        } else {
            Err(anyhow::anyhow!("Failed to install Java 21"))
        }
    }

    /// Скачивает и устанавливает Java 21
    async fn install_java<R: Runtime>(&self, app: &AppHandle<R>) -> Result<()> {
        let _ = app.emit(
            "client-install-progress",
            InstallProgress {
                stage: "java".to_string(),
                progress: 0.0,
                message: "Скачивание Java 21...".to_string(),
            },
        );

        let java_dir = self.get_java_dir();
        fs::create_dir_all(&java_dir)?;

        #[cfg(target_os = "windows")]
        let archive_name = "java.zip";
        #[cfg(not(target_os = "windows"))]
        let archive_name = "java.tar.gz";

        let archive_path = self.base_dir.join(archive_name);

        // Скачиваем архив
        self.download_file_force(JAVA_21_URL, &archive_path, app, "Java", true)
            .await?;

        let _ = app.emit(
            "client-install-progress",
            InstallProgress {
                stage: "java".to_string(),
                progress: 70.0,
                message: "Распаковка Java 21...".to_string(),
            },
        );

        // Распаковываем
        #[cfg(target_os = "windows")]
        self.extract_java_zip(&archive_path, &java_dir)?;

        #[cfg(not(target_os = "windows"))]
        self.extract_java_tar_gz(&archive_path, &java_dir)?;

        // Удаляем архив
        let _ = fs::remove_file(&archive_path);

        let _ = app.emit(
            "client-install-progress",
            InstallProgress {
                stage: "java".to_string(),
                progress: 100.0,
                message: "Java 21 установлена".to_string(),
            },
        );

        log::info!("Java 21 installed successfully");
        Ok(())
    }

    #[cfg(target_os = "windows")]
    fn extract_java_zip(&self, archive_path: &Path, dest_dir: &Path) -> Result<()> {
        let file = fs::File::open(archive_path)?;
        let mut archive = zip::ZipArchive::new(file)?;
        archive.extract(dest_dir)?;
        Ok(())
    }

    #[cfg(not(target_os = "windows"))]
    fn extract_java_tar_gz(&self, archive_path: &Path, dest_dir: &Path) -> Result<()> {
        use std::process::Command;
        
        let status = Command::new("tar")
            .args(["-xzf", &archive_path.to_string_lossy(), "-C", &dest_dir.to_string_lossy()])
            .status()?;

        if !status.success() {
            return Err(anyhow::anyhow!("Failed to extract Java archive"));
        }

        Ok(())
    }

    /// Возвращает версию установленной Java
    pub fn get_installed_java_version(&self) -> Option<String> {
        let java_exe = self.get_java_executable();
        if !java_exe.exists() {
            return None;
        }

        let output = Command::new(&java_exe)
            .arg("-version")
            .output()
            .ok()?;

        let version_output = String::from_utf8_lossy(&output.stderr);
        
        // Парсим версию из вывода
        for line in version_output.lines() {
            if line.contains("version") {
                // Ищем версию в кавычках
                if let Some(start) = line.find('"') {
                    if let Some(end) = line[start + 1..].find('"') {
                        return Some(line[start + 1..start + 1 + end].to_string());
                    }
                }
            }
        }

        Some(JAVA_VERSION.to_string())
    }
}
